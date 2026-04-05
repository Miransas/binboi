"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { fetchControlPlane } from "@/lib/controlplane";

export default function CreateTunnelForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ subdomain: "", target: "localhost:3000" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetchControlPlane("/api/v1/tunnels", {
        method: "POST",
        body: JSON.stringify({
          subdomain: formData.subdomain,
          target: formData.target,
          region: "local",
        }),
      });

      alert("✨ Neural Tunnel Established!");
      onSuccess();
    } catch (error) {
      alert(
        `🔴 Error: ${error instanceof Error ? error.message : "Binboi control plane is offline."}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-white/10 bg-[#0d0d0d] p-6"
    >
      <div>
        <label className="text-[10px] font-mono text-gray-500 uppercase">Desired Subdomain</label>
        <input
          type="text"
          placeholder="sazlab"
          className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-miransas-cyan outline-none focus:border-miransas-cyan/50"
          onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
        />
      </div>
      <div>
        <label className="text-[10px] font-mono text-gray-500 uppercase">Local Target</label>
        <input
          type="text"
          placeholder="localhost:3000"
          className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white outline-none"
          onChange={(e) => setFormData({ ...formData, target: e.target.value })}
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
