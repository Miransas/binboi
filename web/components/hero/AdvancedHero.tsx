"use client";

import { motion } from "framer-motion";

// ─── Data ─────────────────────────────────────────────────────────────────────
// Renkleri dark modda parlayacak şekilde güncelledik.

const ICONS = [
  { id: "slack",    emoji: "💬", label: "Slack",         color: "#4A154B" },
  { id: "gmail",    emoji: "✉️",  label: "Gmail",         color: "#EA4335" },
  { id: "youtube",  emoji: "▶️",  label: "YouTube",       color: "#FF0000" },
  { id: "sheets",   emoji: "📊", label: "Google Sheets", color: "#0F9D58" },
  { id: "linkedin", emoji: "💼", label: "LinkedIn",      color: "#0A66C2" },
  { id: "drive",    emoji: "☁️",  label: "Google Drive",  color: "#1E88E5" },
  { id: "figma",    emoji: "🎨", label: "Figma",         color: "#F24E1E" },
  { id: "notion",   emoji: "📝", label: "Notion",        color: "#FFFFFF" }, // Dark modda beyaz Notion ikonu
];

const CARDS = [
  { id: "c1", label: "Personalized Outreach", color: "#3B82F6" },
  { id: "c2", label: "Strategy Content",      color: "#8B5CF6" },
  { id: "c3", label: "Auto Reporting",        color: "#10B981" },
];

// ─── Icon Node ────────────────────────────────────────────────────────────────

interface IconNodeProps {
  icon: (typeof ICONS)[0];
  index: number;
}

function IconNode({ icon, index }: IconNodeProps) {
  // Başlangıç pozisyonu (sol taraftaki grid)
  const startX = -340 + (index % 3) * 80;
  const startY = 80 + Math.floor(index / 3) * 90;

  return (
    <motion.div
      // Başlangıç durumu: Görünmez ve grid yerinde
      initial={{ x: startX, y: startY, scale: 0, opacity: 0 }}
      // Döngüsel Animasyon: Merkeze git, büyü, kaybol, başa dön
      animate={{
        x: [startX, startX, 0, 0],       // Bekle, merkeze git
        y: [startY, startY, 0, 0],       // Bekle, merkeze git
        scale: [0, 1, 1.15, 0],          // Ortaya çık, büyü, kaybol
        opacity: [0, 1, 1, 0],           // Ortaya çık, görünür kal, kaybol
      }}
      transition={{
        duration: 4,                     // Tüm döngü süresi
        repeat: Infinity,                 // Sonsuz döngü
        delay: index * 0.25,             // Her ikon sırayla başlasın
        times: [0, 0.15, 0.85, 1],        // Animasyon aşamalarının zamanlaması
        ease: "easeInOut",
      }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <div
        className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl backdrop-blur-md shadow-xl"
        style={{
          backgroundColor: `${icon.color}15`, // Hafif renkli şeffaf arka plan
          border: `1px solid ${icon.color}40`,  // Renkli kenarlık
          boxShadow: `0 4px 20px ${icon.color}20`, // Renkli parlama (glow)
        }}
      >
        <span className="text-2xl leading-none">{icon.emoji}</span>
      </div>
      <p className="mt-2 text-center text-[10px] font-medium text-slate-400">
        {icon.label}
      </p>
    </motion.div>
  );
}

// ─── Dotted trail lines (SVG) ─────────────────────────────────────────────────

function Trail({ index }: { index: number }) {
  const startX = -340 + (index % 3) * 80;
  const startY = 80 + Math.floor(index / 3) * 90;

  const x1 = 400 + startX; // SVG koordinat sistemine göre offset
  const y1 = 300 + startY;
  const x2 = 400;
  const y2 = 300;

  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="#334155" // Dark mode çizgisi
      strokeWidth="1.5"
      strokeDasharray="6 5" // Kesikli çizgi
      initial={{ strokeDashoffset: 300, opacity: 0 }}
      animate={{
        strokeDashoffset: [300, 300, 0, 0], // Çizgi çizilsin
        opacity: [0, 0.4, 0.4, 0],           // Ortaya çıkıp kaybolsun
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay: index * 0.25,
        times: [0, 0.15, 0.85, 1],
        ease: "easeInOut",
      }}
    />
  );
}

// ─── Output Card ──────────────────────────────────────────────────────────────

