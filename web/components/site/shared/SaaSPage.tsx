"use client";

import { motion, useAnimationFrame } from "framer-motion";
import { useRef, useState } from "react";

// ─── Background Ambient Orb ───────────────────────────────────────────────────
function PurpleOrb({ className }: { className: string }) {
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full blur-[100px] ${className}`}
      animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.65, 0.35] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// ─── Card 1: Inbound Lead ─────────────────────────────────────────────────────
function Card1Visual() {
  return (
    <div className="relative flex h-40 items-center justify-center">
      <div className="absolute bottom-2 left-1/2 h-16 w-36 -translate-x-1/2 rounded-full bg-purple-600/50 blur-2xl" />
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-purple-500/25"
          style={{ width: 170 + i * 44, height: 38 + i * 10 }}
          animate={{ scaleX: [1, 1.07, 1], opacity: [0.12, 0.5, 0.12] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.7 }}
        />
      ))}
      <div className="absolute h-8 w-32 rounded-full bg-purple-500/45 blur-xl" />
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 flex items-center gap-2 rounded-full border border-purple-400/35 bg-[#140e2e]/90 px-5 py-2 text-sm font-medium text-purple-200"
        style={{ boxShadow: "0 0 28px rgba(140,70,255,0.55), inset 0 0 12px rgba(120,60,220,0.15)" }}
      >
        <motion.span
          className="h-2 w-2 rounded-full bg-purple-400"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          style={{ boxShadow: "0 0 6px rgba(180,120,255,0.9)" }}
        />
        Inbound Lead
      </motion.div>
    </div>
  );
}

// ─── Card 2: Conversions ──────────────────────────────────────────────────────
function Card2Visual() {
  return (
    <div className="relative flex h-40 items-center justify-center">
      <div className="absolute h-28 w-28 rounded-full bg-purple-700/55 blur-3xl" />

      {/* Outer spin ring */}
      <motion.div
        className="absolute h-36 w-36 rounded-full border border-purple-500/20"
        style={{ borderTopColor: "transparent", borderRightColor: "transparent" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
      />

      {/* Orbiting bright dot */}
      <motion.div
        className="absolute"
        animate={{ rotate: 360 }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        style={{ width: 144, height: 144 }}
      >
        <div
          className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-purple-300"
          style={{ boxShadow: "0 0 12px rgba(210,170,255,1), 0 0 24px rgba(160,100,255,0.6)" }}
        />
      </motion.div>

      {/* Inner slow ring */}
      <motion.div
        className="absolute h-24 w-24 rounded-full border border-purple-700/30"
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />

      {/* Core orb */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-2 border-purple-900 bg-gradient-to-b from-[#1e1040] to-[#0d0820]"
        style={{ boxShadow: "0 0 50px rgba(110,50,220,0.6), inset 0 0 24px rgba(90,40,180,0.35)" }}
      >
        <motion.div
          className="h-3 w-3 rounded-full bg-white"
          animate={{ opacity: [1, 0.15, 1], scale: [1, 1.4, 1] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          style={{ boxShadow: "0 0 10px #fff, 0 0 20px rgba(210,180,255,0.9)" }}
        />
      </motion.div>

      <div className="absolute bottom-5 right-8 flex gap-1.5">
        {[1, 0.55, 0.22].map((o, i) => (
          <div key={i} className="h-1.5 w-1.5 rounded-full bg-purple-400" style={{ opacity: o }} />
        ))}
      </div>
    </div>
  );
}

// ─── Card 3: Intelligence / Live Chart ───────────────────────────────────────
function Card3Visual() {
  const [tick, setTick] = useState(0);
  const startRef = useRef<number | null>(null);

  useAnimationFrame((t) => {
    if (startRef.current === null) startRef.current = t;
    setTick(((t - startRef.current) / 5000) % 1);
  });

  const basePts: [number, number][] = [
    [0, 70], [28, 62], [52, 50], [72, 56],
    [94, 36], [114, 42], [134, 20], [155, 26],
    [175, 11], [200, 16], [220, 8],
  ];

  const drawn = Math.max(2, Math.round(tick * basePts.length));
  const pts = basePts.slice(0, drawn);
  const poly = pts.map((p) => p.join(",")).join(" ");
  const tip = pts[pts.length - 1] ?? [0, 70];

  return (
    <div className="relative h-40 overflow-hidden">
      <div className="pointer-events-none absolute bottom-0 left-4 right-4 h-10 rounded-full bg-purple-700/25 blur-xl" />
      <svg viewBox="0 0 220 80" className="absolute inset-x-0 top-6 h-full w-full">
        <defs>
          <linearGradient id="lgLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4020a0" />
            <stop offset="100%" stopColor="#d090ff" />
          </linearGradient>
          <filter id="lineGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* dashed grid */}
          {[20, 40, 60].map((y) => (
            <line key={y} x1="0" y1={y} x2="220" y2={y} stroke="#4a2880" strokeWidth="0.4" strokeDasharray="3 7" />
          ))}
        </defs>
        <polyline
          points={poly}
          fill="none"
          stroke="url(#lgLine)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#lineGlow)"
        />
        {drawn >= 3 && (
          <>
            <circle cx={tip[0]} cy={tip[1]} r="7" fill="rgba(190,130,255,0.15)" />
            <circle cx={tip[0]} cy={tip[1]} r="4" fill="rgba(210,160,255,0.3)" />
            <circle cx={tip[0]} cy={tip[1]} r="2.5" fill="#d090ff" filter="url(#lineGlow)" />
          </>
        )}
      </svg>
    </div>
  );
}

// ─── Card 4: Content Calendar ─────────────────────────────────────────────────
function Card4Visual() {
  const rows = [
    { label: "How we str…",  time: "10:30 AM", color: "#9060d0", bg: "rgba(90,50,150,0.38)" },
    { label: "Quantum Al…",  time: "14:00 PM", color: "#7040b8", bg: "rgba(60,30,110,0.32)" },
    { label: "Growth Rev…",  time: "16:00 PM", color: "#a070e0", bg: "rgba(100,60,160,0.28)" },
  ];

  return (
    <div className="relative mt-2">
      <div className="pointer-events-none absolute -right-3 -top-3 h-20 w-20 rounded-full bg-purple-600/30 blur-2xl" />
      <div
        className="overflow-hidden rounded-xl border border-[#251d40]/70 bg-[#0b091a]/90"
        style={{ boxShadow: "0 0 30px rgba(80,40,160,0.18)" }}
      >
        <div className="grid grid-cols-4 border-b border-[#1e1835]/70">
          {["Mon", "Tue", "Wed", "Thu"].map((d) => (
            <div key={d} className="border-r border-[#1a1530]/60 py-2 text-center text-[10px] text-[#3a3060] last:border-r-0">{d}</div>
          ))}
        </div>
        <div className="space-y-1.5 p-3">
          {rows.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.14, duration: 0.45 }}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2"
              style={{ background: r.bg }}
            >
              <motion.div
                className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                style={{ background: r.color, boxShadow: `0 0 7px ${r.color}` }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.6 }}
              />
              <span className="flex-1 text-[10px] text-[#9080c0]">{r.label}</span>
              <span className="text-[9px] text-[#4a3878]">{r.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Card 5: Retention Funnel ─────────────────────────────────────────────────
function Card5Visual() {
  const stages = [
    { w: 150, label: "Acquire",  color: "rgba(130,70,230,0.80)" },
    { w: 112, label: "Activate", color: "rgba(105,50,205,0.72)" },
    { w: 80,  label: "Retain",   color: "rgba(85,40,175,0.65)" },
    { w: 52,  label: "Expand",   color: "rgba(65,30,145,0.58)" },
  ];

  return (
    <div className="relative flex h-40 flex-col items-center justify-center gap-1">
      {/* Top beam */}
      <motion.div
        className="absolute top-0 left-1/2 h-10 w-16 -translate-x-1/2 rounded-full bg-purple-400/60 blur-xl"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {stages.map((s, i) => (
        <motion.div
          key={i}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.08 + i * 0.13, duration: 0.5, ease: "easeOut" }}
          className="relative flex items-center justify-center rounded-[3px] text-[9px] text-purple-300/60"
          style={{
            width: s.w,
            height: 24,
            background: s.color,
            boxShadow: i === 0 ? "0 0 24px rgba(160,80,255,0.6), inset 0 0 10px rgba(200,140,255,0.15)" : undefined,
          }}
        >
          {i === 0 && (
            <motion.div
              className="absolute inset-0 rounded-[3px]"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ boxShadow: "0 0 20px rgba(170,100,255,0.7)" }}
            />
          )}
          <span className="relative z-10">{s.label}</span>
        </motion.div>
      ))}

      {/* Bottom exit beam */}
      <motion.div
        className="h-5 w-4 rounded-full bg-purple-500/50 blur-md"
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      />
    </div>
  );
}

// ─── Card Wrapper ─────────────────────────────────────────────────────────────
function Card({
  num, title, children, className = "",
}: {
  num: string; title: string; children: React.ReactNode; className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden:   { opacity: 0, y: 28 },
        visible:  { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
      }}
      whileHover={{
        y: -4,
        borderColor: "rgba(140,70,255,0.55)",
        boxShadow: "0 0 50px rgba(100,40,210,0.22), inset 0 0 24px rgba(80,30,160,0.08)",
      }}
      transition={{ duration: 0.22 }}
      className={`relative overflow-hidden rounded-2xl border border-[#1c1730] bg-[#09081a] p-6 ${className}`}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-900/25 blur-2xl" />
      <span className="mb-1 block text-[10px] tracking-widest text-[#2a2245]">{num}</span>
      {children}
      <p
        className="mt-4 text-[15px] font-semibold leading-snug text-[#ccc0ee]"
        style={{ fontFamily: "'Syne', sans-serif" }}
        dangerouslySetInnerHTML={{ __html: title }}
      />
    </motion.div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function BentoGrid() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#05040e] px-6 py-20 md:px-14 lg:px-24">
      {/* Ambient background glows */}
      <PurpleOrb className="h-[400px] w-[400px] bg-purple-900/35 -top-32 -left-32" />
      <PurpleOrb className="h-[500px] w-[500px] bg-purple-800/20 top-1/2 -right-48 -translate-y-1/2" />
      <PurpleOrb className="h-[300px] w-[300px] bg-violet-900/25 bottom-0 left-1/3" />

      {/* Grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "120px",
        }}
      />

      {/* Label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative mb-6 flex items-center gap-2.5"
      >
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-purple-400"
          animate={{ opacity: [1, 0.2, 1], scale: [1, 1.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ boxShadow: "0 0 8px rgba(180,110,255,0.9)" }}
        />
        <span className="text-xs uppercase tracking-[0.18em] text-purple-500/70">Capability</span>
      </motion.div>

      {/* Header row */}
      <div className="relative mb-14 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.05 }}
          className="text-4xl font-bold leading-[1.1] text-[#ede6ff] md:max-w-sm md:text-5xl"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          What Binboi<br />Unlocks Fast
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.15 }}
          className="max-w-[200px] text-right text-[13px] leading-relaxed text-[#3d3560] md:pt-2"
        >
          Not growth hacks. Not fluff.<br />
          Just ingress, visibility, and safer sharing.
        </motion.p>
      </div>

      {/* Cards */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }}
        className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <Card num="· 01" title="Fast Public<br/>URLs">
          <Card1Visual />
        </Card>

        <Card num="· 02" title="Request<br/>Visibility">
          <Card2Visual />
        </Card>

        <Card num="· 03" title="Traffic Clarity<br/>Before Guesswork">
          <Card3Visual />
        </Card>

        <Card num="· 04" title="Webhook Flows<br/>That Stay Legible" className="sm:col-span-2 lg:col-span-2">
          <Card4Visual />
        </Card>

        <Card num="· 05" title="Access Control<br/>That Scales">
          <Card5Visual />
        </Card>
      </motion.div>
    </section>
  );
}