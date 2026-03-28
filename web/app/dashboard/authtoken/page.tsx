"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Key, Copy, RefreshCw, Eye, EyeOff, ShieldAlert, Check, Terminal, Clock, ZapOff } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";
import { toast, Toaster } from "sonner"; // Bildirim kütüphanesi

export default function AuthTokenPage() {
  const [data, setData] = useState({ token: "", last_used_at: "", active_nodes: 0 });
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  const fetchTokenData = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/tokens/current");
      const result = await res.json();
      setData(result);
    } catch (err) {
      toast.error("SYSTEM_SYNC_ERROR: Failed to connect to core.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTokenData(); }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.token);
    toast.success("ACCESS_KEY_COPIED", {
      description: "Neural key secured in clipboard.",
      className: "bg-black border border-miransas-cyan/50 text-miransas-cyan font-mono text-[10px]",
    });
  };

  const revokeSessions = async () => {
    if (!confirm("🚨 KRİTİK UYARI: Tüm aktif tünellerin anında kopacak. Emin misin?")) return;
    
    try {
      await fetch("http://localhost:8080/api/tokens/revoke", { method: "POST" });
      toast.error("PROTOCOL_X_INITIATED", { description: "All active links terminated." });
      fetchTokenData();
    } catch (err) {
      toast.error("REVOKE_FAILED");
    }
  };

  return (
    <div className="p-6 lg:p-12 min-h-screen bg-black text-white font-mono">
      <Toaster position="bottom-right" theme="dark" />
      
      <header className="mb-12">
        <h1 className="text-5xl font-black italic tracking-tighter uppercase">Neural_Access</h1>
        <div className="flex items-center gap-4 mt-2">
            <span className="text-[9px] text-gray-500 font-bold tracking-[0.3em] uppercase">Auth_Protocol: 0x11</span>
            {data.last_used_at && (
                <div className="flex items-center gap-1.5 text-miransas-cyan/60 text-[9px] font-bold">
                    <Clock size={10} />
                    LAST_ACTIVITY: {data.last_used_at}
                </div>
            )}
        </div>
      </header>

      <div className="max-w-3xl space-y-6">
        <div className="relative bg-[#080808] border border-white/5 rounded-3xl p-8 overflow-hidden">
          <BorderBeam size={400} duration={8} className="opacity-20" />
          
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold italic uppercase flex items-center gap-2">
                <Key size={18} className="text-miransas-cyan" /> Master_Key
            </h3>
            <div className="flex gap-2">
                <button onClick={fetchTokenData} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                    <RefreshCw size={14} />
                </button>
            </div>
          </div>

          <div className="bg-black/60 border border-white/5 p-6 rounded-2xl flex items-center gap-4 group/input">
            <p className={`flex-1 text-sm tracking-widest ${isVisible ? 'text-white' : 'text-gray-800 blur-sm select-none'}`}>
              {loading ? "..." : isVisible ? data.token : "********************************"}
            </p>
            <div className="flex gap-1">
                <button onClick={() => setIsVisible(!isVisible)} className="p-2 hover:text-white transition-colors">
                    {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button onClick={handleCopy} className="p-2 hover:text-miransas-cyan transition-colors">
                    <Copy size={18} />
                </button>
            </div>
          </div>
        </div>

        {/* Güvenlik Butonları Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#080808] border border-white/5 p-6 rounded-2xl">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase mb-4 tracking-widest">Danger_Zone</h4>
                <button 
                    onClick={revokeSessions}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-950/20 border border-red-900/30 text-red-500 rounded-xl text-[10px] font-black hover:bg-red-500 hover:text-white transition-all uppercase"
                >
                    <ZapOff size={14} /> Revoke_All_Sessions
                </button>
            </div>

            <div className="bg-[#080808] border border-white/5 p-6 rounded-2xl flex flex-col justify-center">
                <span className="text-[9px] text-gray-600 font-bold uppercase mb-1">Active_Neural_Nodes</span>
                <div className="text-3xl font-black italic text-miransas-cyan">
                    {data.active_nodes.toString().padStart(2, '0')}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}