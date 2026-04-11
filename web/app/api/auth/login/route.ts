import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GO_API = process.env.BINBOI_GO_API_URL ?? "http://localhost:8080";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    callbackUrl?: string;
  };

  let res: Response;
  try {
    res = await fetch(`${GO_API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(body.email ?? "").trim().toLowerCase(),
        password: String(body.password ?? ""),
      }),
    });
  } catch {
    return NextResponse.json({ error: "Auth sunucusuna ulaşılamıyor." }, { status: 503 });
  }

  const data = (await res.json().catch(() => ({}))) as {
    token?: string;
    user?: { id: string; email: string; name: string; plan: string };
    error?: string;
    code?: string;
  };

  if (!res.ok) {
    return NextResponse.json({ error: data.error ?? "Giriş yapılamadı.", code: data.code }, { status: res.status });
  }

  if (!data.token) {
    return NextResponse.json({ error: "Sunucu token döndürmedi." }, { status: 502 });
  }

  const jar = await cookies();
  jar.set("binboi_token", data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  const cb = body.callbackUrl;
  const redirectTo = cb && cb.startsWith("/") && !cb.startsWith("//") ? cb : "/dashboard";

  return NextResponse.json({ ok: true, redirectTo, user: data.user });
}
