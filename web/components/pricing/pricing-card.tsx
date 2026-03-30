import { Check, Sparkles } from "lucide-react";

import { PricingActionButton } from "@/components/pricing/pricing-action-button";
import { getPricingPlan, type PricingPlan } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const accentClasses: Record<PricingPlan["accent"], string> = {
  neutral:
    "bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.08),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(148,163,184,0.04),transparent_28%)]",
  cyan:
    "bg-[radial-gradient(circle_at_top_left,rgba(94,217,208,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(94,217,208,0.08),transparent_28%)]",
  violet:
    "bg-[radial-gradient(circle_at_top_left,rgba(167,139,250,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(167,139,250,0.08),transparent_28%)]",
};

export function PricingCard({ plan }: { plan: PricingPlan }) {
  const href =
    plan.id === "FREE"
      ? "/dashboard"
      : plan.id === "PRO"
        ? "/dashboard/requests"
        : "/dashboard/webhooks";

  return (
    <section
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,21,30,0.96),rgba(7,11,17,0.98))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_30px_100px_rgba(0,0,0,0.32)]",
        plan.featured && "border-miransas-cyan/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_1px_rgba(0,255,209,0.08),0_30px_100px_rgba(0,0,0,0.34)]",
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0 opacity-90", accentClasses[plan.accent])} />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              {plan.name}
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-white">
              {plan.price}
              <span className="ml-1 text-base font-semibold text-zinc-500">{plan.cadence}</span>
            </h2>
            <p className="mt-4 text-sm leading-7 text-zinc-300">{plan.description}</p>
          </div>

          {plan.featured ? (
            <div className="rounded-full border border-miransas-cyan/20 bg-miransas-cyan/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-miransas-cyan">
              Most popular
            </div>
          ) : null}
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
            <Sparkles className={cn("h-3.5 w-3.5", plan.featured ? "text-miransas-cyan" : "text-zinc-500")} />
            {plan.tagline}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {plan.cardFeatures.map((feature) => (
            <div
              key={feature}
              className="flex items-start gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm leading-7 text-zinc-200"
            >
              <Check className="mt-1 h-4 w-4 shrink-0 text-miransas-cyan" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <PricingActionButton
          plan={plan.id}
          href={href}
          label={plan.ctaLabel}
          className="mt-6 w-full"
          variant={plan.featured ? "primary" : "secondary"}
        />
      </div>
    </section>
  );
}

export function PricingCurrentPlanBadge({ plan }: { plan: PricingPlan["id"] }) {
  const activePlan = getPricingPlan(plan);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
      Current plan
      <span className="rounded-full border border-miransas-cyan/18 bg-miransas-cyan/10 px-2 py-0.5 text-miransas-cyan">
        {activePlan.name}
      </span>
    </div>
  );
}
