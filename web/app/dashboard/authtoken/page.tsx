"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Eye, EyeOff, KeyRound, RefreshCcw, ShieldAlert } from "lucide-react";
import { fetchControlPlane, type ControlPlaneTokenState } from "@/lib/controlplane";
import { DashboardPageShell } from "@/components/dashboard/shared/page-shell";

export default function AuthTokenPage() {
  const [data, setData] = useState<ControlPlaneTokenState | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetchControlPlane<ControlPlaneTokenState>("/api/tokens/current");
      setData(response);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load token state.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const copyToken = async () => {
    if (!data?.token) return;
    await navigator.clipboard.writeText(data.token);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const rotateToken = async () => {
    try {
      await fetchControlPlane<{ token: string }>("/api/tokens/generate", { method: "POST" });
      await load();
    } catch (rotateError) {
      setError(rotateError instanceof Error ? rotateError.message : "Token rotation failed.");
    }
  };

  const revokeSessions = async () => {
    const confirmed = window.confirm(
      "Revoke all active tunnel sessions? Connected agents will need to reconnect."
    );
    if (!confirmed) return;

    try {
      await fetchControlPlane("/api/tokens/revoke", { method: "POST" });
      await load();
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : "Session revoke failed.");
    }
  };

  return (
    <DashboardPageShell
      eyebrow="Authentication"
      title="Manage the instance token"
      description="This self-hosted MVP uses one instance token for CLI agents. Rotate it when needed and revoke sessions when you want every active tunnel to disconnect immediately."
      highlights={[
        {
          label: "Token mode",
          value: "Single instance",
          note: "The control plane currently uses one shared token for all connected agents.",
        },
        {
          label: "Last used",
          value: data?.last_used_at || "Never",
          note: "Updated when the relay accepts a tunnel handshake.",
        },
        {
          label: "Active agents",
          value: data ? String(data.active_nodes) : "0",
          note: error || "Each connected tunnel agent counts as one active node here.",
        },
      ]}
      panels={[
        {
          title: "Why the token is instance-wide",
          description: "The first release prioritizes a clear self-hosted story over a half-finished per-user auth system. Rotate the token when you want to replace machine access.",
        },
        {
          title: "What is still missing",
          description: "Per-user API keys, per-agent machine identities, and audit approvals still belong to the next backend milestone.",
        },
      ]}
    >
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-white/10 bg-[#080808] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-miransas-cyan" />
              <h2 className="text-xl font-semibold text-white">Current token</h2>
            </div>
            <button
              onClick={load}
              className="rounded-xl border border-white/8 bg-white/5 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/8 bg-black/30 p-4 font-mono text-sm">
            <div className="flex-1 overflow-x-auto whitespace-nowrap text-miransas-cyan">
              {loading
                ? "Loading token..."
                : revealed
                  ? data?.token || "Token unavailable"
                  : "••••••••••••••••••••••••••••••••"}
            </div>
            <button
              onClick={() => setRevealed((value) => !value)}
              className="rounded-xl border border-white/8 bg-white/5 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              onClick={copyToken}
              className="rounded-xl border border-white/8 bg-white/5 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <p className="mt-4 text-sm leading-7 text-zinc-400">
            Use the token with <span className="font-mono text-miransas-cyan">binboi auth &lt;token&gt;</span> on each machine that should open tunnels.
          </p>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </article>

        <article className="space-y-4 rounded-3xl border border-white/10 bg-[#080808] p-6">
          <h2 className="text-xl font-semibold text-white">Token actions</h2>
          <button
            onClick={rotateToken}
            className="w-full rounded-2xl bg-miransas-cyan px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110"
          >
            Generate a new token
          </button>
          <button
            onClick={revokeSessions}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
          >
            <ShieldAlert className="h-4 w-4" />
            Revoke all active sessions
          </button>
          <p className="text-sm leading-7 text-zinc-500">
            Rotating the token changes future agent authentication. Revoking sessions drops every active tunnel immediately.
          </p>
        </article>
      </section>
    </DashboardPageShell>
  );
}
