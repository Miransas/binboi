/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useSession } from "@/components/provider/session-provider";
import { motion } from "framer-motion";
import { Activity, Shield, Waypoints, Terminal, CheckCircle2 } from "lucide-react";

import BandwidthChart from "@/components/dashboard/shared/BandwidthChart";
import { useRequests } from "@/hooks/useRequests";
import { useTunnels } from "@/hooks/useTunnels";

import TokenManager from "./token-manager";

// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const { tunnels, isLoading, isError } = useTunnels();
  const { requests } = useRequests();

  const activeCount = tunnels ? tunnels.filter((t: any) => t.status === "ACTIVE").length : 0;
  const totalBandwidth = tunnels
    ? tunnels.reduce((acc: number, tunnel: any) => acc + (tunnel.bytes_out || 0), 0)
    : 0;
  const requestVolume = tunnels
    ? tunnels.reduce((sum: number, tunnel: any) => sum + (tunnel.request_count || 0), 0)
    : 0;

  const statusCards = [
    { label: "Active tunnels", value: activeCount.toString().padStart(2, "0"), icon: Activity, accent: "text-cyan-400", bg: "bg-cyan-400/5", border: "border-cyan-400/20" },
    { label: "Throughput", value: `${(totalBandwidth / (1024 * 1024)).toFixed(1)} MB`, icon: Waypoints, accent: "text-violet-400", bg: "bg-violet-400/5", border: "border-violet-400/20" },
    { label: "Mode", value: session?.user ? "AUTH" : "GUEST", icon: Shield, accent: "text-zinc-400", bg: "bg-zinc-400/5", border: "border-zinc-400/20" },
  ];

  return (
    <motion.main 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative min-h-screen bg-[#050506] px-4 py-8 text-zinc-300 sm:px-6 lg:px-8"
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-[30%] w-[30%] rounded-full bg-violet-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        
        {/* Header Section */}
        <section className="grid gap-8 xl:grid-cols-[1fr_380px]">
          <motion.div variants={itemVariants}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Control Plane</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:max-w-2xl">
              Operate tunnels, tokens, and traffic from one surface.
            </h1>
            <p className="mt-4 text-zinc-500 max-w-xl leading-relaxed">
              Live relay state, request visibility, and webhook investigation stay inside the dashboard without extra route chrome.
            </p>
          </motion.div>

          {/* Posture Card */}
          <motion.div variants={itemVariants} className="group relative rounded-2xl border border-white/5 bg-zinc-900/20 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Relay Posture</p>
              <div className={`h-2 w-2 rounded-full ${activeCount > 0 ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" : "bg-zinc-600"}`} />
            </div>
            <p className="text-sm font-medium text-white">
              {activeCount > 0 ? "Relay is carrying live traffic." : "Waiting for active tunnel connections."}
            </p>
            <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
              {session?.user ? `Connected as ${session.user.email}` : "Guest preview mode is active."}
            </p>
          </motion.div>
        </section>

        {/* Stats Grid */}
        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          {statusCards.map((card) => (
            <motion.div 
              key={card.label}
              variants={itemVariants}
              whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.1)" }}
              className={`relative overflow-hidden rounded-xl border border-white/5 bg-zinc-900/40 p-5`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <card.icon className={`h-4 w-4 ${card.accent}`} />
                </div>
                <span className="text-xs font-medium text-zinc-500">{card.label}</span>
              </div>
              <div className="mt-4 text-3xl font-bold text-white tabular-nums">{card.value}</div>
            </motion.div>
          ))}
        </section>

        {/* Chart & Token Manager */}
        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
          <motion.div variants={itemVariants} className="rounded-2xl border border-white/5 bg-zinc-900/20 p-6">
            <BandwidthChart currentUsage={activeCount > 0 ? 452.8 : 0} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <TokenManager />
          </motion.div>
        </section>

        {/* Tunnel Inventory & Timeline */}
        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
          <motion.div variants={itemVariants} className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/20">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 bg-white/[0.02]">
              <h2 className="text-sm font-bold uppercase tracking-widest text-white">Tunnel Inventory</h2>
              <span className="text-[10px] text-zinc-500">{tunnels?.length ?? 0} TOTAL</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/[0.01]">
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <th className="px-6 py-3">Subdomain</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr><td colSpan={3} className="px-6 py-12 text-center text-sm text-zinc-600">Scanning control plane...</td></tr>
                  ) : tunnels?.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-12 text-center text-sm text-zinc-600 font-mono">NO ACTIVE RESERVATIONS</td></tr>
                  ) : (
                    tunnels.map((tunnel: any) => (
                      <tr key={tunnel.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-white">{tunnel.subdomain}<span className="text-zinc-600">.binboi.link</span></div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] px-2 py-0.5 rounded border border-white/10 ${tunnel.status === 'ACTIVE' ? 'text-cyan-400 bg-cyan-400/5' : 'text-zinc-500'}`}>
                            {tunnel.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-zinc-500">{tunnel.target}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Timeline Placeholder (Since we removed the primitive) */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-white/5 bg-zinc-900/20 p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-6">Operator Path</h3>
            <div className="space-y-8">
              {[
                { title: "Issue CLI Token", done: !!session?.user, desc: "Create an access token for identity." },
                { title: "Auth Agent", done: activeCount > 0, desc: "Run binboi login." },
                { title: "Expose Traffic", done: requestVolume > 0, desc: "Reserve a subdomain." }
              ].map((step, i) => (
                <div key={i} className="relative flex gap-4">
                  {i !== 2 && <div className="absolute left-2.5 top-6 w-px h-8 bg-white/5" />}
                  <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${step.done ? "border-cyan-400 bg-cyan-400/10" : "border-zinc-700"}`}>
                    {step.done && <CheckCircle2 className="h-3 w-3 text-cyan-400" />}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${step.done ? "text-white" : "text-zinc-600"}`}>{step.title}</h4>
                    <p className="text-xs text-zinc-500 mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Recent Traffic Table */}
        <section className="mt-8">
          <motion.div variants={itemVariants} className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/20">
             <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-zinc-500" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-white">Recent Traffic</h2>
                </div>
                <div className="flex items-center gap-2">
                   <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                   <span className="text-[10px] text-zinc-500 uppercase">Live Stream</span>
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.01]">
                    <tr className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      <th className="px-6 py-3">Request</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {requests.length === 0 ? (
                      <tr><td colSpan={3} className="px-6 py-12 text-center text-sm text-zinc-600 font-mono uppercase">Waiting for ingress...</td></tr>
                    ) : (
                      requests.slice(0, 5).map((req: any) => (
                        <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-cyan-400">{req.method}</span>
                              <span className="text-sm font-medium text-white">{req.path}</span>
                            </div>
                            <div className="text-[10px] text-zinc-600 mt-1 uppercase tracking-tight">{req.tunnel_subdomain}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              req.status >= 500 ? 'bg-red-500/10 text-red-400' : 
                              req.status >= 400 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-zinc-500">{req.duration_ms}ms</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
             </div>
          </motion.div>
        </section>

      </div>
    </motion.main>
  );
}