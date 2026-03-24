/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/purity */
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Cloud, MapPin, Ban, Shield, ListFilter, Shrink, CornerUpRight, RefreshCw, Edit3, List, Activity, Zap } from "lucide-react";

export default function TrafficPolicy() {
  const flowDuration = 1.8; // Suyun akış hızı (Neon çizgiler)
  
  //  Miransas Siberpunk Renk Paleti
  const colors = {
    cyan: "#00ffd1",       // İnternet Girişi
    red: "#ff003c",        // WAF / Block
    orange: "#ff5e00",     // Rate Limit
    blue: "#00b8ff",       // Headers
    magenta: "#ff00ff",    // Compression
    yellow: "#facc15",     // Forwarding
    green: "#39ff14",      // Target Cloud
    gray: "#222222"        // Pasif
  };

  // 📍 Milimetrik SVG Yolları (Kavisli / Beizer Curves eklendi)
  const segments = [
    { color: colors.cyan, d: "M 160 120 L 260 120 C 270 120, 280 130, 280 140" },
    { color: colors.red, d: "M 280 140 L 280 176" },
    { color: colors.orange, d: "M 280 176 L 280 212" },
    { color: colors.blue, d: "M 280 212 L 280 248" },
    { color: colors.magenta, d: "M 280 248 L 280 284" },
    { color: colors.yellow, d: "M 280 284 L 280 320" },
    { color: colors.yellow, d: "M 280 320 L 280 328 C 280 338, 290 338, 300 338 L 540 338 C 550 338, 560 328, 560 318 L 560 188 C 560 178, 560 168, 570 168 L 580 168" },
    { color: colors.green, d: "M 580 168 L 740 168 C 760 168, 800 120, 840 120" }
  ];

  // ⚡ Tek parça akan veri otoyolu
  const masterPath = "M 160 120 L 260 120 C 270 120, 280 130, 280 140 L 280 328 C 280 338, 290 338, 300 338 L 540 338 C 550 338, 560 328, 560 318 L 560 188 C 560 178, 560 168, 570 168 L 740 168 C 760 168, 800 120, 840 120";

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-20 bg-[#060606] font-sans select-none">

      {/* 📝 ÜST METİNLER (Binboi Ruhuna Uygun) */}
      <div className="text-center mb-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-6">
          <Activity className="w-3.5 h-3.5 text-miransas-magenta animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">Neural Routing Core</span>
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-black italic tracking-tight text-white mb-4">Programmable Traffic.</h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
          Inject intelligence at the edge. Binboi executes WebAssembly policies in sub-milliseconds as traffic flows down the neural stack.
        </p>
      </div>

      {/* 📦 THE MAIN DIAGRAM CONTAINER */}
      <div className="relative w-full aspect-[2/1] max-w-[1000px] mx-auto border border-white/5 rounded-3xl bg-[#0a0a0a] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">

        {/* --- 🌌 Arka Plan Parlaması --- */}
        <div className="absolute top-1/2 left-1/3 w-[500px] h-[300px] bg-miransas-cyan/5 blur-[120px] rounded-full -translate-y-1/2 -z-10 pointer-events-none" />

        {/* Üst Etiket (Cyberpunk) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#111] border-b border-x border-white/10 px-6 py-1.5 rounded-b-xl text-[10px] text-gray-500 tracking-widest font-mono z-30 flex items-center gap-2 shadow-lg">
          <Zap className="w-3 h-3 text-miransas-cyan" /> L7 TRAFFIC PIPELINE
        </div>

        {/* --- 🔗 Z-0: SVG YOLLARI VE NEON ANİMASYON --- */}
        <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 1000 500">
          <defs>
            {/* ✨ Parçacık Maskesi (Veri paketleri gibi akan çizgiler) */}
            <mask id="dashMaskFlow">
              <motion.path
                d={masterPath}
                stroke="white"
                strokeWidth="4"
                fill="none"
                strokeDasharray="20 40"
                initial={{ strokeDashoffset: 120 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: flowDuration, repeat: Infinity, ease: "linear" }}
              />
            </mask>
          </defs>

          {/* 1. Katman: Ana Kablo Yatağı (Koyu) */}
          <path d={masterPath} stroke="#161616" strokeWidth="6" fill="none" />
          
          {/* 2. Katman: Renkli İz (Soluk) */}
          <g opacity="0.3">
            {segments.map((seg, i) => (
              <path key={`bg-${i}`} d={seg.d} stroke={seg.color} strokeWidth="2" fill="none" />
            ))}
          </g>

          {/* 3. Katman: Canlı Akan Neon Veriler (Sihirli Kısım) */}
          <g mask="url(#dashMaskFlow)">
            {segments.map((seg, i) => (
              <path key={`active-${i}`} d={seg.d} stroke={seg.color} strokeWidth="4" fill="none" style={{ filter: `drop-shadow(0 0 8px ${seg.color})` }} />
            ))}
          </g>

          {/* 4. Katman: Düğümler (Nodes) */}
          <GlowingNode cx="160" cy="120" color={colors.cyan} />
          <GlowingNode cx="280" cy="120" color={colors.cyan} />
          <GlowingNode cx="280" cy="158" color={colors.red} />
          <GlowingNode cx="280" cy="194" color={colors.orange} />
          <GlowingNode cx="280" cy="230" color={colors.blue} />
          <GlowingNode cx="280" cy="266" color={colors.magenta} />
          <GlowingNode cx="280" cy="302" color={colors.yellow} />
          <GlowingNode cx="560" cy="168" color={colors.yellow} />
          <GlowingNode cx="740" cy="168" color={colors.green} />
          <GlowingNode cx="840" cy="120" color={colors.green} />

        </svg>

        {/* --- 🧱 Z-10: GLASSMORPHISM KUTULARI --- */}
        <div className="absolute inset-0 z-10 text-xs pointer-events-none">

          {/* SÜTUN BAŞLIKLARI */}
          <div className="absolute top-[8%] w-[20%] left-[0%] flex flex-col items-center text-gray-500 gap-2">
            <Globe className="w-5 h-5 text-gray-400" />
            <span className="text-[10px] font-mono tracking-widest uppercase">Public Web</span>
          </div>
          <div className="absolute top-[8%] w-[40%] left-[30%] flex flex-col items-center text-gray-500 gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#111] border border-white/10 flex items-center justify-center">
              <span className="text-xl font-black italic text-white">B</span>
            </div>
            <span className="text-[10px] font-mono tracking-widest text-miransas-cyan uppercase">Binboi Neural Hub</span>
          </div>
          <div className="absolute top-[8%] w-[20%] left-[80%] flex flex-col items-center text-gray-500 gap-2">
            <Cloud className="w-5 h-5 text-gray-400" />
            <span className="text-[10px] font-mono tracking-widest uppercase">Local Network</span>
          </div>

          {/* SOL SÜTUN (İstekler) */}
          <Pill style={{ left: '4%', top: '20.8%', width: '12%', height: '6.4%' }} text="GET /api/v1" isActive color={colors.cyan} />
          <Pill style={{ left: '4%', top: '49.6%', width: '12%', height: '6.4%' }} text="POST /auth" />

          {/* ORTA SÜTUN 1: MAIN NEURAL STACK */}
          <div className="absolute bg-[#0d0d0d]/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden" style={{ left: '26%', top: '20%', width: '22%', height: '48%' }}>
            <div className="flex items-center pl-[40px] text-white font-mono font-bold text-[10px] tracking-widest border-b border-white/10 bg-[#161616]" style={{ height: '16%' }}>
              api.binboi.link
            </div>
            <Rule text="WAF Shield" icon={<Shield />} color={colors.red} />
            <Rule text="Rate Limiter" icon={<Ban />} color={colors.orange} />
            <Rule text="Inject Headers" icon={<ListFilter />} color={colors.blue} />
            <Rule text="Brotli Compress" icon={<Shrink />} color={colors.magenta} />
            <Rule text="L7 Forwarding" icon={<CornerUpRight />} color={colors.yellow} />
          </div>

          {/* ORTA SÜTUN 2: INTERNAL RESOLUTION */}
          <div className="absolute bg-[#0d0d0d]/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden" style={{ left: '54%', top: '29.6%', width: '22%', height: '14%' }}>
            <div className="flex items-center pl-[40px] text-white font-mono font-bold text-[10px] tracking-widest border-b border-white/10 bg-[#161616]" style={{ height: '52.6%' }}>
              localhost:8080
            </div>
            <Rule text="Traffic Inspector" icon={<Activity />} color={colors.green} height="47.4%" />
          </div>

          {/* SAĞ SÜTUN (Hedefler) */}
          <Pill style={{ left: '84%', top: '20.8%', width: '12%', height: '6.4%' }} text="Core API" isActive color={colors.green} />
          <Pill style={{ left: '84%', top: '49.6%', width: '12%', height: '6.4%' }} text="Auth Service" />

        </div>
      </div>

    </div>
  );
}

