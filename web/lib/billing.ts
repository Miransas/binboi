import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { auth, authEnabled } from "@/auth";
import { db, dbAvailable } from "@/db";
import { ensureAppDatabaseSchema } from "@/db/ensure-schema";
import {
  billingSubscriptions,
  users,
  type SubscriptionStatus,
  type UserPlan,
} from "@/db/schema";
import {
  cancelPaddleSubscription,
  createPaddleCheckoutTransaction,
  createPaddleCustomer,
  getPaddlePriceConfig,
  paddleConfigured,
  updatePaddleSubscriptionPlan,
  verifyPaddleWebhookSignature,
} from "@/lib/paddle";
import { normalizeBillingPlan, type BillingPlan } from "@/lib/pricing";

export class BillingRouteError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type BillingViewer = {
  mode: "account" | "preview";
  user: {
    id: string;
    name: string;
    email: string;
    plan: BillingPlan;
    paddleCustomerId: string | null;
  };
};

type StoredSubscription = {
  id: number;
  plan: UserPlan;
  status: SubscriptionStatus;
  paddleSubscriptionId: string | null;
  paddleCustomerId: string | null;
  paddlePriceId: string | null;
  renewsAt: Date | null;
  cancelAtPeriodEnd: boolean;
  updatedAt: Date;
};

export type BillingSummary = {
  mode: BillingViewer["mode"];
  configured: boolean;
  checkout_enabled: boolean;
  user: BillingViewer["user"];
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

type PaddleSubscriptionEventData = {
  id?: string;
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
};

type DatabaseLikeError = {
  code?: string;
  message?: string;
  cause?: unknown;
};

function extractDatabaseErrorCode(error: unknown): string | null {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current; depth += 1) {
    const record = current as DatabaseLikeError;
    if (typeof record.code === "string" && record.code) {
      return record.code;
    }
    current = record.cause;
  }
  return null;
}

function extractDatabaseErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  const message = (error as DatabaseLikeError | null)?.message;
  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }
  return "Unexpected database error";
}

function mapBillingError(error: unknown, fallback: string): BillingRouteError {
  const code = extractDatabaseErrorCode(error);
  const message = extractDatabaseErrorMessage(error).toLowerCase();

  switch (code) {
    case "42P01":
    case "42703":
      return new BillingRouteError(
        503,
        "The billing tables are not ready yet. Binboi is bootstrapping the auth schema now; retry the request.",
      );
    case "08001":
    case "08006":
      return new BillingRouteError(503, "The auth database is currently unavailable.");
    default:
      if (message.includes("fetch failed") || message.includes("connection") || message.includes("network")) {
        return new BillingRouteError(503, "The auth database is currently unavailable.");
      }
      return new BillingRouteError(500, fallback);
  }
}

function normalizeSubscriptionStatus(status?: string | null): SubscriptionStatus {
  switch (String(status || "").toLowerCase()) {
    case "trialing":
      return "TRIALING";
    case "active":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "paused":
      return "PAUSED";
    case "canceled":
      return "CANCELED";
    default:
      return "FREE";
  }
}

function determinePlanFromPriceId(priceId?: string | null): BillingPlan {
  if (!priceId) {
    return "FREE";
  }
  if (priceId === getPaddlePriceConfig("SCALE")?.priceId) {
    return "SCALE";
  }
  if (priceId === getPaddlePriceConfig("PRO")?.priceId) {
    return "PRO";
  }
  return "FREE";
}

function resolvePlanFromSubscription(data: PaddleSubscriptionEventData): BillingPlan {
  const customPlan = normalizeBillingPlan(
    typeof data.custom_data?.binboi_plan === "string"
      ? data.custom_data.binboi_plan
      : undefined,
  );
  if (customPlan !== "FREE") {
    return customPlan;
  }

  const priceId = data.items?.[0]?.price?.id ?? null;
  return determinePlanFromPriceId(priceId);
}

