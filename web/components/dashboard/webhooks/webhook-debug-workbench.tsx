/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Sparkles,
  TriangleAlert,
  Webhook,
  Waypoints,
  Terminal,
  Database,
  Activity,
  BookOpen,
  SearchCode,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

import { WebhookDeliveryCard } from "@/components/dashboard/webhooks/webhook-delivery-card";
import { WebhookDeliveryDrawer } from "@/components/dashboard/webhooks/webhook-delivery-drawer";
import {
  buildAssistantContextForDelivery,
  buildWebhookDeliveryRecordsFromRequests,
  previewWebhookDeliveryRecords,
  type WebhookDeliveryRecord,
} from "@/lib/webhook-debug-data";
import { useRequests } from "@/hooks/useRequests";
import { cn } from "@/lib/utils";

const providerNotes = [
  { provider: "Stripe", note: "Most failures come from signature verification or raw-body handling, not tunnel reachability." },
  { provider: "Clerk", note: "Watch for middleware or auth guards intercepting the webhook route before the signature check runs." },
  { provider: "GitHub", note: "404 responses often mean the provider path and the actual framework route do not match." },
];

// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export function WebhookDebugWorkbench() {
  const pathname = usePathname();
  const { requests, isError, isLoading } = useRequests({ kind: "WEBHOOK" });
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState<"ALL" | WebhookDeliveryRecord["provider"]>("ALL");
  const [status, setStatus] = useState<"ALL" | WebhookDeliveryRecord["deliveryStatus"]>("ALL");
  const [failedOnly, setFailedOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const dataMode = isError ? "fallback" : requests.length > 0 ? "live" : isLoading ? "loading" : "empty";
  
  const deliveries = useMemo(
    () => dataMode === "fallback" ? previewWebhookDeliveryRecords : buildWebhookDeliveryRecordsFromRequests(requests),
    [dataMode, requests]
  );

  const providers = useMemo(
    () => ["ALL", ...new Set(deliveries.map((record) => record.provider))] as const,
    [deliveries]
  );

  const filtered = useMemo(() => {
    const lower = query.trim().toLowerCase();
    return deliveries.filter((record) => {
      if (provider !== "ALL" && record.provider !== provider) return false;
      if (status !== "ALL" && record.deliveryStatus !== status) return false;
      if (failedOnly && record.deliveryStatus === "SUCCESS") return false;
      if (!lower) return true;

      const haystack = [
        record.provider, record.eventType, record.path, record.destination, 
        record.errorClassification, record.requestPreview, record.responsePreview
      ].filter(Boolean).join(" ").toLowerCase();

      return haystack.includes(lower);
    });
  }, [deliveries, failedOnly, provider, query, status]);

  const selected = filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? null;

  const failedCount = deliveries.filter((r) => r.deliveryStatus === "FAILED").length;
  const retryingCount = deliveries.filter((r) => r.deliveryStatus === "RETRYING").length;
  const avgLatency = deliveries.length > 0 
    ? Math.round(deliveries.reduce((t, r) => t + r.durationMs, 0) / deliveries.length) 
    : 0;

  const selectedTimeline = selected ? [
    {
      label: "Ingress",
      title: `${selected.provider} emitted ${selected.eventType}`,
      desc: `Reached ${selected.path} from ${selected.source}.`,
      status: "complete"
    },
    {
      label: "Forward",
      title: `Forwarded to ${selected.destination}`,
      desc: `Routed via ${selected.tunnelId} in ${selected.durationMs}ms.`,
      status: selected.deliveryStatus === "FAILED" ? "error" : "complete"
    },
    {
      label: "Outcome",
      title: selected.deliveryStatus === "SUCCESS" ? `Responded with ${selected.status}` : selected.errorClassification || "Investigation Needed",
      desc: selected.deliveryStatus === "SUCCESS" ? "Webhook completed successfully." : selected.responsePreview,
      status: selected.deliveryStatus === "SUCCESS" ? "complete" : selected.deliveryStatus === "RETRYING" ? "active" : "error"
    }
  ] : [];

  return (
    <motion.main 
      initial="hidden" animate="visible" variants={containerVariants}
      className="relative min-h-screen bg-[#050506] px-4 py-12 text-zinc-300 sm:px-6 lg:px-12 font-sans"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-cyan-600/5 blur-[130px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl">
        
        {/* Header Section */}
        <motion.section variants={itemVariants} className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-4">
              <Webhook className="h-3 w-3 text-cyan-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Webhook Monitor</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Webhooks</h1>
            <p className="mt-4 text-zinc-500 max-w-xl leading-relaxed">
              Investigate provider deliveries, payload signatures, and local handler responses in real-time.
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-sm md:w-80">
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
              <Database className="h-3 w-3" /> Feed State
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed italic font-mono">
              {dataMode === "live" ? "> LIVE EVENTS STREAMING" : dataMode === "fallback" ? "> FALLBACK: REPLAY MODE" : "> WAITING FOR TRAFFIC"}
            </p>
          </div>
        </motion.section>

        {/* Stats Grid */}
        <motion.section variants={itemVariants} className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-10">
          {[
            { label: "Failed", val: failedCount, icon: TriangleAlert, color: "text-rose-500" },
            { label: "Retrying", val: retryingCount, icon: AlertCircle, color: "text-amber-500" },
            { label: "Avg Latency", val: `${avgLatency}ms`, icon: Waypoints, color: "text-cyan-400" },
            { label: "Total Visible", val: filtered.length, icon: Activity, color: "text-zinc-500" }
          ].map((s, i) => (
            <div key={i} className="p-5 rounded-2xl border border-white/5 bg-zinc-900/20">
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                <s.icon className={`h-3 w-3 ${s.color}`} /> {s.label}
              </div>
              <div className="text-xl font-bold text-white font-mono tracking-tight">{s.val}</div>
            </div>
          ))}
        </motion.section>

        <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
          
          {/* Main Feed */}
          <div className="space-y-6">
            {/* Filter Bar */}
            <motion.div variants={itemVariants} className="p-2 rounded-2xl border border-white/5 bg-zinc-900/40 flex flex-col lg:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-600" />
                <input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search provider, event, route..."
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select 
                  value={provider} onChange={(e) => setProvider(e.target.value as any)}
                  className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-zinc-400 outline-none hover:border-white/10"
                >
                  {providers.map(p => <option key={p} value={p}>{p === "ALL" ? "ALL PROVIDERS" : p.toUpperCase()}</option>)}
                </select>
                <select 
                  value={status} onChange={(e) => setStatus(e.target.value as any)}
                  className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-zinc-400 outline-none hover:border-white/10"
                >
                  <option value="ALL">ALL STATUS</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="RETRYING">RETRYING</option>
                  <option value="FAILED">FAILED</option>
                </select>
                
                {/* Custom Toggle for Failed Only */}
                <button
                  onClick={() => setFailedOnly(!failedOnly)}
                  className={cn(
                    "px-4 py-3 rounded-xl border text-xs font-bold tracking-tight transition-colors flex items-center gap-2",
                    failedOnly 
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400" 
                      : "bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full", failedOnly ? "bg-rose-500 animate-pulse" : "bg-zinc-700")} />
                  ERRORS ONLY
                </button>
              </div>
            </motion.div>

            {/* List */}
            <motion.div variants={itemVariants} className="space-y-3 min-h-[400px]">
              {isLoading && dataMode === "loading" ? (
                <div className="py-20 text-center text-zinc-600 font-mono text-xs animate-pulse tracking-widest">AWAITING_WEBHOOK_EVENTS...</div>
              ) : filtered.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-white/5 rounded-3xl">
                  <SearchCode className="h-8 w-8 text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-500 text-sm font-mono tracking-tighter">NO MATCHING DELIVERIES IN BUFFER</p>
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
                      <WebhookDeliveryCard
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

          {/* Right Sidebar */}
          <motion.aside variants={itemVariants} className="space-y-6">
            <div className="sticky top-12 space-y-6">
              
              {/* Active Investigation Panel */}
              <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md">
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">
                  <Terminal className="h-3.5 w-3.5 text-cyan-400" /> Current Focus
                </div>
                
                {selected ? (
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-bold text-white break-all">{selected.provider} <span className="text-zinc-500">{selected.eventType}</span></p>
                      <p className="text-xs text-zinc-400 font-mono mt-1">{selected.durationMs}ms latency • Status {selected.status}</p>
                    </div>

                    {/* Inline Timeline */}
                    <div className="space-y-5 border-l-2 border-white/5 ml-1 pl-5">
                       {selectedTimeline.map((step, i) => (
                         <div key={i} className="relative">
                            <div className={cn(
                              "absolute -left-[27px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-[#050506]",
                              step.status === 'error' ? 'bg-rose-500' : step.status === 'active' ? 'bg-amber-500' : 'bg-cyan-500'
                            )} />
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{step.label}</p>
                            <p className="text-xs text-white mt-1 font-medium">{step.title}</p>
                            <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed line-clamp-2">{step.desc}</p>
                         </div>
                       ))}
                    </div>

                    <button 
                      onClick={() => setDrawerOpen(true)}
                      className="w-full py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                    >
                      Inspect Deep Delivery
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-600 italic text-center py-10">Select a delivery to trace its lifecycle</p>
                )}
              </div>

              {/* Provider Notes */}
              <div className="p-6 rounded-2xl border border-white/5 bg-black/40">
                <div className="flex items-center gap-2 text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-4">
                  <Sparkles className="h-3.5 w-3.5" /> Provider Quirks
                </div>
                <div className="space-y-4">
                  {providerNotes.map((item) => (
                    <div key={item.provider} className="border-l-2 border-white/10 pl-3">
                      <p className="text-[10px] font-bold text-zinc-300 uppercase">{item.provider}</p>
                      <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Docs Links */}
              <div className="p-6 rounded-2xl border border-white/5 bg-zinc-900/20">
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">
                  <BookOpen className="h-3.5 w-3.5" /> Quick Docs
                </div>
                <div className="space-y-2">
                  {[
                    { href: "/docs/webhooks", title: "Signature Verification Guide" },
                    { href: "/docs/troubleshooting", title: "Troubleshooting Handlers" },
                  ].map((link) => (
                    <Link key={link.href} href={link.href} className="flex items-center gap-2 text-xs text-zinc-400 hover:text-cyan-400 transition-colors p-2 -ml-2 rounded-lg hover:bg-white/5">
                      <CheckCircle2 className="h-3 w-3 opacity-50" /> {link.title}
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </motion.aside>
        </div>
      </div>

      <WebhookDeliveryDrawer
        record={selected}
        open={drawerOpen && Boolean(selected)}
        onClose={() => setDrawerOpen(false)}
      />
    </motion.main>
  );
}