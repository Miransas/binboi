import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { sanitizeRedirectTarget } from "@/lib/auth-routing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GO_API_URL = process.env.BINBOI_GO_API_URL ?? "http://localhost:8080";
const JWT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

type GoAuthResponse = {
  token?: string;
  user?: { id: string; email: string; name: string; plan: string };
  error?: string;
  code?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    inviteToken?: string;
    callbackUrl?: string;
  };

  const callbackUrl = sanitizeRedirectTarget(body.callbackUrl, "/dashboard");

  // ── Proxy to Go auth backend ───────────────────────────────────────────────
  let goRes: Response;
  try {
    goRes = await fetch(`${GO_API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(body.name ?? ""),
        email: String(body.email ?? ""),
        password: String(body.password ?? ""),
        confirm_password: String(body.confirmPassword ?? ""),
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the auth server. Make sure the Go backend is running." },
      { status: 503 },
    );
  }

  const data = (await goRes.json().catch(() => ({}))) as GoAuthResponse;

  if (!goRes.ok) {
    return NextResponse.json(
      { error: data.error ?? "Could not create your account right now.", code: data.code },
      { status: goRes.status },
    );
  }

  if (!data.token) {
    return NextResponse.json(
      { error: "Auth server did not return a token." },
      { status: 502 },
    );
  }

  // ── Set JWT in httpOnly cookie ─────────────────────────────────────────────
  const cookieStore = await cookies();
  cookieStore.set("binboi_token", data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: JWT_COOKIE_MAX_AGE,
  });

  return NextResponse.json({
    ok: true,
    message: "Account created successfully.",
    redirectTo: callbackUrl,
    user: data.user,
    requiresVerification: false,
  });
}
