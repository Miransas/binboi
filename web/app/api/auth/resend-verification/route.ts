import { NextResponse } from "next/server";

import { buildPathWithQuery, sanitizeRedirectTarget } from "@/lib/auth-routing";
import { AuthRouteError, requestEmailVerification } from "@/lib/auth-system";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    callbackUrl?: string;
  };

  try {
    const result = await requestEmailVerification(String(body.email ?? ""));
    const callbackUrl = sanitizeRedirectTarget(body.callbackUrl, "/dashboard");
    const previewUrl = result.verificationToken
      ? new URL(
          buildPathWithQuery("/verify-email", {
            token: result.verificationToken,
            email: result.email,
            callbackUrl,
          }),
          request.url,
        ).toString()
      : null;
    const redirectTo = buildPathWithQuery("/check-email", {
      flow: "verify-email",
      email: result.email,
      callbackUrl,
      previewUrl,
    });

    return NextResponse.json({
      ok: true,
      message: result.alreadyVerified
        ? "This email is already verified."
        : "A new verification link is ready.",
      redirectTo,
      email: result.email,
      delivery: previewUrl
        ? {
            mode: "preview",
            previewUrl,
          }
        : null,
      alreadyVerified: result.alreadyVerified,
    });
  } catch (error) {
    if (error instanceof AuthRouteError) {
      if (error.code === "USER_NOT_FOUND") {
        return NextResponse.json({
          ok: true,
          message:
            "If an account exists for that email, a verification link is ready.",
        });
      }

      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Could not resend the verification link." },
      { status: 500 },
    );
  }
}
