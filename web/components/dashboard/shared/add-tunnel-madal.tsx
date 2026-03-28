"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Globe, Server, ArrowRight } from "lucide-react";
import { useState } from "react";

interface AddTunnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTunnelModal({ isOpen, onClose, onSuccess }: AddTunnelModalProps) {
  const [formData, setFormData] = useState({ subdomain: "", target: "3000" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("http://localhost:8080/api/tunnels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subdomain: formData.subdomain,
          target: `http://localhost:${formData.target}`,
          status: "INACTIVE"
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("🔴 [LINK_FAILED]: Could not create tunnel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (Arka Plan Karartma) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[101] p-1"
          >
            <div className="bg-[#080808] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div>
                  <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">
                    New<span className="text-miransas-cyan">_</span>Neural<span className="text-miransas-cyan">_</span>Link
                  </h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Establish a new encrypted tunnel</p>
                </div>
                <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body (Form) */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  {/* Subdomain Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                      <Globe size={12} className="text-miransas-cyan" /> Requested_Subdomain
                    </label>
                    <div className="flex items-center bg-black border border-white/10 rounded-xl focus-within:border-miransas-cyan transition-all group">
                      <input
                        type="text"
                        required
                        placeholder="my-awesome-app"
                        className="flex-1 bg-transparent p-4 text-sm font-mono outline-none text-white"
                        value={formData.subdomain}
                        onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                      />
                      <span className="pr-4 text-xs font-bold text-gray-600 group-focus-within:text-miransas-cyan transition-colors">
                        .binboi.link
                      </span>
                    </div>
                  </div>

                  {/* Target Port Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2">
                      <Server size={12} className="text-miransas-cyan" /> Local_Target_Port
                    </label>
                    <div className="flex items-center bg-black border border-white/10 rounded-xl focus-within:border-miransas-cyan transition-all">
                      <span className="pl-4 text-xs font-bold text-gray-600">localhost:</span>
                      <input
                        type="number"
                        required
                        placeholder="3000"
                        className="flex-1 bg-transparent p-4 text-sm font-mono outline-none text-white"
                        value={formData.target}
                        onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-5 bg-miransas-cyan text-black font-black italic rounded-2xl text-xs uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-cyan-glow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="animate-pulse">INITIALIZING_LINK...</span>
                  ) : (
                    <>
                      Create_Neural_Link <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}