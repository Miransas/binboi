import { BookOpen, Globe, Zap, KeyRound, Terminal, Webhook, LifeBuoy, ArrowRight } from "lucide-react";
import Link from "next/link";
import { DocsToc, TocItem } from "./_components/docs-toc";


const toc: TocItem[] = [
  { id: "overview",         title: "Overview" },
  { id: "start-here",       title: "Start here" },
  { id: "core-model",       title: "Core model" },
  { id: "guide-map",        title: "Guide map" },
  { id: "operating-notes",  title: "Operating notes" },
];

const startHereGuides = [
  {
    href: "/docs/quick-start",
    title: "Quick Start",
    description: "Up and running with your first tunnel in under five minutes.",
  },
  {
    href: "/docs/authentication",
    title: "Authentication",
    description: "Dashboard-issued tokens, binboi login, and binboi whoami.",
  },
  {
    href: "/docs/http-tunnels",
    title: "HTTP Tunnels",
    description: "Reserve a public URL and forward traffic to a local port.",
  },
];

const guideGroups = [
  {
    title: "Getting started",
    items: [
      { href: "/docs/quick-start",    title: "Quick Start",     description: "First tunnel in minutes." },
      { href: "/docs/authentication", title: "Authentication",  description: "Tokens and CLI login." },
    ],
  },
  {
    title: "Platform",
    items: [
      { href: "/docs/http-tunnels",     title: "HTTP Tunnels",    description: "Public URLs for localhost." },
      { href: "/docs/webhooks",         title: "Webhooks",        description: "Inspect and replay events." },
      { href: "/docs/cli",              title: "CLI Reference",   description: "Every command and flag." },
      { href: "/docs/troubleshooting",  title: "Troubleshooting", description: "Diagnose and recover." },
    ],
  },
];

const coreModel = [
  { title: "Tunnel",               description: "A reserved route between a public URL and a local target service reachable through a connected agent." },
  { title: "Agent",                description: "The CLI process that authenticates to the relay and forwards traffic to your target port." },
  { title: "Public URL",           description: "The external host assigned by the relay, such as https://orders.binboi.link." },
  { title: "Requests & Webhooks",  description: "HTTP traffic that reaches the relay and is forwarded to your app, including callbacks from third-party providers." },
  { title: "Access Tokens",        description: "Dashboard-issued credentials used by binboi login so the CLI can authenticate securely." },
  { title: "Logs & Dashboard",     description: "Operator-facing visibility into tunnel state, request flow, and lifecycle events across the product." },
];

