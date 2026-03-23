"use client";

import React from "react";

import { motion } from "framer-motion";
import { Globe, Cloud, MapPin, Ban, Shield, ListFilter, Shrink, CornerUpRight, RefreshCw, Edit3, List } from "lucide-react";

export default function TrafficPolicy() {
  const flowDuration = 1.2; // Trafik akış hızı (SWR ile dinamik yapılabilir)

  // 🌈 Sıralı Renk Paletimiz (Her adım için farklı bir renk)
  const colors = {
    cyan: "#00ffd1",   // İnternet -> Giriş
    red: "#ef4444",    // IP Blocklist
    orange: "#f97316", // Rate Limit
    blue: "#3b82f6",   // WAF
    purple: "#a855f7", // Modify Headers
    pink: "#ec4899",   // Compression
    yellow: "#eab308", // Forward -> Internal
    green: "#22c55e",  // Find & Replace -> Cloud
    gray: "#404040"    // Pasif düğümler
  };

  // 📍 SVG Koordinatlarına Göre Bölünmüş Renkli Yollar
  const segments = [
    { color: colors.cyan, d: "M 160 120 L 280 120 L 280 140" },
    { color: colors.red, d: "M 280 140 L 280 176" },
    { color: colors.orange, d: "M 280 176 L 280 212" },
    { color: colors.blue, d: "M 280 212 L 280 248" },
    { color: colors.purple, d: "M 280 248 L 280 284" },
    { color: colors.pink, d: "M 280 284 L 280 320" },
    { color: colors.yellow, d: "M 280 320 L 280 338 L 480 338 C 520 338, 520 168, 560 168" },
    { color: colors.green, d: "M 560 168 L 560 206 L 740 206 C 780 206, 780 120, 840 120" }
  ];

  // ⚡ Maske İçin Birleştirilmiş Ana Yol
  const masterPath = "M 160 120 L 280 120 L 280 338 L 480 338 C 520 338, 520 168, 560 168 L 560 206 L 740 206 C 780 206, 780 120, 840 120";

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-20 bg-[#0a0a0a] font-mono select-none">

      {/* 📦 THE MAIN DIAGRAM CONTAINER */}
      <div className="relative w-full aspect-[2/1] max-w-[1000px] mx-auto border border-white/10 rounded-xl bg-[#0e0e0e] shadow-2xl overflow-hidden">

        {/* Üst Etiket */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#0a0a0a] border-b border-x border-white/10 px-6 py-1.5 rounded-b-lg text-[10px] text-gray-500 tracking-wider z-30">
          Fig. 1 &mdash; Sequential Traffic Lifecycle Policy
        </div>

        {/* --- 🔗 Z-0: SVG YOLLARI VE ANİMASYON --- */}
        <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 1000 500">
          <defs>
            {/* ⚡ Akan Maske (Sihir burada: Bu kesik çizgi hareket ettikçe altındaki renkleri gösterir) */}
            <mask id="dashMask">
              <motion.path
                d={masterPath}
                stroke="white"
                strokeWidth="4"
                fill="none"
                strokeDasharray="15 15"
                initial={{ strokeDashoffset: 30 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: flowDuration, repeat: Infinity, ease: "linear" }}
              />
            </mask>
          </defs>

          {/* 1. Katman: Soluk Arka Plan Yolları (Her zaman görünür) */}
          <g opacity="0.15">
            {segments.map((seg, i) => (
              <path key={`bg-${i}`} d={seg.d} stroke={seg.color} strokeWidth="2" fill="none" />
            ))}
          </g>

          {/* 2. Katman: Canlı Akan Yollar (Maskelenmiş) */}
          <g mask="url(#dashMask)">
            {segments.map((seg, i) => (
              <path key={`active-${i}`} d={seg.d} stroke={seg.color} strokeWidth="3" fill="none" style={{ filter: `drop-shadow(0 0 4px ${seg.color})` }} />
            ))}
          </g>

          {/* 3. Katman: Parlayan Bağlantı Noktaları (Dots) */}
          <Dot cx="160" cy="120" color={colors.cyan} />
          <Dot cx="280" cy="120" color={colors.cyan} />
          <Dot cx="280" cy="158" color={colors.red} />
          <Dot cx="280" cy="194" color={colors.orange} />
          <Dot cx="280" cy="230" color={colors.blue} />
          <Dot cx="280" cy="266" color={colors.purple} />
          <Dot cx="280" cy="302" color={colors.pink} />
          <Dot cx="280" cy="338" color={colors.yellow} />
          <Dot cx="560" cy="168" color={colors.yellow} />
          <Dot cx="560" cy="206" color={colors.green} />
          <Dot cx="840" cy="120" color={colors.green} />

          {/* Pasif Gri Noktalar */}
          <Dot cx="560" cy="264" color={colors.gray} glow={false} />
          <Dot cx="560" cy="302" color={colors.gray} glow={false} />
          <Dot cx="560" cy="338" color={colors.gray} glow={false} />
        </svg>

        {/* --- 🧱 Z-10: HTML KUTULARI (Tam Yüzdelik Konumlandırma) --- */}
        <div className="absolute inset-0 z-10 text-xs pointer-events-none">

          {/* SÜTUN BAŞLIKLARI */}
          <div className="absolute top-[8%] w-[20%] left-[0%] flex flex-col items-center text-gray-500 gap-2">
            <Globe className="w-5 h-5" />
            <span className="text-[10px]">the internet</span>
          </div>
          <div className="absolute top-[8%] w-[40%] left-[30%] flex flex-col items-center text-gray-500 gap-2">
            <span className="text-xl font-black italic text-white">B</span>
            <span className="text-[10px]">binboi cloud service</span>
          </div>
          <div className="absolute top-[8%] w-[20%] left-[80%] flex flex-col items-center text-gray-500 gap-2">
            <Cloud className="w-5 h-5" />
            <span className="text-[10px]">your cloud</span>
          </div>

          {/* SOL SÜTUN */}
          <Pill style={{ left: '4%', top: '20.8%', width: '12%', height: '6.4%' }} text="GET /blog" isActive />
          <Pill style={{ left: '4%', top: '49.6%', width: '12%', height: '6.4%' }} text="GET /v1/users" />

          {/* ORTA SÜTUN 1: MAIN POLICY BOX */}
          <div className="absolute bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-2xl flex flex-col pointer-events-auto" style={{ left: '26%', top: '20%', width: '22%', height: '51.2%' }}>
            <div className="flex items-center pl-[40px] text-white font-bold text-[11px] border-b border-[#2a2a2a] bg-[#1a1a1a] rounded-t-xl" style={{ height: '15.62%' }}>https://*.binboi.link</div>
            <Rule text="IP Blocklist" icon={<MapPin />} color={colors.red} />
            <Rule text="Rate Limit" icon={<Ban />} color={colors.orange} />
            <Rule text="WAF" icon={<Shield />} color={colors.blue} />
            <Rule text="Modify Headers" icon={<ListFilter />} color={colors.purple} />
            <Rule text="Compression" icon={<Shrink />} color={colors.pink} />
            <Rule text="Forward" icon={<CornerUpRight />} color={colors.yellow} />
          </div>

          {/* ORTA SÜTUN 2: INTERNAL ROUTING */}
          <div className="absolute bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-2xl flex flex-col pointer-events-auto" style={{ left: '54%', top: '29.6%', width: '20%', height: '15.2%' }}>
            <div className="flex items-center pl-[40px] text-white font-bold text-[11px] border-b border-[#2a2a2a] bg-[#1a1a1a] rounded-t-xl" style={{ height: '52.6%' }}>https://blog.internal</div>
            <Rule text="Find & Replace" icon={<RefreshCw />} color={colors.green} height="47.4%" />
          </div>

          <div className="absolute bg-[#141414] border border-[#2a2a2a] opacity-50 rounded-xl flex flex-col" style={{ left: '54%', top: '48.8%', width: '20%', height: '22.4%' }}>
            <div className="flex items-center pl-[40px] text-gray-500 font-bold text-[11px] border-b border-[#2a2a2a] rounded-t-xl" style={{ height: '35.7%' }}>https://api.internal</div>
            <Rule text="URL Rewrite" icon={<Edit3 />} color="transparent" height="32.1%" />
            <Rule text="Log" icon={<List />} color="transparent" height="32.1%" />
          </div>

          {/* SAĞ SÜTUN */}
          <Pill style={{ left: '84%', top: '20.8%', width: '12%', height: '6.4%' }} text="blog service" isActive />
          <Pill style={{ left: '84%', top: '49.6%', width: '12%', height: '6.4%' }} text="api service" />

        </div>
      </div>

      {/* 📝 ALT BİLGİ METNİ */}
      <div className="mt-16 text-center">
        <h2 className="text-3xl font-serif text-white mb-4">Take action at any phase.</h2>
        <p className="text-gray-400 font-sans max-w-2xl mx-auto leading-relaxed">
          Traffic Policy is an expressive sequential rules system. As traffic flows down the stack, Binboi executes each module in real-time.
        </p>
      </div>

    </div>
  );
}

// --- YARDIMCI BİLEŞENLER ---

function Pill({ style, text, isActive }: { style: React.CSSProperties, text: string, isActive?: boolean }) {
  return (
    <div
      className={`absolute flex items-center justify-center rounded-full border text-[10px] ${isActive ? 'bg-[#1a1a1a] border-white/20 text-white shadow-lg' : 'bg-transparent border-transparent text-gray-600'}`}
      style={style}
    >
      {text}
    </div>
  );
}

// Dinamik Yükseklikli Kurallar Kutusu
function Rule({ text, icon, color, height = "14.06%" }: { text: string, icon: React.ReactNode, color: string, height?: string }) {
  const isActive = color !== "transparent";
  return (
    <div className={`flex items-center justify-between pl-[40px] pr-4 w-full text-[10px] transition-colors ${isActive ? 'hover:bg-white/5 text-gray-300' : 'text-gray-600'}`} style={{ height }}>
      <span className={isActive ? "text-white" : ""}>{text}</span>
      <span style={{ color: isActive ? color : '#404040' }} className="w-3.5 h-3.5">
        {icon}
      </span>
    </div>
  );
}

function Dot({ cx, cy, color, glow = true }: { cx: string, cy: string, color: string, glow?: boolean }) {
  return (
    <g>
      {glow && <circle cx={cx} cy={cy} r="10" fill={color} opacity="0.2" className="animate-pulse" />}
      <circle cx={cx} cy={cy} r="4" fill={color} stroke="#141414" strokeWidth="2" />
    </g>
  );
}