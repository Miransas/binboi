"use client";

import { useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, AlertTriangle, Clock, RefreshCcw, Search, Inbox } from "lucide-react";

import { fetchControlPlane, type ControlPlaneRequest } from "@/lib/controlplane";
import { cn } from "@/lib/utils";

// ── color maps ────────────────────────────────────────────────────────────────

const METHOD_STYLE: Record<string, string> = {
  GET:     "bg-blue-500/15 text-blue-400 border-blue-500/20",
  POST:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  PUT:     "bg-amber-500/15 text-amber-400 border-amber-500/20",
  PATCH:   "bg-amber-500/15 text-amber-400 border-amber-500/20",
  DELETE:  "bg-red-500/15 text-red-400 border-red-500/20",
  HEAD:    "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  OPTIONS: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
};

function methodStyle(method: string) {
  return METHOD_STYLE[method.toUpperCase()] ?? "bg-zinc-500/15 text-zinc-400 border-zinc-500/20";
}

function statusColor(code: number) {
  if (code >= 500) return "text-red-400";
  if (code >= 400) return "text-amber-400";
  if (code >= 200 && code < 300) return "text-emerald-400";
  return "text-zinc-400";
}

function statusDotColor(code: number) {
  if (code >= 500) return "bg-red-400";
  if (code >= 400) return "bg-amber-400";
  if (code >= 200 && code < 300) return "bg-emerald-400";
  return "bg-zinc-500";
}

function durationColor(ms: number) {
  if (ms > 2000) return "text-red-400";
  if (ms > 500) return "text-amber-400";
  return "text-zinc-400";
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function fmtDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── types ─────────────────────────────────────────────────────────────────────

type StatusFilter = "ALL" | "2xx" | "4xx" | "5xx";

// ── skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-px">
      {[1, 0.7, 0.45].map((o, i) => (
        <div
          key={i}
          className="h-14 animate-pulse border-b border-white/[0.04] bg-white/[0.015]"
          style={{ opacity: o }}
        />
      ))}
    </div>
  );
}

// ── animation ─────────────────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const sect = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

// ── page ──────────────────────────────────────────────────────────────────────

