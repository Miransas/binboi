import Link from "next/link";
import { ArrowRight, CheckCircle2, Globe, Shield, Waypoints } from "lucide-react";

const featureCards = [
  {
    title: "Public URL in seconds",
    description: "Expose `localhost` with a small Go client and a single relay connection.",
    icon: Globe,
  },
  {
    title: "Single-connection multiplexing",
    description: "Yamux keeps one tunnel session open and forwards multiple HTTP streams through it.",
    icon: Waypoints,
  },
  {
    title: "Safer first release",
    description: "The frontend now falls back cleanly when the API or auth stack is not available yet.",
    icon: Shield,
  },
];

const quickStart = [
  "Start the relay server on your VPS or local machine.",
  "Authenticate the CLI with your Binboi token.",
  "Open a tunnel to your local app and share the generated URL.",
];

export default function Home() {
  return (
    <main className="bg-[#050505] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,255,209,0.16),_transparent_45%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-miransas-cyan/60 to-transparent" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center gap-12 px-6 pb-20 pt-36 lg:flex-row lg:items-center lg:gap-16">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-miransas-cyan/20 bg-miransas-cyan/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-miransas-cyan">
              Tunnel core preview
            </div>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              Binboi turns your local service into a public endpoint.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              This project is an ngrok-style tunnel stack built with Go on the relay side and
              Next.js on the control-plane side. It is now trimmed down to a stable starter
              version instead of a half-finished animation shell.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-miransas-cyan px-6 py-3 text-sm font-bold text-black transition hover:brightness-110"
              >
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
              >
                Read Docs
              </Link>
            </div>
          </div>

          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-zinc-950/80 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Tunnel flow</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Local to public</h2>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                Ready
              </span>
            </div>

            <div className="mt-6 space-y-4 font-mono text-sm text-zinc-300">
              <div className="rounded-2xl border border-white/8 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">CLI</p>
                <p className="mt-2 text-miransas-cyan">binboi start 3000 my-app</p>
              </div>
              <div className="flex items-center gap-3 text-zinc-500">
                <div className="h-px flex-1 bg-white/10" />
                relay
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Public URL</p>
                <p className="mt-2 break-all text-white">https://my-app.binboi.link</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {featureCards.map(({ title, description, icon: Icon }) => (
            <article key={title} className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
              <div className="inline-flex rounded-2xl border border-miransas-cyan/20 bg-miransas-cyan/10 p-3 text-miransas-cyan">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-miransas-cyan">
              Quick start
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white">A smaller surface, a clearer path</h2>
            <p className="mt-4 max-w-2xl text-zinc-400">
              The first goal is reliability: no blank landing page, no dead navigation, and a
              dashboard that still tells you what to do when the backend is offline.
            </p>
          </div>

          <div className="space-y-4">
            {quickStart.map((step) => (
              <div key={step} className="flex gap-3 rounded-2xl border border-white/10 bg-black/30 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-miransas-cyan" />
                <p className="text-sm leading-7 text-zinc-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
