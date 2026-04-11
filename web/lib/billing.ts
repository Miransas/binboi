import "server-only";

import { cookies } from "next/headers";

import type { BillingPlan } from "@/lib/pricing";

const GO_API = process.env.BINBOI_GO_API_URL ?? "http://localhost:8080";

// ── error class ───────────────────────────────────────────────────────────────

export class BillingRouteError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ── types ─────────────────────────────────────────────────────────────────────

export type SubscriptionStatus = "FREE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "PAUSED" | "CANCELED";

export type BillingSummary = {
  mode: "account" | "preview";
  configured: boolean;
  checkout_enabled: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    plan: BillingPlan;
    paddleCustomerId: string | null;
  };
  subscription: {
    plan: BillingPlan;
    status: SubscriptionStatus;
    renewalDate: string | null;
    cancelAtPeriodEnd: boolean;
    paddleCustomerId: string | null;
    paddleSubscriptionId: string | null;
  };
  catalog: {
    pro_price_configured: boolean;
    scale_price_configured: boolean;
  };
};

// ── internal helpers ──────────────────────────────────────────────────────────

async function bearerHeaders(): Promise<HeadersInit> {
  const jar = await cookies();
  const token = jar.get("binboi_token")?.value;
  const h: HeadersInit = { "Content-Type": "application/json" };
  if (token) (h as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  return h;
}

async function goFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${GO_API}${path}`, init);
  } catch {
    throw new BillingRouteError(503, "Billing sunucusuna ulaşılamıyor.");
  }

  const data = (await res.json().catch(() => ({}))) as T & { error?: string };

  if (!res.ok) {
    throw new BillingRouteError(
      res.status,
      (data as { error?: string }).error ?? "Billing işlemi başarısız.",
    );
  }

  return data;
}

// ── exported functions ────────────────────────────────────────────────────────

export async function getBillingSummary(): Promise<BillingSummary> {
  return goFetch<BillingSummary>("/api/billing", {
    headers: await bearerHeaders(),
  });
}

export async function createBillingCheckout(input: { plan: BillingPlan }) {
  if (input.plan === "FREE") {
    throw new BillingRouteError(400, "Free plan için ödeme gerekmiyor.");
  }
  return goFetch<{ checkoutUrl: string; plan: BillingPlan }>("/api/billing/checkout", {
    method: "POST",
    headers: await bearerHeaders(),
    body: JSON.stringify({ plan: input.plan }),
  });
}

export async function cancelBillingSubscription(): Promise<BillingSummary> {
  return goFetch<BillingSummary>("/api/billing/cancel", {
    method: "POST",
    headers: await bearerHeaders(),
  });
}

export async function changeBillingPlan(targetPlan: BillingPlan): Promise<BillingSummary> {
  if (targetPlan === "FREE") {
    throw new BillingRouteError(
      400,
      "FREE plana dönmek için aboneliği iptal edin.",
    );
  }
  return goFetch<BillingSummary>("/api/billing/change-plan", {
    method: "POST",
    headers: await bearerHeaders(),
    body: JSON.stringify({ plan: targetPlan }),
  });
}

export async function handlePaddleWebhook(
  rawBody: string,
  signatureHeader: string | null,
): Promise<{ ignored: boolean; eventType?: string }> {
  const h: HeadersInit = { "Content-Type": "application/json" };
  if (signatureHeader) (h as Record<string, string>)["Paddle-Signature"] = signatureHeader;

  return goFetch<{ ignored: boolean; eventType?: string }>("/api/billing/webhook", {
    method: "POST",
    headers: h,
    body: rawBody,
  });
}
