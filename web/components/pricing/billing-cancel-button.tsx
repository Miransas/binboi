"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function BillingCancelButton({
  onCanceled,
}: {
  onCanceled?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelSubscription = async () => {
    const confirmed = window.confirm(
      "Cancel this subscription at the end of the current billing period?",
    );
    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/cancel", {
        method: "POST",
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };

      if (response.status === 401) {
        router.push("/login?callbackUrl=%2Fdashboard%2Fbilling");
        return;
      }

      if (!response.ok) {
        throw new Error(body.error || "Could not cancel this subscription.");
      }

      onCanceled?.();
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : "Could not cancel this subscription.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void cancelSubscription()}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel subscription"}
      </button>
      {error ? <p className="text-xs leading-6 text-red-300">{error}</p> : null}
    </div>
  );
}
