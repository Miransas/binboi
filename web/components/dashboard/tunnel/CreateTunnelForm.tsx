"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

export default function CreateTunnelForm({ onSuccess }: { onSuccess: () => void }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ subdomain: "", target: "localhost:3000" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/tunnels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: session?.user?.id,
          subdomain: formData.subdomain,
          target: formData.target,
          region: "eu-central",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✨ Neural Tunnel Established!");
        onSuccess(); // Listeyi yenilemek için
      } else {
        alert(`🔴 Error: ${data.error}`);
      }
    } catch {
      alert("🔴 Binboi Core Server is offline!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit} className="p-6 bg-[#0d0d0d] border border-white/10 rounded-2xl space-y-4"
    >
      <div>
        <label className="text-[10px] font-mono text-gray-500 uppercase">Desired Subdomain</label>
        <input 
          type="text" placeholder="sazlab"
          className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-miransas-cyan outline-none focus:border-miransas-cyan/50"
          onChange={(e) => setFormData({...formData, subdomain: e.target.value})}
        />
      </div>
      <div>
        <label className="text-[10px] font-mono text-gray-500 uppercase">Local Target</label>
        <input 
          type="text" placeholder="localhost:3000"
          className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white outline-none"
          onChange={(e) => setFormData({...formData, target: e.target.value})}
        />
      </div>
      <button 
        disabled={loading}
        className="w-full bg-miransas-cyan text-black font-bold p-3 rounded-lg hover:shadow-[0_0_20px_rgba(0,255,209,0.3)] disabled:opacity-50"
      >
        {loading ? "Establishing Link..." : "Initialize Tunnel"}
      </button>
    </motion.form>
  );
}
