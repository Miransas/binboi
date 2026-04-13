"use client";

import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Globe,
  RefreshCcw,
  Wifi,
  WifiOff,
  Clock,
  ExternalLink,
} from "lucide-react";

import { fetchControlPlane, type ControlPlaneTunnel } from "@/lib/controlplane";

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: ControlPlaneTunnel["status"] }) {
  const map = {
    ACTIVE:   { dot: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]", text: "text-emerald-400", label: "Active" },
    INACTIVE: { dot: "bg-zinc-500",   text: "text-zinc-500",    label: "Inactive" },
    ERROR:    { dot: "bg-red-400",    text: "text-red-400",     label: "Error" },
  } as const;
  const s = map[status] ?? map.INACTIVE;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ── animation ─────────────────────────────────────────────────────────────────

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const row       = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

// ── page ──────────────────────────────────────────────────────────────────────

export default function TunnelsPage() {
  const { data, error, mutate, isLoading } = useSWR(
    "/api/v1/tunnels",
    (path: string) => fetchControlPlane<ControlPlaneTunnel[]>(path),
    { refreshInterval: 5000, revalidateOnFocus: false },
  );

  const tunnels: ControlPlaneTunnel[] = Array.isArray(data) ? data : [];
  const active   = tunnels.filter((t) => t.status === "ACTIVE").length;
  const inactive = tunnels.filter((t) => t.status === "INACTIVE").length;
  const hasError = error != null;

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={container}
      className="relative min-h-screen bg-[#050506] px-4 py-12 text-zinc-300 sm:px-6 lg:px-12"
    >
      {/* ambient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-miransas-cyan/[0.04] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <motion.div variants={row} className="mb-10 flex items-start justify-between gap-4">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-miransas-cyan/20 bg-miransas-cyan/5 px-3 py-1">
              <Wifi className="h-3 w-3 text-miransas-cyan" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-miransas-cyan">
                Control plane · live
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Tunnels</h1>
            <p className="mt-3 max-w-xl text-base text-zinc-500">
              Active tunnel sessions and reservations. Auto-refreshes every 5 seconds.
            </p>
          </div>
          <button
            onClick={() => void mutate()}
            className="mt-1 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs font-medium text-zinc-400 transition hover:border-white/[0.12] hover:text-white"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </motion.div>

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <motion.div variants={row} className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: "Total",    value: tunnels.length, color: "text-white",         icon: Globe },
            { label: "Active",   value: active,         color: "text-emerald-400",   icon: Wifi },
            { label: "Inactive", value: inactive,       color: "text-zinc-500",      icon: WifiOff },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-zinc-900/20 px-6 py-5 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2 text-zinc-600">
                <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{s.label}</span>
              </div>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Error ──────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {hasError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 flex items-center gap-3 rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-400"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Could not reach the control plane. Ensure the Go relay is running.
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <motion.div variants={row} className="overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900/20 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-6 py-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Tunnel inventory
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-zinc-600">
              <Activity className="h-3 w-3" />
              Auto-refresh · 5 s
            </div>
          </div>

          {isLoading && tunnels.length === 0 ? (
            <div className="space-y-3 p-6">
              {[0.9, 0.7, 0.5].map((o, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-xl border border-white/[0.04] bg-white/[0.02]"
                  style={{ opacity: o }}
                />
              ))}
            </div>
          ) : tunnels.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <WifiOff className="h-5 w-5 text-zinc-600" />
              </div>
              <p className="text-sm font-medium text-zinc-500">No tunnels found</p>
              <p className="mt-1 text-xs text-zinc-600">
                Run <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-zinc-400">binboi http 3000</code> to open a tunnel.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.04] text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                    <th className="px-6 py-3.5">Subdomain</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Target</th>
                    <th className="px-6 py-3.5">Requests</th>
                    <th className="px-6 py-3.5">Created</th>
                    <th className="px-6 py-3.5" />
                  </tr>
                </thead>
                <AnimatePresence mode="popLayout">
                  <motion.tbody className="divide-y divide-white/[0.04]">
                    {tunnels.map((t) => (
                      <motion.tr
                        key={t.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group hover:bg-white/[0.02]"
                      >
                        <td className="px-6 py-4">
                          <div className="font-mono font-semibold text-white">{t.subdomain}</div>
                          <div className="mt-0.5 truncate text-[11px] text-zinc-600">{t.public_url}</div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-zinc-400">{t.target}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-zinc-300">{t.request_count.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <Clock className="h-3 w-3" />
                            {fmtDate(t.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {t.public_url && (
                            <a
                              href={t.public_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-white/[0.06] px-2.5 py-1.5 text-xs text-zinc-500 opacity-0 transition hover:text-zinc-300 group-hover:opacity-100"
                            >
                              Open
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </AnimatePresence>
              </table>
            </div>
          )}
        </motion.div>

        {/* poll note */}
        {!isLoading && tunnels.length > 0 && (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-zinc-700">
            <Activity className="h-3 w-3" />
            {tunnels.length} tunnel{tunnels.length !== 1 ? "s" : ""} · polling every 5 s
          </p>
        )}
      </div>
    </motion.main>
  );
}
