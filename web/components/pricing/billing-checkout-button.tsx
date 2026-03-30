"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import type { BillingPlan } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function BillingCheckoutButton({
  plan,
  label,
  className,
  variant = "primary",
}: {
  plan: Exclude<BillingPlan, "FREE">;
  label: string;
  className?: string;
  variant?: "primary" | "secondary";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const body = (await response.json().catch(() => ({}))) as {
        checkoutUrl?: string;
        error?: string;
      };

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok || !body.checkoutUrl) {
        throw new Error(body.error || "Could not open Paddle checkout.");
      }

      window.location.assign(body.checkoutUrl);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Could not open Paddle checkout.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void startCheckout()}
        disabled={loading}
        className={cn(
          "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
          variant === "primary"
            ? "bg-miransas-cyan text-black hover:brightness-110"
            : "border border-white/10 bg-white/[0.03] text-white hover:border-white/20 hover:bg-white/[0.06]",
          className,
        )}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : label}
      </button>
      {error ? <p className="text-xs leading-6 text-red-300">{error}</p> : null}
    </div>
  );
}
