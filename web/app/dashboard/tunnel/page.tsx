/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ExternalLink, 
  Globe, 
  Plus, 
  RefreshCcw, 
  Trash2, 
  Zap, 
  Activity, 
  Lock,
  ArrowUpRight,
  Wifi,
  Terminal
} from "lucide-react";
import { usePricingPlan } from "@/components/provider/pricing-plan-provider";
import { useRegisterAssistantContext } from "@/components/shared/assistant-context";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";
import { fetchControlPlane, type ControlPlaneTunnel } from "@/lib/controlplane";

// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
};

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
      const result = await fetchControlPlane<ControlPlaneTunnel[]>("/api/v1/tunnels");
      setTunnels(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Could not load tunnels.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const metrics = useMemo(() => {
    const active = tunnels.filter((t) => t.status === "ACTIVE").length;
    const requests = tunnels.reduce((sum, t) => sum + t.request_count, 0);
    const transfer = tunnels.reduce((sum, t) => sum + t.bytes_out, 0);
    return { active, requests, transfer };
  }, [tunnels]);

  const freeTunnelLimitReached = plan === "FREE" && metrics.active >= 1;

  const createTunnel = async () => {
    if (freeTunnelLimitReached) return;
    setCreating(true);
    try {
      await fetchControlPlane("/api/v1/tunnels", {
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
    } catch (err: any) {
      setError(err.message || "Tunnel creation failed.");
    } finally {
      setCreating(false);
    }
  };

  const deleteTunnel = async (id: string) => {
    if (!window.confirm("Delete this tunnel reservation?")) return;
    try {
      await fetchControlPlane(`/api/v1/tunnels/${id}`, { method: "DELETE" });
      await load();
    } catch (err: any) {
      setError(err.message || "Deletion failed.");
    }
  };

  useRegisterAssistantContext("dashboard-tunnel-page", {
    currentPage: {
      path: "/dashboard/tunnel",
      title: "Tunnels",
      area: "dashboard",
      summary: `Inventory: ${tunnels.length} reserved, ${metrics.active} active.`,
    },
  });

  return (
    <motion.main 
      initial="hidden" animate="visible" variants={containerVariants}
      className="relative min-h-screen bg-[#050506] px-4 py-12 text-zinc-300 sm:px-6 lg:px-12"
    >
      {/* Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        
        {/* Header Section */}
        <motion.section variants={itemVariants} className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 mb-6">
            <Wifi className="h-3 w-3 text-cyan-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Traffic Relay</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Tunnels & Reservations</h1>
          <p className="mt-4 text-zinc-500 max-w-2xl text-lg leading-relaxed">
            Reserve subdomains and monitor live traffic sessions. Tunnels become <span className="text-emerald-400">ACTIVE</span> when your agent attaches successfully.
          </p>
        </motion.section>

        {/* Stats Row */}
        <motion.section variants={itemVariants} className="grid gap-4 md:grid-cols-3 mb-8">
          {[
            { label: "Reserved", value: tunnels.length, icon: Lock, color: "text-zinc-500" },
            { label: "Active Sessions", value: metrics.active, icon: Zap, color: "text-emerald-400" },
            { label: "Total Requests", value: metrics.requests, icon: Activity, color: "text-cyan-400" }
          ].map((item, i) => (
            <div key={i} className="rounded-2xl border border-white/5 bg-zinc-900/20 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 text-zinc-500 mb-2">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{item.value}</div>
            </div>
          ))}
        </motion.section>

        {/* Free Plan Upgrade Prompt */}
        {plan === "FREE" && (
          <motion.div variants={itemVariants} className="mb-8">
            <UpgradePrompt
              className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-6"
              compact
              title={freeTunnelLimitReached ? "Tunnel Limit Reached" : "Free Plan Limits"}
              description={freeTunnelLimitReached 
                ? "Upgrade to Pro for unlimited active tunnels and custom subdomains." 
                : "Free includes one active tunnel with random public URLs."}
            />
          </motion.div>
        )}

        <div className="grid gap-8 xl:grid-cols-[450px_1fr]">
          
          {/* Left: Create Form */}
          <motion.section variants={itemVariants} className="space-y-6">
            <div className="rounded-2xl border border-white/5 bg-zinc-900/20 p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <Plus className="h-5 w-5 text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-white">New Reservation</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Subdomain</label>
                  <div className="relative mt-2">
                    <input 
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                      disabled={plan === "FREE"}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      placeholder={plan === "FREE" ? "Randomly assigned" : "my-awesome-app"}
                    />
                    {plan === "FREE" && <Lock className="absolute right-4 top-3.5 h-4 w-4 text-zinc-700" />}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Target Port / Host</label>
                  <input 
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="mt-2 w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors font-mono"
                    placeholder="localhost:3000"
                  />
                </div>

                <button 
                  onClick={createTunnel}
                  disabled={creating || freeTunnelLimitReached}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-[0_0_20px_rgba(8,145,178,0.2)]"
                >
                  {creating ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {freeTunnelLimitReached ? "Limit Reached" : "Reserve Tunnel"}
                </button>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs flex gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </motion.div>
              )}
            </div>
          </motion.section>

          {/* Right: Inventory List */}
          <motion.section variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Live Inventory</h2>
              <button onClick={load} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <RefreshCcw className={`h-4 w-4 text-zinc-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {loading && tunnels.length === 0 ? (
                   <div className="px-8 py-20 text-center border border-dashed border-white/5 rounded-2xl text-zinc-600 text-sm">Synchronizing with relay server...</div>
                ) : tunnels.length === 0 ? (
                   <div className="px-8 py-20 text-center border border-dashed border-white/5 rounded-2xl text-zinc-600 text-sm font-mono tracking-tighter">NO RESERVATIONS DETECTED</div>
                ) : (
                  tunnels.map((tunnel) => (
                    <motion.div 
                      key={tunnel.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="group relative rounded-2xl border border-white/5 bg-zinc-900/20 p-6 transition-all hover:border-white/10"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl bg-zinc-950 border border-white/5 ${tunnel.status === 'ACTIVE' ? 'text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'text-zinc-600'}`}>
                            <Globe className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold text-white tracking-tight">{tunnel.subdomain}</h3>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${tunnel.status === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                                {tunnel.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs font-mono text-zinc-500">
                              <Terminal className="h-3 w-3" />
                              {tunnel.target}
                            </div>
                            <div className="mt-3 text-[10px] font-mono text-cyan-400/60 uppercase tracking-tighter flex items-center gap-1 group-hover:text-cyan-400 transition-colors">
                              {tunnel.public_url}
                              <ArrowUpRight className="h-3 w-3" />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-center">
                          <a href={tunnel.public_url} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 text-zinc-400 hover:text-white transition-all hover:scale-105">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <button onClick={() => deleteTunnel(tunnel.id)} className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 text-zinc-600 hover:text-red-400 hover:bg-red-500/5 transition-all hover:scale-105">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Micro Metrics Footer */}
                      <div className="mt-6 pt-6 border-t border-white/[0.03] grid grid-cols-3 gap-4">
                        {[
                          { label: "Region", val: tunnel.region },
                          { label: "Requests", val: tunnel.request_count },
                          { label: "Bandwidth", val: `${Math.round(tunnel.bytes_out / 1024)} KB` }
                        ].map((m, i) => (
                          <div key={i}>
                            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{m.label}</p>
                            <p className="text-xs font-medium text-zinc-400 mt-0.5">{m.val}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </div>
      </div>
    </motion.main>
  );
}

// Dummy AlertCircle for the error box
function AlertCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}