import { NextResponse } from "next/server";

import { BillingRouteError, handlePaddleWebhook } from "@/lib/billing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("paddle-signature");
    const result = await handlePaddleWebhook(rawBody, signature);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof BillingRouteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not process Paddle webhook." }, { status: 500 });
  }
}
