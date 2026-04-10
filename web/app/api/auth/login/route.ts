import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { sanitizeRedirectTarget } from "@/lib/auth-routing";
import { getCurrentSession } from "@/lib/auth-session";
import { authDeploymentMode, authDatabaseEnabled, githubAuthEnabled } from "@/lib/auth-system";

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

export async function GET() {
  const session = await getCurrentSession();

  return NextResponse.json({
    authenticated: Boolean(session?.user?.id),
    mode: authDeploymentMode,
    credentialsEnabled: authDatabaseEnabled,
    githubEnabled: githubAuthEnabled,
    user: session?.user ?? null,
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    callbackUrl?: string;
  };

  const callbackUrl = sanitizeRedirectTarget(body.callbackUrl, "/dashboard");

  // ── Proxy to Go auth backend ───────────────────────────────────────────────
  let goRes: Response;
  try {
    goRes = await fetch(`${GO_API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(body.email ?? "").trim().toLowerCase(),
        password: String(body.password ?? ""),
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
      { error: data.error ?? "Could not sign in right now.", code: data.code },
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
    redirectTo: callbackUrl,
    user: data.user,
  });
}
