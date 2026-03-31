import { NextResponse } from "next/server";

import { AuthRouteError, resetPasswordWithToken } from "@/lib/auth-system";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    token?: string;
    password?: string;
    confirmPassword?: string;
  };

  try {
    const password = String(body.password ?? "");
    const confirmPassword = String(body.confirmPassword ?? "");
    if (password !== confirmPassword) {
      throw new AuthRouteError(
        400,
        "PASSWORD_MISMATCH",
        "Password confirmation does not match.",
      );
    }

    const result = await resetPasswordWithToken({
      token: String(body.token ?? ""),
      password,
    });

    return NextResponse.json({
      ok: true,
      message: "Password updated successfully.",
      redirectTo: "/login?reset=success",
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
      { error: "Could not reset the password." },
      { status: 500 },
    );
  }
}
