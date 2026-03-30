
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession } from "next-auth/react";
import { useTunnels } from "@/hooks/useTunnels";
import BandwidthChart from "@/components/dashboard/shared/BandwidthChart";
import { Activity, Shield, TerminalSquare, Waypoints } from "lucide-react";
import TerminalLog from "./terminal-log";
import TokenManager from "./token-manager";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { tunnels, isLoading, isError } = useTunnels();

  const activeCount = tunnels ? tunnels.filter((t: any) => t.status === "ACTIVE").length : 0;
  const totalBandwidth = tunnels ? tunnels.reduce((acc: number, t: any) => acc + (t.bytes_out || 0), 0) : 0;
  const statusCards = [
    {
      label: "Active tunnels",
      value: activeCount.toString().padStart(2, "0"),
      note: activeCount > 0 ? "traffic is flowing" : "waiting for a tunnel",
      icon: Activity,
    },
    {
      label: "Throughput",
      value: `${(totalBandwidth / (1024 * 1024)).toFixed(1)} MB`,
      note: "bandwidth reported by the API",
      icon: Waypoints,
    },
    {
      label: "Mode",
      value: session?.user ? "AUTH" : "GUEST",
      note: session?.user ? "signed in control plane" : "frontend preview mode",
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-miransas-cyan/30">
      <main className="relative z-10 max-w-7xl mx-auto p-6 lg:p-12">
        <header className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-miransas-cyan">Binboi control plane</p>
            <h1 className="mt-4 text-5xl font-black italic tracking-tight text-white lg:text-7xl">
              BINBOI<span className="text-miransas-cyan">.</span>CORE
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400">
              This dashboard is now driven by the relay control plane. It keeps useful empty states,
              but the content reflects real instance behavior instead of placeholder product ideas.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-full ${activeCount > 0 ? "bg-miransas-cyan shadow-[0_0_10px_#00ffd1]" : "bg-amber-500"}`} />
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
                {activeCount > 0 ? "relay active" : "waiting for first tunnel"}
              </p>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              {session?.user ? `Signed in as ${session.user.email}` : "Guest preview mode enabled"}
            </p>
          </div>
        </header>

        <div className="mb-12 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-[#080808] p-6">
            <BandwidthChart currentUsage={activeCount > 0 ? 452.8 : 0} />
          </div>
          <TokenManager />
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {statusCards.map(({ label, value, note, icon: Icon }) => (
            <article key={label} className="rounded-2xl border border-white/10 bg-[#080808] p-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">{label}</p>
                <Icon className="h-4 w-4 text-miransas-cyan" />
              </div>
              <p className="mt-6 text-4xl font-black italic text-white">{value}</p>
              <p className="mt-2 text-xs leading-6 text-gray-500">{note}</p>
            </article>
          ))}
        </div>

        <div className="mb-12 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#080808]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em]">
                  <th className="p-6 border-b border-white/5">Subdomain</th>
                  <th className="p-6 border-b border-white/5">Status</th>
                  <th className="p-6 border-b border-white/5">Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="p-20 text-center text-miransas-cyan animate-pulse font-bold tracking-widest text-xs italic">
                      SCANNING_NEURAL_LAYERS...
                    </td>
                  </tr>
                ) : tunnels?.length === 0 || isError ? (
                  <tr>
                    <td colSpan={3} className="p-12 text-center text-gray-600 text-xs italic">
                      {isError ? "API_UNREACHABLE" : "NO_ACTIVE_TUNNELS_FOUND"}
                    </td>
                  </tr>
                ) : tunnels.map((tunnel: any) => (
                  <tr key={tunnel.id} className="transition-colors hover:bg-white/[0.01]">
                    <td className="p-6">
                      <div className="text-xl font-bold italic text-white">
                        {tunnel.subdomain}<span className="text-gray-600">.binboi.link</span>
                      </div>
                      <div className="text-[9px] text-gray-600 mt-1 uppercase font-bold tracking-tighter">
                        Hex_ID: {tunnel.id.slice(0, 12)}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-md border w-fit font-black text-[9px] ${tunnel.status === 'ACTIVE'
                          ? 'bg-miransas-cyan/5 text-miransas-cyan border-miransas-cyan/20 animate-pulse'
                          : 'bg-red-950/20 text-red-500 border-red-900/50'
                        }`}>
                        {tunnel.status}
                      </div>
                    </td>
                    <td className="p-6 font-mono text-xs text-gray-400 italic">
                      {tunnel.target}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <aside className="rounded-2xl border border-white/10 bg-[#080808] p-6">
            <div className="flex items-center gap-3">
              <TerminalSquare className="h-5 w-5 text-miransas-cyan" />
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-300">Quick start</h2>
            </div>
            <ol className="mt-6 space-y-4 text-sm leading-7 text-gray-400">
              <li>1. Start the relay with <span className="text-miransas-cyan">./binboi-server</span>.</li>
              <li>2. Create an access token in the dashboard and save it with <span className="text-miransas-cyan">binboi login --token &lt;token&gt;</span>.</li>
              <li>3. Verify with <span className="text-miransas-cyan">binboi whoami</span> and expose your app using <span className="text-miransas-cyan">binboi start 3000 my-app</span>.</li>
            </ol>
          </aside>
        </div>

        <TerminalLog />
      </main>
    </div>
  );
}
