"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { AnimatePresence, cubicBezier, motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Globe,
  KeyRound,
  ShieldCheck,
  TerminalSquare,
  Waypoints,
  Webhook,
} from "lucide-react";

// --- Custom Primitives (Replaced from external imports) ---

function PremiumSurface({
  children,
  className = "",
  contentClassName = "",
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div
      className={`relative rounded-[2rem] border border-zinc-800/80 bg-black/40 backdrop-blur-md overflow-hidden group transition-all duration-500 hover:border-[#9eff00]/30 hover:shadow-[0_8px_30px_rgba(158,255,0,0.05)] ${className}`}
    >
      {/* Terminal Grid Overlay inside the surface */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className={`relative z-10 ${contentClassName}`}>{children}</div>
    </div>
  );
}

function AccentBadge({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#9eff00]/20 bg-[#9eff00]/5 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[#9eff00] shadow-[0_0_10px_rgba(158,255,0,0.1)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#9eff00] animate-pulse shadow-[0_0_8px_rgba(158,255,0,0.8)]" />
      {children}
    </div>
  );
}

// --- Animation Config ---
const transition = { duration: 0.8, ease: cubicBezier(0.16, 1, 0.3, 1) };

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(12px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition },
};

// --- Types ---
type IconType = ComponentType<{ className?: string }>;

type EngineModule = {
  id: string;
  label: string;
  color: string;
  icon: IconType;
  steps: [string, string, string];
  details: [string, string, string];
  logs: [string, string, string, string];
  focus: string;
};

type EngineNode = {
  id: string;
  title: string;
  sub: string;
  x: number;
  y: number;
  delay: number;
};

type EnginePath = {
  id: string;
  d: string;
  delay: number;
  duration: number;
};

type EngineScenario = {
  key: string;
  module: EngineModule;
  nodes: EngineNode[];
  paths: EnginePath[];
  logs: EngineModule["logs"];
};

// --- Data ---
const engineModules: EngineModule[] = [
  {
    id: "routing",
    label: "HTTP Routing",
    color: "#9eff00", // Neon Green
    icon: Globe,
    steps: ["Reserve subdomain", "Match public host", "Forward to localhost"],
    details: [
      "Allocated stripe-dev.binboi.link",
      "Mapped Host header to stripe-dev",
      "Sent POST /webhooks/stripe to 127.0.0.1:3000",
    ],
    logs: [
      "Public URL reserved: https://stripe-dev.binboi.link",
      "> Matched host and active tunnel session",
      "> Forwarded request to localhost:3000/webhooks/stripe",
      "Delivery completed with 200 OK in 38ms",
    ],
    focus: "Fast public exposure without hiding the forwarding path.",
  },
  {
    id: "webhooks",
    label: "Webhook Trace",
    color: "#00ffd1", // Cyan
    icon: Webhook,
    steps: ["Capture signature headers", "Preserve raw payload", "Classify failure"],
    details: [
      "Stored stripe-signature and delivery id",
      "Compared raw body to app parser behavior",
      "Flagged application failure after local handler returned 500",
    ],
    logs: [
      "Webhook trace: Stripe payment_intent.succeeded",
      "> Raw body preserved for signature verification",
      "> Local app returned 500 after verification mismatch",
      "Suggested next step: compare raw-body handling and endpoint route",
    ],
    focus: "Debug provider callbacks before you redeploy or lose the payload.",
  },
  {
    id: "tokens",
    label: "Token Auth",
    color: "#fbbf24", // Amber
    icon: KeyRound,
    steps: ["Validate CLI token", "Attach tunnel agent", "Refresh last-used"],
    details: [
      "Matched token prefix and secure hash",
      "Bound agent identity to tunnel session",
      "Recorded token usage for audit visibility",
    ],
    logs: [
      "CLI login accepted for machine token",
      "> Token prefix matched and hash verified",
      "> Tunnel session attached to operator workspace",
      "Last used timestamp refreshed successfully",
    ],
    focus: "Keep dashboard accounts and machine credentials clearly separated.",
  },
  {
    id: "logs",
    label: "Relay Logs",
    color: "#a855f7", // Violet
    icon: TerminalSquare,
    steps: ["Tail relay events", "Mark tunnel lifecycle", "Guide troubleshooting"],
    details: [
      "Streamed connection and proxy events",
      "Marked tunnel ACTIVE after handshake ACK",
      "Linked runtime hints to docs and assistant search",
    ],
    logs: [
      "Tunnel logs live for stripe-dev",
      "> Agent handshake acknowledged by relay",
      "> Proxy stream opened and request metadata captured",
      "Operator hint: compare status, duration, and local route registration",
    ],
    focus: "Move from raw transport logs to product-level debugging clues.",
  },
  {
    id: "regions",
    label: "Edge Regions",
    color: "#38bdf8", // Blue
    icon: Waypoints,
    steps: ["Pick nearest node", "Measure edge latency", "Keep session warm"],
    details: [
      "Selected lowest-latency active region",
      "Measured round trip between edge and agent",
      "Kept tunnel session ready for the next webhook burst",
    ],
    logs: [
      "Preferred node: fra-edge-01",
      "> Edge-to-agent latency settled at 42ms",
      "> Session warmed for webhook retries and bursts",
      "Route remained stable across repeat deliveries",
    ],
    focus: "Choose a region that stays close to your provider and your machine.",
  },
  {
    id: "tls",
    label: "TLS Edge",
    color: "#f43f5e", // Rose
    icon: ShieldCheck,
    steps: ["Terminate TLS", "Normalize headers", "Forward trusted request"],
    details: [
      "Handled HTTPS at the edge",
      "Passed x-forwarded-* headers to the app",
      "Kept a clean chain from public request to local target",
    ],
    logs: [
      "TLS terminated at edge for binboi public URL",
      "> Forwarded x-forwarded-proto and host metadata",
      "> Local service received normalized request headers",
      "Trusted forwarding chain stayed intact",
    ],
    focus: "Keep HTTPS public while your local target stays simple.",
  },
];

