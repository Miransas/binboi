/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Filter, 
  Search, 
  Sparkles, 
  TriangleAlert, 
  Waypoints, 
  Terminal, 
  Zap, 
  Clock, 
  ChevronRight,
  Database,
  SearchCode
} from "lucide-react";

import { usePricingPlan } from "@/components/provider/pricing-plan-provider";
import { RequestInspectionCard } from "@/components/dashboard/requests/request-inspection-card";
import { RequestInspectionDrawer } from "@/components/dashboard/requests/request-inspection-drawer";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";
import { useRegisterAssistantContext } from "@/components/shared/assistant-context";
import { useRequests } from "@/hooks/useRequests";
import {
  buildAssistantContextForRequest,
  normalizeRequestRecord,
  previewRequestRecords,
} from "@/lib/request-debug-data";

type StatusFilter = "ALL" | "SUCCESS" | "ERROR";
type KindFilter = "ALL" | "REQUEST" | "WEBHOOK";

// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function RequestDebugWorkbench() {
  const { requests, isError, isLoading } = useRequests();
  const { plan, planConfig } = usePricingPlan();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const dataMode = isError ? "fallback" : requests.length > 0 ? "live" : isLoading ? "loading" : "empty";
  
  const sourceRecords = useMemo(
    () => (dataMode === "fallback" ? previewRequestRecords : requests).map(normalizeRequestRecord),
    [dataMode, requests]
  );

  const historyCap = planConfig.limits.requestHistory;
  const visibleSourceRecords = useMemo(
    () => (historyCap === null ? sourceRecords : sourceRecords.slice(0, historyCap)),
    [historyCap, sourceRecords]
  );

  const filtered = useMemo(() => {
    const lower = query.trim().toLowerCase();
    return visibleSourceRecords.filter((record) => {
      if (kind !== "ALL" && record.kind !== kind) return false;
      if (status === "SUCCESS" && record.status >= 400) return false;
      if (status === "ERROR" && record.status < 400) return false;
      if (!lower) return true;
      const haystack = [record.method, record.path, record.provider, record.event_type].join(" ").toLowerCase();
      return haystack.includes(lower);
    });
  }, [kind, query, status, visibleSourceRecords]);

  const selected = filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? null;
  const errorCount = sourceRecords.filter((r) => r.status >= 400).length;
  const avgLatency = sourceRecords.length > 0 
    ? Math.round(sourceRecords.reduce((t, r) => t + r.duration_ms, 0) / sourceRecords.length) 
    : 0;

  useRegisterAssistantContext("dashboard-request-debug", {
    currentPage: { path: "/dashboard/requests", title: "Requests", area: "dashboard" }
  });

  return (
    <motion.main 
      initial="hidden" animate="visible" variants={containerVariants}
      className="relative min-h-screen bg-[#050506] px-4 py-12 text-zinc-300 sm:px-6 lg:px-12 font-sans"
    >
      {/* Background Ambient */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl">
        
        {/* Header Section */}
        <motion.section variants={itemVariants} className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 mb-4">
              <Terminal className="h-3 w-3 text-violet-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Traffic Inspector</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Workbench</h1>
            <p className="mt-4 text-zinc-500 max-w-xl leading-relaxed">
              Debug real-time ingress traffic. Inspect payloads, headers, and AI-powered error diagnostics in one unified stream.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-sm md:w-80">
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
              <Database className="h-3 w-3" /> Feed State
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed italic font-mono">
              {dataMode === "live" ? "> LIVE RELAY ACTIVE" : "> FALLBACK: REPLAY MODE"}
            </p>
          </div>
        </motion.section>

        {/* Stats Grid */}
        <motion.section variants={itemVariants} className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-10">
          {[
            { label: "Failing", val: errorCount, icon: TriangleAlert, color: "text-rose-500" },
            { label: "Webhooks", val: sourceRecords.filter(r => r.kind === 'WEBHOOK').length, icon: Sparkles, color: "text-violet-400" },
            { label: "Avg Latency", val: `${avgLatency}ms`, icon: Clock, color: "text-cyan-400" },
            { label: "Total Stream", val: filtered.length, icon: Activity, color: "text-zinc-500" }
          ].map((s, i) => (
            <div key={i} className="p-5 rounded-2xl border border-white/5 bg-zinc-900/20">
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                <s.icon className={`h-3 w-3 ${s.color}`} /> {s.label}
              </div>
              <div className="text-xl font-bold text-white font-mono tracking-tight">{s.val}</div>
            </div>
          ))}
        </motion.section>

        {plan === "FREE" && (
          <motion.div variants={itemVariants} className="mb-10">
            
          </motion.div>
        )}

        <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
          
          {/* Main Feed */}
          <div className="space-y-6">
            {/* Filter Bar */}
            <motion.div variants={itemVariants} className="p-2 rounded-2xl border border-white/5 bg-zinc-900/40 flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-600" />
                <input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter by path, method, provider..."
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <select 
                  value={kind} onChange={(e) => setKind(e.target.value as any)}
                  className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-zinc-400 outline-none hover:border-white/10"
                >
                  <option value="ALL">ALL KINDS</option>
                  <option value="REQUEST">REQUESTS</option>
                  <option value="WEBHOOK">WEBHOOKS</option>
                </select>
                <select 
                  value={status} onChange={(e) => setStatus(e.target.value as any)}
                  className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-zinc-400 outline-none hover:border-white/10"
                >
                  <option value="ALL">ALL STATUS</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="ERROR">ERRORS</option>
                </select>
              </div>
            </motion.div>

            {/* Request List */}
            <motion.div variants={itemVariants} className="space-y-3 min-h-[400px]">
              {isLoading ? (
                <div className="py-20 text-center text-zinc-600 font-mono text-xs animate-pulse tracking-widest">STREAMS_LOADING_IN_PROGRESS...</div>
              ) : filtered.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-white/5 rounded-3xl">
                  <SearchCode className="h-8 w-8 text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-500 text-sm font-mono tracking-tighter">NO MATCHING TRAFFIC FOUND IN BUFFER</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filtered.map((record) => (
                    <motion.div
                      key={record.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                    >
                      <RequestInspectionCard
                        record={record}
                        active={record.id === selectedId}
                        onSelect={() => { setSelectedId(record.id); setDrawerOpen(true); }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </motion.div>
          </div>

          {/* Right Sidebar: Quick Inspection / Timeline */}
          <motion.aside variants={itemVariants} className="space-y-6">
            <div className="sticky top-12 space-y-6">
              <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md">
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">
                  <Activity className="h-3.5 w-3.5 text-cyan-400" /> Active Investigation
                </div>
                
                {selected ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <span className={`w-2 h-2 rounded-full ${selected.status >= 400 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                         <span className="text-lg font-bold text-white font-mono">{selected.status}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">{selected.duration_ms}ms</span>
                    </div>

                    <div className="space-y-4 border-l-2 border-white/5 ml-1 pl-6">
                       {[
                         { label: "Ingress", val: `${selected.method} ${selected.path}`, status: 'done' },
                         { label: "Relay", val: `Target: ${selected.target || 'local'}`, status: 'done' },
                         { label: "Outcome", val: selected.status >= 400 ? "Error Detected" : "Success", status: selected.status >= 400 ? 'err' : 'done' }
                       ].map((step, i) => (
                         <div key={i} className="relative">
                            <div className={`absolute -left-[31px] top-1.5 w-2 h-2 rounded-full border-2 border-[#050506] ${step.status === 'err' ? 'bg-rose-500' : 'bg-violet-500'}`} />
                            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">{step.label}</p>
                            <p className="text-xs text-zinc-400 mt-0.5 break-all font-mono line-clamp-1">{step.val}</p>
                         </div>
                       ))}
                    </div>

                    <button 
                      onClick={() => setDrawerOpen(true)}
                      className="w-full py-3 rounded-xl bg-zinc-950 border border-white/10 text-xs font-bold text-white hover:bg-zinc-900 transition-colors flex items-center justify-center gap-2"
                    >
                      Open Full Inspector <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-600 italic text-center py-10">Select a record to analyze flow</p>
                )}
              </div>

              {/* Documentation / Tips */}
              <div className="p-6 rounded-2xl border border-white/5 bg-black/40">
                <div className="flex items-center gap-2 text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-3">
                  <Zap className="h-3.5 w-3.5" /> AI Explain
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Binboi can explain <span className="text-zinc-300">5xx Gateway Errors</span> or <span className="text-zinc-300">Timeout</span> patterns automatically when you open the detail drawer.
                </p>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>

      <RequestInspectionDrawer
        record={selected}
        open={drawerOpen && Boolean(selected)}
        onClose={() => setDrawerOpen(false)}
      />
    </motion.main>
  );
}