"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard } from "lucide-react";

import { SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar";
import { useAssistantContext } from "@/components/shared/assistant-context";
import { usePricingPlan } from "@/components/provider/pricing-plan-provider";
import { AssistantLauncher } from "@/components/site/shared/assistant-launcher";
import { getPricingPlan } from "@/lib/pricing";

import { getDashboardHeaderConfig } from "./dashboard-header-config";
import { useDashboardScrollState } from "./use-dashboard-scroll-state";

export default function DashboardHeader() {
  const pathname = usePathname();
  const { pageLabel, context } = useAssistantContext();
  const { plan } = usePricingPlan();
  const activePlan = getPricingPlan(plan);
  const isScrolled = useDashboardScrollState();
  const headerConfig = getDashboardHeaderConfig(pathname);
  const summary =
    context.currentPage?.summary ||
    "Search docs, runtime clues, and troubleshooting guidance from the dashboard.";
  const isCompact = isScrolled || !headerConfig.isHome;
  const showSummary = headerConfig.isHome && !isCompact;

  return (
    <div
      className={`sticky top-0 z-30 px-4 transition-[padding] duration-300 sm:px-6 lg:px-8 ${
        isCompact ? "pb-2 pt-3" : "pb-3 pt-4"
      }`}
    >
      <section className="rounded-xl border border-white/8 bg-[#101113]/95">
        <div className={`transition-all duration-300 ${isCompact ? "px-4 py-3 sm:px-5" : "px-5 py-4 sm:px-6"}`}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <SidebarTrigger className="mt-0.5 rounded-lg border border-white/10 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.06]" />
                <div
                  className={`inline-flex shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-100 transition-all duration-300 ${
                    isCompact ? "h-8 w-8" : "h-9 w-9"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                    {headerConfig.eyebrow}
                  </p>
                  <div className={`${isCompact ? "mt-2" : "mt-3"} flex min-w-0 items-center gap-2`}>
                    <h1
                      className={`truncate font-semibold tracking-tight text-white transition-all duration-300 ${
                        isCompact ? "text-[1.05rem] sm:text-[1.15rem]" : "text-[1.45rem] sm:text-[1.65rem]"
                      }`}
                    >
                      {pageLabel}
                    </h1>
                    {headerConfig.mode === "focus" ? (
                      <span className="hidden rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500 sm:inline-flex">
                        Focused view
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
                    <div className="inline-flex h-10 items-center rounded-lg border border-white/8 bg-white/[0.03] px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                      {activePlan.name}
                    </div>
                    <Link
                      href="/dashboard/billing"
                      className="inline-flex h-10 items-center rounded-lg border border-white/8 bg-white/[0.03] px-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
                    >
                      Billing
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
