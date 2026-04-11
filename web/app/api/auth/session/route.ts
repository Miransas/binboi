import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ authenticated: false, user: null });
  return NextResponse.json({ authenticated: true, user: session.user });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete("binboi_token");
  return NextResponse.json({ ok: true });
}
