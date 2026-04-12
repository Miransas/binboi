/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";

// ─── Data ─────────────────────────────────────────────────────────────────────
// Updated colors to glow in dark mode.

const ICONS = [
  { id: "slack", emoji: "💬", label: "Slack", color: "#8B5CF6" }, // Purple
  { id: "gmail", emoji: "✉️", label: "Gmail", color: "#EF4444" }, // Red
  { id: "youtube", emoji: "▶️", label: "YouTube", color: "#F87171" }, // Lighter Red
  { id: "sheets", emoji: "📊", label: "Google Sheets", color: "#10B981" }, // Green
  { id: "linkedin", emoji: "💼", label: "LinkedIn", color: "#3B82F6" }, // Blue
  { id: "drive", emoji: "☁️", label: "Google Drive", color: "#60A5FA" }, // Lighter Blue
  { id: "figma", emoji: "🎨", label: "Figma", color: "#F97316" }, // Orange
  { id: "notion", emoji: "📝", label: "Notion", color: "#FFFFFF" }, // White Notion icon in dark mode
];

// Icon percentage (%) coordinates
const POSITIONS: [number, number][] = [
  [12, 18], [28, 12], [16, 38],
  [32, 34], [10, 62], [26, 58],
  [15, 85], [30, 82],
];

// Card percentage (%) coordinates
const CARD_POSITIONS = [25, 50, 75];

const FLOAT_VARIANTS = ["A", "B", "C", "A", "B", "C", "A", "B"];
const FLOAT_DURS = [3.2, 2.8, 3.6, 3.0, 2.6, 3.4, 2.9, 3.1];
const FLOAT_DELAYS = [0.0, 0.4, 0.8, 1.2, 0.2, 0.6, 1.0, 1.4];

const CARDS = [
  { id: "c1", label: "Personalized Outreach", sub: "automated · running", color: "#3B82F6", triggerAt: 0.45, bg: "rgba(59, 130, 246, 0.15)", emoji: "💙" },
  { id: "c2", label: "Strategy Content", sub: "automated · running", color: "#8B5CF6", triggerAt: 0.62, bg: "rgba(139, 92, 246, 0.15)", emoji: "💜" },
  { id: "c3", label: "Auto Reporting", sub: "automated · running", color: "#10B981", triggerAt: 0.78, bg: "rgba(16, 185, 129, 0.15)", emoji: "💚" },
];

