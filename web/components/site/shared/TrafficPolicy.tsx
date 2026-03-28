"use client";

import { motion } from "framer-motion";
import { Server, Laptop, Globe, Zap, ShieldCheck } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";

export default function NeuralFlowSection() {
  return (
    <section className="w-full py-24 bg-[#060606] relative overflow-hidden border-t border-white/5">
      {/* Arka Plan Grid Deseni */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white"
          >
            Neural_Link<span className="text-miransas-cyan">_</span>Architecture
          </motion.h2>
          <p className="text-gray-500 font-mono text-xs mt-4 tracking-[0.4em] uppercase">How Binboi bridges the gap</p>
        </div>

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-0">
          
          {/* 1. Global Internet Node */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 relative">
              <Globe size={40} />
              <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-miransas-cyan text-black text-[8px] font-black rounded uppercase">Public</div>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-sm italic">Global_User</p>
              <p className="text-[9px] text-gray-600 font-mono">app.binboi.link</p>
            </div>
          </div>

          {/* Animasyonlu Yol 1 (Public -> Relay) */}
          <div className="hidden lg:block flex-1 relative h-2 mx-4">
            <svg width="100%" height="20" className="overflow-visible">
              <path d="M 0 10 L 200 10" stroke="#1a1a1a" strokeWidth="2" fill="none" />
              <motion.path 
                d="M 0 10 L 200 10" 
                stroke="#ff00ff" 
                strokeWidth="2" 
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.circle r="3" fill="#ff00ff" style={{ filter: 'drop-shadow(0 0 5px #ff00ff)' }}>
                <animateMotion dur="1.5s" repeatCount="indefinite" path="M 0 10 L 200 10" />
              </motion.circle>
            </svg>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[8px] font-black text-miransas-pink italic uppercase">GET /api/v1</div>
          </div>

          {/* 2. Binboi Core Relay (The Server) */}
          <div className="relative p-1 rounded-3xl group">
             <div className="w-40 h-40 bg-[#0a0a0a] border border-white/10 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
                <BorderBeam size={200} duration={6} className="from-transparent via-miransas-cyan to-transparent" />
                <Zap className="text-miransas-cyan mb-2 animate-pulse" size={48} />
                <span className="text-[10px] font-black text-white italic tracking-widest uppercase">Core_Relay</span>
                <div className="mt-2 flex gap-1">
                  <div className="w-1 h-1 bg-miransas-cyan rounded-full animate-ping" />
                  <div className="w-1 h-1 bg-miransas-cyan rounded-full animate-ping delay-75" />
                  <div className="w-1 h-1 bg-miransas-cyan rounded-full animate-ping delay-150" />
                </div>
             </div>
          </div>

          {/* Animasyonlu Yol 2 (Relay -> Local) */}
          <div className="hidden lg:block flex-1 relative h-2 mx-4">
            <svg width="100%" height="20" className="overflow-visible">
              <path d="M 0 10 L 200 10" stroke="#1a1a1a" strokeWidth="2" fill="none" />
              <motion.path 
                d="M 0 10 L 200 10" 
                stroke="#00ffd1" 
                strokeWidth="2" 
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear", delay: 0.5 }}
              />
              <motion.circle r="3" fill="#00ffd1" style={{ filter: 'drop-shadow(0 0 5px #00ffd1)' }}>
                <animateMotion dur="1s" repeatCount="indefinite" path="M 0 10 L 200 10" />
              </motion.circle>
            </svg>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[8px] font-black text-miransas-cyan italic uppercase">Yamux_Tunnel</div>
          </div>

          {/* 3. Local Machine Node */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 relative group-hover:border-miransas-cyan transition-colors">
              <Laptop size={40} />
              <div className="absolute -bottom-2 px-2 py-0.5 bg-white/10 text-gray-400 text-[8px] font-black rounded uppercase border border-white/5">Localhost</div>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-sm italic">Dev_Machine</p>
              <p className="text-[9px] text-gray-600 font-mono">127.0.0.1:3000</p>
            </div>
          </div>

        </div>

        {/* Bilgi Kartları Alt Bölüm */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: "INITIATE", desc: "User hits public endpoint", icon: <Globe size={14} /> },
            { title: "SHIELD", desc: "Miransas WAF scrubs traffic", icon: <ShieldCheck size={14} /> },
            { title: "RELAY", desc: "Yamux multiplexes the link", icon: <Zap size={14} /> },
            { title: "EXPOSE", desc: "Local service receives data", icon: <Laptop size={14} /> },
          ].map((step, i) => (
            <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
              <div className="text-miransas-cyan mb-3">{step.icon}</div>
              <h4 className="text-[10px] font-black text-white italic mb-1 uppercase tracking-widest">{i+1}. {step.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed font-mono">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}