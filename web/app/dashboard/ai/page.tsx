// pages/dashboard/ai-gateways.tsx
"use client";
import { motion } from "framer-motion";
import { Cpu, Zap, Lock } from "lucide-react";

export default function AiGatewaysPlaceholder() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center relative overflow-hidden bg-[#050505] rounded-3xl border border-white/5">
      {/* Arka Plan Glitch Efekti */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 text-center space-y-8 p-12"
      >
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-miransas-cyan blur-3xl opacity-20 animate-pulse" />
          <Cpu size={80} className="text-miransas-cyan relative z-10 mx-auto mb-4" />
        </div>

        <div className="space-y-2">
          <h2 className="text-5xl font-black italic tracking-tighter text-white">
            AI<span className="text-miransas-cyan">_</span>GATEWAY
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="px-3 py-1 bg-purple-900/30 text-purple-400 text-[10px] font-black rounded-full border border-purple-500/30 tracking-widest uppercase">
              Early Access Alpha
            </span>
          </div>
        </div>

        <p className="max-w-md text-gray-500 text-sm font-mono leading-relaxed">
          Tünel trafiğinizi yapay zeka ile gerçek zamanlı analiz edin. 
          Zararlı istekleri nöral ağlarla engelleyin ve akıllı yönlendirme yapın.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 grayscale opacity-50">
            <Zap className="text-yellow-500" size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Smart Inspection</span>
          </div>
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 grayscale opacity-50">
            <Lock className="text-miransas-cyan" size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Neural Shielding</span>
          </div>
        </div>

        <button className="mt-12 px-10 py-4 bg-white/5 border border-white/10 text-gray-400 font-black italic rounded-xl cursor-not-allowed group">
           <span className="group-hover:text-white transition-colors">ACCESS_DENIED: WAIT_FOR_MAINNET</span>
        </button>
      </motion.div>
    </div>
  );
}