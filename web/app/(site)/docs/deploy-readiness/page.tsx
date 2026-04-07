"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const toc = [
  { id: "preflight", title: "Preflight" },
  { id: "modes", title: "Modes" },
  { id: "builds", title: "Build checks" },
  { id: "smoke", title: "Smoke path" },
  { id: "dependencies", title: "External deps" },
];

export default function DeployReadinessPage() {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0% -35% 0%", threshold: 0.45 },
    );

    toc.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 selection:bg-cyan-500/20 selection:text-cyan-100">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:flex lg:gap-x-12">
        <main className="flex-1 lg:max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-500">Deployment</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Use one final operator checklist before you call Binboi ready.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Deploy readiness is the point where build status, auth posture,
              public forwarding, request persistence, domains, and TLS all need
              to agree. This page condenses that final decision path.
            </p>
          </motion.div>

          <section id="preflight" className="mb-24 scroll-mt-20">
            <div className="mb-8 border-l border-zinc-800 pl-6">
              <h2 className="text-2xl font-semibold text-white">Preflight checks</h2>
              <p className="mt-2 text-zinc-400">Clear these before you spend time on tunnel debugging.</p>
            </div>
            <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>Confirm Go can reach SQLite and Postgres-backed auth.</p>
              <p>Confirm Next.js can reach Postgres and has a valid <code className="text-cyan-400">AUTH_SECRET</code>.</p>
              <p>Confirm preview mode is disabled in production-like environments.</p>
              <p>Confirm the public base domain points at the intended proxy path.</p>
            </div>
          </section>

          <section id="modes" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Supported deployment modes</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["local preview", "Fast tunnel loop only. Not the real auth path."],
                ["local full-stack", "Best serious local product validation mode."],
                ["shared staging", "Separate Go and web services with shared Postgres and public ingress."],
                ["production-like", "Real auth, real DNS, preview disabled, real TLS posture."],
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                  <div className="text-sm font-medium text-white">{title}</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="builds" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Build checks</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-black/35">
              <div className="border-b border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">Go and web verification</div>
              <pre className="overflow-x-auto px-4 py-5 text-sm leading-7 text-zinc-300">
                <code>{`mkdir -p .gocache
GOCACHE=$(pwd)/.gocache go test ./...
go build -o /tmp/binboi-server ./cmd/binboi-server
go build -o /tmp/binboi ./cmd/binboi-client

cd web
npm run lint
npx tsc --noEmit
npm run build`}</code>
              </pre>
            </div>
          </section>

          <section id="smoke" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Smoke path that matters most</h2>
            <div className="mt-6 space-y-4">
              {[
                "Authenticate through the real dashboard flow.",
                "Create one access token and verify binboi whoami.",
                "Open one tunnel through the CLI.",
                "Hit the public URL once.",
                "Confirm request persistence and audit visibility.",
                "If custom domains are in scope, verify the intended hosts before public release.",
              ].map((line, index) => (
                <div key={line} className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/25 p-5">
                  <div className="mt-0.5 text-xs font-medium text-cyan-500">{String(index + 1).padStart(2, "0")}</div>
                  <p className="text-sm leading-6 text-zinc-300">{line}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="dependencies" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">External dependencies that still matter</h2>
            <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p><code className="text-cyan-400">DATABASE_URL</code> and <code className="text-cyan-400">BINBOI_AUTH_DATABASE_URL</code></p>
              <p><code className="text-cyan-400">AUTH_SECRET</code></p>
              <p>OAuth credentials if social login is exposed</p>
              <p>Email delivery if verification, invites, or password reset are live</p>
              <p>Billing credentials if pricing and checkout are part of the release</p>
            </div>
          </section>

          <section className="mb-24">
            <h2 className="text-2xl font-semibold text-white">Related guides</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["/docs/environments", "Environments", "Choose the right operating mode before applying this checklist."],
                ["/docs/staging-runbook", "Staging Runbook", "Use the shortest staging bring-up order after preflight."],
                ["/docs/smoke-testing", "Smoke Testing", "Run the fastest validation loop before a release decision."],
                ["/docs/production-domains", "Production Domains", "Verify real host rollout when DNS and TLS are in scope."],
              ].map(([href, title, description]) => (
                <Link key={href} href={href} className="rounded-2xl border border-zinc-800 bg-zinc-900/25 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-900/40">
                  <div className="text-sm font-medium text-white">{title}</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <aside className="hidden lg:block lg:w-64">
          <div className="sticky top-16">
            <div className="mb-6 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500">On this page</div>
            <nav className="relative">
              <div className="absolute left-0 top-0 h-full w-px bg-zinc-800" />
              <ul className="space-y-4">
                {toc.map((item) => (
                  <li key={item.id} className="relative pl-6">
                    {activeId === item.id ? <motion.div layoutId="deploy-readiness-active" className="absolute left-0 top-0 h-full w-0.5 bg-cyan-500" /> : null}
                    <button
                      onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
                      className={activeId === item.id ? "text-left text-sm font-medium text-cyan-400" : "text-left text-sm text-zinc-500 transition-colors hover:text-zinc-300"}
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
}
