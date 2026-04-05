import { NextResponse } from "next/server";

import { signIn } from "@/auth";
import { sanitizeRedirectTarget } from "@/lib/auth-routing";
import { getCurrentSession } from "@/lib/auth-session";
import {
  AuthRouteError,
  authDeploymentMode,
  authDatabaseEnabled,
  authenticateCredentials,
  githubAuthEnabled,
  previewAuthEnabled,
} from "@/lib/auth-system";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  try {
    if (!authDatabaseEnabled) {
      throw new AuthRouteError(
        503,
        previewAuthEnabled ? "AUTH_PREVIEW_ONLY" : "AUTH_UNAVAILABLE",
        previewAuthEnabled
          ? "Database-backed auth is not configured for this deployment. Use local preview mode instead."
          : "Database-backed auth is not configured for this deployment.",
      );
    }

    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const callbackUrl = sanitizeRedirectTarget(body.callbackUrl, "/dashboard");

    await authenticateCredentials({ email, password });
    const redirectTo = await signIn("credentials", {
      email,
      password,
      redirect: false,
      redirectTo: callbackUrl,
    });

    return NextResponse.json({
      ok: true,
      redirectTo:
        typeof redirectTo === "string"
          ? sanitizeRedirectTarget(redirectTo, callbackUrl)
          : callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthRouteError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Could not sign in right now." },
      { status: 500 },
    );
  }
}