async function resolveViewer(): Promise<BillingViewer> {
  if (!dbAvailable || !authEnabled || !db) {
    return {
      mode: "preview",
      user: {
        id: "local-preview",
        name: "Local Preview",
        email: "preview@binboi.local",
        plan: "FREE",
        paddleCustomerId: null,
      },
    };
  }

  try {
    await ensureAppDatabaseSchema();
  } catch (error) {
    throw mapBillingError(error, "Binboi could not prepare the billing schema.");
  }

  const session = await auth();
  const sessionUserId = session?.user?.id;
  if (!sessionUserId) {
    throw new BillingRouteError(401, "Sign in to manage billing.");
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      plan: users.plan,
      isActive: users.isActive,
      paddleCustomerId: users.paddleCustomerId,
    })
    .from(users)
    .where(eq(users.id, sessionUserId))
    .limit(1)
    .catch((error) => {
      throw mapBillingError(error, "Could not load the signed-in user.");
    });

  if (!user) {
    throw new BillingRouteError(404, "Could not load the signed-in user.");
  }
  if (user.isActive === false) {
    throw new BillingRouteError(403, "This Binboi account is inactive.");
  }

  return {
    mode: "account",
    user: {
      id: user.id,
      name: user.name || "Binboi User",
      email: user.email,
      plan: normalizeBillingPlan(user.plan),
      paddleCustomerId: user.paddleCustomerId ?? null,
    },
  };
}

async function getLatestSubscription(userId: string): Promise<StoredSubscription | null> {
  if (!db) {
    return null;
  }

  const [row] = await db
    .select({
      id: billingSubscriptions.id,
      plan: billingSubscriptions.plan,
      status: billingSubscriptions.status,
      paddleSubscriptionId: billingSubscriptions.paddleSubscriptionId,
      paddleCustomerId: billingSubscriptions.paddleCustomerId,
      paddlePriceId: billingSubscriptions.paddlePriceId,
      renewsAt: billingSubscriptions.renewsAt,
      cancelAtPeriodEnd: billingSubscriptions.cancelAtPeriodEnd,
      updatedAt: billingSubscriptions.updatedAt,
    })
    .from(billingSubscriptions)
    .where(eq(billingSubscriptions.userId, userId))
    .orderBy(desc(billingSubscriptions.updatedAt))
    .limit(1)
    .catch((error) => {
      throw mapBillingError(error, "Could not load the current subscription.");
    });

  return row ?? null;
}

function serializeBillingSummary(
  viewer: BillingViewer,
  subscription: StoredSubscription | null,
): BillingSummary {
  return {
    mode: viewer.mode,
    configured: paddleConfigured(),
    checkout_enabled: viewer.mode === "account" && paddleConfigured(),
    user: viewer.user,
    subscription: {
      plan:
        subscription && subscription.status !== "CANCELED"
          ? normalizeBillingPlan(subscription.plan)
          : viewer.user.plan,
      status: subscription?.status ?? "FREE",
      renewalDate: subscription?.renewsAt?.toISOString() ?? null,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
      paddleCustomerId: subscription?.paddleCustomerId ?? viewer.user.paddleCustomerId,
      paddleSubscriptionId: subscription?.paddleSubscriptionId ?? null,
    },
    catalog: {
      pro_price_configured: Boolean(getPaddlePriceConfig("PRO")),
      scale_price_configured: Boolean(getPaddlePriceConfig("SCALE")),
    },
  };
}

async function ensurePaddleCustomer(viewer: BillingViewer) {
  if (viewer.user.paddleCustomerId) {
    return viewer.user.paddleCustomerId;
  }
  if (!db) {
    throw new BillingRouteError(503, "Database is required for billing.");
  }

  const customer = await createPaddleCustomer({
    email: viewer.user.email,
    name: viewer.user.name,
    userId: viewer.user.id,
  });

  await db
    .update(users)
    .set({ paddleCustomerId: customer.id })
    .where(eq(users.id, viewer.user.id));

  return customer.id;
}

export async function getBillingSummary(): Promise<BillingSummary> {
  const viewer = await resolveViewer();
  const subscription =
    viewer.mode === "account" ? await getLatestSubscription(viewer.user.id) : null;
  return serializeBillingSummary(viewer, subscription);
}

