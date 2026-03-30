"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, KeyRound, RefreshCcw } from "lucide-react";

type TokenSummary = {
  auth_mode: "account" | "preview";
  user: {
    email: string;
    plan: "FREE" | "PRO";
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
    <div className="rounded-2xl border border-white/10 bg-[#080808] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <KeyRound className="h-5 w-5 text-miransas-cyan" />
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
              Access tokens
            </h3>
            <p className="mt-2 text-sm text-white">
              {loading
                ? "Loading token policy..."
                : `${summary?.limits.tokens_used ?? 0} of ${summary?.limits.max_tokens ?? 0} active`}
            </p>
          </div>
        </div>

        <button
          onClick={load}
          className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <p className="mt-5 text-sm leading-7 text-zinc-400">
        {loading
          ? "Checking the current plan and token limits."
          : `${summary?.user.plan || "FREE"} plan foundations are active for ${summary?.user.email || "your workspace"}. Full tokens are only shown once at creation time.`}
      </p>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/8 bg-black/30 p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            Recommended next step
          </p>
          <p className="mt-2 text-sm text-white">
            Create a CLI token, then run <span className="font-mono text-miransas-cyan">binboi login --token &lt;token&gt;</span>.
          </p>
        </div>
        <Link
          href="/dashboard/access-tokens"
          className="inline-flex items-center gap-2 rounded-xl bg-miransas-cyan px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110"
        >
          Open page
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
