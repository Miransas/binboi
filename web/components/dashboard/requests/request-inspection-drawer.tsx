"use client";

import Link from "next/link";
import { Clock3, ExternalLink, Route, Waypoints, X } from "lucide-react";

import { RequestErrorExplainer } from "@/components/shared/request-error-explainer";
import { buildAssistantContextForRequest, type RequestInspectionRecord } from "@/lib/request-debug-data";

function tone(status: number) {
  if (status >= 500) {
    return "border-red-400/20 bg-red-500/10 text-red-200";
  }
  if (status >= 400) {
    return "border-amber-300/20 bg-amber-400/10 text-amber-100";
  }
  return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
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
  if (!record || !open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[85]">
      <button
        type="button"
        aria-label="Close request details"
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l border-white/10 bg-[linear-gradient(180deg,rgba(20,26,36,0.98),rgba(10,14,21,0.99))] shadow-[-24px_0_80px_rgba(2,6,23,0.46)]">
        <div className="relative border-b border-white/10 px-5 py-5">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-300">
                  {record.method}
                </span>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${tone(record.status)}`}
                >
                  {record.status}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                  {record.kind}
                </span>
                {record.provider ? (
                  <span className="rounded-full border border-violet-300/16 bg-violet-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-100">
                    {record.provider}
                  </span>
                ) : null}
                {record.error_type ? (
                  <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                    {record.error_type.replaceAll("_", " ")}
                  </span>
                ) : null}
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                {record.path}
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                {record.event_type
                  ? `${record.event_type} through ${record.tunnel_subdomain}`
                  : `${record.tunnel_subdomain} -> ${record.destination || record.target}`}
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
            {record.status >= 400 ? (
              <RequestErrorExplainer context={buildAssistantContextForRequest(record)} />
            ) : null}
            <Link
              href={record.kind === "WEBHOOK" ? "/docs/webhooks" : "/docs/requests"}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white"
            >
              Open related docs
              <ExternalLink className="h-4 w-4 text-zinc-500" />
            </Link>
          </div>
        </div>

        <div className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">Status</p>
              <p className="mt-2 text-sm font-medium text-white">{record.status}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">Duration</p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-white">
                <Clock3 className="h-3.5 w-3.5 text-miransas-cyan" />
                {record.duration_ms} ms
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">Observed</p>
              <p className="mt-2 text-sm font-medium text-white">
                {new Date(record.created_at).toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">Tunnel</p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-white">
                <Waypoints className="h-3.5 w-3.5 text-violet-200" />
                {record.tunnel_subdomain}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Request path
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
              <p>Source: {record.source || "Public ingress"}</p>
              <p>Target: {record.target || "Unknown target"}</p>
              <p>Destination: {record.destination || record.target || "Unknown destination"}</p>
              {record.error_type ? <p>Error class: {record.error_type.replaceAll("_", " ")}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Request preview
              </p>
              <p className="mt-4 text-sm leading-7 text-zinc-300">
                {record.request_preview || "No request preview recorded."}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Response preview
              </p>
              <p className="mt-4 text-sm leading-7 text-zinc-300">
                {record.response_preview || "No response preview was captured."}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              <Route className="h-3.5 w-3.5 text-zinc-500" />
              Payload preview
            </div>
            <pre className="custom-scrollbar mt-4 max-h-72 overflow-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-xs leading-6 text-zinc-300">
              <code>{record.payload_preview || "No payload preview was captured."}</code>
            </pre>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Request headers
              </p>
              <div className="mt-4 space-y-2 text-sm leading-7 text-zinc-300">
                {(record.request_headers ?? []).length > 0 ? (
                  record.request_headers?.map((header) => <p key={header}>{header}</p>)
                ) : (
                  <p>No request headers were captured.</p>
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Response headers
              </p>
              <div className="mt-4 space-y-2 text-sm leading-7 text-zinc-300">
                {(record.response_headers ?? []).length > 0 ? (
                  record.response_headers?.map((header) => <p key={header}>{header}</p>)
                ) : (
                  <p>No response headers were captured.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