const KEYFRAMES = `
@keyframes floatA { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-8px) scale(1.02); } }
@keyframes floatB { 0%, 100% { transform: translateY(-4px) scale(1); } 50% { transform: translateY(6px) scale(1.02); } }
@keyframes floatC { 0%, 100% { transform: translateY(-2px) scale(1); } 50% { transform: translateY(7px) scale(1.02); } }
@keyframes hubSpin { to { transform: rotate(360deg); } }
@keyframes hubPulse {
  0%, 100% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.3), 0 0 0 0 rgba(59, 130, 246, 0.1); }
  50%      { box-shadow: 0 0 50px rgba(59, 130, 246, 0.6), 0 0 0 15px rgba(59, 130, 246, 0.05); }
}
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useSmoothProgress(raw: MotionValue<number>) {
  return useSpring(raw, { stiffness: 60, damping: 20 });
}

// ─── Trail (Icon Entry) ─────────────────────────────────────────────────────────

function Trail({ index, progress, color }: { index: number; progress: MotionValue<number>; color: string }) {
  // SVG coordinates (center = 400,300)
  const x1 = (POSITIONS[index][0] / 100) * 800;
  const y1 = (POSITIONS[index][1] / 100) * 600;
  const x2 = 400; // Hub center
  const y2 = 300;

  // Make line animation a continuous flow
  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color}
      strokeWidth="2"
      strokeDasharray="10 10" // Dashed pattern
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6, strokeDashoffset: [-20, 0] }} // Continuous flow
      transition={{
        opacity: { delay: 0.5 + index * 0.1, duration: 1 },
        strokeDashoffset: { repeat: Infinity, duration: 1.5, ease: "linear" }
      }}
    />
  );
}

// ─── CardTrail (Card Exit) ────────────────────────────────────

function CardTrail({ index, progress, color }: { index: number; progress: MotionValue<number>; color: string }) {
  // SVG coordinates (center = 400,300, Cards = ~600,Y)
  const x1 = 400; // Hub center
  const y1 = 300;
  const x2 = 600; // Left edge of cards
  const y2 = (CARD_POSITIONS[index] / 100) * 600;

  // Timing: start after icon trails finish, fully visible at card trigger point
  const triggerAt = CARDS[index].triggerAt;
  const opacity = useTransform(progress, [0.4, triggerAt], [0, 0.8]);

  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color}
      strokeWidth="2"
      strokeDasharray="10 10" // Dashed pattern
      initial={{ opacity: 0 }}
      style={{ opacity } as unknown as React.CSSProperties}
      animate={{ strokeDashoffset: [20, 0] }} // Continuous outward flow
      transition={{
        strokeDashoffset: { repeat: Infinity, duration: 1.2, ease: "linear" }
      }}
    />
  );
}

// ─── IconNode ────────────────────────────────────────────────────────────────

interface IconNodeProps {
  icon: (typeof ICONS)[0];
  index: number;
}

function IconNode({ icon, index }: IconNodeProps) {
  // Convert percentage (%) coordinates to SVG integer coordinates
  const x = (POSITIONS[index][0] / 100) * 800;
  const y = (POSITIONS[index][1] / 100) * 600;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 * index, duration: 0.6, type: "spring", bounce: 0.4 }}
      className="absolute flex flex-col items-center gap-2 z-[6]"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)' // Centered alignment
      }}
    >
      <div
        className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 shadow-lg backdrop-blur-md"
        style={{
          width: 52, height: 52, fontSize: 24,
          animation: `float${FLOAT_VARIANTS[index]} ${FLOAT_DURS[index]}s ${FLOAT_DELAYS[index]}s ease-in-out infinite`,
        }}
      >
        {icon.emoji}
      </div>
      <p className="rounded-md bg-slate-900/60 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-800">
        {icon.label}
      </p>
    </motion.div>
  );
}

// ─── OutputCard ──────────────────────────────────────────────────────────────

interface OutputCardProps {
  card: (typeof CARDS)[0];
  cardIndex: number;
  progress: MotionValue<number>;
}

function OutputCard({ card, cardIndex, progress }: OutputCardProps) {
  const { triggerAt } = card;
  // Card visibility and position driven by scroll progress
  const x = useTransform(progress, [triggerAt, triggerAt + 0.12], [40, 0]);
  const opacity = useTransform(progress, [triggerAt, triggerAt + 0.1], [0, 1]);

  return (
    <motion.div
      // Combined into a single style object
      style={{
        x,
        opacity,
        left: "75%",
        top: `${CARD_POSITIONS[cardIndex]}%`,
        transform: 'translateY(-50%)'
      } as any}
      className="absolute z-[8] w-72 overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg" style={{ background: card.bg }}>
          {card.emoji}
        </div>
        <div>
          <p className="text-[13px] font-bold text-white">{card.label}</p>
          <p className="text-[10px] text-slate-400">{card.sub}</p>
        </div>
        <div className="ml-auto flex items-end gap-1">
          {/* Animated status dots */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ height: [6, 14, 6] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              className="w-1.5 rounded-full"
              style={{ background: card.color, opacity: 0.8 }}
            />
          ))}
        </div>
      </div>
      {/* Alt taraftaki renkli bar */}
      <div className="relative h-1 w-full bg-slate-800">
        <motion.div
          className="absolute left-0 top-0 h-full"
          style={{ background: card.color }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ repeat: Infinity, duration: 3 + cardIndex, ease: "linear" }}
        />
      </div>
    </motion.div>

  );
}

// ─── Hub (center) ─────────────────────────────────────────────────────────────

function Hub({ progress }: { progress: MotionValue<number> }) {
  // Hub glow driven by scroll progress
  const glowOpacity = useTransform(progress, [0.3, 0.45], [0, 1]);

  return (
    <div className="absolute left-1/2 top-1/2 z-[5] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full">
      {/* Glow and Pulse Effect */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ opacity: glowOpacity } as unknown as React.CSSProperties}
        className="absolute h-36 w-36 rounded-full bg-blue-500/30 blur-3xl"
      />

      {/* Outer ring */}
      <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 shadow-2xl backdrop-blur-md">
        {/* Inner ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-blue-500/50 bg-gradient-to-b from-blue-600 to-blue-900 shadow-inner"
        >
          {/* Center point */}
          <div className="h-6 w-6 rounded-full border-2 border-white/20 bg-white/10" />
        </motion.div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AutomationHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const progress = useSmoothProgress(scrollYProgress);

  // Preserve useParticles and other useEffects (canvasRef, stageRef required)
  // useParticles(canvasRef, stageRef);

  useEffect(() => {
    if (document.getElementById("__autoflow-kf")) return;
    const s = document.createElement("style");
    s.id = "__autoflow-kf";
    s.textContent = KEYFRAMES;
    document.head.appendChild(s);
  }, []);

  return (
    // Dark background covering the full scene
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#0A0A0A]">
      {/* Hafif degrade arka plan */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0A0A0A] to-black" />

      <div className="relative z-10 flex flex-col flex-1 h-full">



        {/* ── Animation scene ── */}
        {/* H-[400vh] and Sticky removed, normal section */}
        <div ref={sectionRef} className="relative mx-auto mt-16 flex w-full max-w-6xl flex-1 items-center justify-center min-h-[500px]">

          {/* Left: icon grid + SVG trail lines */}
          <div className="absolute inset-0">
            {/* SVG trail lines (viewBox 800x600) */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 800 600"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Input Trails (Icons to Hub) */}
              {ICONS.map((icon, i) => (
                <Trail key={`in-${icon.id}`} index={i} progress={progress} color={icon.color} />
              ))}

              {/* Output Trails (Hub to Cards) */}
              {CARDS.map((card, i) => (
                <CardTrail key={`out-${card.id}`} index={i} progress={progress} color={card.color} />
              ))}
            </svg>

            {/* Icons */}
            {ICONS.map((icon, i) => (
              <IconNode key={icon.id} icon={icon} index={i} />
            ))}
          </div>

          {/* Center Hub */}
          <Hub progress={progress} />

          {/* Right: output cards */}
          <div className="relative w-full h-full">
            {CARDS.map((card, i) => (
              <OutputCard key={card.id} card={card} cardIndex={i} progress={progress} />
            ))}
          </div>

          {/* Particles (optional) */}
          {/* <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[4]" /> */}
        </div>
      </div>
    </div>
  );
}