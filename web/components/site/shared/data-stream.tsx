"use client";
import { motion } from "framer-motion";
import { Laptop, Globe, Cpu } from "lucide-react";

export default function DataStream() {
  return (
    <div className="relative flex items-center justify-between w-full max-w-3xl mx-auto h-64 px-10">
      
      {/* 💻 Localhost Node */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="p-4 rounded-2xl bg-white/5 border border-miransas-cyan/30 shadow-neon">
          <Laptop className="w-8 h-8 text-miransas-cyan" />
        </div>
        <span className="text-[10px] font-mono text-miransas-cyan tracking-tighter uppercase">Localhost:3000</span>
      </div>

      {/* 🛰️ The Animated Stream (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        {/* Sabit Arka Plan Yolu */}
        <path
          d="M 120 128 Q 384 128 648 128" 
          stroke="white"
          strokeOpacity="0.05"
          strokeWidth="2"
          fill="none"
        />
        
        {/* ⚡ Neon Akış Hattı */}
        <motion.path
          d="M 120 128 Q 384 128 648 128"
          stroke="url(#neonGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, pathOffset: 0 }}
          animate={{ 
            pathLength: [0.2, 0.2], 
            pathOffset: [0, 1] 
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Gradient Tanımı */}
        <defs>
          <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ffd1" stopOpacity="0" />
            <stop offset="50%" stopColor="#00ffd1" />
            <stop offset="100%" stopColor="#ff00ff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* 🧠 Processing Hub (Orta Nokta - Opsiyonel) */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="relative z-10 p-3 rounded-full bg-miransas-dark border border-white/10"
      >
        <Cpu className="w-6 h-6 text-gray-500" />
      </motion.div>

      {/* 🌍 Web / Cloud Node */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="p-4 rounded-2xl bg-white/5 border border-miransas-magenta/30 shadow-[0_0_20px_rgba(255,0,255,0.2)]">
          <Globe className="w-8 h-8 text-miransas-magenta" />
        </div>
        <span className="text-[10px] font-mono text-miransas-magenta tracking-tighter uppercase">binboi.link</span>
      </div>

      {/* Arka Plan Glow Efektleri */}
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-32 h-32 bg-miransas-cyan/10 blur-[80px] rounded-full" />
      <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-32 h-32 bg-miransas-magenta/10 blur-[80px] rounded-full" />
    </div>
  );
}