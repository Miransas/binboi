"use client";

import { ArrowUpRight, Clock3, RotateCcw, ShieldAlert } from "lucide-react";

import { RequestErrorExplainer } from "@/components/shared/request-error-explainer";
import {
  buildAssistantContextForDelivery,
  type WebhookDeliveryRecord,
} from "@/lib/webhook-debug-data";
import { cn } from "@/lib/utils";

function statusClass(status: WebhookDeliveryRecord["deliveryStatus"]) {
  if (status === "SUCCESS") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  }
  if (status === "RETRYING") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-100";
  }
  return "border-red-400/20 bg-red-500/10 text-red-200";
}

function providerGlow(provider: WebhookDeliveryRecord["provider"]) {
  switch (provider) {
    case "Stripe":
      return "from-violet-400/18";
    case "Clerk":
      return "from-sky-400/18";
    case "Supabase":
      return "from-emerald-400/18";
    case "GitHub":
      return "from-zinc-300/18";
    case "Linear":
      return "from-fuchsia-400/18";
    case "Neon":
      return "from-cyan-300/18";
  }
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
      className={cn(
        "group relative overflow-hidden rounded-[1.75rem] border bg-[#070709]/92 p-5 transition duration-200",
        active
          ? "border-miransas-cyan/30 shadow-[0_0_0_1px_rgba(0,255,209,0.18),0_24px_80px_rgba(0,0,0,0.36)]"
          : "border-white/10 hover:border-white/18",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-90",
          providerGlow(record.provider),
        )}
      />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="relative z-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <button type="button" onClick={onSelect} className="min-w-0 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-300">
                {record.provider}
              </span>
              <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]", statusClass(record.deliveryStatus))}>
                {record.deliveryStatus}
              </span>
              {record.errorClassification && (
                <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                  {record.errorClassification.replaceAll("_", " ")}
                </span>
              )}
            </div>

            <h3 className="mt-4 text-xl font-semibold tracking-tight text-white">
              {record.eventType}
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              {record.method} {record.path}
            </p>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {isFailure && (
              <RequestErrorExplainer
                context={buildAssistantContextForDelivery(record)}
                className="shrink-0"
              />
            )}
            <button
              type="button"
              onClick={onSelect}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white"
            >
              View details
              <ArrowUpRight className="h-4 w-4 text-zinc-500" />
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/8 bg-black/25 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">Status</p>
            <p className="mt-2 text-sm font-medium text-white">{record.status}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/25 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">Latency</p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-white">
              <Clock3 className="h-3.5 w-3.5 text-miransas-cyan" />
              {record.durationMs} ms
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/25 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">Retries</p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-white">
              <RotateCcw className="h-3.5 w-3.5 text-zinc-400" />
              {record.retries}
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/25 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">Destination</p>
            <p className="mt-2 max-h-12 overflow-hidden text-sm font-medium text-white">
              {record.destination}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              <ShieldAlert className="h-3.5 w-3.5 text-zinc-500" />
              Payload preview
            </div>
            <p className="mt-3 max-h-28 overflow-hidden text-sm leading-7 text-zinc-300">
              {record.payloadPreview}
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/25 p-4">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              <ShieldAlert className="h-3.5 w-3.5 text-zinc-500" />
              Response preview
            </div>
            <p className="mt-3 max-h-28 overflow-hidden text-sm leading-7 text-zinc-300">
              {record.responsePreview}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
