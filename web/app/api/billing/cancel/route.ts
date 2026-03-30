import { NextResponse } from "next/server";

import { BillingRouteError, cancelBillingSubscription } from "@/lib/billing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  try {
    const summary = await cancelBillingSubscription();
    return NextResponse.json(summary);
  } catch (error) {
    if (error instanceof BillingRouteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not cancel the subscription." }, { status: 500 });
  }
}
