import { ArrowUpRight, Layers, Zap } from "lucide-react";

;

type ShowcaseCard = {
  name: string;
  role: string;
  what: string;
  stack: string[];
  accent: string;
  accentBg: string;
  accentBorder: string;
  quote?: string;
};

const CARDS: ShowcaseCard[] = [
  {
    name: "Stripe payment flows",
    role: "Fintech startup · 4-person team",
    what: "Replaced ngrok with a self-hosted Binboi relay to receive live Stripe checkout.session.completed events on localhost. Zero redeploys needed when switching between test and live mode keys.",
    stack: ["Next.js", "Stripe", "Go", "Caddy"],
    accent: "#00ffd1",
    accentBg: "rgba(0,255,209,0.06)",
    accentBorder: "rgba(0,255,209,0.15)",
    quote: "Stopped losing Stripe events mid-session when the tunnel dropped. Binboi reconnects automatically.",
  },
  {
    name: "Clerk auth webhooks",
    role: "SaaS product · solo developer",
    what: "Wired Clerk's user.created and session.created events directly to a local Next.js API route. Used Binboi's request inspection to verify svix signatures and trace payload shape before writing the handler.",
    stack: ["Next.js", "Clerk", "TypeScript", "Drizzle"],
    accent: "#86a9ff",
    accentBg: "rgba(134,169,255,0.06)",
    accentBorder: "rgba(134,169,255,0.15)",
    quote: "Request inspection told me the payload structure before I wrote a single line of handler code.",
  },
  {
    name: "GitHub Actions CI triggers",
    role: "Open-source project · 2 maintainers",
    what: "Exposed a local webhook receiver to GitHub's push events during workflow development. Iterating on handler logic without pushing a commit for every test cut the feedback loop from minutes to seconds.",
    stack: ["Go", "GitHub Actions", "Docker", "Binboi CLI"],
    accent: "#ff00ff",
    accentBg: "rgba(255,0,255,0.06)",
    accentBorder: "rgba(255,0,255,0.15)",
    quote: "Cut 20-minute GitHub Actions feedback loops to under 30 seconds on localhost.",
  },
  {
    name: "Supabase realtime dev",
    role: "Agency · 8-person team",
    what: "Ran Supabase database webhooks against a local Express handler to test row-level change events. Binboi's stable subdomain meant the Supabase hook URL never needed updating between sessions.",
    stack: ["Supabase", "Express", "PostgreSQL", "Node.js"],
    accent: "#00ffd1",
    accentBg: "rgba(0,255,209,0.06)",
    accentBorder: "rgba(0,255,209,0.15)",
    quote: "The stable URL means we set the Supabase webhook once and never touch it again during dev.",
  },
  {
    name: "Client demo environment",
    role: "Freelancer · design & development",
    what: "Shared a live localhost preview with clients using a named tunnel like client-preview.domain.com. No staging server, no deploy pipeline, just a tunnel to a local Next.js dev server running the latest build.",
    stack: ["Next.js", "Vercel (prod only)", "Tailwind", "Binboi"],
    accent: "#86a9ff",
    accentBg: "rgba(134,169,255,0.06)",
    accentBorder: "rgba(134,169,255,0.15)",
    quote: "Clients get a real URL, I get feedback on actual code instead of screenshots.",
  },
  {
    name: "Internal tooling portal",
    role: "Engineering team · 12 developers",
    what: "Self-hosted Binboi on an internal VPS so developers can expose services to colleagues without touching the production VPN. Each developer gets named tunnels tied to their access token.",
    stack: ["Go", "Docker Compose", "Caddy", "PostgreSQL"],
    accent: "#ff00ff",
    accentBg: "rgba(255,0,255,0.06)",
    accentBorder: "rgba(255,0,255,0.15)",
    quote: "Every dev on the team can share a live local service in 10 seconds. No VPN drama.",
  },
];

export const metadata = {
  title: "Showcase | Binboi",
  description: "Real teams using Binboi to debug webhooks, share local previews, and cut local dev friction.",
};

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/[0.06]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* ambient glows */}
        <div className="pointer-events-none absolute -left-40 top-0 h-[400px] w-[600px] rounded-full bg-miransas-cyan opacity-[0.04] blur-[100px]" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[400px] w-[600px] rounded-full bg-[#ff00ff] opacity-[0.04] blur-[100px]" />

        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#86a9ff]/20 bg-[#86a9ff]/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#86a9ff]">
            <Zap className="h-3 w-3" />
            Showcase
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
            Built with Binboi.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400">
            Real use cases from developers and teams who replaced managed tunnel services with a
            self-hosted Binboi relay — saving money, gaining visibility, and shipping faster.
          </p>

          <div className="mt-10 flex flex-wrap gap-6">
            {[
              { label: "Use cases", value: CARDS.length.toString() },
              { label: "Avg. setup time", value: "< 5 min" },
              { label: "Self-hosted cost", value: "~$5/mo" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="text-2xl font-black text-white">{stat.value}</span>
                <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Card grid ─────────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <article
              key={card.name}
              className="group flex flex-col rounded-2xl border border-white/[0.08] bg-[#07080c] transition-all duration-200 hover:border-white/[0.14] hover:bg-[#0b0c11]"
            >
              {/* top accent bar */}
              <div
                className="h-[2px] w-full rounded-t-2xl"
                style={{ background: card.accent, opacity: 0.5 }}
              />

              <div className="flex flex-1 flex-col p-6">
                {/* name + role */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-white leading-snug">{card.name}</h2>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                      {card.role}
                    </p>
                  </div>
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border"
                    style={{ background: card.accentBg, borderColor: card.accentBorder }}
                  >
                    <Layers className="h-4 w-4" style={{ color: card.accent }} />
                  </div>
                </div>

                {/* what they built */}
                <p className="mt-4 flex-1 text-sm leading-7 text-zinc-400">
                  {card.what}
                </p>

                {/* quote */}
                {card.quote && (
                  <blockquote
                    className="mt-5 rounded-xl border-l-2 py-2 pl-4 text-sm italic leading-7"
                    style={{
                      borderColor: card.accent,
                      color: "rgba(255,255,255,0.55)",
                      background: card.accentBg,
                    }}
                  >
                    &quot;{card.quote}&quot;
                  </blockquote>
                )}

                {/* tech stack */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {card.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-zinc-400"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* ── Submit your use case ──────────────────────────────────── */}
        <div className="mt-16 flex flex-col items-center gap-5 rounded-2xl border border-white/[0.08] bg-[#07080c] px-8 py-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-miransas-cyan/20 bg-miransas-cyan/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-miransas-cyan">
            Share yours
          </div>
          <h2 className="text-2xl font-black tracking-[-0.03em] text-white">
            Using Binboi in production?
          </h2>
          <p className="max-w-md text-sm leading-7 text-zinc-400">
            Open an issue or PR on GitHub with a brief description of what you built. We review
            every submission and add it to this page.
          </p>
          <a
            href="https://github.com/miransas/binboi/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition hover:border-white/22 hover:bg-white/[0.08]"
          >
            Submit on GitHub
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </main>
    </div>
  );
}
