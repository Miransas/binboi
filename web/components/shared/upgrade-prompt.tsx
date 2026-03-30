"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { usePricingPlan } from "@/components/provider/pricing-plan-provider";
import { getNextPlan, getPricingPlan } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function UpgradePrompt({
  title,
  description,
  className,
  compact = false,
}: {
  title: string;
  description: string;
  className?: string;
  compact?: boolean;
}) {
  const { plan } = usePricingPlan();
  const nextPlan = getNextPlan(plan);

  if (!nextPlan) {
    return null;
  }

  const nextPlanConfig = getPricingPlan(nextPlan);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-miransas-cyan/18 bg-[linear-gradient(180deg,rgba(11,24,29,0.96),rgba(8,14,20,0.98))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_60px_rgba(2,6,23,0.24)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(94,217,208,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(167,139,250,0.08),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-miransas-cyan/28 to-transparent" />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-miransas-cyan/16 bg-miransas-cyan/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-miransas-cyan">
            <Sparkles className="h-3.5 w-3.5" />
            Upgrade path
          </div>
          <h3 className={cn("mt-4 font-semibold text-white", compact ? "text-base" : "text-xl")}>
            {title}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-zinc-300">
            {description}
          </p>
        </div>

        <Link
          href={`/pricing?focus=${nextPlan.toLowerCase()}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-miransas-cyan px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
        >
          {nextPlanConfig.ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
