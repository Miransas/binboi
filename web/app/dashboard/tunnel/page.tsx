"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Globe, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { usePricingPlan } from "@/components/provider/pricing-plan-provider";
import { useRegisterAssistantContext } from "@/components/shared/assistant-context";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";
import { fetchControlPlane, type ControlPlaneTunnel } from "@/lib/controlplane";
import { PremiumDashboardShell } from "../_components/premium-dashboard-shell";
import {
  dashboardBadgeClass,
  dashboardDangerButtonClass,
  dashboardGhostButtonClass,
  dashboardIconTileClass,
  dashboardInputClass,
  dashboardPanelClass,
  dashboardPrimaryButtonClass,
} from "../_components/dashboard-ui";

export default function TunnelPage() {
  const { plan } = usePricingPlan();
  const [tunnels, setTunnels] = useState<ControlPlaneTunnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState("");
  const [target, setTarget] = useState("localhost:3000");
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const result = await fetchControlPlane<ControlPlaneTunnel[]>("/api/tunnels");
      setTunnels(result);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load tunnels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createTunnel = async () => {
    if (freeTunnelLimitReached) {
      setError("You’ve reached your limit. Upgrade to continue.");
      return;
    }

    setCreating(true);
    try {
      await fetchControlPlane("/api/tunnels", {
        method: "POST",
        body: JSON.stringify({
          subdomain: plan === "FREE" ? "" : subdomain,
          target,
          region: "local",
        }),
      });
      setSubdomain("");
      setTarget("localhost:3000");
      await load();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Tunnel creation failed.");
    } finally {
      setCreating(false);
    }
  };

  const deleteTunnel = async (id: string) => {
    const confirmed = window.confirm(
      "Delete this tunnel reservation? If the agent is connected the live session will be closed."
    );
    if (!confirmed) return;

    try {
      await fetchControlPlane(`/api/tunnels/${id}`, { method: "DELETE" });
      await load();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Tunnel deletion failed.");
    }
  };

  const metrics = useMemo(() => {
    const active = tunnels.filter((tunnel) => tunnel.status === "ACTIVE").length;
    const requests = tunnels.reduce((sum, tunnel) => sum + tunnel.request_count, 0);
    const transfer = tunnels.reduce((sum, tunnel) => sum + tunnel.bytes_out, 0);
    return { active, requests, transfer };
  }, [tunnels]);
  const freeTunnelLimitReached = plan === "FREE" && metrics.active >= 1;

  useRegisterAssistantContext("dashboard-tunnel-page", {
    currentPage: {
      path: "/dashboard/tunnel",
      title: "Tunnels",
      area: "dashboard",
      summary: error
        ? `Tunnel inventory is degraded: ${error}`
        : `There are ${tunnels.length} reserved tunnels, ${metrics.active} active tunnels, and ${metrics.requests} forwarded requests in the current inventory.`,
    },
    requestContext: {
      summary: error
        ? `The tunnel page failed to load cleanly: ${error}`
        : tunnels[0]
          ? `The first listed tunnel is ${tunnels[0].subdomain} with status ${tunnels[0].status} and target ${tunnels[0].target}.`
          : "No tunnel reservations exist yet.",
      target: tunnels[0]?.target,
      path: tunnels[0]?.public_url,
      errorType: error ? "CONTROL_PLANE_UNAVAILABLE" : undefined,
    },
  });

  return (
    <PremiumDashboardShell
      eyebrow="Tunnels"
      title="Reserve, connect, and monitor tunnels"
      description="This page reflects the real MVP lifecycle. A tunnel can exist in an inactive reserved state, then become active when a CLI agent connects with a valid access token."
      highlights={[
        {
          label: "Reserved tunnels",
          value: String(tunnels.length),
          note:
            plan === "FREE"
              ? "Free keeps the tunnel flow lightweight and assigns random public URLs."
              : "Reserved subdomains remain visible even when no agent is connected.",
        },
        {
          label: "Active tunnels",
          value: String(metrics.active),
          note: "A tunnel becomes active only when the relay has a live yamux session for it.",
        },
        {
          label: "Request count",
          value: String(metrics.requests),
          note: error || `${Math.round(metrics.transfer / 1024)} KB transferred through the public proxy.`,
        },
      ]}
      panels={[
        {
          title: "Reservation first",
          description: "You can reserve a subdomain before an agent connects. This keeps the URL predictable and avoids confusing races between the CLI and the dashboard.",
        },
        {
          title: "Connection lifecycle",
          description: "When the agent authenticates successfully, the relay upgrades the tunnel to ACTIVE. If the session closes, the tunnel remains reserved but returns to INACTIVE.",
        },
      ]}
    >
      {plan === "FREE" ? (
        <UpgradePrompt
          className="dashboard-premium-upgrade mb-8"
          compact
          title={
            freeTunnelLimitReached
              ? "You’ve reached your limit. Upgrade to continue."
              : "Free includes one active tunnel and random public URLs."
          }
          description={
            freeTunnelLimitReached
              ? "Upgrade for unlimited tunnels, custom domains, and a more flexible debugging workflow."
              : "Free is great for the first local workflow. Upgrade when you want stable named URLs, custom domains, and more than one active tunnel."
          }
        />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <section className={dashboardPanelClass("neutral", "p-6")}>
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-white">
            Create a tunnel reservation
          </h2>
          <p className="mt-3 text-sm leading-7 text-[rgba(194,203,219,0.74)]">
            {plan === "FREE"
              ? "Free tunnels get a random public URL automatically. Paid plans can reserve specific subdomains and custom domains."
              : "Reserve a subdomain and target port first. Then connect the agent with the same subdomain."}
          </p>
          <div className="mt-6 space-y-4">
            <input
              value={subdomain}
              onChange={(event) => setSubdomain(event.target.value)}
              placeholder={plan === "FREE" ? "Random URL assigned automatically on Free" : "my-app"}
              disabled={plan === "FREE"}
              className={dashboardInputClass}
            />
            <input
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              placeholder="localhost:3000"
              className={dashboardInputClass}
            />
            <button
              onClick={createTunnel}
              disabled={creating || freeTunnelLimitReached}
              className={`w-full ${dashboardPrimaryButtonClass}`}
            >
              <Plus className="h-4 w-4" />
              {freeTunnelLimitReached ? "Upgrade for more tunnels" : "Reserve tunnel"}
            </button>
          </div>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </section>

        <section className={dashboardPanelClass("blue", "p-6")}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-white">Tunnel inventory</h2>
            <button
              onClick={load}
              className={dashboardGhostButtonClass}
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.03] p-6 text-sm text-slate-500">
                Loading tunnels...
              </div>
            ) : tunnels.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/[0.08] bg-white/[0.03] p-6 text-sm text-slate-500">
                No tunnel reservations exist yet.
              </div>
            ) : (
              tunnels.map((tunnel) => (
              <div
                  key={tunnel.id}
                  className="rounded-[1.55rem] border border-white/[0.08] bg-[rgba(255,255,255,0.03)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-3">
                      <div className={dashboardIconTileClass("blue", "h-12 w-12")}>
                        <Globe className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold tracking-[-0.02em] text-white">
                          {tunnel.subdomain}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">{tunnel.target}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-600">
                          {tunnel.public_url}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className={dashboardBadgeClass(tunnel.status === "ACTIVE" ? "green" : "neutral")}>
                        {tunnel.status}
                      </span>
                      <a
                        href={tunnel.public_url}
                        target="_blank"
                        rel="noreferrer"
                        className={dashboardGhostButtonClass}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => deleteTunnel(tunnel.id)}
                        className={dashboardDangerButtonClass}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-[rgba(194,203,219,0.74)] sm:grid-cols-3">
                    <div className="rounded-[1.25rem] border border-white/[0.08] bg-[rgba(255,255,255,0.025)] px-4 py-3">
                      <span className="block text-[10px] uppercase tracking-[0.24em] text-slate-600">
                        Region
                      </span>
                      {tunnel.region}
                    </div>
                    <div className="rounded-[1.25rem] border border-white/[0.08] bg-[rgba(255,255,255,0.025)] px-4 py-3">
                      <span className="block text-[10px] uppercase tracking-[0.24em] text-slate-600">
                        Requests
                      </span>
                      {tunnel.request_count}
                    </div>
                    <div className="rounded-[1.25rem] border border-white/[0.08] bg-[rgba(255,255,255,0.025)] px-4 py-3">
                      <span className="block text-[10px] uppercase tracking-[0.24em] text-slate-600">
                        Bandwidth
                      </span>
                      {Math.round(tunnel.bytes_out / 1024)} KB
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </section>
    </PremiumDashboardShell>
  );
}
