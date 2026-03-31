import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth-session";
import { authDatabaseEnabled, githubAuthEnabled } from "@/lib/auth-system";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentSession();

  return NextResponse.json({
    authenticated: Boolean(session?.user?.id),
    mode: authDatabaseEnabled ? "database" : "preview",
    credentialsEnabled: authDatabaseEnabled,
    githubEnabled: githubAuthEnabled,
    user: session?.user ?? null,
  });
}
