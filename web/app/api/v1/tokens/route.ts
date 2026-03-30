import { NextResponse } from "next/server";

import {
  AccessTokenRouteError,
  createAccessToken,
  listAccessTokens,
} from "@/lib/access-tokens";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const response = await listAccessTokens();
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof AccessTokenRouteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET /api/v1/tokens failed", error);
    return NextResponse.json({ error: "Could not load access tokens." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { name?: string };
    const response = await createAccessToken(body.name ?? "");
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof AccessTokenRouteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST /api/v1/tokens failed", error);
    return NextResponse.json({ error: "Could not create access token." }, { status: 500 });
  }
}
