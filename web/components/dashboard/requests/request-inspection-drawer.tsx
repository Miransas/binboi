/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock3, 
  ExternalLink, 
  Route, 
  Waypoints, 
  X, 
  Terminal, 
  Database, 
  ShieldCheck,
  Zap,
  Activity
} from "lucide-react";

import { RequestErrorExplainer } from "@/components/shared/request-error-explainer";
import { buildAssistantContextForRequest, type RequestInspectionRecord } from "@/lib/request-debug-data";
import { cn } from "@/lib/utils";

function getStatusTheme(status: number) {
  if (status >= 500) return "text-rose-500 border-rose-500/20 bg-rose-500/5";
  if (status >= 400) return "text-amber-500 border-amber-500/20 bg-amber-400/5";
  return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
}

export function RequestInspectionDrawer({
  record,
  open,
  onClose,
}: {
  record: RequestInspectionRecord | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!record) return null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative h-full w-full max-w-3xl border-l border-white/5 bg-[#080809] shadow-2xl flex flex-col"
          >
            {/* Header Area */}
            <div className="p-8 border-b border-white/5 bg-zinc-950/50">
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-4 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 font-mono">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                      {record.method}
                    </span>
                    <span className={cn("px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-tighter", getStatusTheme(record.status))}>
                      {record.status}
                    </span>
                    <span className="px-2 py-0.5 rounded border border-violet-500/20 bg-violet-500/5 text-violet-400 text-[10px] font-bold uppercase tracking-tighter">
                      {record.kind}
                    </span>
                  </div>
                  
                  <h2 className="text-3xl font-bold tracking-tight text-white break-all">
                    {record.path}
                  </h2>
                  
                  <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                    <Waypoints className="h-3 w-3 text-violet-400" />
                    <span>{record.tunnel_subdomain}</span>
                    <span className="text-zinc-800">|</span>
                    <Activity className="h-3 w-3 text-cyan-400" />
                    <span className="truncate">{record.target || record.destination}</span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Actions Row */}
              <div className="mt-8 flex flex-wrap gap-3">
                {record.status >= 400 && (
                  <RequestErrorExplainer context={buildAssistantContextForRequest(record)} />
                )}
                <Link
                  href={record.kind === "WEBHOOK" ? "/docs/webhooks" : "/docs/requests"}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/5 text-xs font-bold text-zinc-300 hover:border-white/20 transition-all flex items-center gap-2"
                >
                  View Documentation <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10 bg-[#080809]">
              
              {/* Quick Stats Grid */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "LATENCY", val: `${record.duration_ms}ms`, icon: Clock3, color: "text-cyan-400" },
                  { label: "TIMESTAMP", val: new Date(record.created_at).toLocaleTimeString(), icon: Zap, color: "text-amber-400" },
                  { label: "SOURCE", val: record.source || "Public", icon: ShieldCheck, color: "text-emerald-400" },
                  { label: "REGION", val: "Global/Local", icon: Database, color: "text-zinc-500" }
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5">
                    <div className="flex items-center gap-2 mb-2 opacity-40">
                      <stat.icon className={cn("h-3 w-3", stat.color)} />
                      <span className="text-[8px] font-bold uppercase tracking-widest text-white">{stat.label}</span>
                    </div>
                    <p className="text-xs font-mono text-zinc-300">{stat.val}</p>
                  </div>
                ))}
              </section>

              {/* Main Payloads */}
              <div className="space-y-6">
                {/* JSON Body Preview */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Terminal className="h-4 w-4 text-violet-400" />
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Payload Preview</h3>
                  </div>
                  <pre className="p-6 rounded-2xl bg-black border border-white/5 font-mono text-[11px] leading-relaxed text-emerald-500/80 overflow-x-auto shadow-inner">
                    <code>{record.payload_preview || "// No payload detected"}</code>
                  </pre>
                </section>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Request Preview */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Route className="h-4 w-4 text-cyan-400" />
                      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Request Summary</h3>
                    </div>
                    <div className="p-5 rounded-2xl bg-zinc-900/30 border border-white/5 text-xs font-mono text-zinc-400 leading-6">
                      {record.request_preview || "No data recorded"}
                    </div>
                  </section>

                  {/* Response Preview */}
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="h-4 w-4 text-rose-400" />
                      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Response Summary</h3>
                    </div>
                    <div className="p-5 rounded-2xl bg-zinc-900/30 border border-white/5 text-xs font-mono text-zinc-400 leading-6 italic">
                      {record.response_preview || "No response captured"}
                    </div>
                  </section>
                </div>
              </div>

              {/* Headers Section */}
              <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                {/* Request Headers */}
                <section>
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Request Headers</h3>
                  <div className="space-y-2 font-mono text-[10px]">
                    {(record.request_headers ?? []).length > 0 ? (
                      record.request_headers?.map((h, i) => (
                        <div key={i} className="px-3 py-1.5 rounded bg-zinc-950 border border-white/[0.02] text-zinc-500 break-all">
                          {h}
                        </div>
                      ))
                    ) : (
                      <p className="text-zinc-700 italic">None</p>
                    )}
                  </div>
                </section>

                {/* Response Headers */}
                <section>
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Response Headers</h3>
                  <div className="space-y-2 font-mono text-[10px]">
                    {(record.response_headers ?? []).length > 0 ? (
                      record.response_headers?.map((h, i) => (
                        <div key={i} className="px-3 py-1.5 rounded bg-zinc-950 border border-white/[0.02] text-zinc-500 break-all">
                          {h}
                        </div>
                      ))
                    ) : (
                      <p className="text-zinc-700 italic">None</p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}