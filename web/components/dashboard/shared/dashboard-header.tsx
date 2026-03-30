"use client";

import Link from "next/link";
import { LayoutDashboard, Orbit, Sparkles } from "lucide-react";

import { useAssistantContext } from "@/components/shared/assistant-context";
import { usePricingPlan } from "@/components/provider/pricing-plan-provider";
import { AssistantLauncher } from "@/components/site/shared/assistant-launcher";
import { getPricingPlan } from "@/lib/pricing";

import { DashboardMiniPill, DashboardSurface } from "./dashboard-primitives";

export default function DashboardHeader() {
  const { pageLabel, context } = useAssistantContext();
  const { plan, nextPlan } = usePricingPlan();
  const activePlan = getPricingPlan(plan);
  const summary =
    context.currentPage?.summary ||
    "Search docs, runtime clues, and troubleshooting guidance from the dashboard.";

  return (
    <div className="sticky top-0 z-30 px-4 pb-2 pt-4 sm:px-6 lg:px-8">
      <DashboardSurface accent="neutral" className="p-0">
        <div className="grid gap-5 px-5 py-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(24rem,0.85fr)] xl:items-center xl:px-6">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-miransas-cyan/16 bg-miransas-cyan/8 text-[#8aefe7] shadow-[0_0_24px_rgba(0,255,209,0.08)]">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                <Orbit className="h-3.5 w-3.5 text-miransas-cyan" />
                Binboi dashboard
              </div>
              <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
                {pageLabel}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">{summary}</p>
            </div>
          </div>

          <div className="space-y-4">
            <AssistantLauncher variant="dashboard" storageKey="dashboard-global" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <DashboardMiniPill label="Plan" value={activePlan.name} accent="cyan" />
              <DashboardMiniPill label="Surface" value="Operator-ready" accent="cyan" />
              <DashboardMiniPill label="Context" value="Page-aware" accent="violet" />
              <DashboardMiniPill label="Security" value="Server-side AI" accent="neutral" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Sparkles className="h-3.5 w-3.5 text-miransas-cyan" />
                Assistant uses page context plus server-side runtime lookups when available.
              </div>
              {nextPlan ? (
                <Link
                  href={`/pricing?focus=${nextPlan.toLowerCase()}`}
                  className="inline-flex items-center gap-2 rounded-full border border-miransas-cyan/18 bg-miransas-cyan/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-miransas-cyan transition hover:border-miransas-cyan/30 hover:bg-miransas-cyan/14"
                >
                  {nextPlan === "PRO" ? "Upgrade" : "Go Scale"}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </DashboardSurface>
    </div>
  );
}
