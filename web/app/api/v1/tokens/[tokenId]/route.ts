import { NextResponse } from "next/server";

import { AccessTokenRouteError, revokeAccessToken } from "@/lib/access-tokens";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ tokenId: string }> },
) {
  try {
    const { tokenId } = await params;
    const response = await revokeAccessToken(tokenId);
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof AccessTokenRouteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("DELETE /api/v1/tokens/:tokenId failed", error);
    return NextResponse.json({ error: "Could not revoke access token." }, { status: 500 });
  }
}
