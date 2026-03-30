"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CreditCard, RefreshCcw, ShieldCheck, Sparkles } from "lucide-react";

import { BillingChangePlanButton } from "@/components/pricing/billing-change-plan-button";
import { BillingCancelButton } from "@/components/pricing/billing-cancel-button";
import { BillingCheckoutButton } from "@/components/pricing/billing-checkout-button";
import { usePricingPlan } from "@/components/provider/pricing-plan-provider";
import { DashboardPageShell } from "@/components/dashboard/shared/page-shell";
import { DashboardSurface } from "@/components/dashboard/shared/dashboard-primitives";
import { useRegisterAssistantContext } from "@/components/shared/assistant-context";
import { getNextPlan, getPricingPlan, type BillingPlan } from "@/lib/pricing";

type BillingState = {
  mode: "account" | "preview";
  configured: boolean;
  checkout_enabled: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    plan: BillingPlan;
  };
  subscription: {
    plan: BillingPlan;
    status: string;
    renewalDate: string | null;
    cancelAtPeriodEnd: boolean;
    paddleCustomerId: string | null;
    paddleSubscriptionId: string | null;
  };
};

function formatDate(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BillingPage() {
  const { refreshPlan } = usePricingPlan();
  const [state, setState] = useState<BillingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (background = false) => {
    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch("/api/billing", { cache: "no-store" });
      const body = (await response.json()) as BillingState & { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Could not load billing state.");
      }
      setState(body);
      setError(null);
      void refreshPlan();
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load billing state.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshPlan]);

  useEffect(() => {
    void load();
  }, [load]);

  const activePlan = getPricingPlan(state?.subscription.plan || "FREE");
  const nextPlan = getNextPlan(state?.subscription.plan || "FREE");

  useRegisterAssistantContext("dashboard-billing", {
    currentPage: {
      path: "/dashboard/billing",
      title: "Billing",
      area: "dashboard",
      summary: state
        ? `Billing is showing the ${state.subscription.plan} plan with ${state.subscription.status} subscription status.`
        : "Billing is loading the current plan and subscription state.",
    },
    requestContext: {
      summary: state
        ? `Current plan is ${state.subscription.plan} with subscription status ${state.subscription.status}.`
        : "Billing data is still loading.",
    },
  });

  const highlights = useMemo(
    () => [
      {
        label: "Current plan",
        value: activePlan.name,
        note: "This is the effective plan currently applied to your dashboard features.",
      },
      {
        label: "Subscription",
        value: state?.subscription.status || "FREE",
        note: "Subscription state comes from Paddle webhooks and stays server-side.",
      },
      {
        label: "Renewal",
        value: formatDate(state?.subscription.renewalDate || null),
        note: error || "Renewal timing is updated by subscription.created, updated, and canceled events.",
      },
    ],
    [activePlan.name, error, state?.subscription.renewalDate, state?.subscription.status],
  );

  return (
    <DashboardPageShell
      eyebrow="Billing"
      title="Manage your Binboi subscription"
      description="Binboi uses Paddle as Merchant of Record. Upgrade with hosted checkout, see the current plan and renewal state, and cancel at the end of the billing period without exposing any payment secrets to the browser."
      highlights={highlights}
      panels={[
        {
          title: "Hosted checkout first",
          description: "Paid upgrades open a Paddle hosted checkout so the MVP stays simple, safe, and easier to maintain than a custom card form.",
        },
        {
          title: "Webhook-driven plan state",
          description: "The dashboard unlocks plan features from server-side subscription state. Paddle webhooks update the database, then the UI reads the effective plan back through the billing API.",
        },
      ]}
    >
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <DashboardSurface accent="neutral" className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-miransas-cyan/18 bg-miransas-cyan/10 text-miransas-cyan">
                <CreditCard className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Current billing state</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {state?.user.email || "Loading signed-in workspace..."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void load(true)}
              disabled={loading || refreshing}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-zinc-300 transition hover:border-white/20 hover:text-white"
            >
              <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/25 px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Plan</p>
              <p className="mt-2 text-lg font-semibold text-white">{activePlan.name}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/25 px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Status</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {loading && !state ? "Loading..." : state?.subscription.status || "FREE"}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/25 px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Renewal</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatDate(state?.subscription.renewalDate || null)}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/25 px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Cancel behavior</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {state?.subscription.cancelAtPeriodEnd ? "Ends this cycle" : "Auto renew"}
              </p>
            </div>
          </div>

          {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

          {!state?.configured ? (
            <div className="mt-6 rounded-[1.5rem] border border-amber-300/18 bg-amber-400/10 px-4 py-4 text-sm leading-7 text-amber-100">
              Paddle is not configured for this deployment yet. Set `PADDLE_API_KEY`,
              `PADDLE_CLIENT_TOKEN`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRO_PRICE_ID`, and
              `PADDLE_SCALE_PRICE_ID` before using hosted checkout.
            </div>
          ) : null}

          {state?.mode === "preview" ? (
            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-zinc-300">
              Billing requires database-backed auth mode. Local preview keeps the UI coherent, but
              real Paddle subscriptions need a signed-in account and Postgres.
            </div>
          ) : null}
        </DashboardSurface>

        <DashboardSurface accent="violet" className="p-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-300/18 bg-violet-400/10 text-violet-200">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Upgrade or change plan</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Move up when you need more history, unlimited AI explain, and stronger infrastructure priority.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {nextPlan === "PRO" ? (
              <BillingCheckoutButton plan="PRO" label="Upgrade to Pro" className="w-full" />
            ) : null}
            {nextPlan === "SCALE" ? (
              <BillingCheckoutButton plan="SCALE" label="Go Scale" className="w-full" />
            ) : null}
            {state?.subscription.plan === "FREE" ? (
              <BillingCheckoutButton
                plan="PRO"
                label="Upgrade to Pro"
                className="w-full"
                variant="secondary"
              />
            ) : null}
            {state?.subscription.plan !== "SCALE" ? (
              <BillingCheckoutButton
                plan="SCALE"
                label="Go Scale"
                className="w-full"
                variant="secondary"
              />
            ) : null}
            {state?.subscription.plan === "SCALE" &&
            state?.subscription.status !== "CANCELED" ? (
              <BillingChangePlanButton plan="PRO" label="Downgrade to Pro" onChanged={() => void load(true)} />
            ) : null}
            {state?.subscription.plan !== "FREE" &&
            state?.subscription.status !== "CANCELED" ? (
              <BillingCancelButton onCanceled={() => void load(true)} />
            ) : null}
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-black/25 p-5">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5 text-miransas-cyan" />
              What unlocks
            </div>
            <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
              <p>Free: one active tunnel, capped AI explain, short logs retention, and limited history.</p>
              <p>Pro: unlimited tunnels, custom domains, full request history, full webhook debugging, and unlimited AI explain.</p>
              <p>Scale: everything in Pro, plus advanced logs, priority infrastructure, and future-ready team and API surfaces.</p>
            </div>
          </div>
        </DashboardSurface>
      </section>
    </DashboardPageShell>
  );
}
