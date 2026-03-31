import { NextResponse } from "next/server";

import { buildPathWithQuery, sanitizeRedirectTarget } from "@/lib/auth-routing";
import { AuthRouteError, requestPasswordReset } from "@/lib/auth-system";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    callbackUrl?: string;
  };

  try {
    const result = await requestPasswordReset(String(body.email ?? ""));
    const callbackUrl = sanitizeRedirectTarget(body.callbackUrl, "/dashboard");
    const previewUrl = result.resetToken
      ? new URL(
          buildPathWithQuery("/reset-password", {
            token: result.resetToken,
            email: result.email,
            callbackUrl,
          }),
          request.url,
        ).toString()
      : null;
    const redirectTo = buildPathWithQuery("/check-email", {
      flow: "reset-password",
      email: result.email,
      callbackUrl,
      previewUrl,
    });

    return NextResponse.json({
      ok: true,
      message:
        "If an account exists for that email, a password reset link is ready.",
      redirectTo,
      email: result.email,
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
      { error: "Could not start the password reset flow." },
      { status: 500 },
    );
  }
}
