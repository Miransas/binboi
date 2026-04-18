"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import {
  
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  Globe,
  Lock,
  Plus,
  RefreshCcw,
  Terminal,
  Trash2,
  Wifi,
} from "lucide-react";

import { usePricingPlan } from "@/components/provider/pricing-plan-provider";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";
import {
  fetchControlPlane,
  type ControlPlaneTunnel,
  type ControlPlaneRequest,
} from "@/lib/controlplane";

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtBytes(n: number): string {
  if (n >= 1 << 30) return `${(n / (1 << 30)).toFixed(2)} GB`;
  if (n >= 1 << 20) return `${(n / (1 << 20)).toFixed(1)} MB`;
  if (n >= 1 << 10) return `${(n / (1 << 10)).toFixed(1)} KB`;
  return `${n} B`;
}

function fmtRelative(iso: string | undefined): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function fmtDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── request log terminal ──────────────────────────────────────────────────────

const METHOD_COLOR: Record<string, string> = {
  GET:     "text-blue-400",
  POST:    "text-emerald-400",
  PUT:     "text-amber-400",
  PATCH:   "text-amber-400",
  DELETE:  "text-red-400",
  HEAD:    "text-zinc-500",
  OPTIONS: "text-zinc-500",
};

function statusColor(code: number): string {
  if (code >= 500) return "text-red-400";
  if (code >= 400) return "text-amber-400";
  if (code >= 200) return "text-emerald-400";
  return "text-zinc-500";
}

