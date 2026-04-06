/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ArrowUpRight, Clock3, RotateCcw, ShieldAlert, Zap, Globe, Fingerprint } from "lucide-react";
import { RequestErrorExplainer } from "@/components/shared/request-error-explainer";
import {
  buildAssistantContextForDelivery,
  type WebhookDeliveryRecord,
} from "@/lib/webhook-debug-data";
import { cn } from "@/lib/utils";

// Sağlayıcıya özel neon vurgular
function providerAccent(provider: WebhookDeliveryRecord["provider"]) {
  switch (provider) {
    case "Stripe": return "bg-violet-500/10 text-violet-400 border-violet-500/20";
    case "Clerk": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
    case "GitHub": return "bg-zinc-100/10 text-zinc-100 border-zinc-100/20";
    default: return "bg-miransas-cyan/10 text-miransas-cyan border-miransas-cyan/20";
  }
}

function statusTheme(status: WebhookDeliveryRecord["deliveryStatus"]) {
  if (status === "SUCCESS") return "text-emerald-500 bg-emerald-500/5 border-emerald-500/10";
  if (status === "RETRYING") return "text-amber-500 bg-amber-500/5 border-amber-500/10";
  return "text-rose-500 bg-rose-500/5 border-rose-500/10";
}

export function WebhookDeliveryCard({
  record,
  active,
  onSelect,
}: {
  record: WebhookDeliveryRecord;
  active: boolean;
  onSelect: () => void;
}) {
  const isFailure = record.deliveryStatus !== "SUCCESS";

  return (
    <article
      onClick={onSelect}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-3xl border transition-all duration-300",
        active
          ? "border-cyan-500/30 bg-zinc-900/60 shadow-[0_0_40px_-15px_rgba(6,182,212,0.2)]"
          : "border-white/5 bg-zinc-900/20 hover:border-white/10 hover:bg-zinc-900/40"
      )}
    >
      {/* İnce Üst Işık Çizgisi */}
      <div className={cn(
        "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-500/20 to-transparent transition-opacity",
        active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )} />

      <div className="p-6">
        {/* Header: Meta Bilgiler */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <span className={cn("px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter border", providerAccent(record.provider))}>
              {record.provider}
            </span>
            <span className={cn("px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter border", statusTheme(record.deliveryStatus))}>
              {record.deliveryStatus}
            </span>
            {record.errorClassification && (
              <span className="px-2.5 py-0.5 rounded bg-black/40 border border-white/5 text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                {record.errorClassification.replace("_", " ")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-600">
                <Clock3 className="h-3 w-3" />
                {new Date(record.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
             </div>
             <ArrowUpRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5", active ? "text-cyan-400" : "text-zinc-700")} />
          </div>
        </div>

        {/* Path & Title */}
        <div className="mb-6">
          <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-500 transition-colors">
            {record.eventType}
          </h3>
          <div className="mt-1.5 flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span className="text-zinc-700">{record.method}</span>
            <span className="truncate max-w-[200px] sm:max-w-md">{record.path}</span>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric icon={Zap} label="STATUS" value={record.status} active={active} color={record.status >= 400 ? "text-rose-500" : "text-emerald-500"} />
          <Metric icon={ActivityIcon} label="LATENCY" value={`${record.durationMs}ms`} active={active} color="text-cyan-400" />
          <Metric icon={RotateCcw} label="RETRIES" value={record.retries} active={active} />
          <Metric icon={Globe} label="TUNNEL" value={record.tunnelId} active={active} className="hidden md:flex" />
        </div>

        {/* Payload / Response Snippets (Sadece Hata Varsa veya Aktifse Daha Belirgin) */}
        {(active || isFailure) && (
          <div className="mt-6 pt-6 border-t border-white/5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                <Fingerprint className="h-3 w-3" /> Payload Preview
              </div>
              <p className="text-[11px] font-mono leading-relaxed text-zinc-500 line-clamp-2 bg-black/20 p-2 rounded-lg border border-white/[0.02]">
                {record.payloadPreview}
              </p>
            </div>
            
            {isFailure && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[9px] font-bold text-rose-500/50 uppercase tracking-widest">
                  <ShieldAlert className="h-3 w-3" /> Root Cause
                </div>
                <div className="flex items-start gap-2">
                   <RequestErrorExplainer
                    context={buildAssistantContextForDelivery(record)}
                    className="h-auto py-1 px-3 text-[10px]"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// Alt Bileşen: Metrik Kutucuğu
function Metric({ icon: Icon, label, value, active, color, className }: any) {
  return (
    <div className={cn("flex flex-col p-3 rounded-2xl bg-white/[0.02] border border-white/[0.03]", className)}>
      <div className="flex items-center gap-1.5 opacity-40 mb-1">
        <Icon className="h-3 w-3" />
        <span className="text-[8px] font-bold tracking-widest uppercase">{label}</span>
      </div>
      <span className={cn("text-xs font-mono font-bold", color || "text-zinc-300")}>
        {value}
      </span>
    </div>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}