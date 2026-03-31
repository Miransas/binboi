import { NextResponse } from "next/server";

import { signIn } from "@/auth";
import { sanitizeRedirectTarget } from "@/lib/auth-session";
import {
  AuthRouteError,
  authDatabaseEnabled,
  registerCredentialsUser,
} from "@/lib/auth-system";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    inviteToken?: string;
    callbackUrl?: string;
  };

  try {
    if (!authDatabaseEnabled) {
      throw new AuthRouteError(
        503,
        "AUTH_PREVIEW_ONLY",
        "Database-backed auth is not configured for this deployment. Use local preview mode instead.",
      );
    }

    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");
    if (password !== confirmPassword) {
      throw new AuthRouteError(
        400,
        "PASSWORD_MISMATCH",
        "Password confirmation does not match.",
      );
    }

    const result = await registerCredentialsUser({
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      password,
      inviteToken: body.inviteToken ?? null,
    });

    const callbackUrl = sanitizeRedirectTarget(body.callbackUrl, "/dashboard");

    if (result.verified) {
      const redirectTo = await signIn("credentials", {
        email: result.email,
        password,
        redirect: false,
        redirectTo: callbackUrl,
      });

      return NextResponse.json({
        ok: true,
        message: result.inviteAccepted
          ? "Invite accepted. You are now signed in."
          : "Account created successfully.",
        redirectTo:
          typeof redirectTo === "string"
            ? sanitizeRedirectTarget(redirectTo, callbackUrl)
            : callbackUrl,
        email: result.email,
        requiresVerification: false,
        inviteAccepted: result.inviteAccepted,
      });
    }

    const previewUrl = new URL(
      `/verify-email?token=${encodeURIComponent(result.verificationToken ?? "")}`,
      request.url,
    ).toString();
    const redirectTo = `/check-email?flow=verify-email&email=${encodeURIComponent(
      result.email,
    )}&previewUrl=${encodeURIComponent(previewUrl)}`;

    return NextResponse.json({
      ok: true,
      message: "Account created. Verify your email to continue.",
      redirectTo,
      email: result.email,
      requiresVerification: true,
      delivery: {
        mode: "preview",
        previewUrl,
      },
    });
  } catch (error) {
    if (error instanceof AuthRouteError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Could not create your account right now." },
      { status: 500 },
    );
  }
}
