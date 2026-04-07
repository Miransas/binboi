"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const toc = [
  { id: "endpoints", title: "Endpoints" },
  { id: "counters", title: "Counters" },
  { id: "request-id", title: "Request IDs" },
  { id: "rollout", title: "Rollout checks" },
];

export default function MetricsPage() {
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
              Measure the control plane before guessing.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Binboi exposes both JSON and Prometheus-style metrics so you can
              validate request flow, tunnel health, replay behavior, and rate
              limiting during smoke tests or production incidents.
            </p>
          </motion.div>

          <section id="endpoints" className="mb-24 scroll-mt-20">
            <div className="mb-8 border-l border-zinc-800 pl-6">
              <h2 className="text-2xl font-semibold text-white">Metrics endpoints</h2>
              <p className="mt-2 text-zinc-400">
                Use JSON when building dashboards or scripts. Use Prometheus
                text when scraping or validating raw metric names.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-black/35">
              <div className="border-b border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Endpoints
              </div>
              <pre className="overflow-x-auto px-4 py-5 text-sm leading-7 text-zinc-300">
                <code>{`GET /api/metrics
GET /api/v1/metrics
GET /metrics`}</code>
              </pre>
            </div>

            <div className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>
                <code className="text-cyan-400">/api/v1/metrics</code> returns a
                structured snapshot with fields like uptime, active tunnel
                sessions, stored request counts, replay counters, and rate-limit
                totals.
              </p>
              <p>
                <code className="text-cyan-400">/metrics</code> exposes the same
                state in Prometheus text format for scrape-based monitoring.
              </p>
            </div>
          </section>

          <section id="counters" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">The counters that matter first</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["binboi_api_requests_total", "Control plane API volume."],
                ["binboi_api_rate_limited_total", "How often API requests are rejected by rate limiting."],
                ["binboi_proxy_requests_total", "Public proxy traffic count."],
                ["binboi_proxy_rate_limited_total", "Public requests rejected before they reached a tunnel."],
                ["binboi_request_replays_total", "Successful replay count."],
                ["binboi_request_replay_failed_total", "Replay attempts that reached dispatch but still failed."],
                ["binboi_request_replay_blocked_total", "Replay attempts blocked by policy or quota."],
                ["binboi_tunnel_connections_total", "Accepted tunnel handshakes."],
                ["binboi_tunnel_rejections_total", "Rejected tunnel handshakes."],
                ["binboi_active_tunnel_sessions", "Current live tunnel sessions."],
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

          <section id="request-id" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Request IDs make metrics useful</h2>
            <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>
                Binboi attaches <code className="text-cyan-400">X-Request-ID</code>
                to API and proxy responses. The same id is written into logs and
                related audit records.
              </p>
              <p>
                That means you can move from a failing curl response to logs,
                audit, request history, and snapshot context without guessing
                which request line matters.
              </p>
            </div>
          </section>

          <section id="rollout" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Fast rollout checks</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-black/35">
              <div className="border-b border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Quick validation
              </div>
              <pre className="overflow-x-auto px-4 py-5 text-sm leading-7 text-zinc-300">
                <code>{`curl -i -s -H 'Authorization: Bearer <token>' \\
  http://127.0.0.1:9080/api/v1/metrics

curl -s -H 'Authorization: Bearer <token>' \\
  http://127.0.0.1:9080/metrics`}</code>
              </pre>
            </div>

            <div className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>After opening a tunnel, confirm tunnel connections increase.</p>
              <p>After hitting the public URL, confirm proxy request counters rise.</p>
              <p>If replay testing is part of the rollout, confirm the replay counters move in the expected bucket.</p>
            </div>
          </section>

          <section className="mb-24">
            <h2 className="text-2xl font-semibold text-white">Related guides</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["/docs/operator-snapshot", "Operator Snapshot", "See how metrics fit into one operator view with readiness and limits."],
                ["/docs/smoke-testing", "Smoke Testing", "Use metrics movement as one of the release-day pass conditions."],
                ["/docs/audit-export", "Audit Export", "Pivot from a metric spike into a filtered incident export."],
                ["/docs/request-replay", "Request Replay", "Check replay counters while validating archive and redelivery flows."],
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
                        layoutId="metrics-active"
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
