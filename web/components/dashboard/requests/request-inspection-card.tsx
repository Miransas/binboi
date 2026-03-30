"use client";

import { ArrowUpRight, Clock3, Route, ServerCrash, Waypoints } from "lucide-react";

import { RequestErrorExplainer } from "@/components/shared/request-error-explainer";
import { buildAssistantContextForRequest, type RequestInspectionRecord } from "@/lib/request-debug-data";
import { cn } from "@/lib/utils";

function statusClass(status: number) {
  if (status >= 500) {
    return "border-red-400/20 bg-red-500/10 text-red-200";
  }
  if (status >= 400) {
    return "border-amber-300/20 bg-amber-400/10 text-amber-100";
  }
  return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
}

function methodClass(method: string) {
  switch (method.toUpperCase()) {
    case "POST":
      return "border-miransas-cyan/18 bg-miransas-cyan/10 text-miransas-cyan";
    case "PUT":
    case "PATCH":
      return "border-violet-300/18 bg-violet-400/10 text-violet-100";
    case "DELETE":
      return "border-rose-300/18 bg-rose-400/10 text-rose-100";
    default:
      return "border-white/10 bg-white/[0.04] text-zinc-200";
  }
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
      className={cn(
        "group relative overflow-hidden rounded-[1.75rem] border bg-[linear-gradient(180deg,rgba(20,26,36,0.96),rgba(10,14,21,0.98))] p-5 transition duration-200 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.04),0_20px_60px_rgba(2,6,23,0.28)]",
        active
          ? "border-miransas-cyan/18 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_1px_rgba(0,255,209,0.10),0_20px_60px_rgba(2,6,23,0.32)]"
          : "border-white/10 hover:border-white/18",
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(94,217,208,0.08),transparent_38%),radial-gradient(circle_at_88%_12%,rgba(167,139,250,0.06),transparent_22%)]" />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

      <div className="relative z-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <button type="button" onClick={onSelect} className="min-w-0 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]",
                  methodClass(record.method),
                )}
              >
                {record.method}
              </span>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]",
                  statusClass(record.status),
                )}
              >
                {record.status}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
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

            <h3 className="mt-4 text-xl font-semibold tracking-tight text-white">
              {record.path}
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              {record.event_type
                ? `${record.event_type} routed through ${record.tunnel_subdomain}`
                : `${record.tunnel_subdomain} -> ${record.destination || record.target}`}
            </p>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {isFailure ? (
              <RequestErrorExplainer
                context={buildAssistantContextForRequest(record)}
                className="shrink-0"
              />
            ) : null}
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
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">Duration</p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-white">
              <Clock3 className="h-3.5 w-3.5 text-miransas-cyan" />
              {record.duration_ms} ms
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">Tunnel</p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-white">
              <Waypoints className="h-3.5 w-3.5 text-violet-200" />
              {record.tunnel_subdomain}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">Source</p>
            <p className="mt-2 max-h-12 overflow-hidden text-sm font-medium text-white">
              {record.source || "Public ingress"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-600">Destination</p>
            <p className="mt-2 max-h-12 overflow-hidden text-sm font-medium text-white">
              {record.destination || record.target}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              <Route className="h-3.5 w-3.5 text-zinc-500" />
              Request preview
            </div>
            <p className="mt-3 max-h-28 overflow-hidden text-sm leading-7 text-zinc-300">
              {record.request_preview || "No request preview recorded."}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              <ServerCrash className="h-3.5 w-3.5 text-zinc-500" />
              Response preview
            </div>
            <p className="mt-3 max-h-28 overflow-hidden text-sm leading-7 text-zinc-300">
              {record.response_preview || "No response preview was captured."}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
