"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Minus, ArrowRight, Server, Zap } from "lucide-react";

import { Footer } from "@/components/site/shared/footer";

// ── plan data ─────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "FREE",
    name: "Free",
    monthly: 0,
    yearly: 0,
    description: "For solo development, quick demos, and validating the tunnel flow.",
    badge: null,
    accent: "neutral" as const,
    cta: { label: "Get started free", href: "/register", external: false, soon: false },
    features: [
      "1 active tunnel",
      "Random public URL only",
      "100 requests / day",
      "Last 50 requests history",
      "Basic webhook debugging",
      "5 AI explains / day",
      "Log retention ~1 hour",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    monthly: 9,
    yearly: 7,
    description: "For developers who live in tunnels every day and need real debugging depth.",
    badge: "Most popular",
    accent: "cyan" as const,
    cta: { label: "Coming soon", href: "#", external: false, soon: true },
    features: [
      "Everything in Free",
      "Unlimited tunnels",
      "Custom subdomains & domains",
      "10,000+ requests / day",
      "Full request history",
      "Full webhook debugger",
      "Unlimited AI explain",
      "7 – 30 days log retention",
      "Priority routing",
    ],
  },
  {
    id: "TEAM",
    name: "Team",
    monthly: 29,
    yearly: 23,
    description: "For teams that want more headroom, advanced tooling, and priority support.",
    badge: null,
    accent: "violet" as const,
    cta: { label: "Coming soon", href: "#", external: false, soon: true },
    features: [
      "Everything in Pro",
      "Unlimited usage",
      "Advanced logs & analytics",
      "Team seat management",
      "30+ days log retention",
      "Priority infrastructure",
      "Future API access",
      "Priority support",
    ],
  },
] as const;

// ── comparison table ──────────────────────────────────────────────────────────

const ROWS: { label: string; FREE: string | null; PRO: string | null; TEAM: string | null }[] = [
  { label: "Active tunnels",    FREE: "1",            PRO: "Unlimited",        TEAM: "Unlimited" },
  { label: "Public URLs",       FREE: "Random only",  PRO: "Custom domains",   TEAM: "Custom domains" },
  { label: "Requests / day",    FREE: "100",          PRO: "10,000+",          TEAM: "Unlimited" },
  { label: "Request history",   FREE: "Last 50",      PRO: "Full history",     TEAM: "Full history" },
  { label: "Webhook debugging", FREE: "Basic",        PRO: "Full debugger",    TEAM: "Full + advanced" },
  { label: "AI explain",        FREE: "5 / day",      PRO: "Unlimited",        TEAM: "Unlimited" },
  { label: "Log retention",     FREE: "~1 hour",      PRO: "7 – 30 days",      TEAM: "30+ days" },
  { label: "Custom domains",    FREE: null,           PRO: "Included",         TEAM: "Included" },
  { label: "Advanced logs",     FREE: null,           PRO: null,               TEAM: "Included" },
  { label: "Team management",   FREE: null,           PRO: null,               TEAM: "Included" },
  { label: "Priority routing",  FREE: null,           PRO: "Included",         TEAM: "Priority infra" },
  { label: "API access",        FREE: null,           PRO: "Planned",          TEAM: "Future-ready" },
  { label: "Support",           FREE: "Community",    PRO: "Fast support",     TEAM: "Priority support" },
];

// ── helpers ───────────────────────────────────────────────────────────────────

