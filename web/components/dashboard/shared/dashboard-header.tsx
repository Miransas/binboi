"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, Sparkles } from "lucide-react";

import { useAssistantContext } from "@/components/shared/assistant-context";
import { usePricingPlan } from "@/components/provider/pricing-plan-provider";
import { AssistantLauncher } from "@/components/site/shared/assistant-launcher";
import { getPricingPlan } from "@/lib/pricing";

import { DashboardSurface } from "./dashboard-primitives";
import { getDashboardHeaderConfig } from "./dashboard-header-config";
import { useDashboardScrollState } from "./use-dashboard-scroll-state";

export default function DashboardHeader() {
  const pathname = usePathname();
  const { pageLabel, context } = useAssistantContext();
  const { plan, nextPlan } = usePricingPlan();
  const activePlan = getPricingPlan(plan);
  const isScrolled = useDashboardScrollState();
  const headerConfig = getDashboardHeaderConfig(pathname);
  const summary =
    context.currentPage?.summary ||
    "Search docs, runtime clues, and troubleshooting guidance from the dashboard.";
  const isCompact = isScrolled || !headerConfig.isHome;
  const showSummary = headerConfig.isHome && !isCompact;
  const showUpgrade = Boolean(nextPlan) && headerConfig.isHome;

  return (
    <div
      className={`sticky top-0 z-30 px-4 transition-[padding] duration-300 sm:px-6 lg:px-8 ${
        isCompact ? "pb-1 pt-2" : "pb-2 pt-3"
      }`}
    >
      <DashboardSurface accent="neutral" className="p-0">
        <div className={`transition-all duration-300 ${isCompact ? "px-4 py-2.5 sm:px-5" : "px-5 py-4 sm:px-6"}`}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className={`inline-flex shrink-0 items-center justify-center rounded-2xl border border-miransas-cyan/12 bg-miransas-cyan/7 text-[#9af4ee] transition-all duration-300 ${
                    isCompact ? "h-9 w-9" : "h-11 w-11"
                  }`}
                >
                  <LayoutDashboard className={isCompact ? "h-4 w-4" : "h-5 w-5"} />
                </div>
                <div className="min-w-0">
                  <div className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500 transition-all duration-300 ${isCompact ? "px-2.5 py-0.5" : "px-3 py-1"}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-miransas-cyan/80 shadow-[0_0_10px_rgba(0,255,209,0.35)]" />
                    {headerConfig.eyebrow}
                  </div>
                  <div className={`${isCompact ? "mt-2" : "mt-3"} flex min-w-0 items-center gap-2`}>
                    <h1
                      className={`truncate font-black tracking-tight text-white transition-all duration-300 ${
                        isCompact ? "text-[1.15rem] sm:text-[1.25rem]" : "text-[1.7rem] sm:text-[2rem]"
                      }`}
                    >
                      {pageLabel}
                    </h1>
                    {headerConfig.mode === "focus" ? (
                      <span className="hidden rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500 sm:inline-flex">
                        Active workflow
                      </span>
                    ) : null}
                  </div>
                  {showSummary ? (
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-400 transition-all duration-300">
                      {summary}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <AssistantLauncher
                  variant="dashboard"
                  storageKey="dashboard-global"
                  density="compact"
                />
                {headerConfig.isHome ? (
                  <div className="flex items-center gap-2">
                    <div className="inline-flex h-10 items-center rounded-2xl border border-white/10 bg-white/[0.02] px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                      {activePlan.name}
                    </div>
                    {showUpgrade ? (
                      <Link
                        href="/dashboard/billing"
                        className="inline-flex h-10 items-center rounded-2xl border border-white/10 bg-white/[0.02] px-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300 transition hover:border-miransas-cyan/16 hover:text-white"
                      >
                        Upgrade
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            {!isCompact ? (
              <div className="flex items-center justify-between gap-3 border-t border-white/8 pt-3 text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-miransas-cyan" />
                  Search docs, requests, webhooks, and logs without leaving the current surface.
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                  {activePlan.name} plan
                </div>
              </div>
            ) : headerConfig.mode !== "home" ? (
              <div className="flex items-center gap-2 border-t border-white/8 pt-2 text-[11px] text-zinc-500">
                <Search className="h-3.5 w-3.5 text-miransas-cyan" />
                Focused page mode keeps the header compact.
              </div>
            ) : null}
          </div>
        </div>
      </DashboardSurface>
    </div>
  );
}
