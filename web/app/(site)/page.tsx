import Link from "next/link";
import {
  ArrowRight,
  Command,
  Globe,
  ShieldCheck,
  Webhook,
} from "lucide-react";

import { BinboiAssistant } from "@/components/shared/binboi-assistant";
import {
  SitePageShell,
  SitePanel,
  SiteSectionHeader,
} from "@/components/site/shared/site-primitives";
import { integrationCards } from "@/content/site-content";

const heroStats = [
  { label: "Core surface", value: "HTTP tunnels", note: "Built first and kept honest." },
  { label: "Debugging focus", value: "Webhooks + requests", note: "Headers, payloads, logs, and failure context." },
  { label: "Auth model", value: "Access tokens", note: "Dashboard users and CLI machines are separate." },
];

const workflowSteps = [
  {
    title: "Create a token in the dashboard",
    description:
      "Operators create revocable access tokens once, copy them exactly once, and hand machines the minimum credential they need.",
  },
  {
    title: "Attach the CLI to your local service",
    description:
      "Run `binboi login --token <token>` and `binboi start 3000 my-app` to reserve a public URL and bind it to localhost.",
  },
  {
    title: "Inspect what actually happened",
    description:
      "Move from transport reachability to debugging reality with request context, webhook patterns, runtime logs, and assistant-guided troubleshooting.",
  },
];

