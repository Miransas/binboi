"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const toc = [
  { id: "ready-vs-health", title: "Ready vs health" },
  { id: "checks", title: "Checks" },
  { id: "statuses", title: "Statuses" },
  { id: "deploy-gate", title: "Deploy gate" },
];

export default function ReadinessPage() {
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
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-500">
              Diagnostics
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Decide if the control plane is safe to serve traffic.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Binboi exposes readiness separately from simple health so deploy
              gates can distinguish a reachable process from a system that is
              actually safe to operate.
            </p>
          </motion.div>

          <section id="ready-vs-health" className="mb-24 scroll-mt-20">
            <div className="mb-8 border-l border-zinc-800 pl-6">
              <h2 className="text-2xl font-semibold text-white">Health and readiness are not the same</h2>
              <p className="mt-2 text-zinc-400">
                Health answers whether the process responds. Readiness answers
                whether the important dependencies behind routing and auth are
                in a usable state.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/25 p-5">
                <div className="text-sm font-medium text-white">Health</div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Use <code className="text-cyan-400">/api/v1/health</code> for
                  a simple process heartbeat.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/25 p-5">
                <div className="text-sm font-medium text-white">Readiness</div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Use <code className="text-cyan-400">/api/v1/ready</code> when
                  you need a deploy gate or operator answer.
                </p>
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-black/35">
              <div className="border-b border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Endpoints
              </div>
              <pre className="overflow-x-auto px-4 py-5 text-sm leading-7 text-zinc-300">
                <code>{`GET /api/ready
GET /api/v1/ready`}</code>
              </pre>
            </div>
          </section>

          <section id="checks" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">What readiness checks today</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["sqlite", "Confirms the control plane store is configured and reachable."],
                ["auth", "Checks the Postgres-backed auth provider when auth is enabled."],
                ["tls", "Reports whether TLS is external-edge or ACME-backed and whether the ACME manager exists."],
                ["domain_verifier", "Tracks the background domain verification worker, including stale runs and last errors."],
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                  <div className="text-sm font-medium text-white">{title}</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section id="statuses" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">How to read status</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-black/30">
              <div className="grid gap-px bg-zinc-800 sm:grid-cols-3">
                <div className="bg-zinc-950 p-5">
                  <div className="text-sm font-medium text-white">ok</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Core dependencies are healthy and the service is safe to use.
                  </p>
                </div>
                <div className="bg-zinc-950 p-5">
                  <div className="text-sm font-medium text-white">degraded</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Core service still responds, but a worker like domain
                    verification is stale or reporting errors.
                  </p>
                </div>
                <div className="bg-zinc-950 p-5">
                  <div className="text-sm font-medium text-white">error</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    A core dependency failed. The endpoint returns
                    <code className="ml-1 text-cyan-400">503</code>.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="deploy-gate" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Use readiness as the deploy gate</h2>
            <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>Call readiness after the service boots, before you open traffic.</p>
              <p>
                If the endpoint is <code className="text-cyan-400">503</code>,
                do not keep going. Fix the failed core check first.
              </p>
              <p>
                If the status is <code className="text-cyan-400">degraded</code>,
                decide whether the missing worker matters for the rollout. For
                example, a stale domain verifier matters if you are validating
                new custom domains today.
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-black/35">
              <div className="border-b border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Quick check
              </div>
              <pre className="overflow-x-auto px-4 py-5 text-sm leading-7 text-zinc-300">
                <code>{`curl -s -H 'Authorization: Bearer <token>' \\
  http://127.0.0.1:9080/api/v1/ready`}</code>
              </pre>
            </div>
          </section>

          <section className="mb-24">
            <h2 className="text-2xl font-semibold text-white">Related guides</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["/docs/operator-snapshot", "Operator Snapshot", "Use one endpoint when readiness alone is not enough context."],
                ["/docs/deploy-readiness", "Deploy Readiness", "Turn readiness into a full go or no-go launch decision."],
                ["/docs/domains-and-tls", "Domains & TLS", "Know when degraded domain verifier state should block rollout."],
                ["/docs/metrics", "Metrics", "Cross-check readiness problems with runtime counters and request IDs."],
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
            <div className="mb-6 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500">
              On this page
            </div>
            <nav className="relative">
              <div className="absolute left-0 top-0 h-full w-px bg-zinc-800" />
              <ul className="space-y-4">
                {toc.map((item) => (
                  <li key={item.id} className="relative pl-6">
                    {activeId === item.id ? (
                      <motion.div
                        layoutId="readiness-active"
                        className="absolute left-0 top-0 h-full w-0.5 bg-cyan-500"
                      />
                    ) : null}
                    <button
                      onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
                      className={
                        activeId === item.id
                          ? "text-left text-sm font-medium text-cyan-400"
                          : "text-left text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                      }
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