// --- YARDIMCI BİLEŞENLER ---

function Pill({ style, text, isActive, color }: any) {
  return (
    <div
      className={`absolute flex items-center justify-center rounded-xl font-mono text-[10px] font-bold tracking-wider transition-all duration-500`}
      style={{
        ...style,
        backgroundColor: isActive ? '#111' : 'transparent',
        borderColor: isActive ? `${color}40` : 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        color: isActive ? 'white' : '#666',
        boxShadow: isActive ? `0 0 20px ${color}20` : 'none'
      }}
    >
      {text}
    </div>
  );
}

// Neural Node Rules
function Rule({ text, icon, color, height = "16.8%" }: any) {
  const isActive = color !== "transparent";
  return (
    <div className={`flex items-center justify-between pl-[40px] pr-4 w-full font-mono text-[10px] transition-colors group ${isActive ? 'hover:bg-white/5 text-gray-300' : 'text-gray-600'}`} style={{ height }}>
      <span className={isActive ? "group-hover:text-white transition-colors tracking-wide" : ""}>{text}</span>
      <span style={{ color: isActive ? color : '#404040' }} className={`w-3.5 h-3.5 ${isActive ? 'group-hover:scale-110 transition-transform' : ''}`}>
        {icon}
      </span>
    </div>
  );
}

// Parıldayan Sinir Uçları (Glowing Nodes)
function GlowingNode({ cx, cy, color }: any) {
  return (
    <g>
      {/* Sabit Dış Halka */}
      <circle cx={cx} cy={cy} r="6" fill="#050505" stroke={color} strokeWidth="1.5" opacity="0.5" />
      {/* Yanıp Sönen İç Çekirdek */}
      <motion.circle 
        cx={cx} cy={cy} r="3" fill={color}
        animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
        transition={{ duration: 1.5 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: `drop-shadow(0 0 5px ${color})` }}
      />
    </g>
  );
}