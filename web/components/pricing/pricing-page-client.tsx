"use client";

import Link from "next/link";
import { ArrowRight, Gauge, Sparkles, Waypoints } from "lucide-react";

import { PricingComparisonTable } from "@/components/pricing/pricing-comparison-table";
import { PricingCard, PricingCurrentPlanBadge } from "@/components/pricing/pricing-card";
import { usePricingPlan } from "@/components/provider/pricing-plan-provider";
import {
  SitePageShell,
  SitePanel,
  SiteRail,
  SiteSectionHeader,
} from "@/components/site/shared/site-primitives";
import { pricingPlans } from "@/lib/pricing";
import { Footer } from "../site/shared/footer";

export function PricingPageClient() {
  const { plan, planConfig, aiExplainsRemaining } = usePricingPlan();

  return (
    <>
      <SitePageShell
        eyebrow="Pricing"
        title="Simple pricing for a serious debugging workflow"
        description="Binboi keeps the packaging straightforward: start free, upgrade when the request feed becomes essential, and move to Scale when you want more infrastructure headroom."
      >
        <section
          id="plans"
          className="grid gap-6 xl:grid-cols-[18.5rem_minmax(0,1fr)] 2xl:grid-cols-[19.5rem_minmax(0,1fr)]"
        >
          <SiteRail>
            <SitePanel>
              <PricingCurrentPlanBadge plan={plan} />
              <h2 className="mt-5 text-2xl font-black tracking-[-0.03em] text-white">
                Pick the plan that matches how deep you want to debug.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[rgba(194,203,219,0.76)]">
                Free proves the product shape. Pro is where Binboi becomes a daily tool. Scale
                keeps the same workflow while adding more room for operational teams.
              </p>

              <div className="mt-6 grid gap-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/25 px-4 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                    Active plan
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">{planConfig.name}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-black/25 px-4 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                    AI explains left
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {aiExplainsRemaining === null ? "Unlimited" : `${aiExplainsRemaining} today`}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-black/25 px-4 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                    Request history
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {planConfig.limits.requestHistory === null
                      ? "Full history"
                      : `Last ${planConfig.limits.requestHistory}`}
                  </p>
                </div>
              </div>
            </SitePanel>

            <SitePanel>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#dfe7ff]">
                Upgrade path
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[rgba(194,203,219,0.76)]">
                <p>Free is designed to validate the tunnel loop without clutter.</p>
                <p>Pro unlocks the request feed and debugging depth most teams want every day.</p>
                <p>Scale keeps the same product shape while giving heavier usage more room.</p>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <a
                  href="#comparison"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.08]"
                >
                  Compare plans
                </a>
                <Link
                  href="/dashboard/requests"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                >
                  Open request feed
                </Link>
              </div>
            </SitePanel>
          </SiteRail>

          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
              {pricingPlans.map((planDefinition) => (
                <PricingCard
                  key={planDefinition.id}
                  plan={planDefinition}
                  className={planDefinition.featured ? "lg:col-span-2 2xl:col-span-1" : undefined}
                />
              ))}
            </div>
          </div>
        </section>

        <section
          id="comparison"
          className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18.5rem] 2xl:grid-cols-[minmax(0,1fr)_19.5rem]"
        >
          <SitePanel className="overflow-hidden">
            <SiteSectionHeader
              eyebrow="Comparison"
              title="Know exactly what changes when you upgrade"
              description="No vague enterprise language here. The comparison is built around the parts developers actually hit: tunnel count, history depth, AI explain usage, logs, and webhook debugging quality."
            />
            <div className="mt-6 overflow-x-auto">
              <PricingComparisonTable />
            </div>
          </SitePanel>

          <SiteRail>
            <SitePanel>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#dfe7ff]">
                Reading guide
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[rgba(194,203,219,0.76)]">
                <p>Use the table to compare what changes in tunnel volume, history depth, and AI help.</p>
                <p>The goal is to make the upgrade decision operational, not aspirational.</p>
              </div>
            </SitePanel>
          </SiteRail>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <SitePanel>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-miransas-cyan/18 bg-miransas-cyan/10">
              <Sparkles className="h-4.5 w-4.5 text-miransas-cyan" />
            </div>
            <h3 className="mt-5 text-2xl font-black tracking-[-0.03em] text-white">
              AI that stays practical
            </h3>
            <p className="mt-4 text-sm leading-7 text-zinc-400">
              Free gives you 5 AI explains per day. Pro and Scale remove the cap so every failed
              request and webhook can be explained without rationing.
            </p>
          </SitePanel>

          <SitePanel>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-300/18 bg-violet-400/10">
              <Waypoints className="h-4.5 w-4.5 text-violet-200" />
            </div>
            <h3 className="mt-5 text-2xl font-black tracking-[-0.03em] text-white">
              Better request visibility
            </h3>
            <p className="mt-4 text-sm leading-7 text-zinc-400">
              Free keeps the most recent 50 requests. Paid plans keep the full feed so you can compare
              regressions against healthy baselines instead of losing the context you need.
            </p>
          </SitePanel>

          <SitePanel>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <Gauge className="h-4.5 w-4.5 text-zinc-200" />
            </div>
            <h3 className="mt-5 text-2xl font-black tracking-[-0.03em] text-white">
              Upgrade when the flow proves itself
            </h3>
            <p className="mt-4 text-sm leading-7 text-zinc-400">
              Start free, validate your tunnel workflow, then upgrade when you want custom domains,
              more history, and less friction in day-to-day debugging.
            </p>
          </SitePanel>
        </section>

        <SitePanel>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-black tracking-[-0.03em] text-white">
                Want to feel the difference immediately?
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Open the dashboard, inspect requests, and let the assistant explain failures. The plan
                state is already wired into the MVP product surface.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard/requests"
                className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                Open requests
              </Link>
              <Link
                href="/dashboard/ai"
                className="inline-flex items-center gap-2 rounded-full bg-miransas-cyan px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
              >
                Open AI assistant
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </SitePanel>
      </SitePageShell>
      <Footer />
    </>
  );
}
