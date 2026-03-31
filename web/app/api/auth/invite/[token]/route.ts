import { NextResponse } from "next/server";

import { AuthRouteError, getInviteLookup } from "@/lib/auth-system";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const params = await context.params;
  try {
    const result = await getInviteLookup(params.token);

    if (!result.valid) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AuthRouteError) {
      return NextResponse.json(
        { valid: false, message: error.message, code: error.code },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { valid: false, message: "Could not load this invite." },
      { status: 500 },
    );
  }
}
