/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Laptop, Globe, ShieldCheck, ArrowRight, Zap, Activity } from "lucide-react";
import Link from "next/link";
import { useTraffic } from "../../../hooks/useTraffic";

export default function Hero() {
  const { stats } = useTraffic();
  const kbps = stats?.kbps || 0;

  // Dinamik hız ve renk hesaplamaları
  const flowDuration = Math.max(0.6, 2.5 / (1 + kbps / 200));
  const activeColor = kbps > 400 ? "#ff00ff" : "#00ffd1"; // Yüksek yükte Magenta, normalde Cyan

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-10 overflow-hidden bg-[#060606]">
      
      {/* 🌌 Arka Plan Işımaları (Dinamik) */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full -z-10"
        style={{ backgroundColor: activeColor, filter: 'blur(140px)' }}
      />

      {/* 📝 Header Text */}
      <div className="text-center z-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.03] backdrop-blur-md mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-miransas-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-miransas-cyan"></span>
          </span>
          <span className="text-[10px] font-mono tracking-[0.2em] text-gray-400 uppercase">
            v0.2.0-Alpha is Live in Tashkent
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-7xl md:text-9xl font-black italic tracking-tighter text-white leading-[0.85] mb-8"
        >
          EXPOSE YOUR <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-miransas-cyan via-white to-miransas-magenta">
            LOCAL WORLD.
          </span>
        </motion.h1>

        <motion.p 
          className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed"
        >
          Hyper-speed introspection tunnels for modern engineers. <br/>
          Securely bypass NATs and firewalls with neural routing.
        </motion.p>
      </div>

      {/* ⚡ THE VISUALIZATION: 3D-Like Flow */}
      <div className="relative mt-24 w-full max-w-6xl h-80 flex items-center justify-between px-12 perspective-1000">
        
        {/* Localhost Node */}
        <Node 
          icon={<Laptop className="w-7 h-7"/>} 
          label="Localhost:3000" 
          color="#64748b" 
          description="Your Machine"
        />

        {/* 🛣️ Data Highway 1 */}
        <div className="flex-1 relative h-20 mx-6">
           <StreamLine color={activeColor} duration={flowDuration} count={4} />
        </div>

        {/* 🧠 Core Node: BINBOI (Neural Hub) */}
        <div className="relative z-30">
          <motion.div 
            animate={{ 
              boxShadow: [
                `0 0 40px ${activeColor}10`, 
                `0 0 80px ${activeColor}30`, 
                `0 0 40px ${activeColor}10`
              ] 
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-28 h-28 rounded-[2.5rem] bg-[#0d0d0d] border border-white/10 flex items-center justify-center relative group"
          >
            {/* Dönen Halka */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-8px] border border-dashed border-white/5 rounded-[3rem]"
            />
            
            <span className="text-5xl font-black italic text-white group-hover:text-miransas-cyan transition-colors">B</span>
            
            {/* Canlı Trafik Badge */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <Activity className="w-3 h-3 text-miransas-cyan animate-pulse" />
                <span className="text-[10px] font-mono text-gray-300 font-bold">{kbps} KB/s</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 🛣️ Data Highway 2 */}
        <div className="flex-1 relative h-20 mx-6 rotate-180">
           <StreamLine color={activeColor} duration={flowDuration * 0.9} count={4} />
        </div>

        {/* Global Web Node */}
        <Node 
          icon={<Globe className="w-7 h-7"/>} 
          label="Public Web" 
          color={activeColor} 
          description="Global Access"
          glow
        />
      </div>

      {/* 🚀 CTA Buttons */}
      <motion.div className="mt-20 flex flex-col sm:flex-row items-center gap-6 z-30">
        <Link 
          href="/dashboard"
          className="group relative px-10 py-5 bg-white text-black font-black rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-miransas-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 flex items-center gap-2 uppercase tracking-tighter italic">
            Start Tunneling Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
        
        <button className="px-10 py-5 bg-transparent text-white font-bold rounded-2xl border border-white/10 hover:bg-white/5 transition-all flex items-center gap-3 group">
          <ShieldCheck className="w-5 h-5 text-gray-500 group-hover:text-miransas-cyan transition-colors" />
          <span className="uppercase tracking-widest text-[11px] font-mono">Security Protocol</span>
        </button>
      </motion.div>

    </section>
  );
}

// --- YARDIMCI BİLEŞENLER ---

function Node({ icon, label, color, description, glow }: any) {
  return (
    <div className="flex flex-col items-center gap-4 z-20">
      <div 
        className={`w-20 h-20 rounded-3xl bg-[#0d0d0d] border border-white/10 flex items-center justify-center relative transition-all duration-500`}
        style={{ 
          color: color, 
          boxShadow: glow ? `0 0 50px ${color}20` : 'none',
          borderColor: glow ? `${color}40` : 'rgba(255,255,255,0.1)'
        }}
      >
        {icon}
        {/* Cam Yansıması */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent rounded-3xl" />
      </div>
      <div className="text-center">
        <p className="text-[10px] font-mono text-gray-300 font-black uppercase tracking-widest">{label}</p>
        <p className="text-[9px] font-mono text-gray-600 uppercase mt-1">{description}</p>
      </div>
    </div>
  );
}

function StreamLine({ color, duration, count }: any) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* Arka Plan Hattı */}
      <div className="absolute w-full h-[1px] bg-white/5" />
      
      {/* Akan Parçacıklar (Particles) */}
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: "-150%", opacity: 0 }}
          animate={{ x: "150%", opacity: [0, 1, 1, 0] }}
          transition={{ 
            duration: duration, 
            repeat: Infinity, 
            ease: "linear",
            delay: (duration / count) * i 
          }}
          className="absolute h-[2px] w-12 rounded-full"
          style={{ 
            background: `linear-gradient(90deg, transparent, ${color}, white)`,
            boxShadow: `0 0 15px ${color}`
          }}
        />
      ))}
    </div>
  );
}