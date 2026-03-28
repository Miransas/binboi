"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Shield, 
  Trash2, 
  ExternalLink, 
  Search, 
  Plus, 
  Activity,
  Globe,
  RefreshCw
} from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";
import AddTunnelModal from "../../../components/dashboard/shared/add-tunnel-madal";

// Tünel Tipi Tanımı
interface Tunnel {
  id: string;
  subdomain: string;
  target: string;
  status: "ACTIVE" | "INACTIVE" | "ERROR";
  region: string;
  bytes_in: number;
  bytes_out: number;
  created_at: string;
}

export default function TunnelsPage() {
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 1. Verileri Go Backend'den Çek
  const fetchTunnels = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/tunnels");
      const data = await res.json();
      setTunnels(data || []);
    } catch (err) {
      console.error("🔴 [SYSTEM_ERROR]: Connection to core failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTunnels(); }, []);

  // 2. Tünel Sonlandırma (Delete)
  const terminateTunnel = async (id: string) => {
    if (!confirm("⚠️ TERMINATE_LINK: Bu tüneli kalıcı olarak kapatmak istiyor musun?")) return;
    
    try {
      const res = await fetch(`http://localhost:8080/api/tunnels/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTunnels(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      alert("🔴 ERROR: Termination failed.");
    }
  };

  const filteredTunnels = tunnels.filter(t => 
    t.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.target.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-12 min-h-screen bg-black text-white font-mono">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase">
            Neural<span className="text-miransas-cyan">_</span>Links
          </h1>
          <p className="text-[10px] text-gray-500 mt-2 font-bold tracking-[0.3em] uppercase">
            Active Tunnels: {tunnels.filter(t => t.status === 'ACTIVE').length} / {tunnels.length}
          </p>
        </motion.div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
            <input 
              type="text"
              placeholder="SEARCH_NODES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs focus:border-miransas-cyan outline-none transition-all"
            />
          </div>
          <button 
            onClick={fetchTunnels}
            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-gray-400 bg-white transition-all"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-miransas-cyan text-black font-black italic rounded-xl text-xs uppercase hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,209,0.3)]">
            <Plus size={16} /> New_Link
          </button>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="py-20 text-center text-miransas-cyan animate-pulse italic tracking-[0.5em]">
              SCANNING_NEURAL_LAYERS...
            </div>
          ) : filteredTunnels.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl text-gray-600 italic">
              NO_ACTIVE_TUNNELS_FOUND_IN_THIS_SECTOR
            </div>
          ) : filteredTunnels.map((tunnel) => (
            <motion.div
              key={tunnel.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group relative bg-[#080808] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all overflow-hidden"
            >
              <BorderBeam size={300} duration={12} className="opacity-0 group-hover:opacity-100" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                {/* Left: Domain & ID */}
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl border ${
                    tunnel.status === 'ACTIVE' 
                    ? 'bg-miransas-cyan/5 border-miransas-cyan/20 text-miransas-cyan' 
                    : 'bg-red-950/20 border-red-900/50 text-red-500'
                  }`}>
                    <Globe size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic group-hover:text-miransas-cyan transition-colors">
                      {tunnel.subdomain}<span className="text-gray-600">.binboi.link</span>
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">ID: {tunnel.id.slice(0,8)}</span>
                      <span className="h-1 w-1 bg-gray-800 rounded-full" />
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Region: {tunnel.region || 'US_EAST'}</span>
                    </div>
                  </div>
                </div>

                {/* Middle: Stats */}
                <div className="flex items-center gap-8 px-8 border-x border-white/5 hidden lg:flex">
                  <div className="text-center">
                    <p className="text-[9px] text-gray-600 font-bold uppercase mb-1">Target</p>
                    <p className="text-xs font-mono text-gray-300 italic">{tunnel.target}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-gray-600 font-bold uppercase mb-1">Traffic_Out</p>
                    <p className="text-xs font-mono text-miransas-cyan">{(tunnel.bytes_out / 1024).toFixed(1)} KB</p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <a 
                    href={`http://${tunnel.subdomain}.binboi.link:8000`} 
                    target="_blank"
                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <ExternalLink size={18} />
                  </a>
                  <button 
                    onClick={() => terminateTunnel(tunnel.id)}
                    className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Status Bar */}
              <div className="absolute bottom-0 left-0 h-[2px] bg-miransas-cyan transition-all duration-500" 
                   style={{ width: tunnel.status === 'ACTIVE' ? '100%' : '0%', opacity: 0.3 }} />
            </motion.div>
          ))}
        </AnimatePresence>
        <AddTunnelModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchTunnels} />
      </div>

      {/* Footer Info */}
      <footer className="mt-12 flex items-center justify-between border-t border-white/5 pt-6 text-[9px] text-gray-600 font-bold uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Activity size={10} /> Latency: 24ms</span>
          <span className="flex items-center gap-1"><Shield size={10} /> Security: TLS_v1.3</span>
        </div>
        <div>Neural_Core_v1.0.4</div>
      </footer>
    </div>
  );
}