function Cell({ value }: { value: string | null }) {
  if (!value) {
    return (
      <span className="inline-flex items-center justify-center">
        <Minus className="h-3.5 w-3.5 text-zinc-700" />
      </span>
    );
  }
  return <span className="text-zinc-300">{value}</span>;
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-screen bg-[#000000] text-white">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/[0.06]">
        {/* grid bg */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* radial glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[600px] -translate-x-1/2 rounded-full bg-miransas-cyan/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-24 text-center lg:px-8 lg:pt-32">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-miransas-cyan/20 bg-miransas-cyan/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-miransas-cyan">
            <Zap className="h-3 w-3" />
            Pricing
          </div>

          <h1 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
            Simple, transparent
            <br />
            <span className="bg-gradient-to-r from-miransas-cyan to-[#86a9ff] bg-clip-text text-transparent">
              pricing.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-8 text-zinc-400">
            Start free. Upgrade when you need more tunnels, better debugging, or custom domains.
            No surprises.
          </p>

          {/* billing toggle */}
          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
            <button
              onClick={() => setYearly(false)}
              className={[
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                !yearly
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300",
              ].join(" ")}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={[
                "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                yearly
                  ? "bg-white text-black shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300",
              ].join(" ")}
            >
              Yearly
              <span
                className={[
                  "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest transition-colors",
                  yearly
                    ? "bg-miransas-cyan/20 text-miransas-cyan"
                    : "bg-zinc-700 text-zinc-400",
                ].join(" ")}
              >
                −20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Plan cards ────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const price = yearly ? plan.yearly : plan.monthly;
            const isCyan = plan.accent === "cyan";
            const isViolet = plan.accent === "violet";

            return (
              <div
                key={plan.id}
                className={[
                  "relative flex flex-col rounded-2xl border p-7 transition-all duration-200",
                  isCyan
                    ? "border-miransas-cyan/30 bg-miransas-cyan/[0.03] shadow-[0_0_50px_-15px_rgba(0,255,209,0.2)]"
                    : isViolet
                    ? "border-violet-500/20 bg-violet-500/[0.02]"
                    : "border-white/[0.08] bg-[#07080c]",
                ].join(" ")}
              >
                {/* popular badge */}
                {plan.badge && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2">
                    <div className="rounded-b-xl bg-miransas-cyan px-4 py-1 text-[9px] font-black uppercase tracking-[0.22em] text-black">
                      {plan.badge}
                    </div>
                  </div>
                )}

                {/* plan name + price */}
                <div className="mb-6 pt-3">
                  <p
                    className={[
                      "mb-4 text-[10px] font-bold uppercase tracking-[0.22em]",
                      isCyan
                        ? "text-miransas-cyan"
                        : isViolet
                        ? "text-violet-400"
                        : "text-zinc-500",
                    ].join(" ")}
                  >
                    {plan.name}
                  </p>

                  <div className="flex items-end gap-1.5">
                    <span className="text-5xl font-black tracking-tight text-white">
                      ${price}
                    </span>
                    {price > 0 && (
                      <span className="mb-1.5 text-sm text-zinc-500">/ mo</span>
                    )}
                  </div>

                  {yearly && price > 0 && (
                    <p className="mt-1.5 text-[11px] text-zinc-600">
                      Billed ${price * 12} / year
                    </p>
                  )}

                  <p className="mt-4 text-sm leading-6 text-zinc-500">
                    {plan.description}
                  </p>
                </div>

                {/* CTA */}
                {plan.cta.soon ? (
                  <button
                    disabled
                    className={[
                      "mb-6 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium",
                      isViolet
                        ? "border-violet-500/20 bg-violet-500/[0.06] text-violet-400/50 cursor-not-allowed"
                        : "border-miransas-cyan/20 bg-miransas-cyan/[0.06] text-miransas-cyan/50 cursor-not-allowed",
                    ].join(" ")}
                  >
                    {plan.cta.label}
                  </button>
                ) : (
                  <Link
                    href={plan.cta.href}
                    className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black transition hover:bg-zinc-100 active:scale-[0.98]"
                  >
                    {plan.cta.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}

                {/* divider */}
                <div
                  className={[
                    "mb-5 h-px",
                    isCyan
                      ? "bg-miransas-cyan/10"
                      : isViolet
                      ? "bg-violet-500/10"
                      : "bg-white/[0.06]",
                  ].join(" ")}
                />

                {/* feature list */}
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check
                        className={[
                          "mt-0.5 h-3.5 w-3.5 shrink-0",
                          isCyan
                            ? "text-miransas-cyan"
                            : isViolet
                            ? "text-violet-400"
                            : "text-zinc-600",
                        ].join(" ")}
                      />
                      <span className="leading-5 text-zinc-400">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* ── Comparison table ────────────────────────────────────────────── */}
        <div className="mt-20">
          <h2 className="mb-8 text-center text-xl font-bold tracking-tight text-white">
            Full feature comparison
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                    Feature
                  </th>
                  {PLANS.map((p) => (
                    <th
                      key={p.id}
                      className={[
                        "px-6 py-4 text-[10px] font-bold uppercase tracking-widest",
                        p.accent === "cyan"
                          ? "text-miransas-cyan"
                          : p.accent === "violet"
                          ? "text-violet-400"
                          : "text-zinc-500",
                      ].join(" ")}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {ROWS.map((row) => (
                  <tr key={row.label} className="hover:bg-white/[0.015]">
                    <td className="px-6 py-3.5 text-zinc-500">{row.label}</td>
                    <td className="px-6 py-3.5 text-sm"><Cell value={row.FREE} /></td>
                    <td className="px-6 py-3.5 text-sm"><Cell value={row.PRO} /></td>
                    <td className="px-6 py-3.5 text-sm"><Cell value={row.TEAM} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Self-hosted note ─────────────────────────────────────────────── */}
        <div className="mt-16 rounded-2xl border border-white/[0.06] bg-[#07080c] p-8 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]">
            <Server className="h-5 w-5 text-zinc-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Prefer to self-host?</h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-500">
            Binboi is fully open-source. Run the entire stack — relay server, control plane,
            and database — on your own infrastructure for free, forever. No seat limits, no
            usage caps, no phone-home.
          </p>
          <a
            href="https://github.com/miransas/binboi"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-white/[0.14] hover:text-white"
          >
            View on GitHub
            <ArrowRight className="h-4 w-4" />
          </a>
          <p className="mt-4 text-[11px] text-zinc-700">
            See the{" "}
            <Link href="/blog/self-hosting-guide" className="underline underline-offset-4 transition hover:text-zinc-500">
              self-hosting guide
            </Link>{" "}
            to get started in under 20 minutes.
          </p>
        </div>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {[
            {
              q: "When will Pro and Team be available?",
              a: "Paddle billing integration is in progress. Sign up now and you'll be notified as soon as payments go live. All early adopters get a discount.",
            },
            {
              q: "Is there a free trial for paid plans?",
              a: "Yes — once billing launches, Pro and Team will include a 14-day trial. No credit card required to start.",
            },
            {
              q: "Can I change plans later?",
              a: "Yes. You can upgrade or downgrade at any time. Upgrades take effect immediately; downgrades apply at the next billing period.",
            },
            {
              q: "What counts as a request?",
              a: "Any HTTP request forwarded through a Binboi tunnel — including webhook deliveries, browser requests, and API calls.",
            },
          ].map((item) => (
            <div key={item.q} className="rounded-xl border border-white/[0.06] bg-[#07080c] p-6">
              <p className="mb-2 font-semibold text-white">{item.q}</p>
              <p className="text-sm leading-7 text-zinc-500">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

    
    </div>
  );
}
