"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  CreditCard,
  Zap,
  ArrowRight,
  RefreshCcw,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Crown,
} from "lucide-react";

import { pricingPlans, type BillingPlan } from "@/lib/pricing";

// ── types ─────────────────────────────────────────────────────────────────────

type BillingData = {
  plan: BillingPlan;
  status: string;
  renewalDate?: string | null;
  cancelAtPeriodEnd?: boolean;
};

// ── animation presets ─────────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

// ── helpers ───────────────────────────────────────────────────────────────────

const PLAN_ICON = {
  FREE: ShieldCheck,
  PRO: Zap,
  SCALE: Crown,
} as const;

const PLAN_COLOR = {
  FREE: "text-zinc-400",
  PRO: "text-miransas-cyan",
  SCALE: "text-violet-400",
} as const;

const PLAN_BORDER = {
  FREE: "border-white/[0.07]",
  PRO: "border-miransas-cyan/30",
  SCALE: "border-violet-500/30",
} as const;

const PLAN_GLOW = {
  FREE: "",
  PRO: "shadow-[0_0_40px_-12px_rgba(0,255,209,0.15)]",
  SCALE: "shadow-[0_0_40px_-12px_rgba(139,92,246,0.2)]",
} as const;

const STATUS_STYLE: Record<string, { label: string; dot: string; text: string }> = {
  active:   { label: "Active",   dot: "bg-emerald-400", text: "text-emerald-400" },
  ACTIVE:   { label: "Active",   dot: "bg-emerald-400", text: "text-emerald-400" },
  TRIALING: { label: "Trial",    dot: "bg-amber-400",   text: "text-amber-400" },
  PAST_DUE: { label: "Past due", dot: "bg-red-400",     text: "text-red-400" },
  CANCELED: { label: "Canceled", dot: "bg-zinc-500",    text: "text-zinc-400" },
  FREE:     { label: "Free",     dot: "bg-zinc-500",    text: "text-zinc-400" },
};

function statusStyle(s: string) {
  return STATUS_STYLE[s] ?? { label: s, dot: "bg-zinc-500", text: "text-zinc-400" };
}

const COMPARISON_ROWS = [
  { label: "Active tunnels",    values: { FREE: "1",          PRO: "Unlimited",       SCALE: "Unlimited" } },
  { label: "Public URLs",       values: { FREE: "Random only", PRO: "Custom domains",  SCALE: "Custom domains" } },
  { label: "Requests / day",    values: { FREE: "100",         PRO: "10,000+",         SCALE: "Unlimited" } },
  { label: "Request history",   values: { FREE: "Last 50",     PRO: "Full history",    SCALE: "Full history" } },
  { label: "Webhook debugging", values: { FREE: "Basic",       PRO: "Full debugger",   SCALE: "Full + advanced logs" } },
  { label: "AI explain",        values: { FREE: "5 / day",     PRO: "Unlimited",       SCALE: "Unlimited" } },
  { label: "Log retention",     values: { FREE: "~1 hour",     PRO: "7 – 30 days",     SCALE: "30 days+" } },
  { label: "Routing priority",  values: { FREE: "Rate limited", PRO: "Priority",       SCALE: "Priority infra" } },
] as const;

