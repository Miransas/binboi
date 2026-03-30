"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, KeyRound, RefreshCcw } from "lucide-react";

import { DashboardSurface } from "@/components/dashboard/shared/dashboard-primitives";

type TokenSummary = {
  auth_mode: "account" | "preview";
  user: {
    email: string;
    plan: "FREE" | "PRO" | "SCALE";
  };
  limits: {
    max_tokens: number;
    tokens_used: number;
    max_tunnels: number;
  };
};

export default function TokenManager() {
  const [summary, setSummary] = useState<TokenSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/tokens", { cache: "no-store" });
      const body = (await response.json()) as TokenSummary;
      if (response.ok) {
        setSummary(body);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <DashboardSurface accent="neutral" className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-miransas-cyan/16 bg-miransas-cyan/8 text-[#8aefe7]">
            <KeyRound className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Access tokens
            </h3>
            <p className="mt-2 text-sm font-medium text-white">
              {loading
                ? "Loading token policy..."
                : `${summary?.limits.tokens_used ?? 0} of ${summary?.limits.max_tokens ?? 0} active`}
            </p>
          </div>
        </div>

        <button
          onClick={load}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-2.5 text-zinc-400 transition hover:border-white/20 hover:text-white"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <p className="mt-5 text-sm leading-7 text-zinc-400">
        {loading
          ? "Checking the current plan and token limits."
          : `${summary?.user.plan || "FREE"} plan foundations are active for ${summary?.user.email || "your workspace"}. Full tokens are shown only once at creation time.`}
      </p>

      <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Recommended next step
        </p>
        <p className="mt-3 text-sm leading-7 text-zinc-300">
          Create a CLI token, then run{" "}
          <span className="font-mono text-miransas-cyan">binboi login --token &lt;token&gt;</span>{" "}
          on the machine that should open tunnels.
        </p>

        <Link
          href="/dashboard/access-tokens"
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-miransas-cyan px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
        >
          Open token manager
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </DashboardSurface>
  );
}
