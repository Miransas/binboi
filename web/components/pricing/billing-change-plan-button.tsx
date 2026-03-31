"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { buildLoginHref } from "@/lib/auth-routing";
import type { BillingPlan } from "@/lib/pricing";

export function BillingChangePlanButton({
  plan,
  label,
  onChanged,
}: {
  plan: Exclude<BillingPlan, "FREE">;
  label: string;
  onChanged?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/change-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };

      if (response.status === 401) {
        router.push(buildLoginHref("/dashboard/billing"));
        return;
      }

      if (!response.ok) {
        throw new Error(body.error || "Could not change the subscription plan.");
      }

      onChanged?.();
    } catch (changeError) {
      setError(
        changeError instanceof Error
          ? changeError.message
          : "Could not change the subscription plan.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void submit()}
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : label}
      </button>
      {error ? <p className="text-xs leading-6 text-red-300">{error}</p> : null}
    </div>
  );
}
