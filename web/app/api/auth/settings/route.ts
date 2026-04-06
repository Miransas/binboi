import { NextResponse } from "next/server";

import { buildPathWithQuery } from "@/lib/auth-routing";
import { getCurrentSession } from "@/lib/auth-session";
import {
  AuthRouteError,
  authDatabaseEnabled,
  authDeploymentMode,
  getUserSettings,
  githubAuthEnabled,
  previewAuthEnabled,
  updateUserSettings,
} from "@/lib/auth-system";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthenticatedResponse() {
  return NextResponse.json({ error: "Sign in to manage your account." }, { status: 401 });
}

export async function GET() {
  const session = await getCurrentSession();

  if (!authDatabaseEnabled) {
    return NextResponse.json({
      authenticated: false,
      mode: authDeploymentMode,
      credentialsEnabled: authDatabaseEnabled,
      githubEnabled: githubAuthEnabled,
      previewEnabled: previewAuthEnabled,
      user: null,
    });
  }

  if (!session?.user?.id) {
    return unauthenticatedResponse();
  }

  try {
    const user = await getUserSettings(session.user.id);

    return NextResponse.json({
      authenticated: true,
      mode: authDeploymentMode,
      credentialsEnabled: authDatabaseEnabled,
      githubEnabled: githubAuthEnabled,
      previewEnabled: previewAuthEnabled,
      user,
    });
  } catch (error) {
    if (error instanceof AuthRouteError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Could not load your account settings." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  if (!authDatabaseEnabled) {
    return NextResponse.json(
      {
        error: previewAuthEnabled
          ? "Database-backed auth is not configured for this deployment. User management stays disabled in preview mode."
          : "Database-backed auth is not configured for this deployment.",
        code: previewAuthEnabled ? "AUTH_PREVIEW_ONLY" : "AUTH_UNAVAILABLE",
      },
      { status: 503 },
    );
  }

  const session = await getCurrentSession();
  if (!session?.user?.id) {
    return unauthenticatedResponse();
  }

  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
  };

  try {
    const result = await updateUserSettings({
      userId: session.user.id,
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
    });

    const previewUrl = result.verificationToken
      ? new URL(
          buildPathWithQuery("/verify-email", {
            token: result.verificationToken,
            email: result.user.email,
            callbackUrl: "/dashboard/user-management",
          }),
          request.url,
        ).toString()
      : null;

    return NextResponse.json({
      ok: true,
      message: result.emailChanged
        ? "Profile updated. Verify your new email to keep credentials sign-in enabled."
        : "Profile updated successfully.",
      emailChanged: result.emailChanged,
      user: result.user,
      delivery: previewUrl
        ? {
            mode: "preview",
            previewUrl,
          }
        : null,
    });
  } catch (error) {
    if (error instanceof AuthRouteError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Could not update your account settings." },
      { status: 500 },
    );
  }
}
