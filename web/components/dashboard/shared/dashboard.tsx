/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession } from "next-auth/react";
import { Activity, Shield, Waypoints } from "lucide-react";

import BandwidthChart from "@/components/dashboard/shared/BandwidthChart";
import {
  DashboardSectionHeading,
  DashboardStatCard,
  DashboardSurface,
  DashboardTimeline,
} from "@/components/dashboard/shared/dashboard-primitives";
import { useRegisterAssistantContext } from "@/components/shared/assistant-context";
import { useTunnels } from "@/hooks/useTunnels";

import TerminalLog from "./terminal-log";
import TokenManager from "./token-manager";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { tunnels, isLoading, isError } = useTunnels();

  const activeCount = tunnels ? tunnels.filter((t: any) => t.status === "ACTIVE").length : 0;
  const totalBandwidth = tunnels
    ? tunnels.reduce((acc: number, tunnel: any) => acc + (tunnel.bytes_out || 0), 0)
    : 0;
  const requestVolume = tunnels
    ? tunnels.reduce((sum: number, tunnel: any) => sum + (tunnel.request_count || 0), 0)
    : 0;

  useRegisterAssistantContext("dashboard-overview-metrics", {
    currentPage: {
      path: "/dashboard",
      title: "Dashboard overview",
      area: "dashboard",
      summary: isError
        ? "The overview is in a degraded state because the control plane is currently unreachable."
        : `The overview reports ${activeCount} active tunnels and ${(totalBandwidth / (1024 * 1024)).toFixed(1)} MB of observed throughput.`,
    },
    logContext: {
      summary: isError
        ? "The main dashboard could not load tunnel data from the control plane."
        : "The overview is connected to tunnel metrics and relay stream visibility.",
    },
  });

  const statusCards = [
    {
      label: "Active tunnels",
      value: activeCount.toString().padStart(2, "0"),
      note: activeCount > 0 ? "Traffic is currently flowing through the relay." : "Waiting for the first connected tunnel.",
      icon: Activity,
      accent: "cyan" as const,
    },
    {
      label: "Throughput",
      value: `${(totalBandwidth / (1024 * 1024)).toFixed(1)} MB`,
      note: "Observed bytes forwarded through the public proxy surface.",
      icon: Waypoints,
      accent: "violet" as const,
    },
    {
      label: "Mode",
      value: session?.user ? "AUTH" : "GUEST",
      note: session?.user ? "Signed-in control plane mode is active." : "Local preview mode is still available for MVP testing.",
      icon: Shield,
      accent: "neutral" as const,
    },
  ];

  const setupTimeline = [
    {
      label: "Step 1",
      title: "Issue a CLI token",
      description:
        "Create an access token in the dashboard so every machine gets a distinct, revocable identity.",
      status: session?.user ? "complete" : "active",
      meta: session?.user ? "Ready" : "Preview",
    },
    {
      label: "Step 2",
      title: "Authenticate the agent",
      description:
        "Run `binboi login --token <token>` and verify with `binboi whoami` before exposing traffic.",
      status: activeCount > 0 ? "complete" : "active",
      meta: activeCount > 0 ? "Connected" : "Pending",
    },
    {
      label: "Step 3",
      title: "Expose public traffic",
      description:
        "Reserve a subdomain, attach the relay, and keep request visibility inside the dashboard instead of guessing from raw logs.",
      status: requestVolume > 0 ? "complete" : "waiting",
      meta: requestVolume > 0 ? `${requestVolume} requests` : "Waiting",
    },
  ] as const;

  return (
    <div className="relative px-4 pb-12 pt-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <DashboardSurface accent="cyan" className="px-6 py-7 sm:px-8 lg:px-10">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(24rem,0.85fr)] xl:items-end">
            <DashboardSectionHeading
              eyebrow="Binboi control plane"
              title="Operate tunnels, tokens, traffic, and webhook failures from one premium surface."
              description="The dashboard now reflects live relay state, token posture, request visibility, and webhook investigation tools with honest fallback behavior when the control plane is unavailable."
            />

            <DashboardSurface accent="violet" className="p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Relay posture
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    activeCount > 0
                      ? "bg-miransas-cyan shadow-[0_0_16px_rgba(0,255,209,0.65)]"
                      : "bg-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.36)]"
                  }`}
                />
                <p className="text-sm font-medium text-white">
                  {activeCount > 0 ? "Relay is carrying live tunnel traffic." : "Relay is waiting for the first active tunnel."}
                </p>
              </div>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                {session?.user
                  ? `Signed in as ${session.user.email}.`
                  : "Guest preview mode is enabled, so the product still behaves coherently without a full auth deployment."}
              </p>
            </DashboardSurface>
          </div>
        </DashboardSurface>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {statusCards.map(({ label, value, note, icon, accent }) => (
            <DashboardStatCard
              key={label}
              label={label}
              value={value}
              note={note}
              icon={icon}
              accent={accent}
            />
          ))}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(23rem,0.85fr)]">
          <DashboardSurface accent="cyan" className="p-6">
            <BandwidthChart currentUsage={activeCount > 0 ? 452.8 : 0} />
          </DashboardSurface>
          <TokenManager />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(24rem,0.85fr)]">
          <DashboardSurface accent="violet" className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                  Tunnel inventory
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">Live reservations and forwarding targets</h2>
              </div>
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                {isError ? "Degraded" : `${tunnels?.length ?? 0} total`}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                    <th className="border-b border-white/10 px-6 py-4">Subdomain</th>
                    <th className="border-b border-white/10 px-6 py-4">Status</th>
                    <th className="border-b border-white/10 px-6 py-4">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-16 text-center text-sm text-zinc-500">
                        Scanning the control plane for active tunnel reservations...
                      </td>
                    </tr>
                  ) : tunnels?.length === 0 || isError ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-16 text-center text-sm text-zinc-500">
                        {isError
                          ? "The API is currently unreachable, so live tunnel inventory is unavailable."
                          : "No active tunnel reservations were found yet."}
                      </td>
                    </tr>
                  ) : (
                    tunnels.map((tunnel: any) => (
                      <tr key={tunnel.id} className="transition-colors hover:bg-white/[0.03]">
                        <td className="px-6 py-5">
                          <div className="text-base font-semibold text-white">
                            {tunnel.subdomain}
                            <span className="text-zinc-500">.binboi.link</span>
                          </div>
                          <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                            {tunnel.id.slice(0, 12)}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${
                              tunnel.status === "ACTIVE"
                                ? "border-miransas-cyan/20 bg-miransas-cyan/10 text-miransas-cyan"
                                : "border-white/10 bg-white/[0.03] text-zinc-300"
                            }`}
                          >
                            {tunnel.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-zinc-400">{tunnel.target}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </DashboardSurface>

          <DashboardTimeline
            eyebrow="Operator path"
            title="How the live tunnel workflow progresses"
            items={setupTimeline}
            className="h-full"
          />
        </div>

        <TerminalLog />
      </div>
    </div>
  );
}