// ── component ─────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = async (background = false) => {
    if (!background) setLoading(true);
    try {
      const res = await fetch("/api/billing", { cache: "no-store" });
      const data = await res.json();
      setBilling(data);
      setError(null);
    } catch {
      setError("Could not load billing information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUpgrade = async (plan: BillingPlan) => {
    if (plan === billing?.plan) return;
    setActionLoading(plan);
    setActionError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel your subscription at period end?")) return;
    setActionLoading("cancel");
    setActionError(null);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cancel failed");
      await load(true);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const currentPlan: BillingPlan = billing?.plan ?? "FREE";
  const PlanIcon = PLAN_ICON[currentPlan] ?? ShieldCheck;
  const ss = statusStyle(billing?.status ?? "FREE");

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={container}
      className="relative min-h-screen bg-[#050506] px-4 py-12 text-zinc-300 sm:px-6 lg:px-12"
    >
      {/* background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 h-[500px] w-[600px] rounded-full bg-miransas-cyan/[0.04] blur-[130px]" />
        <div className="absolute top-0 left-1/3 h-[400px] w-[500px] rounded-full bg-violet-500/[0.04] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <motion.section variants={item} className="mb-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-miransas-cyan/20 bg-miransas-cyan/5 px-3 py-1">
            <CreditCard className="h-3 w-3 text-miransas-cyan" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-miransas-cyan">
              Billing &amp; Plans
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Subscription
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-500">
            Manage your plan, review what&apos;s included, and upgrade when you&apos;re ready.
          </p>
        </motion.section>

        {/* ── Current plan banner ────────────────────────────────────────────── */}
        <motion.section variants={item} className="mb-8">
          <div
            className={[
              "rounded-2xl border bg-zinc-900/30 p-6 backdrop-blur-sm",
              PLAN_BORDER[currentPlan],
              PLAN_GLOW[currentPlan],
            ].join(" ")}
          >
            {loading ? (
              <div className="flex items-center gap-3 animate-pulse text-zinc-600">
                <RefreshCcw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading billing information…</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-6">
                {/* plan identity */}
                <div className="flex items-center gap-4">
                  <div
                    className={[
                      "rounded-xl border p-2.5 bg-white/[0.03]",
                      PLAN_BORDER[currentPlan],
                    ].join(" ")}
                  >
                    <PlanIcon className={`h-5 w-5 ${PLAN_COLOR[currentPlan]}`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                      Current plan
                    </p>
                    <p className={`mt-0.5 text-2xl font-bold ${PLAN_COLOR[currentPlan]}`}>
                      {currentPlan.charAt(0) + currentPlan.slice(1).toLowerCase()}
                    </p>
                  </div>
                </div>

                {/* right side controls */}
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${ss.dot}`} />
                    <span className={`text-sm font-medium ${ss.text}`}>{ss.label}</span>
                  </div>

                  {billing?.renewalDate && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-600">
                        {billing.cancelAtPeriodEnd ? "Ends" : "Renews"}
                      </p>
                      <p className="text-sm text-zinc-300">
                        {new Date(billing.renewalDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  )}

                  {currentPlan !== "FREE" && !billing?.cancelAtPeriodEnd && (
                    <button
                      onClick={handleCancel}
                      disabled={actionLoading === "cancel"}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-xs font-medium text-zinc-500 transition hover:border-red-400/30 hover:text-red-400 disabled:opacity-50"
                    >
                      {actionLoading === "cancel" ? "Cancelling…" : "Cancel plan"}
                    </button>
                  )}

                  {billing?.cancelAtPeriodEnd && (
                    <span className="rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-1.5 text-xs text-amber-400">
                      Cancels at period end
                    </span>
                  )}

                  <button
                    onClick={() => load(true)}
                    className="rounded-lg p-2 text-zinc-600 transition hover:bg-white/[0.04] hover:text-zinc-400"
                    title="Refresh"
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* action error */}
        <AnimatePresence>
          {actionError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 flex items-center gap-3 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {actionError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Plan cards ────────────────────────────────────────────────────── */}
        <motion.section variants={item} className="mb-10">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">
            Available plans
          </p>
          <div className="grid gap-5 lg:grid-cols-3">
            {pricingPlans.map((plan) => {
              const isCurrent = plan.id === currentPlan;
              const rank = { FREE: 1, PRO: 2, SCALE: 3 };
              const isUpgrade = rank[plan.id] > rank[currentPlan];
              const isDowngrade = rank[plan.id] < rank[currentPlan];
              const PIcon = PLAN_ICON[plan.id];

              return (
                <div
                  key={plan.id}
                  className={[
                    "relative flex flex-col rounded-2xl border p-6 transition-all duration-200",
                    isCurrent
                      ? `${PLAN_BORDER[plan.id]} bg-zinc-900/40 ${PLAN_GLOW[plan.id]}`
                      : "border-white/[0.06] bg-zinc-900/20 hover:border-white/[0.12]",
                  ].join(" ")}
                >
                  {/* current plan tab */}
                  {isCurrent && (
                    <div className="absolute -top-px left-5">
                      <div
                        className={[
                          "rounded-b-lg px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em]",
                          plan.id === "PRO"
                            ? "bg-miransas-cyan/20 text-miransas-cyan"
                            : plan.id === "SCALE"
                            ? "bg-violet-500/20 text-violet-400"
                            : "bg-zinc-700/60 text-zinc-400",
                        ].join(" ")}
                      >
                        Current plan
                      </div>
                    </div>
                  )}

                  {/* plan header */}
                  <div className="mb-5 flex items-start justify-between pt-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={[
                          "rounded-lg border p-2 bg-white/[0.03]",
                          isCurrent ? PLAN_BORDER[plan.id] : "border-white/[0.06]",
                        ].join(" ")}
                      >
                        <PIcon
                          className={`h-4 w-4 ${isCurrent ? PLAN_COLOR[plan.id] : "text-zinc-500"}`}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-white">{plan.name}</p>
                        <p className={`text-[10px] uppercase tracking-widest ${PLAN_COLOR[plan.id]}`}>
                          {plan.price}
                          <span className="text-zinc-600">{plan.cadence}</span>
                        </p>
                      </div>
                    </div>
                    {plan.featured && !isCurrent && (
                      <span className="flex items-center gap-1 rounded-full border border-miransas-cyan/25 bg-miransas-cyan/8 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-miransas-cyan">
                        <Sparkles className="h-2.5 w-2.5" />
                        Popular
                      </span>
                    )}
                  </div>

                  {/* tagline */}
                  <p className="mb-5 text-sm leading-6 text-zinc-500">{plan.tagline}</p>

                  {/* feature list */}
                  <ul className="mb-6 flex-1 space-y-2.5">
                    {plan.cardFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check
                          className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                            isCurrent ? PLAN_COLOR[plan.id] : "text-zinc-600"
                          }`}
                        />
                        <span className={isCurrent ? "text-zinc-300" : "text-zinc-500"}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* action button */}
                  {isCurrent ? (
                    <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm font-medium text-zinc-500">
                      <Check className="h-4 w-4" />
                      Your current plan
                    </div>
                  ) : isUpgrade ? (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={actionLoading === plan.id}
                      className={[
                        "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-60",
                        plan.id === "PRO"
                          ? "bg-miransas-cyan text-black hover:bg-miransas-cyan/90"
                          : "bg-violet-600 text-white hover:bg-violet-500",
                      ].join(" ")}
                    >
                      {actionLoading === plan.id ? (
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                      {actionLoading === plan.id ? "Redirecting…" : plan.ctaLabel}
                    </button>
                  ) : isDowngrade ? (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={actionLoading === plan.id}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-sm font-medium text-zinc-500 transition hover:border-white/[0.12] hover:text-zinc-300 disabled:opacity-50"
                    >
                      {actionLoading === plan.id && (
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                      )}
                      {actionLoading === plan.id ? "Loading…" : "Downgrade"}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* ── Comparison table ──────────────────────────────────────────────── */}
        <motion.section variants={item}>
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-600">
            Plan comparison
          </p>
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900/20 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                      Feature
                    </th>
                    {pricingPlans.map((p) => (
                      <th
                        key={p.id}
                        className={[
                          "px-6 py-4 text-[10px] font-bold uppercase tracking-widest",
                          p.id === currentPlan ? PLAN_COLOR[p.id] : "text-zinc-600",
                        ].join(" ")}
                      >
                        {p.name}
                        {p.id === currentPlan && (
                          <span className="ml-2 rounded-full border border-current/30 bg-current/10 px-1.5 py-0.5 text-[8px]">
                            you
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.label} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 text-sm text-zinc-500">{row.label}</td>
                      {pricingPlans.map((p) => (
                        <td
                          key={p.id}
                          className={[
                            "px-6 py-4 text-sm",
                            p.id === currentPlan ? "font-medium text-zinc-200" : "text-zinc-600",
                          ].join(" ")}
                        >
                          {row.values[p.id]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>

        {/* ── Upgrade nudge (FREE plan only) ───────────────────────────────── */}
        {!loading && currentPlan === "FREE" && (
          <motion.div
            variants={item}
            className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-miransas-cyan/15 bg-miransas-cyan/[0.04] px-6 py-5"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-miransas-cyan" />
              <div>
                <p className="font-semibold text-white">Ready to go further?</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Pro unlocks unlimited tunnels, custom domains, full webhook debugging, and more for $9/month.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleUpgrade("PRO")}
              disabled={actionLoading === "PRO"}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-miransas-cyan px-5 py-2.5 text-sm font-bold text-black transition hover:bg-miransas-cyan/90 active:scale-[0.98] disabled:opacity-60"
            >
              {actionLoading === "PRO" ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              Upgrade to Pro
            </button>
          </motion.div>
        )}

      </div>
    </motion.main>
  );
}
