"use client";

import Link from "next/link";
import { Clock3, ExternalLink, RotateCcw, X } from "lucide-react";

import { RequestErrorExplainer } from "@/components/shared/request-error-explainer";
import {
  buildAssistantContextForDelivery,
  type WebhookDeliveryRecord,
} from "@/lib/webhook-debug-data";

function tone(status: WebhookDeliveryRecord["deliveryStatus"]) {
  if (status === "SUCCESS") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  }
  if (status === "RETRYING") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-100";
  }
  return "border-red-400/20 bg-red-500/10 text-red-200";
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
  if (!record || !open) {
    return null;
  }

  const isFailure = record.deliveryStatus !== "SUCCESS";

  return (
    <div className="fixed inset-0 z-[85]">
      <button
        type="button"
        aria-label="Close webhook details"
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l border-white/10 bg-[#060608]/97 shadow-[-24px_0_80px_rgba(0,0,0,0.55)]">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-300">
                  {record.provider}
                </span>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${tone(record.deliveryStatus)}`}>
                  {record.deliveryStatus}
                </span>
                {record.errorClassification && (
                  <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                    {record.errorClassification.replaceAll("_", " ")}
                  </span>
                )}
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                {record.eventType}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                {record.method} {record.path}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/[0.03] p-2 text-zinc-400 transition hover:border-white/20 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {isFailure && (
              <RequestErrorExplainer context={buildAssistantContextForDelivery(record)} />
            )}
            <Link
              href="/docs/webhooks"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white"
            >
              Open webhook docs
              <ExternalLink className="h-4 w-4 text-zinc-500" />
            </Link>
          </div>
        </div>

        <div className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">Status</p>
              <p className="mt-2 text-sm font-medium text-white">{record.status}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">Latency</p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-white">
                <Clock3 className="h-3.5 w-3.5 text-miransas-cyan" />
                {record.durationMs} ms
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">Retries</p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-white">
                <RotateCcw className="h-3.5 w-3.5 text-zinc-400" />
                {record.retries}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">Received</p>
              <p className="mt-2 text-sm font-medium text-white">
                {new Date(record.receivedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Delivery path
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
              <p>Source: {record.source}</p>
              <p>Destination: {record.destination}</p>
              <p>Tunnel id: {record.tunnelId}</p>
              {record.signatureHeader && <p>Signature header: {record.signatureHeader}</p>}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Request preview
              </p>
              <p className="mt-4 text-sm leading-7 text-zinc-300">{record.requestPreview}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Response preview
              </p>
              <p className="mt-4 text-sm leading-7 text-zinc-300">{record.responsePreview}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Payload preview
            </p>
            <pre className="custom-scrollbar mt-4 max-h-72 overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-xs leading-6 text-zinc-300">
              <code>{record.payloadPreview}</code>
            </pre>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Response headers
            </p>
            <div className="mt-4 space-y-2 text-sm leading-7 text-zinc-300">
              {record.responseHeaders.map((header) => (
                <p key={header}>{header}</p>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