export async function createBillingCheckout(input: { plan: BillingPlan }) {
  if (input.plan === "FREE") {
    throw new BillingRouteError(400, "Free does not require checkout.");
  }
  if (!paddleConfigured()) {
    throw new BillingRouteError(503, "Paddle is not configured for this deployment.");
  }

  const viewer = await resolveViewer();
  if (viewer.mode !== "account") {
    throw new BillingRouteError(403, "Billing requires a signed-in dashboard account.");
  }

  const currentSubscription = await getLatestSubscription(viewer.user.id);
  const currentPlan =
    currentSubscription && currentSubscription.status !== "CANCELED"
      ? normalizeBillingPlan(currentSubscription.plan)
      : viewer.user.plan;

  if (currentPlan === input.plan) {
    throw new BillingRouteError(409, `You are already on the ${input.plan} plan.`);
  }

  const customerId = await ensurePaddleCustomer(viewer);
  const transaction = await createPaddleCheckoutTransaction({
    plan: input.plan,
    customerId,
    userId: viewer.user.id,
    userEmail: viewer.user.email,
  });

  const checkoutUrl = transaction.checkout?.url;
  if (!checkoutUrl) {
    throw new BillingRouteError(502, "Paddle did not return a hosted checkout URL.");
  }

  return {
    checkoutUrl,
    plan: input.plan,
  };
}

export async function cancelBillingSubscription() {
  if (!paddleConfigured()) {
    throw new BillingRouteError(503, "Paddle is not configured for this deployment.");
  }

  const viewer = await resolveViewer();
  if (viewer.mode !== "account") {
    throw new BillingRouteError(403, "Billing requires a signed-in dashboard account.");
  }
  if (!db) {
    throw new BillingRouteError(503, "Database is required for billing.");
  }

  const subscription = await getLatestSubscription(viewer.user.id);
  if (!subscription?.paddleSubscriptionId) {
    throw new BillingRouteError(404, "There is no active Paddle subscription to cancel.");
  }

  await cancelPaddleSubscription(subscription.paddleSubscriptionId);
  await db
    .update(billingSubscriptions)
    .set({
      cancelAtPeriodEnd: true,
      updatedAt: new Date(),
    })
    .where(eq(billingSubscriptions.id, subscription.id));

  return getBillingSummary();
}

export async function changeBillingPlan(targetPlan: BillingPlan) {
  if (targetPlan === "FREE") {
    throw new BillingRouteError(
      400,
      "Use cancel subscription to return to the Free plan at the end of the billing period.",
    );
  }
  if (!paddleConfigured()) {
    throw new BillingRouteError(503, "Paddle is not configured for this deployment.");
  }

  const viewer = await resolveViewer();
  if (viewer.mode !== "account") {
    throw new BillingRouteError(403, "Billing requires a signed-in dashboard account.");
  }
  if (!db) {
    throw new BillingRouteError(503, "Database is required for billing.");
  }

  const subscription = await getLatestSubscription(viewer.user.id);
  if (!subscription?.paddleSubscriptionId) {
    throw new BillingRouteError(
      404,
      "There is no active Paddle subscription to change. Start with hosted checkout.",
    );
  }

  const currentPlan =
    subscription.status !== "CANCELED" ? normalizeBillingPlan(subscription.plan) : "FREE";
  if (currentPlan === targetPlan) {
    throw new BillingRouteError(409, `You are already on the ${targetPlan} plan.`);
  }

  const updatedSubscription = await updatePaddleSubscriptionPlan({
    subscriptionId: subscription.paddleSubscriptionId,
    plan: targetPlan,
    customerId: subscription.paddleCustomerId ?? viewer.user.paddleCustomerId,
    userId: viewer.user.id,
    userEmail: viewer.user.email,
  });

  await upsertSubscriptionForUser(
    viewer.user.id,
    updatedSubscription,
    normalizeSubscriptionStatus(updatedSubscription.status),
  );

  return getBillingSummary();
}

async function updateUserPlan(userId: string, plan: BillingPlan, paddleCustomerId?: string | null) {
  if (!db) {
    return;
  }

  await db
    .update(users)
    .set({
      plan,
      paddleCustomerId: paddleCustomerId ?? undefined,
    })
    .where(eq(users.id, userId));
}