const engineSlots = [
  { id: "top", y: 135, portY: 180 },
  { id: "mid", y: 255, portY: 300 },
  { id: "bot", y: 375, portY: 420 },
] as const;

const engineLayouts = [[1], [0, 2], [0, 1, 2], [0], [2]] as const;

const heroSignals = [
  "HTTP tunnels first",
  "Webhook inspection built in",
  "Access token auth for CLI machines",
];

const heroStatus = [
  {
    label: "Public URL",
    value: "binboi-dev.binboi.link",
    note: "Stable enough for providers to call back into local development.",
  },
  {
    label: "Tunnel state",
    value: "ACTIVE",
    note: "Handshake, attach, and proxy lifecycle surfaced instead of hidden.",
  },
  {
    label: "Debugging clue",
    value: "Signature mismatch",
    note: "Headers, raw body, status, and response timing stay close together.",
  },
];

// --- Helper Functions ---
function generateScenario(previousId?: string): EngineScenario {
  const availableModules = engineModules.filter((module) => module.id !== previousId);
  const activeModule =
    availableModules[Math.floor(Math.random() * availableModules.length)] ?? engineModules[0];
  const layout = engineLayouts[Math.floor(Math.random() * engineLayouts.length)] ?? engineLayouts[0];
  const key = `${activeModule.id}-${Date.now()}`;

  const nodes = layout.map((slotIndex, index) => {
    const slot = engineSlots[slotIndex];

    return {
      id: `${key}-${slot.id}`,
      title: activeModule.steps[slotIndex],
      sub: activeModule.details[slotIndex],
      x: 520,
      y: slot.y,
      delay: index * 0.12,
    };
  });

  const paths = layout.flatMap((slotIndex) => {
    const slot = engineSlots[slotIndex];

    return [
      {
        id: `in-${key}-${slot.id}`,
        d: `M 300 280 C 410 280, 410 ${slot.portY}, 520 ${slot.portY}`,
        delay: Math.random() * 0.35,
        duration: 2.8 + Math.random(),
      },
      {
        id: `out-${key}-${slot.id}`,
        d:
          slot.portY === 300
            ? `M 780 300 L 850 300`
            : `M 780 ${slot.portY} C 820 ${slot.portY}, 810 300, 850 300`,
        delay: Math.random() * 0.35 + 0.25,
        duration: 2.8 + Math.random(),
      },
    ];
  });

  return {
    key,
    module: activeModule,
    nodes,
    paths,
    logs: activeModule.logs,
  };
}

