import { NextResponse } from "next/server";

import { buildPathWithQuery, sanitizeRedirectTarget } from "@/lib/auth-routing";
import { AuthRouteError, verifyEmailToken } from "@/lib/auth-system";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    token?: string;
    callbackUrl?: string;
  };

  try {
    const result = await verifyEmailToken(String(body.token ?? ""));
    const callbackUrl = sanitizeRedirectTarget(body.callbackUrl, "/dashboard");

    return NextResponse.json({
      ok: true,
      message: "Email verified successfully.",
      redirectTo: buildPathWithQuery("/login", {
        verified: "success",
        callbackUrl,
      }),
      email: result.email,
    });
  } catch (error) {
    if (error instanceof AuthRouteError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "Could not verify this email address." },
      { status: 500 },
    );
  }
}
