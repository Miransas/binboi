"use client";

import { useMemo, useState } from "react";
import { Activity, Filter, Search, Sparkles, TriangleAlert, Waypoints } from "lucide-react";

import {
  DashboardSectionHeading,
  DashboardStatCard,
  DashboardSurface,
  DashboardTimeline,
} from "@/components/dashboard/shared/dashboard-primitives";
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

export function RequestDebugWorkbench() {
  const { requests, isError, isLoading } = useRequests();
  const { plan, planConfig } = usePricingPlan();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const dataMode = isError ? "fallback" : requests.length > 0 ? "live" : "preview";
  const sourceRecords = useMemo(
    () =>
      (dataMode === "live" ? requests : previewRequestRecords).map((record) =>
        normalizeRequestRecord(record),
      ),
    [dataMode, requests],
  );
  const historyCap = planConfig.limits.requestHistory;
  const visibleSourceRecords = useMemo(
    () => (historyCap === null ? sourceRecords : sourceRecords.slice(0, historyCap)),
    [historyCap, sourceRecords],
  );
  const historyLimited = historyCap !== null && sourceRecords.length > historyCap;
  const todayRequestCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return sourceRecords.filter((record) => record.created_at.slice(0, 10) === today).length;
  }, [sourceRecords]);
  const requestLimitReached =
    planConfig.limits.requestsPerDay !== null &&
    todayRequestCount >= planConfig.limits.requestsPerDay;

  const filtered = useMemo(() => {
    const lower = query.trim().toLowerCase();

    return visibleSourceRecords.filter((record) => {
      if (kind !== "ALL" && record.kind !== kind) {
        return false;
      }

      if (status === "SUCCESS" && record.status >= 400) {
        return false;
      }
      if (status === "ERROR" && record.status < 400) {
        return false;
      }

      if (!lower) {
        return true;
      }

      const haystack = [
        record.method,
        record.path,
        record.provider,
        record.event_type,
        record.error_type,
        record.destination,
        record.request_preview,
        record.response_preview,
        record.payload_preview,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(lower);
    });
  }, [kind, query, status, visibleSourceRecords]);

  const selected = filtered.find((record) => record.id === selectedId) ?? filtered[0] ?? null;
  const errorCount = sourceRecords.filter((record) => record.status >= 400).length;
  const webhookCount = sourceRecords.filter((record) => record.kind === "WEBHOOK").length;
  const avgLatency =
    sourceRecords.length > 0
      ? Math.round(
          sourceRecords.reduce((total, record) => total + record.duration_ms, 0) /
            sourceRecords.length,
        )
      : 0;

  useRegisterAssistantContext("dashboard-request-debug", {
    currentPage: {
      path: "/dashboard/requests",
      title: "Requests",
      area: "dashboard",
      summary:
        selected
          ? `Requests workbench is focused on ${selected.method} ${selected.path} with status ${selected.status} on tunnel ${selected.tunnel_subdomain}.`
          : `Requests workbench currently shows ${filtered.length} filtered request records.`,
    },
    requestContext: selected
      ? buildAssistantContextForRequest(selected).requestContext
      : {
          summary: `Requests workbench currently shows ${filtered.length} filtered request records.`,
        },
    webhookContext: selected ? buildAssistantContextForRequest(selected).webhookContext : undefined,
    logContext: {
      summary:
        dataMode === "live"
          ? "The requests page is backed by live control-plane inspection records."
          : "The requests page is using preview replay traffic because live inspection records are not available yet.",
    },
  });

  const selectedTimeline =
    selected
      ? ([
          {
            label: "Ingress",
            title: `${selected.method} ${selected.path}`,
            description: `${selected.source || "Public ingress"} reached ${selected.tunnel_subdomain}.${selected.kind === "WEBHOOK" ? ` Provider: ${selected.provider || "Webhook traffic"}.` : ""}`,
            status: "complete",
            meta: selected.kind,
          },
          {
            label: "Forward",
            title: `Forwarded to ${selected.destination || selected.target || "local target"}`,
            description: `Binboi relayed the request to ${selected.target || selected.destination || "the configured target"} in ${selected.duration_ms} ms.`,
            status: selected.status >= 500 ? "error" : "complete",
            meta: `${selected.duration_ms} ms`,
          },
          {
            label: "Outcome",
            title:
              selected.status < 400
                ? `Returned ${selected.status}`
                : selected.error_type
                  ? selected.error_type.replaceAll("_", " ")
                  : `Returned ${selected.status}`,
            description:
              selected.response_preview || "No response preview was captured for this request.",
            status:
              selected.status >= 500
                ? "error"
                : selected.status >= 400
                  ? "active"
                  : "complete",
            meta: `${selected.status}`,
          },
        ] as const)
      : ([] as const);

  return (
    <div className="px-4 pb-12 pt-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <DashboardSurface accent="cyan" className="px-6 py-7 sm:px-8 lg:px-10">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] xl:items-end">
            <DashboardSectionHeading
              eyebrow="Requests"
              title="Inspect every inbound request like a debugging surface, not a blind tunnel counter."
              description="Binboi now treats request inspection as a first-class product surface: method, path, status, duration, target, previews, and AI-assisted error explanation are visible from one workflow."
            />

            <DashboardSurface accent={dataMode === "live" ? "violet" : "neutral"} className="p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Feed mode
              </p>
              <p className="mt-3 text-sm leading-7 text-zinc-300">
                {dataMode === "live"
                  ? "Live relay inspection is active. These records were captured from the control plane while traffic moved through public tunnel URLs."
                  : dataMode === "fallback"
                    ? "The control plane is unreachable right now, so Binboi is showing preview replay traffic to keep the debugging workflow explorable."
                    : "No live requests have been captured yet, so Binboi is showing preview replay traffic until the first tunnel request arrives."}
              </p>
            </DashboardSurface>
          </div>
        </DashboardSurface>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <DashboardStatCard
            label="Failing requests"
            value={String(errorCount)}
            note="4xx and 5xx responses are highlighted so the assistant can explain the likely failure mode."
            icon={TriangleAlert}
            accent="rose"
          />
          <DashboardStatCard
            label="Webhook traffic"
            value={String(webhookCount)}
            note="Webhook-shaped traffic stays visible in the same feed, with provider and event hints when available."
            icon={Sparkles}
            accent="violet"
          />
          <DashboardStatCard
            label="Average latency"
            value={`${avgLatency} ms`}
            note="Use latency to spot slow handlers before provider retries or timeouts become noisy."
            icon={Waypoints}
            accent="cyan"
          />
        </div>

        {plan === "FREE" ? (
          <UpgradePrompt
            className="mt-8"
            title={
              requestLimitReached
                ? "You’ve reached your daily request limit. Upgrade to continue."
                : historyLimited
                ? "You’ve reached your request history limit. Upgrade to continue."
                : "Free keeps the request feed lightweight."
            }
            description={
              requestLimitReached
                ? "Free is designed for light debugging. Upgrade for higher request volume, full history, and unlimited AI explain."
                : historyLimited
                ? "Free keeps the last 50 requests and basic debugging. Upgrade for full request history, unlimited AI explain, and deeper webhook investigation."
                : "You get 100 requests per day, the last 50 requests in history, and 5 AI explains per day. Upgrade when you want full history and unlimited debugging help."
            }
            compact
          />
        ) : null}

        <DashboardSurface accent="violet" className="mt-10 p-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_0.85fr] xl:items-end">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem_11rem]">
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <Search className="h-4 w-4 text-zinc-500" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search path, provider, error type, preview text, or destination"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                />
              </label>

              <label className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-300">
                <span className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  <Filter className="h-3.5 w-3.5" />
                  Type
                </span>
                <select
                  value={kind}
                  onChange={(event) => setKind(event.target.value as KindFilter)}
                  className="w-full bg-transparent text-white outline-none"
                >
                  {["ALL", "REQUEST", "WEBHOOK"].map((item) => (
                    <option key={item} value={item} className="bg-black">
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-300">
                <span className="mb-2 block text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  Status
                </span>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as StatusFilter)}
                  className="w-full bg-transparent text-white outline-none"
                >
                  {["ALL", "SUCCESS", "ERROR"].map((item) => (
                    <option key={item} value={item} className="bg-black">
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <DashboardSurface accent="neutral" className="p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Inspection model
              </p>
              <p className="mt-3 text-sm leading-7 text-zinc-300">
                Every row keeps the request line, status, latency, headers, request preview, and
                response preview in one place so failed traffic can be explained immediately.
              </p>
            </DashboardSurface>
          </div>
        </DashboardSurface>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
          <div className="space-y-4">
            {isLoading && dataMode === "live" ? (
              <DashboardSurface accent="neutral" className="px-6 py-10 text-sm text-zinc-400">
                Inspecting the control plane for recent request records...
              </DashboardSurface>
            ) : filtered.length === 0 ? (
              <DashboardSurface accent="neutral" className="px-6 py-10">
                <div className="mx-auto max-w-xl text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                    No matching traffic
                  </p>
                  <h2 className="mt-4 text-2xl font-semibold text-white">
                    Your filters currently hide every request in the inspection stream.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    Clear the current search or switch back to all statuses so the request feed can
                    show matching records again.
                  </p>
                </div>
              </DashboardSurface>
            ) : (
              filtered.map((record) => (
                <RequestInspectionCard
                  key={record.id}
                  record={record}
                  active={record.id === selected?.id}
                  onSelect={() => {
                    setSelectedId(record.id);
                    setDrawerOpen(true);
                  }}
                />
              ))
            )}
          </div>

          <div className="space-y-6">
            <DashboardTimeline
              eyebrow="Flow view"
              title="How the selected request moved through the relay"
              items={selectedTimeline}
            />

            <DashboardSurface accent="neutral" className="p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-miransas-cyan/16 bg-miransas-cyan/10">
                  <Activity className="h-4.5 w-4.5 text-miransas-cyan" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                    Investigation posture
                  </p>
                  <p className="mt-1 text-sm text-white">
                    {selected
                      ? selected.status >= 400
                        ? "This request should be explained before you assume the tunnel is broken."
                        : "This request is a healthy baseline you can compare against regressions."
                      : "Select a request to open the inspection drawer."}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                Failed requests expose an inline AI explanation action. Successful requests stay
                valuable as latency and shape baselines for later debugging sessions.
              </p>
            </DashboardSurface>
          </div>
        </div>
      </div>

      <RequestInspectionDrawer
        record={selected}
        open={drawerOpen && Boolean(selected)}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
