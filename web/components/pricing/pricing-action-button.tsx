"use client";

import Link from "next/link";

import { usePricingPlan } from "@/components/provider/pricing-plan-provider";
import type { BillingPlan } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function PricingActionButton({
  plan,
  label,
  href,
  variant = "primary",
  className,
}: {
  plan: BillingPlan;
  label: string;
  href: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const { setPlan } = usePricingPlan();

  return (
    <Link
      href={href}
      onClick={() => setPlan(plan)}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition",
        variant === "primary"
          ? "bg-miransas-cyan text-black hover:brightness-110"
          : "border border-white/10 bg-white/[0.03] text-white hover:border-white/20 hover:bg-white/[0.06]",
        className,
      )}
    >
      {label}
    </Link>
  );
}