export default function Home() {
  return (
    <SitePageShell
      eyebrow="Binboi"
      title="Tunnel localhost, debug webhooks, and keep the control plane readable."
      description="Binboi is a developer tunnel platform with a Go relay, CLI authentication, and a calmer dashboard for request and webhook debugging. It feels self-hostable, product-led, and honest about what is live versus still MVP."
    >
      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <SitePanel className="overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,_rgba(0,255,209,0.1),_transparent_34%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-miransas-cyan/15 bg-miransas-cyan/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-miransas-cyan">
              <ShieldCheck className="h-3.5 w-3.5" />
              Self-hosted tunnel control plane
            </div>

            <h2 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl">
              A premium developer workflow for the messy moment between localhost and the public internet.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400">
              Binboi starts where simple tunnel tools stop. You still get a public URL fast, but
              the product is designed around what you need next: clean token auth, request
              visibility, webhook debugging, and a dashboard that tells the operational truth.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-miransas-cyan px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
              >
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs/quick-start"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                Start with docs
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {heroStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.5rem] border border-white/10 bg-black/35 p-4"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                    {item.label}
                  </p>
                  <p className="mt-3 text-lg font-semibold text-white">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{item.note}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Command className="h-4 w-4 text-miransas-cyan" />
                  CLI first
                </div>
                <pre className="mt-4 overflow-x-auto rounded-[1.25rem] border border-white/10 bg-black/60 p-4 text-sm leading-7 text-miransas-cyan">
                  <code>{`brew install binboi/tap/binboi
binboi login --token <token>
binboi whoami
binboi start 3000 my-app`}</code>
                </pre>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Webhook className="h-4 w-4 text-miransas-cyan" />
                  Request visibility
                </div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
                  <p>Public URL: `https://stripe-dev.binboi.link/webhooks/stripe`</p>
                  <p>Status: `500 APPLICATION_500` after signature verification.</p>
                  <p>Next clue: compare `stripe-signature`, raw-body handling, and the route your app actually exposed on localhost.</p>
                </div>
              </div>
            </div>
          </div>
        </SitePanel>

        <BinboiAssistant
          variant="hero"
          storageKey="site-home-hero"
          title="Ask Binboi before you start redeploying"
          description="Search docs, product pages, live tunnel context, and troubleshooting guidance from one assistant surface. When server-side AI credentials are configured, it adds concise summaries without exposing any secret to the browser."
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SitePanel>
          <SiteSectionHeader
            eyebrow="Inspection"
            title="Built for the request after the first public 200"
            description="Getting a public URL is step one. The harder problem is understanding whether the right request arrived, which route handled it, and why the provider or app still failed."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Request inspection
              </p>
              <p className="mt-3 text-lg font-semibold text-white">
                Headers, payload previews, status, duration, target
              </p>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Binboi keeps moving toward a richer per-request view so developers can answer what
                reached the app without reading an entire transport stream.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Webhook debugging
              </p>
              <p className="mt-3 text-lg font-semibold text-white">
                Signature failures, retries, and route mismatches
              </p>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Stripe, Clerk, Supabase, GitHub, Neon, and Linear all surface the same debugging
                questions in different wrappers. Binboi keeps those patterns close to the docs.
              </p>
            </div>
          </div>
        </SitePanel>

        <SitePanel>
          <SiteSectionHeader
            eyebrow="How it works"
            title="One relay, one CLI session, one calmer debugging loop"
            description="The product stays narrow on purpose: reliable HTTP exposure first, then visibility and operational polish around it."
          />
          <div className="mt-6 space-y-4">
            {workflowSteps.map((step, index) => (
              <div
                key={step.title}
                className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-black/35 p-5 sm:grid-cols-[3rem_minmax(0,1fr)] sm:items-start"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-miransas-cyan/15 bg-miransas-cyan/8 text-sm font-semibold text-miransas-cyan">
                  0{index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </SitePanel>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SitePanel>
          <SiteSectionHeader
            eyebrow="Integrations"
            title="The providers that force you to care about callback URLs"
            description="Binboi is strongest when a provider needs to call back into local development and you need more context than a plain tunnel URL can give you."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {integrationCards.map((card) => (
              <article
                key={card.name}
                className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  {card.label}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-white">{card.name}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">{card.summary}</p>
              </article>
            ))}
          </div>
        </SitePanel>

        <SitePanel>
          <SiteSectionHeader
            eyebrow="Docs and install"
            title="CLI onboarding and product docs stay one click away"
            description="The fastest path through Binboi should always be visible, even when the backend is unavailable or a feature is still maturing."
          />
          <div className="mt-6 space-y-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Globe className="h-4 w-4 text-miransas-cyan" />
                HTTP tunnel quick path
              </div>
              <pre className="mt-4 overflow-x-auto rounded-[1.25rem] border border-white/10 bg-black/60 p-4 text-sm leading-7 text-miransas-cyan">
                <code>{`binboi login --token <token>
binboi start 3000 my-app
curl https://my-app.binboi.link/health`}</code>
              </pre>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/docs"
                className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5 transition hover:border-white/20 hover:bg-white/[0.03]"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Documentation
                </p>
                <h3 className="mt-3 text-lg font-semibold text-white">Explore the guides</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Installation, authentication, HTTP tunnels, requests, logs, webhooks, and troubleshooting.
                </p>
              </Link>

              <Link
                href="/dashboard/access-tokens"
                className="rounded-[1.5rem] border border-miransas-cyan/20 bg-miransas-cyan/6 p-5 transition hover:brightness-110"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-miransas-cyan">
                  Access tokens
                </p>
                <h3 className="mt-3 text-lg font-semibold text-white">Create a machine credential</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-300">
                  Mint a dashboard token, copy it once, and use it with `binboi login`.
                </p>
              </Link>
            </div>
          </div>
        </SitePanel>
      </section>

      <SitePanel>
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <SiteSectionHeader
              eyebrow="Product direction"
              title="A self-hosted tunnel platform that still feels like a product"
              description="Binboi keeps the operating model straightforward: strong HTTP tunnels first, real token auth, a premium dashboard, and clear docs around the debugging work that matters most to developers."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/pricing"
              className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5 transition hover:border-white/20 hover:bg-white/[0.03]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Plans
              </p>
              <h3 className="mt-3 text-lg font-semibold text-white">Free and Pro foundations</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Token and tunnel limits are already visible in the UX, even while billing remains an MVP foundation.
              </p>
            </Link>
            <Link
              href="/blog"
              className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5 transition hover:border-white/20 hover:bg-white/[0.03]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Build notes
              </p>
              <h3 className="mt-3 text-lg font-semibold text-white">Read the product story</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Follow shipping notes, security reasoning, and the product decisions behind Binboi&apos;s current shape.
              </p>
            </Link>
          </div>
        </div>
      </SitePanel>
    </SitePageShell>
  );
}
