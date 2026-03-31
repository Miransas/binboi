"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Filter,
  Search,
  Sparkles,
  TriangleAlert,
  Webhook,
  Waypoints,
} from "lucide-react";

import { useRegisterAssistantContext } from "@/components/shared/assistant-context";
import { WebhookDeliveryCard } from "@/components/dashboard/webhooks/webhook-delivery-card";
import { WebhookDeliveryDrawer } from "@/components/dashboard/webhooks/webhook-delivery-drawer";
import {
  buildAssistantContextForDelivery,
  webhookDeliveryRecords,
  type WebhookDeliveryRecord,
} from "@/lib/webhook-debug-data";
import {
  DashboardSectionHeading,
  DashboardStatCard,
  DashboardSurface,
  DashboardTimeline,
} from "@/components/dashboard/shared/dashboard-primitives";

const providerNotes = [
  {
    provider: "Stripe",
    note: "Most failures come from signature verification or raw-body handling, not tunnel reachability.",
  },
  {
    provider: "Clerk",
    note: "Watch for middleware or auth guards intercepting the webhook route before the signature check runs.",
  },
  {
    provider: "GitHub",
    note: "404 responses often mean the provider path and the actual framework route do not match.",
  },
];

export function WebhookDebugWorkbench() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState<"ALL" | WebhookDeliveryRecord["provider"]>("ALL");
  const [status, setStatus] = useState<"ALL" | WebhookDeliveryRecord["deliveryStatus"]>("ALL");
  const [failedOnly, setFailedOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(webhookDeliveryRecords[0]?.id ?? null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const providers = useMemo(
    () => ["ALL", ...new Set(webhookDeliveryRecords.map((record) => record.provider))] as const,
    [],
  );

  const filtered = useMemo(() => {
    const lower = query.trim().toLowerCase();

    return webhookDeliveryRecords.filter((record) => {
      if (provider !== "ALL" && record.provider !== provider) {
        return false;
      }
      if (status !== "ALL" && record.deliveryStatus !== status) {
        return false;
      }
      if (failedOnly && record.deliveryStatus === "SUCCESS") {
        return false;
      }
      if (!lower) {
        return true;
      }

      const haystack = [
        record.provider,
        record.eventType,
        record.path,
        record.destination,
        record.errorClassification,
        record.requestPreview,
        record.responsePreview,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(lower);
    });
  }, [failedOnly, provider, query, status]);

  const selected =
    filtered.find((record) => record.id === selectedId) ??
    filtered[0] ??
    null;

  const failedCount = webhookDeliveryRecords.filter((record) => record.deliveryStatus === "FAILED").length;
  const retryingCount = webhookDeliveryRecords.filter((record) => record.deliveryStatus === "RETRYING").length;
  const avgLatency = Math.round(
    webhookDeliveryRecords.reduce((total, record) => total + record.durationMs, 0) /
      webhookDeliveryRecords.length,
  );
  const selectedTimeline =
    selected
      ? ([
          {
            label: "Ingress",
            title: `${selected.provider} emitted ${selected.eventType}`,
            description: `The delivery reached ${selected.path} from ${selected.source}.`,
            status: "complete",
            meta: selected.provider,
          },
          {
            label: "Forward",
            title: `Forwarded to ${selected.destination}`,
            description: `Binboi attached the delivery to tunnel ${selected.tunnelId} and observed ${selected.durationMs} ms end-to-end latency.`,
            status: selected.deliveryStatus === "FAILED" ? "error" : "complete",
            meta: `${selected.durationMs} ms`,
          },
          {
            label: "Outcome",
            title:
              selected.deliveryStatus === "SUCCESS"
                ? `Destination responded with ${selected.status}`
                : selected.errorClassification || "Delivery needs investigation",
            description:
              selected.deliveryStatus === "SUCCESS"
                ? "The webhook completed successfully and is safe to compare against future regressions."
                : selected.responsePreview,
            status:
              selected.deliveryStatus === "SUCCESS"
                ? "complete"
                : selected.deliveryStatus === "RETRYING"
                  ? "active"
                  : "error",
            meta: selected.deliveryStatus,
          },
        ] as const)
      : ([] as const);

  useRegisterAssistantContext("dashboard-webhook-debug", {
    currentPage: {
      path: pathname,
      title: "Webhooks",
      area: "dashboard",
      summary:
        selected
          ? `Webhook debugger is focused on ${selected.provider} ${selected.eventType} with delivery status ${selected.deliveryStatus} and response ${selected.status}.`
          : `Webhook debugger has ${filtered.length} filtered deliveries ready for inspection.`,
    },
    requestContext: selected
      ? buildAssistantContextForDelivery(selected).requestContext
      : {
          summary: `Webhook debugger currently shows ${filtered.length} deliveries after filters.`,
        },
    webhookContext: selected
      ? buildAssistantContextForDelivery(selected).webhookContext
      : {
          summary: `Webhook debugger currently shows ${filtered.length} deliveries after filters.`,
        },
  });

  return (
    <div className="flex min-h-full flex-col px-4 pb-8 pt-4 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] xl:items-end">
          <DashboardSectionHeading
            eyebrow="Webhooks"
            title="Investigate webhook failures without stacked dashboard chrome."
            description="Provider deliveries, retries, classifications, and response previews stay in one focused debugging surface."
          />

          <DashboardSurface accent="neutral" className="p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Feed model
            </p>
            <p className="mt-3 text-sm leading-7 text-zinc-300">
              This debugger uses a realistic provider replay model so Stripe, Clerk, Supabase,
              GitHub, Linear, and Neon delivery failures stay explorable even before Binboi
              stores dedicated webhook delivery rows separately from the core request stream.
            </p>
          </DashboardSurface>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <DashboardStatCard
            label="Failed deliveries"
            value={String(failedCount)}
            note="These are the deliveries that need explanation, not just transport status."
            icon={TriangleAlert}
            accent="rose"
          />
          <DashboardStatCard
            label="Retrying now"
            value={String(retryingCount)}
            note="Retries help you spot upstream instability or slow local handlers."
            icon={Webhook}
            accent="amber"
          />
          <DashboardStatCard
            label="Average latency"
            value={`${avgLatency} ms`}
            note="Enough to catch slow handlers before provider retry windows get noisy."
            icon={Waypoints}
            accent="cyan"
          />
        </div>

        <DashboardSurface accent="violet" className="mt-10 p-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_0.85fr] xl:items-end">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_12rem]">
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <Search className="h-4 w-4 text-zinc-500" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search provider, event type, route, classification, or preview text"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                />
              </label>

              <label className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-300">
                <span className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  <Filter className="h-3.5 w-3.5" />
                  Provider
                </span>
                <select
                  value={provider}
                  onChange={(event) =>
                    setProvider(event.target.value as "ALL" | WebhookDeliveryRecord["provider"])
                  }
                  className="w-full bg-transparent text-white outline-none"
                >
                  {providers.map((item) => (
                    <option key={item} value={item} className="bg-black">
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-300">
                <span className="mb-2 block text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  Delivery
                </span>
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as "ALL" | WebhookDeliveryRecord["deliveryStatus"])
                  }
                  className="w-full bg-transparent text-white outline-none"
                >
                  {["ALL", "FAILED", "RETRYING", "SUCCESS"].map((item) => (
                    <option key={item} value={item} className="bg-black">
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
              <label className="inline-flex items-center gap-3 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={failedOnly}
                  onChange={(event) => setFailedOnly(event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-black text-miransas-cyan accent-miransas-cyan"
                />
                Failed or retrying only
              </label>
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                {filtered.length} visible deliveries
              </p>
            </div>
          </div>
        </DashboardSurface>

        <section className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_0.9fr]">
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <DashboardSurface accent="neutral" className="border-dashed p-8">
                <p className="text-sm leading-7 text-zinc-500">
                  No deliveries matched the current filters. Broaden the provider or status
                  filters, or search for a different event type.
                </p>
              </DashboardSurface>
            ) : (
              filtered.map((record) => (
                <WebhookDeliveryCard
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

          <aside className="space-y-4 xl:sticky xl:top-8">
            <DashboardSurface accent="neutral" className="p-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-miransas-cyan" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-300">
                  Provider notes
                </h2>
              </div>
              <div className="mt-4 space-y-3">
                {providerNotes.map((item) => (
                  <div
                    key={item.provider}
                    className="rounded-2xl border border-white/8 bg-black/25 px-4 py-4"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                      {item.provider}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-zinc-300">{item.note}</p>
                  </div>
                ))}
              </div>
            </DashboardSurface>

            <DashboardSurface accent="violet" className="p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Current focus
              </p>
              {selected ? (
                <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
                  <p>
                    {selected.provider} {selected.eventType}
                  </p>
                  <p>Status {selected.status}, {selected.deliveryStatus.toLowerCase()}, {selected.durationMs} ms.</p>
                  <p>{selected.errorClassification || "No explicit error classification recorded."}</p>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-zinc-400">
                  Select a delivery to keep its request and webhook context attached to the Binboi
                  assistant.
                </p>
              )}
            </DashboardSurface>

            {selected ? (
              <DashboardTimeline
                eyebrow="Lifecycle"
                title="Current delivery timeline"
                items={selectedTimeline}
              />
            ) : null}

            <DashboardSurface accent="cyan" className="p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Supporting docs
              </p>
              <div className="mt-4 space-y-3">
                {[
                  { href: "/docs/webhooks", title: "Webhook debugging guide" },
                  { href: "/docs/requests", title: "Request inspection guide" },
                  { href: "/docs/troubleshooting", title: "Troubleshooting guide" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-2xl border border-white/8 bg-black/25 px-4 py-4 text-sm text-zinc-300 transition hover:border-white/15 hover:text-white"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </DashboardSurface>
          </aside>
        </section>
      </div>

      <WebhookDeliveryDrawer
        record={selected}
        open={drawerOpen && Boolean(selected)}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
