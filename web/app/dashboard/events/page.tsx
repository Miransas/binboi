"use client";

import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  RefreshCcw,
  Radio,
  Info,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { fetchControlPlane, type ControlPlaneEvent } from "@/lib/controlplane";
import { cn } from "@/lib/utils";

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function LevelBadge({ level }: { level: string }) {
  const map: Record<string, { cls: string; Icon: React.ElementType; label: string }> = {
    INFO:  { cls: "text-blue-400 bg-blue-400/10 border-blue-400/20",   Icon: Info,         label: "Info"  },
    WARN:  { cls: "text-amber-400 bg-amber-400/10 border-amber-400/20", Icon: AlertCircle,  label: "Warn"  },
    ERROR: { cls: "text-red-400 bg-red-400/10 border-red-400/20",       Icon: AlertTriangle, label: "Error" },
    OK:    { cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", Icon: CheckCircle2, label: "OK" },
  };
  const s = map[level?.toUpperCase()] ?? map.INFO;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest", s.cls)}>
      <s.Icon className="h-2.5 w-2.5" />
      {s.label}
    </span>
  );
}

// ── animation ─────────────────────────────────────────────────────────────────

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const row       = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

// ── page ──────────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const { data, error, mutate, isLoading } = useSWR(
    "/api/v1/events",
    (path: string) => fetchControlPlane<ControlPlaneEvent[]>(path),
    { refreshInterval: 5000, revalidateOnFocus: false },
  );

  const events: ControlPlaneEvent[] = Array.isArray(data) ? data : [];
  const hasError = error != null;

  const counts = {
    info:  events.filter((e) => e.level?.toUpperCase() === "INFO").length,
    warn:  events.filter((e) => e.level?.toUpperCase() === "WARN").length,
    error: events.filter((e) => e.level?.toUpperCase() === "ERROR").length,
  };

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={container}
      className="relative min-h-screen bg-[#050506] px-4 py-12 text-zinc-300 sm:px-6 lg:px-12"
    >
      {/* ambient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-violet-500/[0.04] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <motion.div variants={row} className="mb-10 flex items-start justify-between gap-4">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/5 px-3 py-1">
              <Radio className="h-3 w-3 text-violet-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
                Control plane · events
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Events</h1>
            <p className="mt-3 max-w-xl text-base text-zinc-500">
              Audit log of control-plane activity. Auto-refreshes every 5 seconds.
            </p>
          </div>
          <button
            onClick={() => void mutate()}
            className="mt-1 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs font-medium text-zinc-400 transition hover:border-white/[0.12] hover:text-white"
          >
            <RefreshCcw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            Refresh
          </button>
        </motion.div>

        {/* ── Stats ────────────────────────────────────────────────────────── */}
        <motion.div variants={row} className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total",  value: events.length, color: "text-white",        Icon: Activity },
            { label: "Info",   value: counts.info,   color: "text-blue-400",     Icon: Info },
            { label: "Warn",   value: counts.warn,   color: "text-amber-400",    Icon: AlertCircle },
            { label: "Error",  value: counts.error,  color: "text-red-400",      Icon: AlertTriangle },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-zinc-900/20 px-6 py-5 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2 text-zinc-600">
                <s.Icon className={cn("h-3.5 w-3.5", s.color)} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{s.label}</span>
              </div>
              <p className={cn("text-3xl font-bold", s.color)}>{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Error banner ─────────────────────────────────────────────────── */}
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

        {/* ── Event log ────────────────────────────────────────────────────── */}
        <motion.div variants={row} className="overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900/20 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-6 py-4">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Event log
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-zinc-600">
              <Activity className="h-3 w-3" />
              Auto-refresh · 5 s
            </div>
          </div>

          {isLoading && events.length === 0 ? (
            <div className="space-y-3 p-6">
              {[0.9, 0.7, 0.5].map((o, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-xl border border-white/[0.04] bg-white/[0.02]"
                  style={{ opacity: o }}
                />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <Radio className="h-5 w-5 text-zinc-600" />
              </div>
              <p className="text-sm font-medium text-zinc-500">No events yet</p>
              <p className="mt-1 text-xs text-zinc-600">
                Run{" "}
                <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-zinc-400">
                  binboi http 3000 my-app
                </code>{" "}
                to create your first tunnel and generate events.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.04] text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                    <th className="px-6 py-3.5">Level</th>
                    <th className="px-6 py-3.5">Message</th>
                    <th className="px-6 py-3.5">Tunnel</th>
                    <th className="px-6 py-3.5">Time</th>
                  </tr>
                </thead>
                <AnimatePresence mode="popLayout">
                  <motion.tbody className="divide-y divide-white/[0.04]">
                    {events.map((e, i) => (
                      <motion.tr
                        key={`${e.created_at}-${i}`}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group hover:bg-white/[0.02]"
                      >
                        <td className="px-6 py-3.5">
                          <LevelBadge level={e.level} />
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="font-mono text-xs text-zinc-300">{e.message}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          {e.tunnel_subdomain ? (
                            <span className="font-mono text-xs text-zinc-500">{e.tunnel_subdomain}</span>
                          ) : (
                            <span className="text-zinc-700">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                            <Clock className="h-3 w-3" />
                            {fmtTime(e.created_at)}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </AnimatePresence>
              </table>
            </div>
          )}
        </motion.div>

        {!isLoading && events.length > 0 && (
          <p className="mt-4 flex items-center gap-1.5 text-xs text-zinc-700">
            <Activity className="h-3 w-3" />
            {events.length} event{events.length !== 1 ? "s" : ""} · polling every 5 s
          </p>
        )}
      </div>
    </motion.main>
  );
}
