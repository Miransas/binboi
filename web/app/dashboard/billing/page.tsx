/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  RefreshCcw, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight
} from "lucide-react";

import { BillingChangePlanButton } from "@/components/pricing/billing-change-plan-button";
import { BillingCancelButton } from "@/components/pricing/billing-cancel-button";
import { BillingCheckoutButton } from "@/components/pricing/billing-checkout-button";
import { usePricingPlan } from "@/components/provider/pricing-plan-provider";
import { useRegisterAssistantContext } from "@/components/shared/assistant-context";
import { getNextPlan, getPricingPlan, type BillingPlan } from "@/lib/pricing";

// --- Types ---
type BillingState = {
  mode: "account" | "preview";
  configured: boolean;
  checkout_enabled: boolean;
  user: { id: string; name: string; email: string; plan: BillingPlan; };
  subscription: {
    plan: BillingPlan;
    status: string;
    renewalDate: string | null;
    cancelAtPeriodEnd: boolean;
    paddleCustomerId: string | null;
    paddleSubscriptionId: string | null;
  };
};

// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

function formatDate(value: string | null) {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export default function BillingPage() {
  const { refreshPlan } = usePricingPlan();
  const [state, setState] = useState<BillingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true); else setLoading(true);
    try {
      const response = await fetch("/api/billing", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Billing load failed");
      setState(body);
      setError(null);
      void refreshPlan();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshPlan]);

  useEffect(() => { void load(); }, [load]);

  const activePlan = getPricingPlan(state?.subscription.plan || "FREE");
  const nextPlan = getNextPlan(state?.subscription.plan || "FREE");

  useRegisterAssistantContext("dashboard-billing", {
    currentPage: {
      path: "/dashboard/billing",
      title: "Billing",
      area: "dashboard",
      summary: state 
        ? `Billing is showing the ${state.subscription.plan} plan.` 
        : "Loading billing state...",
    },
  });

  return (
    <motion.main 
      initial="hidden" animate="visible" variants={containerVariants}
      className="relative min-h-screen bg-[#050506] px-4 py-12 text-zinc-300 sm:px-6 lg:px-12"
    >
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-[10%] h-[500px] w-[500px] rounded-full bg-violet-600/5 blur-[120px]" />
        <div className="absolute bottom-0 left-[10%] h-[400px] w-[400px] rounded-full bg-cyan-600/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        
        {/* Header Section */}
        <motion.section variants={itemVariants} className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-6">
            <CreditCard className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Subscription Engine</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Billing & Plans</h1>
          <p className="mt-4 text-zinc-500 max-w-2xl text-lg leading-relaxed">
            Manage your workspace plan and subscription through Paddle. High-performance tunneling requires stable infrastructure.
          </p>
        </motion.section>

        {/* Top Highlights Grid */}
        <motion.section variants={itemVariants} className="grid gap-4 md:grid-cols-3 mb-8">
          {[
            { label: "Active Plan", value: activePlan.name, icon: Zap, color: "text-amber-400" },
            { label: "Status", value: state?.subscription.status || "FREE", icon: ShieldCheck, color: "text-emerald-400" },
            { label: "Next Renewal", value: formatDate(state?.subscription.renewalDate || null), icon: Calendar, color: "text-cyan-400" }
          ].map((item, i) => (
            <div key={i} className="rounded-2xl border border-white/5 bg-zinc-900/20 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 text-zinc-500 mb-2">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
              </div>
              <div className="text-xl font-bold text-white tabular-nums">{item.value}</div>
            </div>
          ))}
        </motion.section>

        <div className="grid gap-8 xl:grid-cols-[1fr_400px]">
          
          {/* Left: Current State & Info */}
          <div className="space-y-6">
            <motion.section variants={itemVariants} className="rounded-2xl border border-white/5 bg-zinc-900/20 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <CreditCard className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Billing Overview</h2>
                    <p className="text-xs text-zinc-500 mt-1 font-mono">{state?.user.email || "Fetching identity..."}</p>
                  </div>
                </div>
                <button 
                  onClick={() => void load(true)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <RefreshCcw className={`h-4 w-4 text-zinc-500 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Plan Type", val: activePlan.name },
                  { label: "Sub Status", val: state?.subscription.status || "N/A" },
                  { label: "Renewal", val: formatDate(state?.subscription.renewalDate || null) },
                  { label: "Auto-Renew", val: state?.subscription.cancelAtPeriodEnd ? "Disabled" : "Enabled" }
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-sm font-medium text-zinc-300">{stat.val}</p>
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {(!state?.configured || state?.mode === "preview") && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    className="mt-8 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex gap-4"
                  >
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed text-amber-200/70">
                      {!state?.configured 
                        ? "Paddle environment variables are missing. Checkout is disabled for this instance." 
                        : "Local preview mode active. Real subscriptions require a database and authentication."}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* Plan Features List */}
            <motion.section variants={itemVariants} className="p-8 rounded-2xl border border-white/5 bg-zinc-950/40">
              <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Plan Entitlements
              </h3>
              <div className="space-y-4">
                {[
                  { plan: "Free", desc: "1 tunnel, 24h logs, community support." },
                  { plan: "Pro", desc: "Unlimited tunnels, 7d logs, custom domains, AI analysis." },
                  { plan: "Scale", desc: "Advanced logging, priority infrastructure, API access." }
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                    <div className="text-xs font-bold text-zinc-500 w-12 pt-0.5 uppercase">{f.plan}</div>
                    <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Right: Actions & Upgrades */}
          <motion.section variants={itemVariants} className="space-y-6">
            <div className="rounded-2xl border border-white/5 bg-zinc-900/20 p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Upgrade Flow</h2>
              </div>

              <div className="space-y-4">
                {/* Dynamically Render Paddle Buttons with Binboi Styling */}
                {nextPlan === "PRO" && (
                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl opacity-20 blur group-hover:opacity-40 transition" />
                    <BillingCheckoutButton 
                      plan="PRO" label="Upgrade to Pro" 
                      className="relative w-full flex items-center justify-between py-4 px-6 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all active:scale-[0.98]" 
                    />
                  </div>
                )}

                {nextPlan === "SCALE" && (
                  <BillingCheckoutButton 
                    plan="SCALE" label="Move to Scale" 
                    className="w-full py-4 px-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all flex items-center justify-between" 
                  />
                )}

                {/* Manage Existing Subscription */}
                {state?.subscription.plan !== "FREE" && state?.subscription.status !== "CANCELED" && (
                  <div className="pt-6 mt-6 border-t border-white/5 space-y-4">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-center">Management Actions</p>
                    
                    {state?.subscription.plan === "SCALE" && (
                      <div className="flex justify-center">
                        <BillingChangePlanButton 
                          plan="PRO" label="Downgrade to Pro" 
                          onChanged={() => void load(true)}
                          className="text-sm text-zinc-400 hover:text-white transition-colors"
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-center">
                      <BillingCancelButton 
                        onCanceled={() => void load(true)}
                        className="text-xs text-red-500/60 hover:text-red-400 transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trust Banner */}
            <div className="p-6 rounded-2xl border border-white/5 bg-black/40 text-center">
              <ShieldCheck className="h-6 w-6 text-zinc-700 mx-auto mb-3" />
              <p className="text-xs text-zinc-500 leading-relaxed">
                Binboi uses <span className="text-zinc-300 font-medium">Paddle</span> as Merchant of Record. Your payment secrets never hit our servers.
              </p>
            </div>
          </motion.section>

        </div>
      </div>
    </motion.main>
  );
}