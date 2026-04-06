"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// ─── Data ─────────────────────────────────────────────────────────────────────

const ICONS = [
  { emoji: "💬", label: "Slack" },
  { emoji: "✉️",  label: "Gmail" },
  { emoji: "▶️",  label: "YouTube" },
  { emoji: "📊", label: "Sheets" },
  { emoji: "💼", label: "LinkedIn" },
  { emoji: "☁️",  label: "Drive" },
  { emoji: "🎨", label: "Figma" },
  { emoji: "📝", label: "Notion" },
];

// İkonların sol taraftaki pozisyonları (X, Y yüzdelik değerleri)
const POSITIONS: [number, number][] = [
  [12, 18], [28, 12], [16, 38],
  [32, 34], [10, 62], [26, 58],
  [15, 85], [30, 82],
];

// Kartların sağ taraftaki Y ekseni pozisyonları (X her zaman %75)
const CARD_POSITIONS = [25, 50, 75];

const FLOAT_VARIANTS = ["A", "B", "C", "A", "B", "C", "A", "B"];
const FLOAT_DURS     = [3.2, 2.8, 3.6, 3.0, 2.6, 3.4, 2.9, 3.1];
const FLOAT_DELAYS   = [0.0, 0.4, 0.8, 1.2, 0.2, 0.6, 1.0, 1.4];

