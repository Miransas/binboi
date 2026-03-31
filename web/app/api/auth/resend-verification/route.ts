import { NextResponse } from "next/server";

import { AuthRouteError, requestEmailVerification } from "@/lib/auth-system";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
  };

  try {
    const result = await requestEmailVerification(String(body.email ?? ""));
    const previewUrl = result.verificationToken
      ? new URL(
          `/verify-email?token=${encodeURIComponent(result.verificationToken)}`,
          request.url,
        ).toString()
      : null;
    const redirectTo = `/check-email?flow=verify-email&email=${encodeURIComponent(
      result.email,
    )}${previewUrl ? `&previewUrl=${encodeURIComponent(previewUrl)}` : ""}`;

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
