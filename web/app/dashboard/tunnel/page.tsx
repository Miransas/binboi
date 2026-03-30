"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Globe, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { useRegisterAssistantContext } from "@/components/shared/assistant-context";
import { DashboardPageShell } from "@/components/dashboard/shared/page-shell";
import { DashboardSurface } from "@/components/dashboard/shared/dashboard-primitives";
import { fetchControlPlane, type ControlPlaneTunnel } from "@/lib/controlplane";

export default function TunnelPage() {
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
    setCreating(true);
    try {
      await fetchControlPlane("/api/tunnels", {
        method: "POST",
        body: JSON.stringify({ subdomain, target, region: "local" }),
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
    <DashboardPageShell
      eyebrow="Tunnels"
      title="Reserve, connect, and monitor tunnels"
      description="This page reflects the real MVP lifecycle. A tunnel can exist in an inactive reserved state, then become active when a CLI agent connects with a valid access token."
      highlights={[
        {
          label: "Reserved tunnels",
          value: String(tunnels.length),
          note: "Reserved subdomains remain visible even when no agent is connected.",
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
      <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <DashboardSurface accent="neutral" className="p-6">
          <h2 className="text-xl font-semibold text-white">Create a tunnel reservation</h2>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            Reserve a subdomain and target port first. Then connect the agent with the same subdomain.
          </p>
          <div className="mt-6 space-y-4">
            <input
              value={subdomain}
              onChange={(event) => setSubdomain(event.target.value)}
              placeholder="my-app"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-miransas-cyan"
            />
            <input
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              placeholder="localhost:3000"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-miransas-cyan"
            />
            <button
              onClick={createTunnel}
              disabled={creating}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-miransas-cyan px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Reserve tunnel
            </button>
          </div>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </DashboardSurface>

        <DashboardSurface accent="cyan" className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Tunnel inventory</h2>
            <button
              onClick={load}
              className="rounded-xl border border-white/8 bg-white/5 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-2xl border border-white/8 bg-black/20 p-6 text-sm text-zinc-500">
                Loading tunnels...
              </div>
            ) : tunnels.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-zinc-500">
                No tunnel reservations exist yet.
              </div>
            ) : (
              tunnels.map((tunnel) => (
              <div
                  key={tunnel.id}
                  className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl border border-white/8 bg-white/5 p-3 text-miransas-cyan">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{tunnel.subdomain}</h3>
                        <p className="mt-1 text-sm text-zinc-500">{tunnel.target}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.24em] text-zinc-600">
                          {tunnel.public_url}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          tunnel.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-zinc-500/10 text-zinc-300"
                        }`}
                      >
                        {tunnel.status}
                      </span>
                      <a
                        href={tunnel.public_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-white/8 bg-white/5 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => deleteTunnel(tunnel.id)}
                        className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-300 transition hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-zinc-400 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/8 bg-black/30 px-4 py-3">
                      <span className="block text-[10px] uppercase tracking-[0.24em] text-zinc-600">
                        Region
                      </span>
                      {tunnel.region}
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/30 px-4 py-3">
                      <span className="block text-[10px] uppercase tracking-[0.24em] text-zinc-600">
                        Requests
                      </span>
                      {tunnel.request_count}
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-black/30 px-4 py-3">
                      <span className="block text-[10px] uppercase tracking-[0.24em] text-zinc-600">
                        Bandwidth
                      </span>
                      {Math.round(tunnel.bytes_out / 1024)} KB
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DashboardSurface>
      </section>
    </DashboardPageShell>
  );
}
