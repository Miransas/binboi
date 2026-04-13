"use client";

import Link from "next/link";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { ArrowRight, Download, KeyRound, Zap, ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

// ─── Custom Primitives ────────────────────────────────────────────────────────

function AccentBadge({ children, color = "#9eff00" }: { children: ReactNode, color?: string }) {
  return (
    <div 
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest shadow-[0_0_10px_rgba(var(--badge-color),0.1)]"
      style={{ 
        borderColor: `${color}40`, 
        backgroundColor: `${color}10`,
        color: color 
      }}
    >
      <span 
        className="h-1.5 w-1.5 rounded-full animate-pulse" 
        style={{ 
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`
        }} 
      />
      {children}
    </div>
  );
}

// Simulated BorderBeam
function BorderBeam({ className, colorFrom, colorTo }: { className?: string, colorFrom?: string, colorTo?: string }) {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none rounded-2xl border ${className}`} 
      style={{
        borderImageSource: `linear-gradient(to right, ${colorFrom || 'transparent'}, ${colorTo || 'transparent'})`,
        borderColor: `${colorTo}30`
      }}
    />
  );
}

// ─── shared fade-up variant ───────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.55, 
      ease: [0.22, 1, 0.36, 1], 
      delay: i 
    },
  }),
};

// ─── How It Works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    icon: Download,
    title: "Install the CLI",
    description: "One command, no dependencies.",
    code: "npm install -g @binboi/cli",
    accent: "#00ffd1", // Cyan
    accentBg: "rgba(0,255,209,0.08)",
    accentBorder: "rgba(0,255,209,0.25)",
  },
  {
    num: "02",
    icon: KeyRound,
    title: "Authenticate",
    description: "Paste your access token from the dashboard.",
    code: "binboi login --token <your-token>",
    accent: "#38bdf8", // Electric Blue (Mor yerine teknik bir mavi)
    accentBg: "rgba(56,189,248,0.08)",
    accentBorder: "rgba(56,189,248,0.25)",
  },
  {
    num: "03",
    icon: Zap,
    title: "Expose your port",
    description: "A stable public URL appears instantly.",
    code: "binboi http 3000 my-app",
    accent: "#9eff00", // Neon Green
    accentBg: "rgba(158,255,0,0.08)",
    accentBorder: "rgba(158,255,0,0.25)",
  },
];

