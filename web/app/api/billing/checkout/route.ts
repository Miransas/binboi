import { NextResponse } from "next/server";

import { BillingRouteError, createBillingCheckout } from "@/lib/billing";
import { normalizeBillingPlan } from "@/lib/pricing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { plan?: string };
    const plan = normalizeBillingPlan(body.plan);
    const response = await createBillingCheckout({
      plan,
    });

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof BillingRouteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not create Paddle checkout." }, { status: 500 });
  }
}
