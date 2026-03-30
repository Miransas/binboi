"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, KeyRound, Plus, RefreshCcw, Trash2 } from "lucide-react";

import { DashboardPageShell } from "@/components/dashboard/shared/page-shell";
import { DashboardSurface } from "@/components/dashboard/shared/dashboard-primitives";

type AccessTokenRecord = {
  id: string;
  name: string;
  prefix: string;
  status: "ACTIVE" | "REVOKED";
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

type AccessTokenResponse = {
  auth_mode: "account" | "preview";
  user: {
    id: string;
    name: string;
    email: string;
    plan: "FREE" | "PRO" | "SCALE";
  };
  limits: {
    plan: "FREE" | "PRO" | "SCALE";
    max_tokens: number;
    max_tunnels: number;
    tokens_used: number;
    active_tunnels: number | null;
  };
  tokens: AccessTokenRecord[];
};

type AccessTokenCreateResponse = AccessTokenResponse & {
  token: string;
  record: AccessTokenRecord;
};

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AccessTokensPage() {
  const [data, setData] = useState<AccessTokenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copyState, setCopyState] = useState<string | null>(null);
  const [tokenName, setTokenName] = useState("CLI token");
  const [error, setError] = useState<string | null>(null);
  const [newToken, setNewToken] = useState<AccessTokenCreateResponse | null>(null);

  const load = async (background = false) => {
    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch("/api/v1/tokens", { cache: "no-store" });
      const body = (await response.json()) as AccessTokenResponse & { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Could not load access tokens.");
      }
      setData(body);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load access tokens.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const highlights = useMemo(() => {
    const plan = data?.limits.plan || "FREE";
    const tokenUsage = data ? `${data.limits.tokens_used}/${data.limits.max_tokens}` : "0/0";
    const tunnelAllowance = data
      ? `${data.limits.active_tunnels ?? 0}/${data.limits.max_tunnels}`
      : "0/0";

    return [
      {
        label: "Plan",
        value: plan,
        note:
          plan === "SCALE"
            ? "Scale keeps the token surface wide open for heavier teams and future API-heavy workflows."
            : plan === "PRO"
              ? "Pro foundations are wired in for higher token and tunnel limits."
              : "Free plan foundations are active with conservative default limits.",
      },
      {
        label: "Access tokens",
        value: tokenUsage,
        note: error || "Create, rotate, and revoke CLI credentials without storing raw tokens in the database.",
      },
      {
        label: "Tunnel allowance",
        value: tunnelAllowance,
        note: "Usage numbers are ready for real metering later. The plan-aware limit surface is in place now.",
      },
    ];
  }, [data, error]);

  const copyText = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopyState(key);
    window.setTimeout(() => setCopyState(null), 1500);
  };

  const createToken = async () => {
    setCreating(true);
    try {
      const response = await fetch("/api/v1/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tokenName }),
      });
      const body = (await response.json()) as AccessTokenCreateResponse & { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Could not create access token.");
      }
      setNewToken(body);
      setData(body);
      setError(null);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not create access token.");
    } finally {
      setCreating(false);
    }
  };

  const revokeToken = async (tokenId: string) => {
    const confirmed = window.confirm("Revoke this access token? The CLI will stop authenticating with it immediately.");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/v1/tokens/${tokenId}`, { method: "DELETE" });
      const body = (await response.json()) as AccessTokenResponse & { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Could not revoke access token.");
      }
      setData(body);
      setError(null);
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : "Could not revoke access token.");
    }
  };

  return (
    <DashboardPageShell
      eyebrow="Authentication"
      title="Access tokens for the Binboi CLI"
      description="Create personal access tokens for `binboi login`, review when they were created or last used, and revoke them without ever storing the raw token in the database."
      highlights={highlights}
      panels={[
        {
          title: "How the CLI flow works",
          description:
            "Create a token here, copy it once, then run `binboi login --token <token>` on the machine that should open tunnels. After that, `binboi whoami` verifies the account and plan attached to the saved token.",
        },
        {
          title: "What the product stores",
          description:
            "Binboi stores a token prefix, secure hash, timestamps, and status. The full token is returned only once at creation time, just like a real hosted tunnel product should behave.",
        },
      ]}
    >
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <DashboardSurface accent="neutral" className="p-6">
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-miransas-cyan" />
            <h2 className="text-xl font-semibold text-white">Create a new token</h2>
          </div>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            Give each machine or workflow its own name so revoking old access stays simple.
          </p>

          <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Token name
          </label>
          <input
            value={tokenName}
            onChange={(event) => setTokenName(event.target.value)}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-miransas-cyan/40"
            placeholder="Production MacBook"
          />

          <button
            onClick={createToken}
            disabled={creating}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-miransas-cyan px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {creating ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {creating
              ? "Creating token..."
              : data?.auth_mode === "preview"
                ? "Rotate preview token"
                : "Create access token"}
          </button>

          <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-7 text-amber-100">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-4 w-4 shrink-0" />
              <p>The full token is visible only once. Copy it now and save it into `binboi login --token &lt;token&gt;`.</p>
            </div>
          </div>

          {newToken && (
            <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    New token
                  </p>
                  <p className="mt-2 break-all font-mono text-sm text-white">{newToken.token}</p>
                </div>
                <button
                  onClick={() => copyText(newToken.token, "new-token")}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:bg-white/10 hover:text-white"
                >
                  {copyState === "new-token" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-3 text-sm text-emerald-100">
                Token prefix: <span className="font-mono">{newToken.record.prefix}</span>
              </p>
            </div>
          )}

          {data?.auth_mode === "preview" && (
            <p className="mt-6 text-sm leading-7 text-zinc-500">
              Local preview mode is active because dashboard auth or Postgres is not configured. This page is backed by the relay&apos;s single preview token so `binboi login` and `binboi whoami` still work against the real backend.
            </p>
          )}
        </DashboardSurface>

        <DashboardSurface accent="cyan" className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Existing access tokens</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Signed in as {data?.user.email || "loading..."} on the {data?.limits.plan || "FREE"} plan.
              </p>
            </div>
            <button
              onClick={() => load(true)}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:bg-white/10 hover:text-white"
            >
              <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Prefix</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Last used</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                      Loading access tokens...
                    </td>
                  </tr>
                ) : !data || data.tokens.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                      No access tokens yet. Create one to connect the CLI.
                    </td>
                  </tr>
                ) : (
                  data.tokens.map((token) => (
                    <tr key={token.id} className="bg-black/20">
                      <td className="px-4 py-4 text-white">
                        <p className="font-medium">{token.name}</p>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs text-miransas-cyan">
                        <div className="flex items-center gap-2">
                          <span>{token.prefix}</span>
                          <button
                            onClick={() => copyText(token.prefix, token.id)}
                            className="rounded-lg border border-white/10 bg-white/5 p-1 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                          >
                            {copyState === token.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-zinc-300">{formatDate(token.createdAt)}</td>
                      <td className="px-4 py-4 text-zinc-400">{formatDate(token.lastUsedAt)}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                            token.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-300"
                              : "bg-zinc-700/50 text-zinc-300"
                          }`}
                        >
                          {token.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => revokeToken(token.id)}
                          disabled={token.status !== "ACTIVE"}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {data?.auth_mode === "preview" ? "Rotate" : "Revoke"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DashboardSurface>
      </section>
    </DashboardPageShell>
  );
}