function StepConnector({ color }: { color: string }) {
  return (
    <div className="hidden items-center justify-center lg:flex" aria-hidden>
      <svg width="80" height="2" className="overflow-visible">
        <line x1="0" y1="1" x2="80" y2="1" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="5 5" />
        <motion.circle
          r="3"
          fill={color}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          animate={{ cx: [0, 80] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8 bg-black">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          custom={0}
          variants={fadeUp}
          className="mb-14 text-center"
        >
          <AccentBadge color="#00ffd1">How it works</AccentBadge>
          <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
            From install to live in 60 seconds.
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-mono text-xs leading-relaxed text-zinc-400 sm:text-sm">
            No port-forwarding. No firewall changes. Just a token and a command.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="contents">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  custom={i * 0.12}
                  variants={fadeUp}
                  className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-black/60 backdrop-blur-sm p-6 transition-all duration-500 group"
                  style={{ '--hover-color': step.accent } as React.CSSProperties}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = `${step.accent}50`}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(39, 39, 42, 0.8)'}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span
                      className="font-mono text-[10px] font-bold uppercase tracking-[0.28em]"
                      style={{ color: step.accent }}
                    >
                      Step {step.num}
                    </span>
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl border transition-colors duration-500"
                      style={{ background: step.accentBg, borderColor: step.accentBorder }}
                    >
                      <Icon className="h-5 w-5" style={{ color: step.accent }} />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white transition-colors duration-500" style={{ color: 'white' }}>{step.title}</h3>
                  <p className="mt-1.5 text-xs text-zinc-500 font-mono">{step.description}</p>

                  <div className="mt-5 overflow-x-auto rounded-xl border border-zinc-800/80 bg-[#050505] px-4 py-3 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                    <div className="mb-2 flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-700/60" />
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-700/60" />
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-700/60" />
                    </div>
                    <pre className="font-mono text-[11px] text-zinc-300 whitespace-pre-wrap break-all mt-3">
                      <span style={{ color: step.accent }} className="select-none">$ </span>
                      {step.code}
                    </pre>
                  </div>

                  <div
                    className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full blur-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                    style={{ background: step.accent, opacity: 0.15 }}
                  />
                </motion.div>

                {i < STEPS.length - 1 && (
                  <StepConnector key={`conn-${i}`} color={STEPS[i].accent} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────

const FAQS = [
  { q: "What is Binboi?", a: "Binboi is a self-hosted alternative to ngrok. It creates a secure tunnel from a public HTTPS URL to a port on your local machine." },
  { q: "Is it free to use?", a: "Yes. Binboi is open source and free to self-host. You bring your own server, your own domain, and pay nothing." },
  { q: "How secure is the tunnel?", a: "Traffic is TLS-terminated at the edge. Your server is the only machine that can read plaintext. Access tokens are stored as bcrypt hashes." },
  { q: "Can I use a custom domain?", a: "Yes. Point a wildcard DNS record (*.yourdomain.com) at your server and configure the edge router for wildcard TLS." },
  { q: "What happens if the tunnel drops?", a: "The CLI agent reconnects automatically with exponential backoff. The public URL stays reserved as long as the session is active." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-zinc-800/80 last:border-0 bg-black/20">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-6 py-5 px-6 text-left transition-colors hover:text-[#00ffd1]"
      >
        <span className="text-sm font-bold text-zinc-200">{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className={open ? "text-[#00ffd1]" : "text-zinc-500"}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden px-6"
          >
            <p className="pb-5 pt-1 font-mono text-[11px] leading-relaxed text-zinc-400">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqSection() {
  const statColors = ["#00ffd1", "#38bdf8", "#00ffd1", "#9eff00"];
  
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8 bg-black">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr]">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} custom={0} variants={fadeUp}>
            <AccentBadge color="#00ffd1">FAQ</AccentBadge>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Knowledge Base
            </h2>
            <p className="mt-4 font-mono text-xs leading-relaxed text-zinc-400 sm:text-sm">
              A self-hosted tunnel platform built for developers who want
              request visibility without a managed SaaS dependency.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                { value: "Open source", label: "MIT licensed" },
                { value: "Self-hosted", label: "Your infra only" },
                { value: "TLS always", label: "End-to-end encrypted" },
                { value: "Webhooks", label: "First-class support" },
              ].map((s, idx) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-zinc-800/80 bg-black/40 backdrop-blur-sm p-4 transition-colors duration-500"
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = `${statColors[idx]}60`}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(39, 39, 42, 0.8)'}
                >
                  <p className="font-mono text-sm font-bold text-white">{s.value}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            custom={0.1}
            variants={fadeUp}
            className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-black/60 backdrop-blur-md"
          >
            {FAQS.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Bottom CTA ───────────────────────────────────────────────────────────────

export function CtaSection() {
  return (
    <section className="relative overflow-hidden px-4 py-32 sm:px-6 lg:px-8 bg-black">
      <div className="pointer-events-none absolute inset-0">
        {/* Sadece Cyan ve Neon Yeşil Glow'lar */}
        <div className="absolute left-1/3 top-0 -translate-x-1/2 w-full max-w-[600px] h-[400px] bg-[#00ffd1]/10 blur-[120px] rounded-full" />
        <div className="absolute right-1/3 top-20 translate-x-1/4 w-full max-w-[500px] h-[300px] bg-[#9eff00]/10 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_30%,#000000_85%)]" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <AccentBadge color="#9eff00">Get started</AccentBadge>

          <h2 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Start tunneling
            <br />
            <span className="bg-gradient-to-r from-[#00ffd1] to-[#9eff00] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(158,255,0,0.2)]">
              in 60 seconds.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl font-mono text-sm leading-relaxed text-zinc-400">
            Deploy Binboi on your own server, create an access token, and expose your first
            local port—all before your coffee cools.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row font-mono uppercase tracking-widest text-xs">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-[#9eff00] px-8 py-4 font-bold text-black transition-all duration-300 hover:bg-[#b0ff33] hover:scale-105 shadow-[0_0_15px_rgba(158,255,0,0.15)] hover:shadow-[0_0_25px_rgba(158,255,0,0.4)]"
            >
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-black/50 backdrop-blur-sm px-8 py-4 font-bold text-zinc-300 transition-all duration-300 hover:border-[#00ffd1]/50 hover:text-[#00ffd1] hover:bg-[#00ffd1]/5"
            >
              Read the docs
            </Link>
          </div>

          <div className="mx-auto mt-12 max-w-sm overflow-hidden rounded-2xl border border-zinc-800 bg-[#050505] p-6 text-left shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.02)] relative group transition-colors hover:border-[#9eff00]/30">
            <div className="mb-4 flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full border border-zinc-700 bg-zinc-800" />
              <div className="h-2.5 w-2.5 rounded-full border border-zinc-700 bg-zinc-800" />
              <div className="h-2.5 w-2.5 rounded-full border border-zinc-700 bg-zinc-800" />
            </div>
            <div className="space-y-2.5 font-mono text-[11px]">
              <p className="flex items-center gap-2">
                <span className="text-[#00ffd1]">~</span>
                <span className="text-zinc-300">npm install -g @binboi/cli</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-[#00ffd1]">~</span>
                <span className="text-zinc-300">binboi login --token <span className="text-zinc-500">••••••••</span></span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-[#00ffd1]">~</span>
                <span className="text-[#00ffd1]">binboi http 3000 my-app</span>
              </p>
              <p className="mt-4 pt-3 border-t border-zinc-800 text-[#9eff00] drop-shadow-[0_0_5px_rgba(158,255,0,0.5)] flex items-center gap-2">
                <span className="animate-pulse">✓</span> Tunnel live → https://my-app.binboi.com
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}