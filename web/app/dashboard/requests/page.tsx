"use client";

import { useState } from "react";
import { Activity, Inbox, RefreshCcw, Search, Webhook } from "lucide-react";

import { DashboardRouteFrame } from "@/app/dashboard/_components/dashboard-route-frame";
import { RequestInspectionCard } from "@/components/dashboard/requests/request-inspection-card";
import { RequestInspectionDrawer } from "@/components/dashboard/requests/request-inspection-drawer";
import { useRequests } from "@/hooks/useRequests";
import { normalizeRequestRecord } from "@/lib/request-debug-data";
import { cn } from "@/lib/utils";

type StatusFilter = "ALL" | "SUCCESS" | "ERROR";
type KindFilter = "ALL" | "REQUEST" | "WEBHOOK";

function RowSkeleton() {
  return (
    <div className="space-y-3">
      {[0.9, 0.7, 0.55, 0.4].map((opacity, i) => (
        <div
          key={i}
          className="h-[180px] animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.02]"
          style={{ opacity }}
        />
      ))}
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 px-8 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
        <Inbox className="h-5 w-5 text-zinc-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-400">
          {filtered ? "No requests match the current filters" : "No requests recorded yet"}
        </p>
        <p className="mt-1 text-sm text-zinc-600">
          {filtered
            ? "Clear the search or adjust the filters to see all traffic."
            : "HTTP traffic routed through active tunnels will appear here every 3 seconds."}
        </p>
      </div>
    </div>
  );
}

export default function RequestsPage() {
  const { requests, isLoading, isError, refresh } = useRequests();
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<KindFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const records = requests.map(normalizeRequestRecord);

  const filtered = records.filter((r) => {
    if (kindFilter !== "ALL" && r.kind !== kindFilter) return false;
    if (statusFilter === "SUCCESS" && r.status >= 400) return false;
    if (statusFilter === "ERROR" && r.status < 400) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const hay = [r.method, r.path, r.provider, r.event_type, r.tunnel_subdomain].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const selected = filtered.find((r) => r.id === selectedId) ?? null;

  const errors = records.filter((r) => r.status >= 400).length;
  const webhooks = records.filter((r) => r.kind === "WEBHOOK").length;
  const avgMs =
    records.length > 0
      ? Math.round(records.reduce((s, r) => s + r.duration_ms, 0) / records.length)
      : 0;

  return (
    <DashboardRouteFrame variant="workbench">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">

          {/* ── Header ───────────────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                Control plane · live feed
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Requests</h1>
              <p className="mt-1.5 text-sm text-zinc-400">
                HTTP traffic routed through your tunnels. Refreshes every 3 seconds.
              </p>
            </div>
            <button
              onClick={() => void refresh()}
              className="mt-1 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>

          {/* ── Stats ─────────────────────────────────────────────────── */}
          {!isLoading && !isError && records.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Total",       value: records.length,   color: "text-white" },
                { label: "Avg latency", value: `${avgMs}ms`,     color: "text-miransas-cyan" },
                { label: "Errors",      value: errors,           color: errors > 0 ? "text-rose-400" : "text-zinc-400" },
                { label: "Webhooks",    value: webhooks,         color: webhooks > 0 ? "text-[#86a9ff]" : "text-zinc-400" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/[0.06] bg-[#0d0e10] px-5 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">{s.label}</p>
                  <p className={cn("mt-3 text-2xl font-semibold tracking-tight", s.color)}>{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Filters ───────────────────────────────────────────────── */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-white/[0.06] bg-[#0d0e10] px-4 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-zinc-600" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter by path, method, provider, tunnel…"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
              />
            </label>
            <div className="flex gap-2">
              {(["ALL", "REQUEST", "WEBHOOK"] as KindFilter[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setKindFilter(k)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition",
                    kindFilter === k
                      ? "border-miransas-cyan/30 bg-miransas-cyan/10 text-miransas-cyan"
                      : "border-white/[0.06] bg-[#0d0e10] text-zinc-500 hover:border-white/12 hover:text-zinc-300",
                  )}
                >
                  {k === "ALL" ? "All" : k === "WEBHOOK" ? "Webhooks" : "Requests"}
                </button>
              ))}
              {(["ALL", "SUCCESS", "ERROR"] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition",
                    statusFilter === s
                      ? s === "ERROR"
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                        : s === "SUCCESS"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border-miransas-cyan/30 bg-miransas-cyan/10 text-miransas-cyan"
                      : "border-white/[0.06] bg-[#0d0e10] text-zinc-500 hover:border-white/12 hover:text-zinc-300",
                  )}
                >
                  {s === "ALL" ? "All status" : s === "SUCCESS" ? "2xx" : "4xx/5xx"}
                </button>
              ))}
            </div>
          </div>

          {/* ── Error banner ──────────────────────────────────────────── */}
          {isError && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/8 px-5 py-4 text-sm text-rose-300">
              Could not reach the control plane. Check that the Go relay is running and your
              session token is valid.
            </div>
          )}

          {/* ── Live feed ─────────────────────────────────────────────── */}
          {isLoading ? (
            <RowSkeleton />
          ) : isError ? null : filtered.length === 0 ? (
            <EmptyState filtered={records.length > 0 && filtered.length === 0} />
          ) : (
            <div className="space-y-3">
              {filtered.map((record) => (
                <RequestInspectionCard
                  key={record.id}
                  record={record}
                  active={record.id === selectedId}
                  onSelect={() => {
                    setSelectedId(record.id);
                    setDrawerOpen(true);
                  }}
                />
              ))}
            </div>
          )}

          {/* ── Polling note ──────────────────────────────────────────── */}
          {!isLoading && !isError && records.length > 0 && (
            <p className="flex items-center gap-1.5 text-xs text-zinc-600">
              <Activity className="h-3 w-3" />
              Auto-refreshing every 3 s · {records.length} record{records.length !== 1 ? "s" : ""} in feed
              {webhooks > 0 && (
                <>
                  {" · "}
                  <Webhook className="h-3 w-3 text-[#86a9ff]" />
                  {webhooks} webhook{webhooks !== 1 ? "s" : ""}
                </>
              )}
            </p>
          )}
        </div>
      </div>

      <RequestInspectionDrawer
        record={selected}
        open={drawerOpen && Boolean(selected)}
        onClose={() => setDrawerOpen(false)}
      />
    </DashboardRouteFrame>
  );
}
