import { NextResponse } from "next/server";

import { AuthRouteError, requestPasswordReset } from "@/lib/auth-system";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
  };

  try {
    const result = await requestPasswordReset(String(body.email ?? ""));
    const previewUrl = result.resetToken
      ? new URL(
          `/reset-password?token=${encodeURIComponent(result.resetToken)}`,
          request.url,
        ).toString()
      : null;
    const redirectTo = `/check-email?flow=reset-password&email=${encodeURIComponent(
      result.email,
    )}${previewUrl ? `&previewUrl=${encodeURIComponent(previewUrl)}` : ""}`;

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
