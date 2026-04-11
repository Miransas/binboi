import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type JWTPayload = {
  sub?: string;
  email?: string;
  name?: string;
  plan?: string;
  exp?: number;
};

function parseJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8")) as JWTPayload;
  } catch {
    return null;
  }
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  plan: string;
};

export type Session = { user: SessionUser };

export async function getCurrentSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get("binboi_token")?.value;
  if (!token) return null;

  const p = parseJWT(token);
  if (!p?.sub || !p.email) return null;
  if (typeof p.exp === "number" && Date.now() / 1000 > p.exp) return null;

  return { user: { id: p.sub, email: p.email, name: p.name ?? "", plan: p.plan ?? "FREE" } };
}

export async function requireSession(): Promise<Session> {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  return session;
}

export async function redirectIfAuthenticated(to = "/dashboard") {
  const session = await getCurrentSession();
  if (session) redirect(to);
}
