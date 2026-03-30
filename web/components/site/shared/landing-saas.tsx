"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";
import { AnimatePresence, cubicBezier, motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Command,
  Globe,
  KeyRound,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Waypoints,
  Webhook,
} from "lucide-react";



import {
  AccentBadge,
  PremiumSurface,
  SectionHeading,
  type Accent,
} from "./landing-primitives";


const transition = { duration: 0.8, ease: cubicBezier(0.16, 1, 0.3, 1) };

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(12px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition },
};

type IconType = ComponentType<{ className?: string }>;

type EngineModule = {
  id: string;
  label: string;
  color: string;
  accent: Accent;
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

const engineModules: EngineModule[] = [
  {
    id: "routing",
    label: "HTTP Routing",
    color: "#00ffd1",
    accent: "cyan",
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
    color: "#ff00ff",
    accent: "magenta",
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
    color: "#fbbf24",
    accent: "amber",
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
    color: "#a855f7",
    accent: "violet",
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
    color: "#38bdf8",
    accent: "blue",
    icon: Waypoints,
    steps: ["Pick nearest node", "Measure edge latency", "Keep session warm"],
    details: [
      "Selected lowest-latency preview region",
      "Measured round trip between edge and agent",
      "Kept tunnel session ready for the next webhook burst",
    ],
    logs: [
      "Preferred node: fra-preview",
      "> Edge-to-agent latency settled at 42ms",
      "> Session warmed for webhook retries and bursts",
      "Route remained stable across repeat deliveries",
    ],
    focus: "Choose a region that stays close to your provider and your machine.",
  },
  {
    id: "tls",
    label: "TLS Edge",
    color: "#34d399",
    accent: "emerald",
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
    value: "miransas-dev.binboi.link",
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

function GlowingWire({
  path,
  color,
  delay,
  duration,
}: {
  path: string;
  color: string;
  delay: number;
  duration: number;
}) {
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
      <path
        d={path}
        stroke="#27272a"
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        opacity={0.6}
      />
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
          strokeDashoffset: {
            duration,
            repeat: Infinity,
            ease: "linear",
          },
        }}
        style={{
          filter: `drop-shadow(0 0 15px ${color}) drop-shadow(0 0 30px ${color})`,
        }}
      />
    </g>
  );
}

function OrbitModule({
  module,
  angle,
  isActive,
}: {
  module: EngineModule;
  angle: number;
  isActive: boolean;
}) {
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
          <div className="h-[3px] w-5 rounded-sm bg-gradient-to-r from-zinc-700 to-zinc-300" />
          <div className="h-[3px] w-5 rounded-sm bg-gradient-to-r from-zinc-700 to-zinc-300" />
          <div className="h-[3px] w-5 rounded-sm bg-gradient-to-r from-zinc-700 to-zinc-300" />
        </div>

        <div style={{ transform: `rotate(${-angle}deg)` }} className="flex flex-col items-center">
          <div
            className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-[0_15px_30px_rgba(0,0,0,0.9),inset_0_2px_2px_rgba(255,255,255,0.1)]"
            style={{
              boxShadow: isActive
                ? `0 0 30px ${module.color}60, inset 0 2px 2px rgba(255,255,255,0.2)`
                : undefined,
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
      className="absolute z-10 flex h-[90px] w-[260px] flex-col justify-center overflow-hidden rounded-xl border border-white/10 bg-[#0d0d0d] px-6 shadow-[0_30px_60px_rgba(0,0,0,0.82),inset_0_2px_3px_rgba(255,255,255,0.05)]"
      style={{ left: node.x, top: node.y }}
    >
      <div
        className="absolute left-0 top-0 h-[18px] w-full border-b border-black/50 opacity-20"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1.5px, transparent 1.5px)",
          backgroundSize: "5px 5px",
        }}
      />
      <div
        className="absolute bottom-0 left-0 h-[18px] w-full border-t border-black/50 opacity-20"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1.5px, transparent 1.5px)",
          backgroundSize: "5px 5px",
        }}
      />

      <div className="absolute left-[-9px] top-1/2 z-20 h-[18px] w-[18px] -translate-y-1/2 rounded-full border-2 border-zinc-500 bg-[#050505] shadow-[inset_0_2px_4px_rgba(0,0,0,0.82)]" />
      <div className="absolute right-[-9px] top-1/2 z-20 h-[18px] w-[18px] -translate-y-1/2 rounded-full border-2 border-zinc-500 bg-[#050505] shadow-[inset_0_2px_4px_rgba(0,0,0,0.82)]" />

      <h4 className="relative z-10 text-base font-bold tracking-tight text-white">{node.title}</h4>
      <p className="relative z-10 mt-1 truncate rounded-md border border-white/5 bg-black/80 p-1.5 font-mono text-[10px] text-miransas-cyan shadow-inner">
        {node.sub}
      </p>
    </motion.div>
  );
}