const CARDS = [
  { id: "c1", label: "Personalized Outreach", sub: "automated · running", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)", emoji: "💙" },
  { id: "c2", label: "Strategy Content",      sub: "automated · running", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.15)", emoji: "💜" },
  { id: "c3", label: "Auto Reporting",        sub: "automated · running", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", emoji: "💚" },
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

// ─── Particle System ──────────────────────────────────────────────────────────

function useParticles(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  stageRef: React.RefObject<HTMLDivElement>
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    
    // Canvas boyutunu kapsayıcıya uydur
    canvas.width = stage.offsetWidth;
    canvas.height = stage.offsetHeight;
    
    const ctx = canvas.getContext("2d")!;
    const ps: { x: number; y: number; vx: number; vy: number; life: number; size: number; color: string }[] = [];
    let last = 0, raf: number;

    const tick = (ts: number) => {
      if (ts - last > 120) { // Parçacık üretme hızı
        const a = Math.random() * Math.PI * 2;
        const s = 0.5 + Math.random() * 1.5;
        // Merkezden dışa doğru
        ps.push({
          x: stage.offsetWidth / 2,
          y: stage.offsetHeight / 2,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          life: 1,
          size: 2 + Math.random() * 2,
          color: Math.random() > 0.5 ? "#60a5fa" : "#a78bfa" // Mavi ve mor tonları
        });
        last = ts;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.012; // Yaşam süresi
        if (p.life <= 0) { ps.splice(i, 1); continue; }
        ctx.globalAlpha = p.life * 0.8;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [canvasRef, stageRef]);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnimatedHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useParticles(canvasRef, stageRef);

  useEffect(() => {
    if (document.getElementById("__autoflow-kf")) return;
    const s = document.createElement("style");
    s.id = "__autoflow-kf";
    s.textContent = KEYFRAMES;
    document.head.appendChild(s);
  }, []);

  return (
    <section className="relative flex w-full items-center justify-center bg-[#030712] py-20 min-h-screen">
      <div 
        ref={stageRef} 
        className="relative h-[550px] w-full max-w-6xl rounded-3xl border border-slate-800/60 bg-slate-950/50 shadow-2xl overflow-hidden"
      >
        
        {/* Arkadaki Hafif Glow Efekti */}
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

        {/* ─── SVG Bağlantı Çizgileri (Veri Akışı) ─── */}
        <svg className="absolute inset-0 h-full w-full pointer-events-none z-[1]">
          {/* İkonlardan Merkeze Akan Çizgiler */}
          {ICONS.map((_, i) => (
            <motion.line
              key={`in-${i}`}
              x1={`${POSITIONS[i][0]}%`}
              y1={`${POSITIONS[i][1]}%`}
              x2="50%"
              y2="50%"
              stroke="#334155"
              strokeWidth="2"
              strokeDasharray="8 8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6, strokeDashoffset: [-24, 0] }} // İçeri doğru akış
              transition={{
                opacity: { delay: 0.5 + i * 0.1, duration: 1 },
                strokeDashoffset: { repeat: Infinity, duration: 1.5, ease: "linear" }
              }}
            />
          ))}

          {/* Merkezden Kartlara Akan Çizgiler */}
          {CARDS.map((_, i) => (
            <motion.line
              key={`out-${i}`}
              x1="50%"
              y1="50%"
              x2="75%"
              y2={`${CARD_POSITIONS[i]}%`}
              stroke="#475569"
              strokeWidth="2"
              strokeDasharray="8 8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8, strokeDashoffset: [24, 0] }} // Dışarı doğru akış
              transition={{
                opacity: { delay: 1.5 + i * 0.2, duration: 1 },
                strokeDashoffset: { repeat: Infinity, duration: 1.2, ease: "linear" }
              }}
            />
          ))}
        </svg>

        {/* ─── Sol Taraf: İkonlar ─── */}
        {ICONS.map((icon, i) => (
          <motion.div
            key={i}
            className="absolute flex flex-col items-center gap-2 z-[6]"
            style={{ 
              left: `${POSITIONS[i][0]}%`, 
              top: `${POSITIONS[i][1]}%`,
              transform: 'translate(-50%, -50%)' // Tam merkezden hizalama
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * i, duration: 0.6, type: "spring", bounce: 0.4 }}
          >
            <div
              className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 shadow-lg backdrop-blur-md"
              style={{
                width: 52, height: 52, fontSize: 24,
                animation: `float${FLOAT_VARIANTS[i]} ${FLOAT_DURS[i]}s ${FLOAT_DELAYS[i]}s ease-in-out infinite`,
              }}
            >
              {icon.emoji}
            </div>
            <span className="rounded-md bg-slate-900/60 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-800">
              {icon.label}
            </span>
          </motion.div>
        ))}

        {/* ─── Merkez: Hub ─── */}
        <div
          className="absolute left-1/2 top-1/2 z-[5] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
          style={{
            width: 110, height: 110,
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            border: "2px solid #3b82f6",
            animation: "hubPulse 3s ease-in-out infinite",
          }}
        >
          {/* Dönen İç Halka */}
          <div
            className="flex items-center justify-center rounded-full shadow-inner"
            style={{
              width: 70, height: 70,
              background: "linear-gradient(135deg, #2563eb, #4f46e5)",
              border: "1px solid #60a5fa",
              animation: "hubSpin 8s linear infinite",
            }}
          >
            {/* Merkez Nokta */}
            <div style={{ width: 24, height: 24, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.2)" }} />
          </div>
        </div>

        {/* ─── Parçacık Efektleri ─── */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[4]" />

        {/* ─── Sağ Taraf: Çıktı Kartları ─── */}
        {CARDS.map((card, i) => (
          <motion.div
            key={card.id}
            className="absolute z-[8] w-64 overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-2xl backdrop-blur-xl"
            style={{ 
              left: "75%", 
              top: `${CARD_POSITIONS[i]}%`,
              transform: 'translateY(-50%)' // Dikeyde tam ortalama
            }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 + i * 0.2, duration: 0.6, type: "spring", bounce: 0.3 }}
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
                {/* Kart içi ses/aktivite barları */}
                {[...Array(3)].map((_, j) => (
                  <motion.div
                    key={j}
                    animate={{ height: [6, 14, 6] }}
                    transition={{ repeat: Infinity, duration: 1, delay: j * 0.2 }}
                    className="w-1.5 rounded-full"
                    style={{ background: card.color, opacity: 0.8 }}
                  />
                ))}
              </div>
            </div>
            {/* Alt İşlem Çubuğu */}
            <div className="relative h-1 w-full bg-slate-800">
              <motion.div 
                className="absolute left-0 top-0 h-full"
                style={{ background: card.color }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ repeat: Infinity, duration: 3 + i, ease: "linear" }}
              />
            </div>
          </motion.div>
        ))}
        
      </div>
    </section>
  );
}