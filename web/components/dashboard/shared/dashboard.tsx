/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession } from "next-auth/react";
import { useTunnels } from "@/hooks/useTunnels";
import { motion } from "framer-motion";
import BandwidthChart from "@/components/dashboard/shared/BandwidthChart";
import { TrashIcon, PlusIcon, TerminalIcon } from "lucide-react";
import { useEffect, useState } from "react";
import TerminalLog from "./terminal-log";
import { useTheme } from "next-themes";
import { BorderBeam } from "../../ui/border-beam";
import TokenManager from "./token-manager";

export default function DashboardPage() {
  const { theme } = useTheme();
  const { data: session } = useSession();
  
  // Tünelleri Go Backend'den çekiyoruz
  const { tunnels, isLoading, mutate } = useTunnels(session?.user?.id || "");

  const activeCount = tunnels ? tunnels.filter((t: any) => t.status === "ACTIVE").length : 0;
  const totalBandwidth = tunnels ? tunnels.reduce((acc: number, t: any) => acc + (t.bytes_out || 0), 0) : 0;

  // Tünel Silme İşlemi
  const handleDelete = async (id: string) => {
    if (window.confirm("⚠️ TERMINATE_LINK: Confirm permanent deletion?")) {
      try {
        const res = await fetch(`http://localhost:8080/api/tunnels/${id}`, { method: 'DELETE' });
        if (res.ok) {
          mutate(); // Tabloyu yenile
        }
      } catch (err) {
        console.error("Deletion failed:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-miransas-cyan/30">
      <main className="relative z-10 max-w-7xl mx-auto p-6 lg:p-12">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-7xl font-black italic tracking-tighter text-white">
              BINBOI<span className="text-miransas-cyan">.</span>CORE
            </h1>
            <div className="flex items-center gap-3 mt-4 bg-white/5 w-fit px-3 py-1 rounded-md border border-white/10">
              <span className={`h-2 w-2 rounded-full ${activeCount > 0 ? 'bg-miransas-cyan animate-pulse shadow-[0_0_8px_#00ffd1]' : 'bg-red-600'}`} />
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                Status: {activeCount > 0 ? 'NEURAL_LINK_ACTIVE' : 'SYSTEM_IDLE'}
              </p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <button className="p-3 bg-white/5 border border-white/10 cursor-pointer rounded-xl hover:bg-white/10 transition-all text-gray-400 hover:text-white">
              <TerminalIcon size={18} />
            </button>
            <button className="flex items-center gap-2 px-8 py-4 bg-miransas-cyan text-white cursor-pointer font-black italic rounded-xl shadow-[0_0_30_rgba(0,255,209,0.3)] hover:scale-105 transition-all text-xs uppercase">
              <PlusIcon size={16} /> New Link
            </button>
          </div>
        </header>

        {/* --- TOKEN MANAGER SECTION --- */}
        <div className="mb-12">
          <TokenManager initialToken="" />
        </div>

        {/* --- STATS SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="md:col-span-2 relative group">
            <div className="relative h-full bg-[#080808] border border-white/10 rounded-2xl p-6 backdrop-blur-xl overflow-hidden">
              <BorderBeam duration={6} size={400} className="from-transparent via-miransas-cyan to-transparent" />
              <BandwidthChart currentUsage={activeCount > 0 ? 452.8 : 0} />
            </div>
          </div>

          <div className="relative group">
            <div className="relative h-full bg-[#080808] border border-white/10 rounded-2xl p-8 flex flex-col justify-between overflow-hidden">
              <BorderBeam duration={8} delay={2} size={300} className="from-transparent via-red-500 to-transparent" />
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Active Links</span>
              <div className="text-6xl font-black italic text-miransas-cyan">
                {activeCount.toString().padStart(2, '0')}
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="relative h-full bg-[#080808] border border-white/10 rounded-2xl p-8 flex flex-col justify-between overflow-hidden">
              <BorderBeam duration={8} delay={4} size={300} className="from-transparent via-blue-500 to-transparent" />
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Throughput</span>
              <div className="text-4xl font-black italic text-white">
                {(totalBandwidth / (1024 * 1024)).toFixed(1)} <span className="text-lg text-gray-600">MB</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- TUNNEL TABLE --- */}
        <div className="relative mb-12">
          <div className="relative bg-[#080808] border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em]">
                  <th className="p-6 border-b border-white/5">Neural Node</th>
                  <th className="p-6 border-b border-white/5">Signal</th>
                  <th className="p-6 border-b border-white/5 text-right">Target</th>
                  <th className="p-6 border-b border-white/5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-20 text-center text-miransas-cyan animate-pulse font-bold tracking-widest text-xs italic">
                      SCANNING_NEURAL_LAYERS...
                    </td>
                  </tr>
                ) : tunnels?.length === 0 ? (
                    <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-600 text-xs italic">
                      NO_ACTIVE_TUNNELS_FOUND
                    </td>
                  </tr>
                ) : tunnels.map((tunnel: any) => (
                  <motion.tr key={tunnel.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-white/[0.01] transition-colors group/row">
                    <td className="p-6">
                      <div className="text-xl font-bold group-hover/row:text-miransas-cyan transition-colors italic">
                        {tunnel.subdomain}<span className="text-gray-600">.binboi.link</span>
                      </div>
                      <div className="text-[9px] text-gray-600 mt-1 uppercase font-bold tracking-tighter">
                        Hex_ID: {tunnel.id.slice(0, 12)}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-md border w-fit font-black text-[9px] ${
                        tunnel.status === 'ACTIVE'
                        ? 'bg-miransas-cyan/5 text-miransas-cyan border-miransas-cyan/20 animate-pulse'
                        : 'bg-red-950/20 text-red-500 border-red-900/50'
                      }`}>
                        {tunnel.status}
                      </div>
                    </td>
                    <td className="p-6 text-right font-mono text-xs text-gray-400 italic">
                      {tunnel.target}
                    </td>
                    <td className="p-6 text-center">
                      <button onClick={() => handleDelete(tunnel.id)} className="p-2 text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                        <TrashIcon size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- LIVE TERMINAL --- */}
        <div className="mt-8">
          <TerminalLog />
        </div>
      </main>
    </div>
  );
}