interface OutputCardProps {
  card: (typeof CARDS)[0];
  cardIndex: number;
}

function OutputCard({ card, cardIndex }: OutputCardProps) {
  return (
    <motion.div
      // Giriş animasyonu (sağdan gelme)
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        duration: 0.8,
        delay: 2.5 + cardIndex * 0.3, // İkonlar merkeze ulaştıktan sonra başlasın
        type: "spring",
        stiffness: 100,
      }}
      className="mb-3 overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800 shadow-xl backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
          style={{ backgroundColor: card.color }}
        >
          <span className="text-sm">✦</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{card.label}</p>
          <p className="text-xs text-slate-400">automated · running</p>
        </div>
        <div className="ml-auto flex gap-1">
          {/* Animasyonlu durum noktaları */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="h-1.5 w-4 rounded-full"
              style={{ backgroundColor: card.color }}
            />
          ))}
        </div>
      </div>
      {/* Alt taraftaki renkli bar */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${card.color}, ${card.color}11)`,
        }}
      />
    </motion.div>
  );
}

// ─── Hub (merkez) ─────────────────────────────────────────────────────────────

function Hub() {
  return (
    <div className="relative flex items-center justify-center z-10">
      {/* Parlama ve Pulse Efekti */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-36 w-36 rounded-full bg-blue-500/30 blur-3xl"
      />
      
      {/* Dış halka */}
      <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 shadow-2xl backdrop-blur-md">
        {/* İç halka */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-blue-500/50 bg-gradient-to-b from-blue-600 to-blue-900 shadow-inner"
        >
          {/* Merkez nokta */}
          <div className="h-6 w-6 rounded-full border-2 border-white/20 bg-white/10" />
        </motion.div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AutomationHero() {
  return (
    // Tüm sahneyi kaplayan Dark Arka Plan
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#050509]">
      {/* Hafif degrade arka plan */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#050509] to-black" />

      <div className="relative z-10 flex flex-col flex-1 h-full">
        {/* Nav (Dark Mode uyumlu) */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center justify-between px-10 py-6 border-b border-slate-800/50"
        >
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            <span className="text-2xl">⚙️</span> Autoflow
          </div>
          <div className="flex gap-8 text-sm text-slate-400">
            {["How it Works", "Use Cases", "Partners"].map((n) => (
              <span key={n} className="cursor-pointer hover:text-white transition-colors">
                {n}
              </span>
            ))}
          </div>
          <button className="rounded-full border border-slate-700 px-5 py-2 text-sm font-medium text-white hover:bg-white hover:text-black transition-colors">
            Book a Free Call
          </button>
        </motion.nav>

        {/* Hero text (Dark Mode uyumlu) */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mx-auto mt-16 max-w-2xl text-center"
        >
          <h1 className="font-['Georgia',serif] text-5xl font-bold leading-tight text-white">
            Turn Manual Tasks<br />
            <span className="text-blue-400">into Automations</span>
          </h1>
          <p className="mt-6 text-slate-400 text-lg">
            Automate documents, emails, approvals, and more, with<br />
            expert help and enterprise-grade AI integrations.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <button className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">
              Book a Free Discovery
            </button>
            <button className="rounded-full border border-slate-700 bg-slate-900/50 px-8 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
              Case Studies
            </button>
          </div>
        </motion.div>

        {/* ── Animasyon sahnesi ── */}
        {/* H-[400vh] ve Sticky kaldırıldı, normal bir bölge yapıldı */}
        <div className="relative mx-auto mt-16 flex w-full max-w-6xl flex-1 items-center justify-center min-h-[500px]">
          
          {/* Sol: icon grid + SVG trail lines */}
          <div className="absolute inset-0">
            {/* SVG trail çizgileri */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 800 600"
              preserveAspectRatio="xMidYMid meet"
            >
              {ICONS.map((icon, i) => (
                <Trail key={icon.id} index={i} />
              ))}
            </svg>

            {/* Icon'lar */}
            {ICONS.map((icon, i) => (
              <IconNode key={icon.id} icon={icon} index={i} />
            ))}
          </div>

          {/* Merkez Hub */}
          <Hub />

          {/* Sağ: output cards */}
          <div className="absolute right-0 top-1/2 w-72 -translate-y-1/2 translate-x-4 z-20">
            {CARDS.map((card, i) => (
              <OutputCard key={card.id} card={card} cardIndex={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}