const LandingSaas = () => {
     const [scenario, setScenario] = useState<EngineScenario>(() => generateScenario());
    
      useEffect(() => {
        const timer = window.setInterval(() => {
          setScenario((current) => generateScenario(current.module.id));
        }, 4200);
    
        return () => window.clearInterval(timer);
      }, []);
  return (
    <div>
       <section className="relative ">
        <div className="mx-auto max-w-full">
     

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ ...transition, delay: 0.36 }}
            className="mt-12"
          >
            <PremiumSurface accent="magenta" contentClassName="p-0" className="overflow-hidden">
              <div className="relative overflow-hidden">
                <div className=" px-5 py-5 sm:px-7">
                  <div className="grid gap-5 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
                    <div>
                      <AccentBadge accent={scenario.module.accent}>Hero engine</AccentBadge>
                      <h2 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
                        The hero inherits the uploaded engine scene and uses it as the landing
                        system, not as decoration.
                      </h2>
                      <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
                        Active focus: <span className="text-white">{scenario.module.label}</span>.
                        {" "}
                        {scenario.module.focus}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {heroStatus.map((item, index) => (
                        <div
                          key={item.label}
                          className="rounded-[1.4rem] border border-white/10 bg-black/30 p-4"
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                            {item.label}
                          </p>
                          <p
                            className="mt-3 text-lg font-semibold"
                            style={{ color: index === 1 ? scenario.module.color : "#ffffff" }}
                          >
                            {item.value}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-zinc-400">{item.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative h-[520px] sm:h-[580px] xl:h-[640px]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_42%,rgba(0,255,209,0.08),transparent_30%),radial-gradient(circle_at_78%_38%,rgba(255,0,255,0.08),transparent_30%)]" />

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
                        style={{
                          backgroundColor: scenario.module.color,
                          opacity: 0.24,
                        }}
                      />

                      <div className="pointer-events-none absolute h-[450px] w-[450px] rounded-full border border-white/[0.05] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />
                      <div className="pointer-events-none absolute h-[600px] w-[600px] rounded-full border border-white/[0.02]" />

                      {engineModules.map((module, index) => (
                        <OrbitModule
                          key={module.id}
                          module={module}
                          angle={45 + index * 52}
                          isActive={scenario.module.id === module.id}
                        />
                      ))}

                      <div className="relative z-20 flex h-[220px] w-[220px] items-center justify-center overflow-hidden rounded-[60px] border border-[#2a2a2e] bg-[#0a0a0a] shadow-[inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-4px_-4px_10px_rgba(0,0,0,0.9),0_30px_60px_rgba(0,0,0,0.95)]">
                        <div
                          className="absolute inset-0 opacity-[0.16] mix-blend-overlay"
                          style={{
                            backgroundImage:
                              'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
                          }}
                        />

                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                          className="absolute z-10 h-[160px] w-[160px]"
                        >
                          {[0, 60, 120, 180, 240, 300].map((angle) => (
                            <div
                              key={angle}
                              className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                              style={{
                                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-55px)`,
                              }}
                            >
                              <div className="z-20 h-3 w-5 rounded-sm bg-gradient-to-b from-miransas-cyan to-miransas-magenta shadow-[0_0_20px_#00ffd1]" />
                              <div className="z-10 mt-[-1px] h-5 w-6 rounded-b-lg border border-[#333] border-t-0 bg-gradient-to-b from-[#111] to-[#000] shadow-inner" />
                            </div>
                          ))}
                        </motion.div>

                        <span className="absolute z-30 text-8xl font-black italic text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                          B
                        </span>

                        <div className="pointer-events-none absolute inset-0 rounded-[60px] bg-gradient-to-tr from-white/10 via-transparent to-transparent mix-blend-overlay" />
                      </div>

                      <div className="absolute right-[-2px] top-1/2 z-0 flex -translate-y-1/2 items-center drop-shadow-xl">
                        <div className="h-[20px] w-[26px] rounded-r-sm border border-[#444] bg-[#1a1a1c] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]" />
                        <div className="absolute right-[-5px] z-10 h-[26px] w-[7px] rounded-[2px] bg-gradient-to-b from-miransas-cyan to-miransas-magenta shadow-[0_0_10px_#00ffd1]" />
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div key={scenario.key}>
                        {scenario.nodes.map((node) => (
                          <ProcessNode key={node.id} node={node} />
                        ))}
                      </motion.div>
                    </AnimatePresence>

                    <div className="absolute left-[850px] top-[140px] z-10 flex h-[320px] w-[300px] flex-col overflow-hidden rounded-2xl border border-[#222] bg-[#0c0c0e] p-6 shadow-[0_40px_80px_rgba(0,0,0,0.9),inset_0_2px_10px_rgba(0,0,0,0.8)]">
                      <div className="absolute left-[-10px] top-[160px] z-20 h-[20px] w-[20px] rounded-full border-2 border-zinc-600 bg-[#050505] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]" />

                      <div className="mb-5 border-b border-[#222]/50 pb-4">
                        <div className="flex gap-2.5">
                          <div className="h-3.5 w-3.5 rounded-full border border-[#e0443e] bg-[#ff5f56]" />
                          <div className="h-3.5 w-3.5 rounded-full border border-[#dea123] bg-[#ffbd2e]" />
                          <div className="h-3.5 w-3.5 rounded-full border border-[#1aab29] bg-[#27c93f] shadow-[0_0_10px_#27c93f]" />
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                            Live relay terminal
                          </p>
                          <p
                            className="font-mono text-[10px] uppercase tracking-[0.24em]"
                            style={{ color: scenario.module.color }}
                          >
                            {scenario.module.label}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 overflow-hidden font-mono text-xs leading-relaxed">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={scenario.key}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0 }}
                            variants={{
                              visible: { transition: { staggerChildren: 0.1 } },
                            }}
                            className="flex flex-col gap-2"
                          >
                            <p className="mb-2 text-zinc-600">
                              operator@binboi:~$ tail -f relay.log
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
                                      ? "mt-3 font-bold text-miransas-cyan"
                                      : "text-zinc-500"
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

                  <div className="pointer-events-none absolute bottom-5 left-5 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs font-medium text-zinc-300 backdrop-blur">
                    Every bordered surface uses the same beam language as the hero engine.
                  </div>
                </div>
              </div>
            </PremiumSurface>
          </motion.div>
        </div>
         <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transition, delay: 0.22 }}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-miransas-cyan px-6 py-3.5 text-sm font-semibold text-black transition hover:brightness-110"
              >
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs/quick-start"
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.07]"
              >
                Read quick start
              </Link>
              <Link
                href="/dashboard/access-tokens"
                className="inline-flex items-center justify-center rounded-full border border-miransas-magenta/18 bg-miransas-magenta/8 px-6 py-3.5 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Create access token
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transition, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              {heroSignals.map((signal) => (
                <span
                  key={signal}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-300"
                >
                  {signal}
                </span>
              ))}
            </motion.div>
      </section>  
    </div>
  )
}

export default LandingSaas