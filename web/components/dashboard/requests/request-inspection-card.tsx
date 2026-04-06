/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { ArrowUpRight, Clock3, Route, ServerCrash, Waypoints, Terminal, Activity } from "lucide-react";
import { RequestErrorExplainer } from "@/components/shared/request-error-explainer";
import { buildAssistantContextForRequest, type RequestInspectionRecord } from "@/lib/request-debug-data";
import { cn } from "@/lib/utils";

// --- Helpers for Neon Accents ---
function getStatusTheme(status: number) {
  if (status >= 500) return "text-rose-500 border-rose-500/20 bg-rose-500/5";
  if (status >= 400) return "text-amber-500 border-amber-500/20 bg-amber-500/5";
  return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
}

function getMethodTheme(method: string) {
  const m = method.toUpperCase();
  if (m === "POST") return "text-cyan-400 border-cyan-400/20 bg-cyan-400/5";
  if (m === "DELETE") return "text-rose-400 border-rose-400/20 bg-rose-400/5";
  if (["PUT", "PATCH"].includes(m)) return "text-violet-400 border-violet-400/20 bg-violet-400/5";
  return "text-zinc-400 border-white/10 bg-white/5";
}

export function RequestInspectionCard({
  record,
  active,
  onSelect,
}: {
  record: RequestInspectionRecord;
  active: boolean;
  onSelect: () => void;
}) {
  const isFailure = record.status >= 400;

  return (
    <article
      onClick={onSelect}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300",
        active 
          ? "border-violet-500/40 bg-zinc-900/40 shadow-[0_0_30px_rgba(139,92,246,0.05)]" 
          : "border-white/5 bg-zinc-900/20 hover:border-white/10 hover:bg-zinc-900/30"
      )}
    >
      {/* Side Indicator Line */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 transition-all",
        isFailure ? "bg-rose-500/50" : "bg-emerald-500/20",
        active && "w-1.5 opacity-100"
      )} />

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          
          {/* Main Info Section */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-4 font-mono">
              <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-tighter", getMethodTheme(record.method))}>
                {record.method}
              </span>
              <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-tighter", getStatusTheme(record.status))}>
                {record.status}
              </span>
              <span className="px-2 py-0.5 rounded border border-white/5 bg-white/5 text-zinc-500 text-[10px] font-bold uppercase tracking-tighter">
                {record.kind}
              </span>
              {record.provider && (
                <span className="px-2 py-0.5 rounded border border-violet-500/20 bg-violet-500/5 text-violet-400 text-[10px] font-bold uppercase tracking-tighter">
                  {record.provider}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Terminal className="h-4 w-4 text-zinc-700 shrink-0" />
              <h3 className={cn(
                "text-lg font-bold tracking-tight transition-colors truncate",
                active ? "text-white" : "text-zinc-300 group-hover:text-white"
              )}>
                {record.path}
              </h3>
            </div>
            
            <p className="mt-2 text-xs text-zinc-600 font-mono flex items-center gap-2">
              <Activity className="h-3 w-3" />
              {record.event_type || `${record.tunnel_subdomain} → ${record.target || record.destination}`}
            </p>
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-3 shrink-0">
            {isFailure && (
              <RequestErrorExplainer
                context={buildAssistantContextForRequest(record)}
                className="scale-90 origin-right"
              />
            )}
            <div className="p-2 rounded-lg bg-zinc-950 border border-white/5 text-zinc-500 group-hover:text-white transition-colors">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Technical Metadata Grid */}
        <div className="mt-8 grid gap-2 grid-cols-2 sm:grid-cols-4">
          {[
            { label: "LATENCY", val: `${record.duration_ms}ms`, icon: Clock3, color: "text-cyan-400" },
            { label: "RELAY", val: record.tunnel_subdomain, icon: Waypoints, color: "text-violet-400" },
            { label: "SOURCE", val: record.source || "remote", icon: Activity, color: "text-zinc-500" },
            { label: "TARGET", val: record.target || "local", icon: Terminal, color: "text-zinc-500" }
          ].map((item, i) => (
            <div key={i} className="px-3 py-2 rounded-lg bg-black/20 border border-white/[0.03]">
              <div className="flex items-center gap-1.5 mb-1 opacity-40">
                <item.icon className="h-2.5 w-2.5" />
                <span className="text-[8px] font-bold uppercase tracking-widest leading-none">{item.label}</span>
              </div>
              <p className="text-xs font-mono font-medium text-zinc-400 truncate">{item.val}</p>
            </div>
          ))}
        </div>

        {/* Data Previews (Collapsible or Truncated) */}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.03] hover:border-white/5 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Route className="h-3 w-3 text-zinc-700" />
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">REQUEST_BODY</span>
            </div>
            <p className="text-[11px] font-mono leading-relaxed text-zinc-500 line-clamp-3">
              {record.request_preview || "NO_PAYLOAD_CAPTURED"}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.03] hover:border-white/5 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <ServerCrash className="h-3 w-3 text-zinc-700" />
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">RESPONSE_BODY</span>
            </div>
            <p className="text-[11px] font-mono leading-relaxed text-zinc-500 line-clamp-3 italic">
              {record.response_preview || "NO_RESPONSE_CAPTURED"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Subtle Bottom Glow for Active State */}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
      )}
    </article>
  );
}