export default function RequestsPage() {
  const [query, setQuery]               = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const { data, error, mutate, isLoading } = useSWR(
    "/api/v1/requests",
    (path: string) => fetchControlPlane<ControlPlaneRequest[]>(path),
    { refreshInterval: 3000, revalidateOnFocus: false },
  );

  const all: ControlPlaneRequest[] = Array.isArray(data) ? data : [];

  const records = all.filter((r) => {
    if (statusFilter === "2xx" && (r.status < 200 || r.status >= 300)) return false;
    if (statusFilter === "4xx" && (r.status < 400 || r.status >= 500)) return false;
    if (statusFilter === "5xx" && r.status < 500) return false;
    if (query.trim()) {
      const q   = query.toLowerCase();
      const hay = [r.method, r.path, r.tunnel_subdomain, r.provider ?? ""].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const errors = all.filter((r) => r.status >= 400).length;
  const avgMs  = all.length > 0
    ? Math.round(all.reduce((s, r) => s + r.duration_ms, 0) / all.length)
    : 0;

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={container}
      className="relative min-h-screen bg-[#050506] px-4 py-12 text-zinc-300 sm:px-6 lg:px-12"
    >
      {/* ambient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/3 h-[400px] w-[500px] rounded-full bg-violet-500/[0.04] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <motion.div variants={sect} className="mb-10 flex items-start justify-between gap-4">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1">
              <Activity className="h-3 w-3 text-violet-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
                Live feed · 3 s
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Requests</h1>
            <p className="mt-3 max-w-xl text-base text-zinc-500">
              HTTP traffic forwarded through your tunnels.
              <span className="ml-2 inline-flex items-center gap-1 rounded border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-blue-400">GET</span>
              <span className="ml-1 inline-flex items-center gap-1 rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-400">POST</span>
              <span className="ml-1 inline-flex items-center gap-1 rounded border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-red-400">DELETE</span>
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

        {/* ── Stats ───────────────────────────────────────────────────────── */}
        {all.length > 0 && (
          <motion.div variants={sect} className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Total",       value: all.length,           color: "text-white" },
              { label: "Avg latency", value: `${avgMs}ms`,         color: "text-miransas-cyan" },
              { label: "Errors",      value: errors,               color: errors > 0 ? "text-red-400" : "text-zinc-500" },
              { label: "Success",     value: all.length - errors,  color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-zinc-900/20 px-6 py-5">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Filter bar ──────────────────────────────────────────────────── */}
        <motion.div variants={sect} className="mb-6 flex flex-wrap gap-3">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-white/[0.06] bg-zinc-900/20 px-4 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-zinc-600" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by path, method, tunnel…"
              className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
            />
          </label>
          <div className="flex gap-2">
            {(["ALL", "2xx", "4xx", "5xx"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-xs font-semibold transition",
                  statusFilter === s
                    ? s === "5xx" ? "border-red-500/30 bg-red-500/10 text-red-400"
                      : s === "4xx" ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      : s === "2xx" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-miransas-cyan/30 bg-miransas-cyan/10 text-miransas-cyan"
                    : "border-white/[0.06] bg-zinc-900/20 text-zinc-500 hover:text-zinc-300",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Error banner ─────────────────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 flex items-center gap-3 rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-400"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Could not reach the control plane. Check that the Go relay is running.
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        <motion.div
          variants={sect}
          className="overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900/20 backdrop-blur-sm"
        >
          <div className="border-b border-white/[0.06] bg-white/[0.02] px-6 py-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              {records.length} record{records.length !== 1 ? "s" : ""}
              {(query || statusFilter !== "ALL") && " (filtered)"}
            </span>
          </div>

          {isLoading && all.length === 0 ? (
            <Skeleton />
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center gap-4 px-8 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <Inbox className="h-5 w-5 text-zinc-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">
                  {all.length > 0 ? "No requests match the filter" : "No requests yet"}
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  {all.length > 0
                    ? "Clear the search or change the status filter."
                    : "HTTP traffic through active tunnels will appear here."}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.04] text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                    <th className="w-24 px-6 py-3.5">Method</th>
                    <th className="px-6 py-3.5">Path</th>
                    <th className="w-20 px-6 py-3.5">Status</th>
                    <th className="w-28 px-6 py-3.5">Duration</th>
                    <th className="w-32 px-6 py-3.5">Time</th>
                    <th className="w-36 px-6 py-3.5">Tunnel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {records.map((r) => (
                      <motion.tr
                        key={r.id}
                        layout
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="group hover:bg-white/[0.02]"
                      >
                        {/* Method */}
                        <td className="px-6 py-3.5">
                          <span
                            className={cn(
                              "inline-block rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase",
                              methodStyle(r.method),
                            )}
                          >
                            {r.method}
                          </span>
                        </td>

                        {/* Path */}
                        <td className="px-6 py-3.5 max-w-xs">
                          <span className="block truncate font-mono text-xs text-zinc-300">
                            {r.path}
                          </span>
                          {r.provider && (
                            <span className="mt-0.5 block text-[10px] text-zinc-600">
                              {r.provider}
                              {r.event_type ? ` · ${r.event_type}` : ""}
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDotColor(r.status)}`} />
                            <span className={`font-mono font-semibold ${statusColor(r.status)}`}>
                              {r.status}
                            </span>
                          </div>
                        </td>

                        {/* Duration */}
                        <td className="px-6 py-3.5">
                          <span className={cn("font-mono text-xs", durationColor(r.duration_ms))}>
                            {fmtDuration(r.duration_ms)}
                          </span>
                        </td>

                        {/* Time */}
                        <td className="px-6 py-3.5">
                          <span className="flex items-center gap-1.5 text-xs text-zinc-600">
                            <Clock className="h-3 w-3 shrink-0" />
                            {fmtTime(r.created_at)}
                          </span>
                        </td>

                        {/* Tunnel */}
                        <td className="px-6 py-3.5">
                          <span className="font-mono text-[11px] text-zinc-600 transition group-hover:text-zinc-400">
                            {r.tunnel_subdomain}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* poll note */}
        {!isLoading && all.length > 0 && (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-zinc-700">
            <Activity className="h-3 w-3" />
            {all.length} record{all.length !== 1 ? "s" : ""} · auto-refresh every 3 s
          </p>
        )}
      </div>
    </motion.main>
  );
}