function RequestLog({
  subdomain,
  requests,
}: {
  subdomain: string;
  requests: ControlPlaneRequest[];
}) {
  const rows = requests
    .filter((r) => r.tunnel_subdomain === subdomain)
    .slice(0, 50);

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.04] bg-zinc-950/80">
      {/* header bar */}
      <div className="flex items-center gap-2 border-b border-white/[0.04] bg-black/40 px-4 py-2.5">
        <Terminal className="h-3.5 w-3.5 text-zinc-600" />
        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          request log · {subdomain}
        </span>
        <span className="ml-auto font-mono text-[10px] text-zinc-700">
          {rows.length} recent
        </span>
      </div>

      {/* rows */}
      <div className="max-h-56 overflow-y-auto px-4 py-2 font-mono text-[11px] leading-6">
        {rows.length === 0 ? (
          <p className="py-4 text-center text-zinc-700">
            No requests recorded yet for this tunnel.
          </p>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="flex items-baseline gap-2 hover:bg-white/[0.02]">
              <span className="shrink-0 text-zinc-700">{fmtTime(r.created_at)}</span>
              <span className={`w-14 shrink-0 font-bold ${METHOD_COLOR[r.method] ?? "text-zinc-400"}`}>
                {r.method}
              </span>
              <span className="min-w-0 flex-1 truncate text-zinc-400">{r.path}</span>
              <span className={`shrink-0 font-semibold ${statusColor(r.status)}`}>
                {r.status}
              </span>
              <span className="shrink-0 text-zinc-700">{fmtDuration(r.duration_ms)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── card ──────────────────────────────────────────────────────────────────────

function TunnelCard({
  tunnel,
  requests,
  onDelete,
}: {
  tunnel: ControlPlaneTunnel;
  requests: ControlPlaneRequest[];
  onDelete: (id: string) => Promise<void>;
}) {
  const [logOpen, setLogOpen] = useState(false);

  const isActive = tunnel.status === "ACTIVE";

  const lastReqAt = (() => {
    const hits = requests.filter((r) => r.tunnel_subdomain === tunnel.subdomain);
    if (hits.length === 0) return undefined;
    return hits.reduce((a, b) => (a.created_at > b.created_at ? a : b)).created_at;
  })();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group relative rounded-2xl border border-white/5 bg-zinc-900/20 p-6 transition-all hover:border-white/10"
    >
      {/* ── top row ── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`rounded-xl border border-white/5 bg-zinc-950 p-3 ${
              isActive
                ? "text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                : "text-zinc-600"
            }`}
          >
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold tracking-tight text-white">
                {tunnel.subdomain}
              </h3>
              <span
                className={`rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                  isActive
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : "border-zinc-700 bg-zinc-800 text-zinc-500"
                }`}
              >
                {tunnel.status}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 font-mono text-xs text-zinc-500">
              <Terminal className="h-3 w-3" />
              {tunnel.target}
            </div>
            <a
              href={tunnel.public_url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-center gap-1 font-mono text-[10px] uppercase tracking-tighter text-cyan-400/60 transition-colors hover:text-cyan-400"
            >
              {tunnel.public_url}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <a
            href={tunnel.public_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/5 bg-zinc-950 p-2.5 text-zinc-400 transition-all hover:scale-105 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            onClick={() => onDelete(tunnel.id)}
            className="rounded-xl border border-white/5 bg-zinc-950 p-2.5 text-zinc-600 transition-all hover:scale-105 hover:bg-red-500/5 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── stats footer ── */}
      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.03] pt-6 sm:grid-cols-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Requests</p>
          <p className="mt-0.5 text-sm font-semibold text-zinc-300">
            {tunnel.request_count.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Data out</p>
          <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-violet-400">
            <ArrowUp className="h-3 w-3" />
            {fmtBytes(tunnel.bytes_out)}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Last connected</p>
          <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-zinc-400">
            <Clock className="h-3 w-3" />
            {isActive ? (
              <span className="text-emerald-400">now</span>
            ) : (
              fmtRelative(tunnel.last_connected_at)
            )}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">Last request</p>
          <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-zinc-400">
            <Clock className="h-3 w-3" />
            {lastReqAt ? (
              fmtRelative(lastReqAt)
            ) : (
              <span className="text-zinc-700">—</span>
            )}
          </p>
        </div>
      </div>

      {/* ── request log toggle ── */}
      <button
        onClick={() => setLogOpen((v) => !v)}
        className="mt-4 flex w-full items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600 transition hover:border-white/[0.08] hover:text-zinc-400"
      >
        {logOpen ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
        Request log
      </button>

      <AnimatePresence initial={false}>
        {logOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <RequestLog subdomain={tunnel.subdomain} requests={requests} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

export default function TunnelPage() {
  const { plan } = usePricingPlan();
  const [subdomain, setSubdomain] = useState("");
  const [target, setTarget] = useState("localhost:3000");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: tunnels = [],
    mutate: mutateTunnels,
    isLoading,
  } = useSWR<ControlPlaneTunnel[]>(
    "/api/v1/tunnels",
    (p: string) => fetchControlPlane<ControlPlaneTunnel[]>(p),
    { refreshInterval: 5000, revalidateOnFocus: false },
  );

  const { data: requests = [] } = useSWR<ControlPlaneRequest[]>(
    "/api/v1/requests",
    (p: string) => fetchControlPlane<ControlPlaneRequest[]>(p),
    { refreshInterval: 3000, revalidateOnFocus: false },
  );

  const active    = tunnels.filter((t) => t.status === "ACTIVE").length;
  const reqTotal  = tunnels.reduce((s, t) => s + t.request_count, 0);
  const freeLimitReached = plan === "FREE" && active >= 1;

  const createTunnel = async () => {
    if (freeLimitReached) return;
    setCreating(true);
    setFormError(null);
    try {
      await fetchControlPlane("/api/v1/tunnels", {
        method: "POST",
        body: JSON.stringify({
          subdomain: plan === "FREE" ? "" : subdomain,
          target,
          region: "local",
        }),
      });
      setSubdomain("");
      setTarget("localhost:3000");
      await mutateTunnels();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Tunnel creation failed.");
    } finally {
      setCreating(false);
    }
  };

  const deleteTunnel = async (id: string) => {
    if (!window.confirm("Delete this tunnel reservation?")) return;
    try {
      await fetchControlPlane(`/api/v1/tunnels/${id}`, { method: "DELETE" });
      await mutateTunnels();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Deletion failed.");
    }
  };

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative min-h-screen bg-[#050506] px-4 py-12 text-zinc-300 sm:px-6 lg:px-12"
    >
      {/* ambient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <motion.section variants={itemVariants} className="mb-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1">
            <Wifi className="h-3 w-3 text-cyan-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
              Traffic Relay
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Tunnels
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-500">
            Reserve subdomains and inspect live traffic. Tunnels become{" "}
            <span className="text-emerald-400">ACTIVE</span> when the CLI agent
            connects.
          </p>
        </motion.section>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <motion.section variants={itemVariants} className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Reserved",       value: tunnels.length, color: "text-zinc-400" },
            { label: "Active sessions",value: active,         color: "text-emerald-400" },
            { label: "Total requests", value: reqTotal.toLocaleString(), color: "text-cyan-400" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/5 bg-zinc-900/20 p-6 backdrop-blur-sm"
            >
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                {s.label}
              </p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </motion.section>

        {/* ── Upgrade prompt ─────────────────────────────────────────────── */}
        {plan === "FREE" && (
          <motion.div variants={itemVariants} className="mb-8">
            <UpgradePrompt
              className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-6"
              compact
              title={freeLimitReached ? "Tunnel Limit Reached" : "Free Plan Limits"}
              description={
                freeLimitReached
                  ? "Upgrade to Pro for unlimited active tunnels and custom subdomains."
                  : "Free plan includes one active tunnel with a random public URL."
              }
            />
          </motion.div>
        )}

        <div className="grid gap-8 xl:grid-cols-[420px_1fr]">

          {/* ── Create form ────────────────────────────────────────────── */}
          <motion.section variants={itemVariants}>
            <div className="rounded-2xl border border-white/5 bg-zinc-900/20 p-8 backdrop-blur-sm">
              <div className="mb-8 flex items-center gap-3">
                <div className="rounded-lg bg-cyan-500/10 p-2">
                  <Plus className="h-5 w-5 text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-white">New Reservation</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Subdomain
                  </label>
                  <div className="relative mt-2">
                    <input
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                      disabled={plan === "FREE"}
                      className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-sm text-white transition-colors focus:border-cyan-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder={plan === "FREE" ? "Randomly assigned" : "my-awesome-app"}
                    />
                    {plan === "FREE" && (
                      <Lock className="absolute right-4 top-3.5 h-4 w-4 text-zinc-700" />
                    )}
                  </div>
                </div>

                <div>
                  <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Target
                  </label>
                  <input
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 font-mono text-sm text-white transition-colors focus:border-cyan-500/50 focus:outline-none"
                    placeholder="localhost:3000"
                  />
                </div>

                <button
                  onClick={createTunnel}
                  disabled={creating || freeLimitReached}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-4 text-sm font-bold text-white shadow-[0_0_20px_rgba(8,145,178,0.2)] transition-all hover:bg-cyan-500 active:scale-95 disabled:opacity-50"
                >
                  {creating ? (
                    <RefreshCcw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {freeLimitReached ? "Limit Reached" : "Reserve Tunnel"}
                </button>
              </div>

              {formError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 flex gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {formError}
                </motion.div>
              )}
            </div>
          </motion.section>

          {/* ── Inventory ──────────────────────────────────────────────── */}
          <motion.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                Live Inventory
              </h2>
              <button
                onClick={() => void mutateTunnels()}
                className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-white/5 hover:text-zinc-400"
              >
                <RefreshCcw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            <AnimatePresence mode="popLayout">
              {isLoading && tunnels.length === 0 ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-dashed border-white/5 py-20 text-center font-mono text-sm text-zinc-600"
                >
                  Synchronizing with relay server…
                </motion.div>
              ) : tunnels.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-dashed border-white/5 py-20 text-center font-mono text-sm tracking-tighter text-zinc-600"
                >
                  NO RESERVATIONS DETECTED
                </motion.div>
              ) : (
                tunnels.map((t) => (
                  <TunnelCard
                    key={t.id}
                    tunnel={t}
                    requests={requests}
                    onDelete={deleteTunnel}
                  />
                ))
              )}
            </AnimatePresence>
          </motion.section>
        </div>
      </div>
    </motion.main>
  );
}

// ── inline AlertCircle SVG ────────────────────────────────────────────────────

function AlertCircle({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
