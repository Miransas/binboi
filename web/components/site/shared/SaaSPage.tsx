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

import { BinboiAssistant } from "@/components/shared/binboi-assistant";
import { integrationCards } from "@/content/site-content";

import {
  AccentBadge,
  PremiumSurface,
  SectionHeading,
  type Accent,
} from "./landing-primitives";
import { LandingSectionDivider } from "./landing-section-divider";
import { LandingSignalBand } from "./landing-signal-band";




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


const featureCards: Array<{
  accent: Accent;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  icon: IconType;
}> = [
    {
      accent: "cyan",
      eyebrow: "Request inspection",
      title: "Follow the full handoff from edge to localhost.",
      description:
        "Binboi is designed around the moment after the public URL works. Read what actually arrived, which host matched, how long the target took, and where the request went next.",
      bullets: [
        "Headers, payload previews, status, duration, and target service in one surface.",
        "Cleaner clues when a 404 or 500 came from the app instead of the tunnel.",
        "A calmer path from transport success to debugging reality.",
      ],
      icon: TerminalSquare,
    },
    {
      accent: "magenta",
      eyebrow: "Webhook debugging",
      title: "Diagnose provider failures before you redeploy.",
      description:
        "Stripe, Clerk, Supabase, GitHub, Neon, and Linear all surface different versions of the same problem: the provider delivered something, but your local app still rejected it.",
      bullets: [
        "Compare signature headers, raw body handling, and route registration.",
        "See retries, application failures, and likely next steps without guessing.",
        "Keep webhook docs and assistant help one click away from the active tunnel.",
      ],
      icon: Webhook,
    },
    {
      accent: "violet",
      eyebrow: "Logs and events",
      title: "Keep the relay honest about what happened.",
      description:
        "Raw logs are useful, but lifecycle events, tunnel state, and product-level notes are what make the control plane readable under pressure.",
      bullets: [
        "Tunnel attach, disconnect, and error moments stay visible.",
        "Runtime logs can be summarized by the assistant when context is available.",
        "Surface gaps are labeled clearly when the backend is still MVP.",
      ],
      icon: Sparkles,
    },
    {
      accent: "amber",
      eyebrow: "Access control",
      title: "Separate operator accounts from machine credentials.",
      description:
        "Users create tokens in the dashboard, the CLI uses those tokens for machine auth, and the product stays honest about free and paid plan foundations while billing matures.",
      bullets: [
        "Full tokens are shown once and stored as prefix plus secure hash.",
        "binboi login and binboi whoami behave like a real developer product.",
        "Plan labels and limits are visible without pretending billing is finished.",
      ],
      icon: KeyRound,
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



function LinkCard({
  href,
  accent,
  eyebrow,
  title,
  description,
}: {
  href: string;
  accent: Accent;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.18 }}>
      <Link href={href} className="block h-full">
        <PremiumSurface accent={accent} contentClassName="p-5 sm:p-5" className="h-full">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            {eyebrow}
          </p>
          <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
          <p className="mt-3 text-sm leading-7 text-zinc-400">{description}</p>
          <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white">
            Open
            <ArrowRight className="h-4 w-4 text-zinc-500" />
          </div>
        </PremiumSurface>
      </Link>
    </motion.div>
  );
}

