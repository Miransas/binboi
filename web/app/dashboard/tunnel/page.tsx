"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, MoreHorizontal, Globe, Laptop, Activity, Search, ShieldCheck } from "lucide-react";

// Mock Veri (Drizzle/SWR ile değişecek)
const mockTunnels = [
  { id: "tnl_1x89a", name: "lost-signal-api", domain: "sad.binboi.link", target: "localhost:8080", status: "online", traffic: "1.2 MB/s", createdAt: "2 mins ago" },
  { id: "tnl_9z2b", name: "worktio-webhook", domain: "worktio.binboi.link", target: "localhost:3000", status: "online", traffic: "45 KB/s", createdAt: "1 hour ago" },
  { id: "tnl_3c4d", name: "duru-temizlik-test", domain: "duru.binboi.link", target: "localhost:5173", status: "offline", traffic: "0 KB/s", createdAt: "2 days ago" },
];

export default function TunnelsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      
      {/* 📝 Header Bölümü */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-white tracking-tight">Endpoints & Tunnels</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your active introspections and routing policies.</p>
        </motion.div>
        
        <motion.button 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 bg-miransas-cyan text-black px-5 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(0,255,209,0.3)] hover:shadow-[0_0_25px_rgba(0,255,209,0.5)] transition-all"
        >
          <Plus className="w-4 h-4" /> Create Tunnel
        </motion.button>
      </div>

      {/* 🔍 Filtreleme ve Arama Çubuğu */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex items-center gap-3 mb-6 bg-[#0e0e0e] border border-white/10 p-2 rounded-xl"
      >
        <div className="flex items-center gap-2 px-3 flex-1">
          <Search className="w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search domains or targets..." 
            className="w-full bg-transparent border-none text-sm text-white focus:outline-none placeholder-gray-600 font-mono"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      {/* 📊 Tüneller Tablosu */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-[#0e0e0e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            {/* Tablo Başlıkları */}
            <thead className="bg-[#111] border-b border-white/5 text-[11px] uppercase tracking-widest text-gray-500 font-bold">
              <tr>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Domain (Public)</th>
                <th className="px-6 py-4 font-medium">Target (Local)</th>
                <th className="px-6 py-4 font-medium">Traffic</th>
                <th className="px-6 py-4 font-medium">Security</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>

            {/* Tablo Gövdesi */}
            <tbody className="text-sm">
              {mockTunnels.map((tunnel, index) => (
                <motion.tr 
                  key={tunnel.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                >
                  {/* Status Indicator */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 bg-[#161616] w-fit px-3 py-1.5 rounded-full border border-white/5">
                      <span className="relative flex h-2 w-2">
                        {tunnel.status === 'online' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-miransas-cyan opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${tunnel.status === 'online' ? 'bg-miransas-cyan' : 'bg-gray-600'}`}></span>
                      </span>
                      <span className="text-gray-300 capitalize text-[11px] font-mono tracking-wider">{tunnel.status}</span>
                    </div>
                  </td>

                  {/* Public Domain */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-500 group-hover:text-miransas-cyan transition-colors" />
                      <a href={`https://${tunnel.domain}`} target="_blank" className="font-mono text-white hover:text-miransas-cyan transition-colors">
                        {tunnel.domain}
                      </a>
                    </div>
                  </td>

                  {/* Local Target */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-400 font-mono text-xs bg-white/5 w-fit px-2 py-1 rounded border border-white/5">
                      <Laptop className="w-3.5 h-3.5" />
                      {tunnel.target}
                    </div>
                  </td>

                  {/* Traffic Stats */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-400 font-mono text-xs">
                      <Activity className={`w-3.5 h-3.5 ${tunnel.status === 'online' ? 'text-miransas-magenta' : 'text-gray-600'}`} />
                      {tunnel.traffic}
                    </div>
                  </td>

                  {/* Security (WAF) */}
                  <td className="px-6 py-4">
                    <div title="WAF & Rate Limiting Active">
                      <ShieldCheck className="w-4 h-4 text-green-500" />
                    </div>
                  </td>

                  {/* Actions Menüsü */}
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Tablo Alt Bilgisi */}
        <div className="px-6 py-4 bg-[#111] border-t border-white/5 text-xs text-gray-500 flex justify-between">
          <span>Showing {mockTunnels.length} active tunnels</span>
          <span className="font-mono">Proxy: proxy.ts (Active)</span>
        </div>
      </motion.div>

    </div>
  );
}