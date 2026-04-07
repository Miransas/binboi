"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const toc = [
  { id: "precheck", title: "Pre-check" },
  { id: "preview-stack", title: "Preview stack" },
  { id: "validate", title: "Validate flow" },
  { id: "observability", title: "Observability" },
  { id: "release", title: "Release decision" },
];

export default function SmokeTestingPage() {
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
              Run the shortest serious Binboi validation loop.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Smoke testing is the fastest operator pass before a release, demo,
              or staging push. The goal is simple: prove that auth, tunnel
              handshake, public forwarding, request persistence, and metrics all
              move together.
            </p>
          </motion.div>

          <section id="precheck" className="mb-24 scroll-mt-20">
            <div className="mb-8 border-l border-zinc-800 pl-6">
              <h2 className="text-2xl font-semibold text-white">Pre-check</h2>
              <p className="mt-2 text-zinc-400">Do these first so you do not chase fake tunnel bugs.</p>
            </div>
            <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>Build the Go binaries cleanly.</p>
              <p>Make sure the upstream app is really listening on <code className="text-cyan-400">127.0.0.1:3000</code>.</p>
              <p>Make sure the control plane can start with the env vars you plan to use.</p>
              <p>Confirm you already have a usable access token.</p>
            </div>
          </section>

          <section id="preview-stack" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Quick preview stack</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-black/35">
              <div className="border-b border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">Minimal smoke setup</div>
              <pre className="overflow-x-auto px-4 py-5 text-sm leading-7 text-zinc-300">
                <code>{`mkdir -p .gocache
GOCACHE=$(pwd)/.gocache go test ./...
go build -o /tmp/binboi-server ./cmd/binboi-server
go build -o /tmp/binboi ./cmd/binboi-client

env \\
  BINBOI_API_ADDR=127.0.0.1:9080 \\
  BINBOI_TUNNEL_ADDR=127.0.0.1:9081 \\
  BINBOI_PROXY_ADDR=127.0.0.1:9082 \\
  BINBOI_DATABASE_PATH=/tmp/binboi-preview.db \\
  BINBOI_ALLOW_PREVIEW_MODE=true \\
  /tmp/binboi-server`}</code>
              </pre>
            </div>
          </section>

          <section id="validate" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Validate the full request path</h2>
            <div className="mt-6 space-y-4">
              {[
                "Resolve or create a usable token.",
                "Run binboi whoami against the control plane.",
                "Open one tunnel, usually demo on port 3000.",
                "Hit the public Binboi URL once.",
                "Confirm the request feed records the forwarded request.",
                "If needed, continue into archive and replay after the smoke path is green.",
              ].map((line, index) => (
                <div key={line} className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/25 p-5">
                  <div className="mt-0.5 text-xs font-medium text-cyan-500">{String(index + 1).padStart(2, "0")}</div>
                  <p className="text-sm leading-6 text-zinc-300">{line}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="observability" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Observability checks that must move</h2>
            <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>Check <code className="text-cyan-400">/api/v1/snapshot</code> to see health, readiness, metrics, limits, critical events, and tunnel summary together.</p>
              <p>Check <code className="text-cyan-400">/api/v1/metrics</code> and <code className="text-cyan-400">/metrics</code>.</p>
              <p>Confirm the response includes <code className="text-cyan-400">X-Request-ID</code>.</p>
              <p>After the public request, make sure proxy request counters and tunnel connection counters are not flat.</p>
            </div>
          </section>

          <section id="release" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Release decision</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                <div className="text-sm font-medium text-white">Green-light</div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Build passes, tunnel opens, public forwarding works, request persistence works, and metrics are populated.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                <div className="text-sm font-medium text-white">Block release</div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Valid tokens are rejected, tunnels stay offline, proxy repeats 502 or 503, or the request feed stays empty after known traffic.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-24">
            <h2 className="text-2xl font-semibold text-white">Related guides</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["/docs/deploy-readiness", "Deploy Readiness", "Use the longer final checklist when the fast smoke pass is green."],
                ["/docs/operator-snapshot", "Operator Snapshot", "Pull one operator view during smoke validation."],
                ["/docs/metrics", "Metrics", "Verify the exact counters that should move during the pass."],
                ["/docs/request-replay", "Request Replay", "Continue into archive and replay only after the base smoke path is healthy."],
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
                    {activeId === item.id ? <motion.div layoutId="smoke-testing-active" className="absolute left-0 top-0 h-full w-0.5 bg-cyan-500" /> : null}
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