export default function SaaSPage() {
  const [scenario, setScenario] = useState<EngineScenario>(() => generateScenario());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setScenario((current) => generateScenario(current.module.id));
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="relative overflow-hidden bg-[#040405] text-white selection:bg-miransas-cyan/30 mt-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[920px] bg-[radial-gradient(circle_at_top,rgba(0,255,209,0.16),transparent_24%),radial-gradient(circle_at_82%_14%,rgba(255,0,255,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-[0.16]" />
      <div className="pointer-events-none absolute left-[-16rem] top-[18rem] h-[28rem] w-[28rem] rounded-full bg-miransas-cyan/10 blur-[160px]" />
      <div className="pointer-events-none absolute right-[-18rem] top-[9rem] h-[32rem] w-[32rem] rounded-full bg-miransas-magenta/10 blur-[180px]" />

{/* 
      <section className="relative px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-full gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.18 }}>
            <PremiumSurface accent="cyan" className="h-full">
              <AccentBadge accent="cyan">Quick path</AccentBadge>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-white">
                Keep the first successful request path visible from install to inspection.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
                The current CTA areas were kept, but upgraded to match the hero quality: install,
                token creation, CLI login, first tunnel, and the next debugging clue now sit in a
                single product-grade surface.
              </p>

              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/45 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Command className="h-4 w-4 text-miransas-cyan" />
                  CLI onboarding
                </div>
                <pre className="mt-4 overflow-x-auto rounded-[1.25rem] border border-white/10 bg-black/60 p-4 text-sm leading-7 text-miransas-cyan">
                  <code>{`brew tap binboi/tap
                      brew install binboi
                      binboi login --token <token>
                      binboi start 3000 stripe-dev
                     curl https://stripe-dev.binboi.link/health`}</code>
                </pre>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  {
                    label: "1. Create token",
                    text: "Generate a revocable access token once in the dashboard and copy it safely.",
                  },
                  {
                    label: "2. Attach the CLI",
                    text: "Authenticate the machine, reserve a public URL, and map it to localhost.",
                  },
                  {
                    label: "3. Inspect the result",
                    text: "Read the request, webhook, or log clues without redeploying anything yet.",
                  },
                ].map((step) => (
                  <div
                    key={step.label}
                    className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                      {step.label}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-zinc-300">{step.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/docs/quick-start"
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm text-white transition hover:border-white/20 hover:bg-white/[0.07]"
                >
                  <BookOpen className="h-4 w-4 text-miransas-cyan" />
                  Follow quick start
                </Link>
                <Link
                  href="/dashboard/access-tokens"
                  className="inline-flex items-center gap-2 rounded-full border border-miransas-cyan/18 bg-miransas-cyan/8 px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-110"
                >
                  <KeyRound className="h-4 w-4 text-miransas-cyan" />
                  Create machine token
                </Link>
              </div>
            </PremiumSurface>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.18 }}>
            <PremiumSurface accent="violet" className="h-full p-1" contentClassName="p-1">
              <BinboiAssistant
                variant="hero"
                storageKey="site-home-hero"
                title="Ask Binboi before you start changing code"
                description="Search docs, product pages, live tunnel context, requests, webhooks, and logs from the same dark assistant surface. When AI credentials are configured, the summaries stay server-side and secure."
                className="h-full border-transparent bg-transparent shadow-none"
              />
            </PremiumSurface>
          </motion.div>
        </div>
      </section> */}

      <LandingSectionDivider label="Operator surfaces" />
      <LandingSignalBand />

      <section className="relative px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-full">
          <SectionHeading
            eyebrow="Inspection surfaces"
            accent="magenta"
            title="The tunnel is only the first answer."
            description="The rest of the landing now follows the same visual language as the hero: beam-edged panels, glowing control surfaces, and product sections that stay focused on debugging, not generic SaaS filler."
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {featureCards.map((card) => {
              const Icon = card.icon;

              return (
                <motion.div
                  key={card.title}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="h-full"
                >
                  <PremiumSurface accent={card.accent} className="h-full">
                    <div className="flex items-center justify-between gap-3">
                      <AccentBadge accent={card.accent}>{card.eyebrow}</AccentBadge>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>

                    <h3 className="mt-5 text-2xl font-black tracking-tight text-white">
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-zinc-400">{card.description}</p>

                    <div className="mt-6 space-y-3">
                      {card.bullets.map((bullet) => (
                        <div
                          key={bullet}
                          className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-zinc-300"
                        >
                          {bullet}
                        </div>
                      ))}
                    </div>
                  </PremiumSurface>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <LandingSectionDivider label="Provider flows" />

      <section className="relative px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <SectionHeading
              eyebrow="Integrations"
              accent="cyan"
              title="Use the same public workflow across the providers that trigger real debugging work."
              description="Stripe, Clerk, Supabase, GitHub, Neon, and Linear all force you to care about callback URLs, signature handling, retries, or target routes. Binboi keeps those realities close to the product instead of hiding them behind a single tunnel command."
            />

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {integrationCards.map((card, index) => (
                <motion.div
                  key={card.name}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.18 }}
                  className="h-full"
                >
                  <PremiumSurface
                    accent={
                      (["cyan", "magenta", "violet", "amber", "emerald", "blue"][
                        index % 6
                      ] as Accent)
                    }
                    contentClassName="p-5"
                    className="h-full"
                    beamSize={140}
                    beamDuration={7 + index * 0.4}
                    beamDelay={index * 0.4}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                      {card.label}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-white">{card.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-zinc-400">{card.summary}</p>
                  </PremiumSurface>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <LinkCard
              href="/docs"
              accent="amber"
              eyebrow="Documentation"
              title="Move from the landing to the actual guides without losing context."
              description="Installation, authentication, CLI usage, HTTP tunnels, requests, webhooks, regions, logs, and troubleshooting are all live routes instead of placeholder docs."
            />
            <LinkCard
              href="/dashboard"
              accent="cyan"
              eyebrow="Dashboard"
              title="Open the control plane and work from a real operator surface."
              description="Guest-safe fallback states, access token management, tunnel inventory, setup guidance, AI search, and the request-first product model are all visible today."
            />
            <LinkCard
              href="/dashboard/access-tokens"
              accent="magenta"
              eyebrow="Access tokens"
              title="Create a machine credential that behaves like a real product feature."
              description="Users mint tokens in the dashboard, the CLI authenticates with them, and the full token is only shown once before secure hash storage."
            />
          </div>
        </div>
      </section>

      <LandingSectionDivider label="Start cleanly" />

      <section className="relative px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <PremiumSurface accent="cyan" beamSize={320} beamDuration={10}>
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <AccentBadge accent="cyan">Ready to start</AccentBadge>
                <h2 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Start with the same premium surface language all the way through the product.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
                  The hero now drives the landing instead of sitting beside generic sections. The
                  same beam and glow treatment carries into showcase panels, feature cards, docs
                  links, and the closing CTA so the page feels like one product system.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-full bg-miransas-cyan px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Open dashboard
                  </Link>
                  <Link
                    href="/docs/quick-start"
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.07]"
                  >
                    <BookOpen className="h-4 w-4 text-miransas-cyan" />
                    Read docs
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <LinkCard
                  href="/pricing"
                  accent="amber"
                  eyebrow="Plans"
                  title="Free and Pro foundations stay visible."
                  description="Usage, limits, and upgrade direction are present in the UX without pretending billing is already complete."
                />
                <LinkCard
                  href="/blog"
                  accent="violet"
                  eyebrow="Build notes"
                  title="Read the product story behind the control plane."
                  description="The blog and changelog explain why Binboi leans into request truth, token security, and a premium developer workflow."
                />
              </div>
            </div>
          </PremiumSurface>
        </div>
      </section>
    </main>
  );
}
