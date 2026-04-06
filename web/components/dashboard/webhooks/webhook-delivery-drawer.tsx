/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock3, 
  ExternalLink, 
  RotateCcw, 
  X, 
  Terminal,
  Activity,
  Route,
  ServerCrash,
  Zap,
  Key,
  Network
} from "lucide-react";

import { RequestErrorExplainer } from "@/components/shared/request-error-explainer";
import {
  buildAssistantContextForDelivery,
  type WebhookDeliveryRecord,
} from "@/lib/webhook-debug-data";
import { cn } from "@/lib/utils";

// --- Neon Accent Themes ---
function getDeliveryTheme(status: WebhookDeliveryRecord["deliveryStatus"]) {
  if (status === "SUCCESS") return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
  if (status === "RETRYING") return "text-amber-500 border-amber-500/20 bg-amber-500/5";
  return "text-rose-500 border-rose-500/20 bg-rose-500/5";
}

export function WebhookDeliveryDrawer({
  record,
  open,
  onClose,
}: {
  record: WebhookDeliveryRecord | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!record) return null;

  const isFailure = record.deliveryStatus !== "SUCCESS";

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
                    <span className="px-2 py-0.5 rounded border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-[10px] font-bold uppercase tracking-tighter">
                      {record.provider}
                    </span>
                    <span className={cn("px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-tighter", getDeliveryTheme(record.deliveryStatus))}>
                      {record.deliveryStatus}
                    </span>
                    {record.errorClassification && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-400 uppercase tracking-tighter">
                        {record.errorClassification.replaceAll("_", " ")}
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-3xl font-bold tracking-tight text-white break-words">
                    {record.eventType}
                  </h2>
                  
                  <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono">
                    <span className="px-2 py-0.5 rounded border border-white/10 bg-white/5 text-zinc-300">
                      {record.method}
                    </span>
                    <span className="truncate">{record.path}</span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white transition-colors shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Actions Row */}
              <div className="mt-8 flex flex-wrap gap-3">
                {isFailure && (
                  <RequestErrorExplainer context={buildAssistantContextForDelivery(record)} />
                )}
                <Link
                  href="/docs/webhooks"
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/5 text-xs font-bold text-zinc-300 hover:border-white/20 transition-all flex items-center gap-2"
                >
                  Webhook Handlers Doc <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10 bg-[#080809]">
              
              {/* Quick Stats Grid */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "STATUS CODE", val: record.status, icon: Activity, color: record.status >= 400 ? "text-rose-400" : "text-emerald-400" },
                  { label: "LATENCY", val: `${record.durationMs}ms`, icon: Clock3, color: "text-cyan-400" },
                  { label: "RETRIES", val: record.retries, icon: RotateCcw, color: record.retries > 0 ? "text-amber-400" : "text-zinc-500" },
                  { label: "TIMESTAMP", val: new Date(record.receivedAt).toLocaleTimeString(), icon: Zap, color: "text-violet-400" }
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

              {/* Delivery Path */}
              <section className="p-6 rounded-2xl bg-zinc-900/20 border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  <Network className="h-4 w-4 text-violet-400" /> Routing Integrity
                </div>
                <div className="grid md:grid-cols-2 gap-4 font-mono text-xs">
                  <div>
                    <span className="text-zinc-600 block mb-1 uppercase tracking-wider text-[9px]">Source</span>
                    <span className="text-zinc-300">{record.source}</span>
                  </div>
                  <div>
                    <span className="text-zinc-600 block mb-1 uppercase tracking-wider text-[9px]">Destination</span>
                    <span className="text-zinc-300">{record.destination}</span>
                  </div>
                  <div>
                    <span className="text-zinc-600 block mb-1 uppercase tracking-wider text-[9px]">Tunnel ID</span>
                    <span className="text-violet-400">{record.tunnelId}</span>
                  </div>
                  {record.signatureHeader && (
                    <div>
                      <span className="text-zinc-600 block mb-1 uppercase tracking-wider text-[9px] flex items-center gap-1">
                        <Key className="h-2.5 w-2.5" /> Signature Header
                      </span>
                      <span className="text-cyan-400 break-all">{record.signatureHeader}</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Payload Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Payload Data</h3>
                </div>
                <pre className="p-6 rounded-2xl bg-black border border-white/5 font-mono text-[11px] leading-relaxed text-emerald-500/80 overflow-x-auto shadow-inner">
                  <code>{record.payloadPreview || "// Payload empty or not recorded"}</code>
                </pre>
              </section>

              {/* Previews Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Route className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Request Summary</h3>
                  </div>
                  <div className="p-5 rounded-2xl bg-zinc-900/30 border border-white/5 text-xs font-mono text-zinc-400 leading-6">
                    {record.requestPreview || "No data recorded"}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <ServerCrash className="h-4 w-4 text-rose-400" />
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Response Summary</h3>
                  </div>
                  <div className="p-5 rounded-2xl bg-zinc-900/30 border border-white/5 text-xs font-mono text-zinc-400 leading-6 italic">
                    {record.responsePreview || "No response captured"}
                  </div>
                </section>
              </div>

              {/* Headers */}
              <section className="pt-6 border-t border-white/5">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Response Headers</h3>
                <div className="space-y-2 font-mono text-[10px]">
                  {(record.responseHeaders ?? []).length > 0 ? (
                    record.responseHeaders?.map((h, i) => (
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
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}