export default function DocsPage() {
  return (
    <div className="flex gap-8 px-8 py-10 max-w-[1100px] mx-auto">
      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 space-y-16">

        {/* Header */}
        <div className="space-y-4 reveal-up">
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-widest">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Introduction</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground text-balance leading-tight">
            Documentation for shipping tunnels, tokens, and webhook debugging without guessing.
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            Binboi docs are organized as focused guides instead of one giant page. The left rail gives
            you the product map, the center column explains one topic at a time, and the right rail
            keeps the current guide readable while you move through it.
          </p>
          <div className="h-px bg-border mt-2" />
        </div>

        {/* Overview */}
        <section id="overview" className="space-y-6 reveal-up">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary/70">Overview</p>
            <h2 className="text-2xl font-semibold text-foreground">What Binboi is</h2>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Binboi is a tunneling and webhook inspection platform for developers who need public URLs,
              clear CLI authentication, and calmer visibility into what reached their local app.
            </p>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            The platform combines a Go relay, a CLI agent, and a dashboard into one workflow. The relay
            gives you a public entry point, the CLI bridges traffic back to your machine, and the dashboard
            explains what is happening with tunnels, tokens, requests, and webhook events.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { eyebrow: "Expose",   title: "Public URLs for localhost",   description: "Turn a service running on your machine into a reachable public endpoint without deploying a full preview environment first.", color: "text-primary" },
              { eyebrow: "Inspect",  title: "Clear request visibility",    description: "Follow request flow, metadata, and webhook debugging with documentation that matches how the product actually behaves.", color: "text-emerald-400" },
              { eyebrow: "Operate",  title: "Self-hosted control plane",   description: "Run the relay yourself, keep the platform understandable, and build from a coherent HTTP tunnel baseline.", color: "text-amber-400" },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-border bg-card p-5 space-y-2 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                data-hover
              >
                <p className={`text-[11px] font-semibold uppercase tracking-widest ${card.color}`}>{card.eyebrow}</p>
                <p className="text-sm font-semibold text-foreground">{card.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Start here */}
        <section id="start-here" className="space-y-6 reveal-up">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary/70">Start here</p>
            <h2 className="text-2xl font-semibold text-foreground">The fastest path through the docs</h2>
            <p className="text-muted-foreground leading-relaxed mt-2">
              If you are new to Binboi, these three guides are the cleanest sequence.
            </p>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {startHereGuides.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-hover
                className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
              >
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200">{item.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{item.description}</p>
                <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 mt-1" />
              </Link>
            ))}
          </div>
          {/* Code block */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground">Shortest useful path</span>
              <span className="text-[11px] text-muted-foreground/50 font-mono">bash</span>
            </div>
            <pre className="px-5 py-4 text-sm font-mono text-foreground/90 leading-relaxed overflow-x-auto">
              <code>{`brew install binboi/tap/binboi
binboi login --token <dashboard-token>
binboi whoami
binboi start 3000 my-app`}</code>
            </pre>
            <div className="px-5 pb-4">
              <p className="text-xs text-muted-foreground/60 leading-relaxed">
                The current repository uses <code className="text-primary/80 font-mono">binboi start</code> for
                the working HTTP tunnel flow.
              </p>
            </div>
          </div>
        </section>

        {/* Core model */}
        <section id="core-model" className="space-y-6 reveal-up">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary/70">Core model</p>
            <h2 className="text-2xl font-semibold text-foreground">The small set of concepts that powers the whole product</h2>
            <p className="text-muted-foreground leading-relaxed mt-2">
              The product gets easier to operate when you keep the model small and consistent.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {coreModel.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-5 space-y-2 hover:border-primary/20 transition-colors duration-200"
                data-hover
              >
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
          {/* Callout */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 space-y-1">
            <p className="text-sm font-semibold text-primary">The simplest framing</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Binboi is for the moment when you need a public URL for local work, but you also want
              the platform to explain itself instead of behaving like a black box.
            </p>
          </div>
        </section>

        {/* Guide map */}
        <section id="guide-map" className="space-y-6 reveal-up">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary/70">Guide map</p>
            <h2 className="text-2xl font-semibold text-foreground">Explore the docs by operating area</h2>
            <p className="text-muted-foreground leading-relaxed mt-2">
              The information architecture stays the same, but the docs home now acts like a proper index into that structure.
            </p>
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            {guideGroups.map((group) => (
              <div
                key={group.title}
                className="rounded-xl border border-border bg-card p-5 space-y-4"
              >
                <div className="space-y-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">Guide group</p>
                  <h3 className="text-lg font-semibold text-foreground">{group.title}</h3>
                </div>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-hover
                      className="group flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0 ml-3" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Operating notes */}
        <section id="operating-notes" className="space-y-6 reveal-up pb-16">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary/70">Operating notes</p>
            <h2 className="text-2xl font-semibold text-foreground">What the current product is strongest at today</h2>
            <p className="text-muted-foreground leading-relaxed mt-2">
              The docs should tell the truth about what feels mature, what is evolving, and what is still planned.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-6 py-5 text-sm leading-7 text-muted-foreground space-y-3">
            <p>
              The strongest current product surfaces are HTTP tunnels, dashboard-backed access tokens,{" "}
              <code className="text-primary/80 font-mono">binboi login</code>,{" "}
              <code className="text-primary/80 font-mono">binboi whoami</code>, relay event logs, and a
              coherent self-hosted control plane.
            </p>
            <p>
              Richer request inspection, replay ergonomics, and broader runtime surfaces are still
              evolving. The docs call that out directly instead of pretending everything is equally finished.
            </p>
          </div>
          {/* Callout */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 space-y-1">
            <p className="text-sm font-semibold text-emerald-400">Why the docs are organized this way</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Each route focuses on one slice of the product so the documentation stays maintainable,
              easier to scan, and easier to keep honest as Binboi grows.
            </p>
          </div>
        </section>

      </div>

      {/* ── Sticky right TOC ── */}
      <DocsToc items={toc} />
    </div>
  );
}