async function findUserForSubscriptionEvent(data: PaddleSubscriptionEventData) {
  if (!db) {
    return null;
  }

  const customUserId =
    typeof data.custom_data?.binboi_user_id === "string" ? data.custom_data.binboi_user_id : null;
  if (customUserId) {
    const [user] = await db
      .select({ id: users.id, paddleCustomerId: users.paddleCustomerId })
      .from(users)
      .where(eq(users.id, customUserId))
      .limit(1);
    if (user) {
      return user;
    }
  }

  if (data.customer_id) {
    const [user] = await db
      .select({ id: users.id, paddleCustomerId: users.paddleCustomerId })
      .from(users)
      .where(eq(users.paddleCustomerId, data.customer_id))
      .limit(1);
    if (user) {
      return user;
    }
  }

  if (data.id) {
    const [subscription] = await db
      .select({ userId: billingSubscriptions.userId })
      .from(billingSubscriptions)
      .where(eq(billingSubscriptions.paddleSubscriptionId, data.id))
      .limit(1);
    if (subscription) {
      return { id: subscription.userId, paddleCustomerId: data.customer_id ?? null };
    }
  }

  return null;
}

async function upsertSubscriptionForUser(
  userId: string,
  data: PaddleSubscriptionEventData,
  normalizedStatus: SubscriptionStatus,
) {
  if (!db) {
    return;
  }

  const plan =
    normalizedStatus === "CANCELED" ? "FREE" : resolvePlanFromSubscription(data);
  const paddlePriceId = data.items?.[0]?.price?.id ?? null;
  const renewalDate = data.next_billed_at ? new Date(data.next_billed_at) : null;
  const cancelAtPeriodEnd = data.scheduled_change?.action === "cancel";

  const [existing] = await db
    .select({ id: billingSubscriptions.id })
    .from(billingSubscriptions)
    .where(
      data.id
        ? and(
            eq(billingSubscriptions.userId, userId),
            eq(billingSubscriptions.paddleSubscriptionId, data.id),
          )
        : eq(billingSubscriptions.userId, userId),
    )
    .orderBy(desc(billingSubscriptions.updatedAt))
    .limit(1);

  const payload = {
    userId,
    provider: "PADDLE",
    plan,
    status: normalizedStatus,
    paddleSubscriptionId: data.id ?? null,
    paddleCustomerId: data.customer_id ?? null,
    paddlePriceId,
    renewsAt: renewalDate,
    cancelAtPeriodEnd,
    updatedAt: new Date(),
  };

  if (existing) {
    await db
      .update(billingSubscriptions)
      .set(payload)
      .where(eq(billingSubscriptions.id, existing.id));
  } else {
    await db.insert(billingSubscriptions).values({
      ...payload,
      createdAt: new Date(),
    });
  }

  await updateUserPlan(userId, plan, data.customer_id ?? null);
}

export async function handlePaddleWebhook(rawBody: string, signatureHeader: string | null) {
  if (!verifyPaddleWebhookSignature(rawBody, signatureHeader)) {
    throw new BillingRouteError(400, "Invalid Paddle webhook signature.");
  }
  if (!db) {
    throw new BillingRouteError(503, "Database is required for billing webhooks.");
  }

  const payload = JSON.parse(rawBody) as {
    event_type?: string;
    eventType?: string;
    data?: PaddleSubscriptionEventData;
  };

  const eventType = String(payload.event_type || payload.eventType || "").replaceAll("_", ".");
  const data = payload.data || {};

  if (!["subscription.created", "subscription.updated", "subscription.canceled"].includes(eventType)) {
    return { ignored: true };
  }

  const user = await findUserForSubscriptionEvent(data);
  if (!user) {
    throw new BillingRouteError(404, "Could not map Paddle subscription to a Binboi user.");
  }

  const normalizedStatus =
    eventType === "subscription.canceled"
      ? "CANCELED"
      : normalizeSubscriptionStatus(data.status);

  await upsertSubscriptionForUser(user.id, data, normalizedStatus);

  return {
    ignored: false,
    eventType,
  };
}
