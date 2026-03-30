import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

import type { BillingPlan } from "@/lib/pricing";

type PaddlePriceConfig = {
  plan: Exclude<BillingPlan, "FREE">;
  priceId: string;
  productId?: string;
};

export class PaddleConfigError extends Error {}

export class PaddleApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const paddleApiBaseUrl = process.env.PADDLE_API_BASE_URL || "https://api.paddle.com";

function hasConfiguredPrice(item: PaddlePriceConfig): item is PaddlePriceConfig {
  return Boolean(item.priceId);
}

const paddlePriceConfigs = [
  {
    plan: "PRO" as const,
    priceId: process.env.PADDLE_PRO_PRICE_ID || "",
    productId: process.env.PADDLE_PRO_PRODUCT_ID,
  },
  {
    plan: "SCALE" as const,
    priceId: process.env.PADDLE_SCALE_PRICE_ID || "",
    productId: process.env.PADDLE_SCALE_PRODUCT_ID,
  },
].filter(hasConfiguredPrice);

export function paddleConfigured() {
  return Boolean(
    process.env.PADDLE_API_KEY &&
      process.env.PADDLE_WEBHOOK_SECRET &&
      process.env.PADDLE_CLIENT_TOKEN &&
      getPaddlePriceConfig("PRO") &&
      getPaddlePriceConfig("SCALE"),
  );
}

export function getPaddlePriceConfig(plan: BillingPlan) {
  if (plan === "FREE") {
    return null;
  }

  return paddlePriceConfigs.find((item) => item.plan === plan) ?? null;
}

function requirePaddleApiKey() {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    throw new PaddleConfigError("Missing PADDLE_API_KEY.");
  }
  return apiKey;
}

export async function paddleRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${paddleApiBaseUrl}${path}`, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(15000),
    headers: {
      Authorization: `Bearer ${requirePaddleApiKey()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Paddle-Version": "1",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const body = (await response.json().catch(() => ({}))) as {
    data?: T;
    error?: { detail?: string };
    errors?: Array<{ detail?: string }>;
  };

  if (!response.ok) {
    throw new PaddleApiError(
      response.status,
      body.error?.detail || body.errors?.[0]?.detail || "Paddle request failed.",
    );
  }

  return body.data as T;
}

export async function createPaddleCustomer(input: {
  email: string;
  name?: string | null;
  userId: string;
}) {
  return paddleRequest<{ id: string; email: string }>("/customers", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      name: input.name ?? undefined,
      custom_data: {
        binboi_user_id: input.userId,
      },
    }),
  });
}

export async function createPaddleCheckoutTransaction(input: {
  plan: Exclude<BillingPlan, "FREE">;
  customerId: string;
  userId: string;
  userEmail: string;
}) {
  const config = getPaddlePriceConfig(input.plan);
  if (!config) {
    throw new PaddleConfigError(`Missing Paddle price configuration for ${input.plan}.`);
  }

  return paddleRequest<{
    id: string;
    checkout?: { url?: string };
  }>("/transactions", {
    method: "POST",
    body: JSON.stringify({
      items: [{ price_id: config.priceId, quantity: 1 }],
      customer_id: input.customerId,
      collection_mode: "automatic",
      custom_data: {
        binboi_user_id: input.userId,
        binboi_user_email: input.userEmail,
        binboi_plan: input.plan,
      },
      checkout: {
        url: null,
      },
    }),
  });
}

export async function cancelPaddleSubscription(subscriptionId: string) {
  return paddleRequest<{ id: string; status: string }>('/subscriptions/' + subscriptionId + '/cancel', {
    method: "POST",
    body: JSON.stringify({
      effective_from: "next_billing_period",
    }),
  });
}

export async function updatePaddleSubscriptionPlan(input: {
  subscriptionId: string;
  plan: Exclude<BillingPlan, "FREE">;
  customerId?: string | null;
  userId: string;
  userEmail: string;
}) {
  const config = getPaddlePriceConfig(input.plan);
  if (!config) {
    throw new PaddleConfigError(`Missing Paddle price configuration for ${input.plan}.`);
  }

  return paddleRequest<{
    id: string;
    status?: string;
    customer_id?: string;
    next_billed_at?: string | null;
    scheduled_change?: {
      action?: string;
      effective_at?: string | null;
    } | null;
    items?: Array<{
      price?: {
        id?: string;
        product_id?: string;
      } | null;
    }> | null;
    custom_data?: Record<string, unknown> | null;
  }>(`/subscriptions/${input.subscriptionId}`, {
    method: "PATCH",
    body: JSON.stringify({
      customer_id: input.customerId ?? undefined,
      items: [{ price_id: config.priceId, quantity: 1 }],
      proration_billing_mode: "do_not_bill",
      custom_data: {
        binboi_user_id: input.userId,
        binboi_user_email: input.userEmail,
        binboi_plan: input.plan,
      },
    }),
  });
}

function parsePaddleSignature(header: string | null) {
  if (!header) {
    return null;
  }

  const parts = header.split(";").map((part) => part.trim());
  const values = Object.fromEntries(
    parts
      .map((part) => part.split("=", 2))
      .filter(([key, value]) => key && value),
  );

  if (!values.ts || !values.h1) {
    return null;
  }

  return {
    timestamp: values.ts,
    hash: values.h1,
  };
}

export function verifyPaddleWebhookSignature(rawBody: string, signatureHeader: string | null) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    throw new PaddleConfigError("Missing PADDLE_WEBHOOK_SECRET.");
  }

  const parsed = parsePaddleSignature(signatureHeader);
  if (!parsed) {
    return false;
  }

  const timestamp = Number(parsed.timestamp);
  if (!Number.isFinite(timestamp)) {
    return false;
  }

  const fiveMinutes = 5 * 60;
  if (Math.abs(Math.floor(Date.now() / 1000) - timestamp) > fiveMinutes) {
    return false;
  }

  const signedPayload = `${parsed.timestamp}:${rawBody}`;
  const digest = createHmac("sha256", secret).update(signedPayload).digest("hex");

  const expected = Buffer.from(digest, "hex");
  const actual = Buffer.from(parsed.hash, "hex");

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}
