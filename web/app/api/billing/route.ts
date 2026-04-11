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
    return NextResponse.json({ error: "Billing durumu alınamadı." }, { status: 500 });
  }
}
