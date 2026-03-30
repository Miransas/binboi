import { NextResponse } from "next/server";

import { BillingRouteError, changeBillingPlan } from "@/lib/billing";
import { normalizeBillingPlan } from "@/lib/pricing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { plan?: string };
    const plan = normalizeBillingPlan(body.plan);
    const summary = await changeBillingPlan(plan);
    return NextResponse.json(summary);
  } catch (error) {
    if (error instanceof BillingRouteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not change the subscription plan." }, { status: 500 });
  }
}