// --- Sub Components ---
function GlowingWire({ path, color, delay, duration }: { path: string; color: string; delay: number; duration: number }) {
  return (
    <g>
      <path
        d={path}
        stroke="#18181b"
        strokeWidth={16}
        fill="none"
        strokeLinecap="round"
        style={{ filter: "drop-shadow(0 5px 10px rgba(0,0,0,0.8))" }}
      />
      <path d={path} stroke="#27272a" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />
      <motion.path
        d={path}
        stroke={color}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeDasharray="84 520"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1], strokeDashoffset: [0, -1000] }}
        exit={{ opacity: 0 }}
        transition={{
          opacity: { delay, duration: 0.3 },
          strokeDashoffset: { duration, repeat: Infinity, ease: "linear" },
        }}
        style={{ filter: `drop-shadow(0 0 15px ${color}) drop-shadow(0 0 30px ${color})` }}
      />
    </g>
  );
}

function OrbitModule({ module, angle, isActive }: { module: EngineModule; angle: number; isActive: boolean }) {
  const Icon = module.icon;

  return (
    <div
      className="absolute left-1/2 top-1/2 transition-all duration-700 ease-in-out"
      style={{
        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
        zIndex: isActive ? 30 : 10,
        opacity: isActive ? 1 : 0.22,
        filter: isActive ? "none" : "grayscale(100%) brightness(40%)",
      }}
    >
      <div className="relative" style={{ transform: `translateX(${isActive ? "188px" : "168px"})` }}>
        <div className="absolute left-[-20px] top-1/2 z-0 flex -translate-y-1/2 flex-col gap-[4px]">
          <div className="h-[3px] w-5 rounded-sm bg-gradient-to-r from-zinc-800 to-zinc-400" />
          <div className="h-[3px] w-5 rounded-sm bg-gradient-to-r from-zinc-800 to-zinc-400" />
          <div className="h-[3px] w-5 rounded-sm bg-gradient-to-r from-zinc-800 to-zinc-400" />
        </div>

        <div style={{ transform: `rotate(${-angle}deg)` }} className="flex flex-col items-center">
          <div
            className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-[0_15px_30px_rgba(0,0,0,0.9),inset_0_2px_2px_rgba(255,255,255,0.1)]"
            style={{
              boxShadow: isActive ? `0 0 30px ${module.color}60, inset 0 2px 2px rgba(255,255,255,0.2)` : undefined,
            }}
          >
            <div
              style={{
                color: isActive ? module.color : "#666",
                filter: isActive ? `drop-shadow(0 0 12px ${module.color})` : "none",
              }}
            >
              <Icon className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-white/10 bg-[#050505] px-3 py-1.5 shadow-xl">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-300">
              {module.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessNode({ node }: { node: EngineNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.84, x: -18 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.84, x: 18 }}
      transition={{ duration: 0.4, delay: node.delay, type: "spring" }}
      className="absolute z-10 flex h-[90px] w-[260px] flex-col justify-center overflow-hidden rounded-xl border border-zinc-800 bg-black/80 backdrop-blur-sm px-6 shadow-[0_30px_60px_rgba(0,0,0,0.82),inset_0_2px_3px_rgba(255,255,255,0.05)]"
      style={{ left: node.x, top: node.y }}
    >
      <div
        className="absolute left-0 top-0 h-[18px] w-full border-b border-black/50 opacity-20"
        style={{ backgroundImage: "radial-gradient(#ffffff 1.5px, transparent 1.5px)", backgroundSize: "5px 5px" }}
      />
      <div
        className="absolute bottom-0 left-0 h-[18px] w-full border-t border-black/50 opacity-20"
        style={{ backgroundImage: "radial-gradient(#ffffff 1.5px, transparent 1.5px)", backgroundSize: "5px 5px" }}
      />

      <div className="absolute left-[-9px] top-1/2 z-20 h-[18px] w-[18px] -translate-y-1/2 rounded-full border-2 border-[#9eff00]/50 bg-[#050505] shadow-[inset_0_2px_4px_rgba(0,0,0,0.82)]" />
      <div className="absolute right-[-9px] top-1/2 z-20 h-[18px] w-[18px] -translate-y-1/2 rounded-full border-2 border-zinc-500 bg-[#050505] shadow-[inset_0_2px_4px_rgba(0,0,0,0.82)]" />

      <h4 className="relative z-10 text-base font-bold tracking-tight text-white">{node.title}</h4>
      <p className="relative z-10 mt-1 truncate rounded-md border border-[#9eff00]/10 bg-[#9eff00]/5 px-2 py-1 font-mono text-[10px] text-[#9eff00] shadow-inner">
        {node.sub}
      </p>
    </motion.div>
  );
}

// --- Main Page Component ---
const LandingSaas = () => {
  const [scenario, setScenario] = useState<EngineScenario>(() => generateScenario());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setScenario((current) => generateScenario(current.module.id));
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <section className="relative pt-32 pb-24 overflow-hidden min-h-screen bg-black">
        {/* Main Background Terminal Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        {/* Glow behind the hero */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-[#9eff00]/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative z-10 mx-auto max-w-full">
          {/* Hero headline */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ ...transition, delay: 0 }}
            className="mb-10 px-4 text-center"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#9eff00]/20 bg-[#9eff00]/5 px-4 py-1.5 shadow-[0_0_15px_rgba(158,255,0,0.05)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#9eff00] animate-pulse shadow-[0_0_8px_rgba(158,255,0,0.8)]" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#9eff00]">
                Self-hosted tunnel platform
              </span>
            </div>
            <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              Expose local.
              <br />
              <span className="bg-gradient-to-r from-[#9eff00] to-[#00ffd1] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(158,255,0,0.3)]">
                Debug faster.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl font-mono text-sm leading-relaxed text-zinc-400 sm:text-base">
              Binboi gives your localhost a stable public URL, captures every inbound request,
              and surfaces webhook failures before you touch a redeploy.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ ...transition, delay: 0.14 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row font-mono uppercase tracking-widest text-xs"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#9eff00] px-8 py-4 font-bold text-black transition-all duration-300 hover:bg-[#b0ff33] hover:scale-105 shadow-[0_0_15px_rgba(158,255,0,0.15)] hover:shadow-[0_0_25px_rgba(158,255,0,0.4)]"
            >
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-black/50 backdrop-blur-sm px-8 py-4 font-bold text-zinc-300 transition-all duration-300 hover:border-[#9eff00]/50 hover:text-[#9eff00] hover:bg-[#9eff00]/5"
            >
              Read quick start
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ ...transition, delay: 0.22 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            {heroSignals.map((signal) => (
              <span
                key={signal}
                className="rounded-full border border-zinc-800 bg-black/50 px-4 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400"
              >
                {signal}
              </span>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ ...transition, delay: 0.32 }}
            className="mt-16 max-w-[1400px] mx-auto px-4"
          >
            <PremiumSurface contentClassName="p-0">
              <div className="relative overflow-hidden">
                <div className="px-6 py-8 sm:px-10 border-b border-zinc-800/50 bg-black/20">
                  <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
                    <div>
                      <AccentBadge>Tunnel engine</AccentBadge>
                      <h2 className="mt-5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                        Full request visibility from public webhook to local response.
                      </h2>
                      <p className="mt-4 max-w-2xl font-mono text-xs leading-relaxed text-zinc-400">
                        Active focus: <span className="text-[#9eff00]">{scenario.module.label}</span>.
                        {" "}
                        {scenario.module.focus}
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      {heroStatus.map((item, index) => (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-zinc-800/80 bg-black/60 p-4 transition-colors"
                        >
                          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-zinc-500">
                            {item.label}
                          </p>
                          <p
                            className="mt-3 font-mono text-sm font-bold"
                            style={{ color: index === 1 ? scenario.module.color : "#ffffff" }}
                          >
                            {item.value}
                          </p>
                          <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">{item.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative h-[520px] sm:h-[580px] xl:h-[640px] bg-black/40">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_42%,rgba(158,255,0,0.05),transparent_30%),radial-gradient(circle_at_78%_38%,rgba(0,255,209,0.05),transparent_30%)]" />

                  <div className="absolute left-1/2 top-6 h-[600px] w-[1180px] origin-top -translate-x-1/2 scale-[0.42] sm:scale-[0.62] lg:scale-[0.84] xl:scale-100">
                    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1200 600">
                      <AnimatePresence mode="wait">
                        <motion.g key={scenario.key}>
                          {scenario.paths.map((path) => (
                            <GlowingWire
                              key={path.id}
                              path={path.d}
                              color={scenario.module.color}
                              delay={path.delay}
                              duration={path.duration}
                            />
                          ))}
                        </motion.g>
                      </AnimatePresence>
                    </svg>

                    <div className="absolute left-[40px] top-[150px] z-10 flex h-[260px] w-[260px] items-center justify-center">
                      <div
                        className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-[90px]"
                        style={{ backgroundColor: scenario.module.color, opacity: 0.15 }}
                      />

                      <div className="pointer-events-none absolute h-[450px] w-[450px] rounded-full border border-white/[0.03] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />
                      <div className="pointer-events-none absolute h-[600px] w-[600px] rounded-full border border-white/[0.02]" />

                      {engineModules.map((module, index) => (
                        <OrbitModule
                          key={module.id}
                          module={module}
                          angle={45 + index * 52}
                          isActive={scenario.module.id === module.id}
                        />
                      ))}

                      <div className="relative z-20 flex h-[220px] w-[220px] items-center justify-center overflow-hidden rounded-full border border-zinc-800 bg-[#050505] shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_0_30px_rgba(0,0,0,0.9)]">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                          className="absolute z-10 h-[160px] w-[160px]"
                        >
                          {[0, 60, 120, 180, 240, 300].map((angle) => (
                            <div
                              key={angle}
                              className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                              style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-55px)` }}
                            >
                              <div className="z-20 h-3 w-5 rounded-sm bg-gradient-to-b from-[#9eff00] to-[#00ffd1] shadow-[0_0_20px_#9eff00]" />
                              <div className="z-10 mt-[-1px] h-5 w-6 rounded-b-lg border border-zinc-800 border-t-0 bg-black shadow-inner" />
                            </div>
                          ))}
                        </motion.div>

                        <span className="absolute z-30 text-8xl font-black italic text-white drop-shadow-[0_0_15px_rgba(158,255,0,0.3)]">
                          {/* B */}
                        </span>
                      </div>

                      <div className="absolute right-[-2px] top-1/2 z-0 flex -translate-y-1/2 items-center drop-shadow-xl">
                        <div className="h-[20px] w-[26px] rounded-r-sm border border-zinc-800 bg-[#111] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />
                        <div className="absolute right-[-5px] z-10 h-[26px] w-[7px] rounded-[2px] bg-gradient-to-b from-[#9eff00] to-[#00ffd1] shadow-[0_0_10px_#9eff00]" />
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div key={scenario.key}>
                        {scenario.nodes.map((node) => (
                          <ProcessNode key={node.id} node={node} />
                        ))}
                      </motion.div>
                    </AnimatePresence>

                    <div className="absolute left-[850px] top-[140px] z-10 flex h-[320px] w-[320px] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-black/80 backdrop-blur-md p-6 shadow-[0_40px_80px_rgba(0,0,0,0.9),inset_0_2px_10px_rgba(255,255,255,0.02)]">
                      <div className="absolute left-[-10px] top-[160px] z-20 h-[20px] w-[20px] rounded-full border-2 border-zinc-700 bg-[#050505] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]" />

                      <div className="mb-5 border-b border-zinc-800/80 pb-4">
                        <div className="flex gap-2.5">
                          <div className="h-3 w-3 rounded-full border border-[#e0443e] bg-[#ff5f56]" />
                          <div className="h-3 w-3 rounded-full border border-[#dea123] bg-[#ffbd2e]" />
                          <div className="h-3 w-3 rounded-full border border-[#1aab29] bg-[#27c93f] shadow-[0_0_8px_#27c93f]" />
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                            Live relay terminal
                          </p>
                          <p
                            className="font-mono text-[10px] font-bold uppercase tracking-[0.24em]"
                            style={{ color: scenario.module.color }}
                          >
                            {scenario.module.label}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 overflow-hidden font-mono text-[11px] leading-relaxed">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={scenario.key}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0 }}
                            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                            className="flex flex-col gap-2.5"
                          >
                            <p className="text-zinc-600">
                              <span className="text-[#9eff00]">operator@binboi</span>:~$ tail -f relay.log
                            </p>
                            {scenario.logs.map((log, index) => (
                              <motion.p
                                key={log}
                                variants={{
                                  hidden: { opacity: 0, x: -10 },
                                  visible: { opacity: 1, x: 0 },
                                }}
                                className={
                                  index === 0
                                    ? "font-bold text-zinc-300"
                                    : index === scenario.logs.length - 1
                                      ? "mt-2 font-bold text-[#9eff00] drop-shadow-[0_0_5px_rgba(158,255,0,0.5)]"
                                      : "text-zinc-500 pl-3 border-l border-zinc-800"
                                }
                              >
                                {log}
                              </motion.p>
                            ))}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="pointer-events-none absolute bottom-5 left-5 rounded-full border border-[#9eff00]/20 bg-[#9eff00]/5 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-[#9eff00] backdrop-blur-md shadow-[0_0_15px_rgba(158,255,0,0.05)]">
                    Captures headers, payload, timing, and status
                  </div>
                </div>
              </div>
            </PremiumSurface>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default LandingSaas;