"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Download, KeyRound, Zap, ChevronDown } from "lucide-react";
import { useState } from "react";

import { BorderBeam } from "@/components/ui/border-beam";
import { AccentBadge } from "./landing-primitives";
import LaserFlow from "./laser-flow";

// ─── shared fade-up variant ───────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.55, 
      ease: [0.22, 1, 0.36, 1], 
      delay: i // custom prop'tan gelen değer
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
    accent: "#00ffd1",
    accentBg: "rgba(0,255,209,0.06)",
    accentBorder: "rgba(0,255,209,0.18)",
  },
  {
    num: "02",
    icon: KeyRound,
    title: "Authenticate",
    description: "Paste your access token from the dashboard.",
    code: "binboi login --token <your-token>",
    accent: "#ff00ff",
    accentBg: "rgba(255,0,255,0.06)",
    accentBorder: "rgba(255,0,255,0.18)",
  },
  {
    num: "03",
    icon: Zap,
    title: "Expose your port",
    description: "A stable public URL appears instantly.",
    code: "binboi http 3000 my-app",
    accent: "#86a9ff",
    accentBg: "rgba(134,169,255,0.06)",
    accentBorder: "rgba(134,169,255,0.18)",
  },
];

function StepConnector({ color }: { color: string }) {
  return (
    <div className="hidden items-center justify-center lg:flex" aria-hidden>
      <svg width="80" height="2" className="overflow-visible">
        {/* track */}
        <line x1="0" y1="1" x2="80" y2="1" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="5 5" />
        {/* animated dot */}
        <motion.circle
          r="3"
          fill={color}
          style={{ filter: `drop-shadow(0 0 5px ${color})` }}
          animate={{ cx: [0, 80] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* heading */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          custom={0}
          variants={fadeUp}
          className="mb-14 text-center"
        >
          <AccentBadge accent="cyan">How it works</AccentBadge>
          <h2 className="mt-5 text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">
            From install to live in 60 seconds.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
            No port-forwarding. No firewall changes. Just a token and a command.
          </p>
        </motion.div>

        {/* steps */}
        <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <>
                <motion.div
                  key={step.num}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  custom={i * 0.12}
                  variants={fadeUp}
                  className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07080c] p-6"
                >
                  <BorderBeam
                    size={180}
                    duration={6 + i}
                    delay={i * 1.2}
                    borderWidth={1}
                    colorFrom="transparent"
                    colorTo={step.accent}
                  />

                  {/* step number + icon */}
                  <div className="mb-5 flex items-center justify-between">
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.28em]"
                      style={{ color: step.accent }}
                    >
                      Step {step.num}
                    </span>
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl border"
                      style={{ background: step.accentBg, borderColor: step.accentBorder }}
                    >
                      <Icon className="h-5 w-5" style={{ color: step.accent }} />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-zinc-500">{step.description}</p>

                  {/* code block */}
                  <div className="mt-5 overflow-x-auto rounded-xl border border-white/[0.06] bg-black/60 px-4 py-3">
                    <div className="mb-2 flex gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-rose-500/60" />
                      <div className="h-2 w-2 rounded-full bg-amber-400/60" />
                      <div className="h-2 w-2 rounded-full bg-emerald-500/60" />
                    </div>
                    <pre className="font-mono text-xs text-zinc-300 whitespace-pre-wrap break-all">
                      <span className="text-zinc-600 select-none">$ </span>
                      {step.code}
                    </pre>
                  </div>

                  {/* ambient glow */}
                  <div
                    className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl"
                    style={{ background: step.accent, opacity: 0.06 }}
                  />
                </motion.div>

                {/* connector between steps */}
                {i < STEPS.length - 1 && (
                  <StepConnector key={`conn-${i}`} color={step.accent} />
                )}
              </>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "What is Binboi?",
    a: "Binboi is a self-hosted alternative to ngrok. It creates a secure tunnel from a public HTTPS URL to a port on your local machine—giving providers like Stripe, GitHub, and Clerk a stable endpoint to call, even during local development.",
  },
  {
    q: "Is it free to use?",
    a: "Yes. Binboi is open source and free to self-host. You bring your own server, your own domain, and pay nothing to Miransas. A managed cloud option may follow later.",
  },
  {
    q: "How secure is the tunnel?",
    a: "Traffic is TLS-terminated at the Caddy edge. Your server is the only machine that can read plaintext—Miransas never sees your data. Access tokens are stored as bcrypt hashes and scoped per machine.",
  },
  {
    q: "Can I use a custom domain?",
    a: "Yes. Point a wildcard DNS record (*.yourdomain.com) at your server and configure Caddy with DNS-01 for wildcard TLS. Every tunnel then gets a subdomain like my-app.yourdomain.com.",
  },
  {
    q: "What happens if the tunnel drops?",
    a: "The CLI agent reconnects automatically with exponential backoff. The public URL stays reserved as long as the session is associated with your token—no manual re-registration needed.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.07] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors hover:text-white"
      >
        <span className="text-base font-medium text-zinc-200">{q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="shrink-0 text-zinc-500"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <p className="pb-5 text-sm leading-7 text-zinc-400">{a}</p>
      </motion.div>
    </div>
  );
}

export function FaqSection() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr]">
          {/* left: heading */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            custom={0}
            variants={fadeUp}
          >
            <AccentBadge accent="violet">FAQ</AccentBadge>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">
              What is Binboi?
            </h2>
            <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
              A self-hosted tunnel platform built for developers who want
              request visibility without a managed SaaS dependency.
            </p>

            {/* quick stats */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { value: "Open source", label: "MIT licensed" },
                { value: "Self-hosted", label: "Your infra only" },
                { value: "TLS always", label: "End-to-end encrypted" },
                { value: "Webhooks", label: "First-class support" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
                >
                  <p className="text-base font-bold text-white">{s.value}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* right: accordion */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            custom={0.1}
            variants={fadeUp}
            className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07080c] px-7"
          >
            <BorderBeam size={280} duration={10} borderWidth={1} className="from-transparent via-violet-400 to-transparent" />
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
    <section className="relative overflow-hidden px-4 py-32 sm:px-6 lg:px-8">
      {/* LaserFlow beam background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-60">
          <LaserFlow
            color="#00ffd1"
            horizontalBeamOffset={0.0}
            verticalBeamOffset={0.0}
            horizontalSizing={6}
            verticalSizing={0.18}
            flowSpeed={0.4}
            flowStrength={0.3}
            wispDensity={2}
            wispSpeed={18}
            wispIntensity={4}
            fogIntensity={0.3}
            fogScale={0.5}
            fogFallSpeed={0.5}
            decay={1.2}
            falloffStart={1.5}
          />
        </div>
        {/* bottom magenta beam */}
        <div className="absolute inset-0 opacity-35" style={{ transform: "scaleY(-1)" }}>
          <LaserFlow
            color="#ff00ff"
            horizontalBeamOffset={0.0}
            verticalBeamOffset={0.0}
            horizontalSizing={6}
            verticalSizing={0.14}
            flowSpeed={0.3}
            flowStrength={0.25}
            wispDensity={1}
            wispSpeed={12}
            wispIntensity={3}
            fogIntensity={0.2}
            fogScale={0.4}
            fogFallSpeed={0.4}
            decay={1.3}
            falloffStart={1.6}
          />
        </div>
      </div>

      {/* radial fade to make it feel contained */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_30%,#050506_75%)]" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <AccentBadge accent="cyan">Get started</AccentBadge>

          <h2 className="mt-6 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
            Start tunneling
            <br />
            <span className="bg-gradient-to-r from-miransas-cyan to-miransas-magenta bg-clip-text text-transparent">
              in 60 seconds.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-zinc-400">
            Deploy Binboi on your own server, create an access token, and expose your first
            local port—all before your coffee cools.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-miransas-cyan px-8 py-4 text-sm font-bold text-black transition hover:brightness-110"
            >
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs/quick-start"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-8 py-4 text-sm font-semibold text-white transition hover:border-white/22 hover:bg-white/[0.08]"
            >
              Read the docs
            </Link>
          </div>

          {/* terminal snippet */}
          <div className="mx-auto mt-10 max-w-sm overflow-hidden rounded-2xl border border-white/[0.08] bg-black/60 p-5 text-left backdrop-blur">
            <div className="mb-3 flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-rose-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <p>
                <span className="text-zinc-600">$ </span>
                <span className="text-zinc-300">npm install -g @binboi/cli</span>
              </p>
              <p>
                <span className="text-zinc-600">$ </span>
                <span className="text-zinc-300">binboi login --token ••••••••</span>
              </p>
              <p>
                <span className="text-zinc-600">$ </span>
                <span className="text-miransas-cyan">binboi http 3000 my-app</span>
              </p>
              <p className="mt-2 text-emerald-400">
                ✓ Tunnel live → https://my-app.binboi.miransas.com
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
