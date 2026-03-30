import { NextResponse } from "next/server";

import { BillingRouteError, getBillingSummary } from "@/lib/billing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const summary = await getBillingSummary();
    return NextResponse.json(summary);
  } catch (error) {
    if (error instanceof BillingRouteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not load billing state." }, { status: 500 });
  }
}
