"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const toc = [
  { id: "overview", title: "Overview" },
  { id: "payload", title: "Payload" },
  { id: "recent-events", title: "Recent failures" },
  { id: "tunnel-summary", title: "Tunnel summary" },
  { id: "ops-flow", title: "Ops flow" },
];

export default function OperatorSnapshotPage() {
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
              Read the whole control plane in one call.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              The operator snapshot endpoint is the fastest way to answer three
              questions at once: is Binboi healthy, what is failing right now,
              and which tunnels are actually online.
            </p>
          </motion.div>

          <section id="overview" className="mb-24 scroll-mt-20">
            <div className="mb-8 border-l border-zinc-800 pl-6">
              <h2 className="text-2xl font-semibold text-white">Overview</h2>
              <p className="mt-2 text-zinc-400">
                Use snapshot when you want the shortest possible operator
                feedback loop.
              </p>
            </div>

            <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>
                Instead of calling health, readiness, limits, metrics, recent
                events, and tunnel state separately, you can ask the control
                plane for one response and make a release or incident decision
                from there.
              </p>
              <p>
                This is especially useful during staging bring-up, production
                rollout, custom domain validation, or a public demo where you
                need one operator-safe endpoint instead of six tabs.
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-black/30">
              <div className="border-b border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Operator endpoints
              </div>
              <div className="space-y-3 px-4 py-5 text-sm text-zinc-300">
                <div>
                  <code className="text-cyan-400">GET /api/snapshot</code>
                </div>
                <div>
                  <code className="text-cyan-400">GET /api/v1/snapshot</code>
                </div>
                <p className="text-zinc-500">
                  Both routes require control plane access. The v1 route returns
                  the normal envelope with `data` and `meta`.
                </p>
              </div>
            </div>
          </section>

          <section id="payload" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">What the payload gives you</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["health", "Simple heartbeat for the service process."],
                ["readiness", "Auth, DB, TLS, and worker readiness in one view."],
                ["metrics", "Core counters like requests, tunnels, replays, and rate limits."],
                ["limits", "Plan, quota usage, and retention posture for the current access scope."],
                ["recent_critical_events", "Latest warn and error audit events without extra filtering."],
                ["tunnel_summary", "Status counts plus recent tunnel state with active session visibility."],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5"
                >
                  <div className="text-sm font-medium text-white">{title}</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-black/35">
              <div className="border-b border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Example
              </div>
              <pre className="overflow-x-auto px-4 py-5 text-sm leading-7 text-zinc-300">
                <code>{`curl -s \\
  -H 'Authorization: Bearer <token>' \\
  http://127.0.0.1:9080/api/v1/snapshot`}</code>
              </pre>
            </div>
          </section>

          <section id="recent-events" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Recent critical events</h2>
            <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>
                Snapshot now includes the latest `warn` and `error` events so
                an operator can see the most important failures without running
                an extra audit query first.
              </p>
              <p>
                This is useful for problems like rejected tunnel handshakes,
                replay policy blocks, domain verification errors, or auth health
                failures during rollout.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
              <div className="text-sm font-medium text-white">Typical use</div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-400">
                <li>Check whether the newest failure is a `warn` or a hard `error`.</li>
                <li>Correlate `request_id`, `resource_type`, and `resource_id` from the event body.</li>
                <li>Decide whether you need a full audit export or only a small incident slice.</li>
              </ul>
            </div>
          </section>

          <section id="tunnel-summary" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Tunnel summary</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-black/30">
              <div className="border-b border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Included tunnel fields
              </div>
              <div className="grid gap-px bg-zinc-800 sm:grid-cols-2">
                {[
                  "status",
                  "region",
                  "target",
                  "public_url",
                  "request_count",
                  "bytes_out",
                  "last_error",
                  "last_connected_at",
                  "last_disconnected_at",
                  "active_session",
                ].map((field) => (
                  <div
                    key={field}
                    className="bg-zinc-950 px-4 py-3 text-sm text-zinc-300"
                  >
                    {field}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>
                `status_counts` gives you a quick active versus inactive versus
                error breakdown.
              </p>
              <p>
                `recent` lists the latest updated tunnels so you can immediately
                see whether a tunnel is stuck inactive, actively connected, or
                carrying an error like stream failure or proxy trouble.
              </p>
            </div>
          </section>

          <section id="ops-flow" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">How to use it in ops</h2>
            <div className="mt-6 space-y-4">
              {[
                "Call snapshot first during smoke tests, deploy checks, or production triage.",
                "If readiness is degraded, inspect the failing check before looking at request history.",
                "If readiness is healthy but recent critical events exist, use those events to choose the next targeted audit or request query.",
                "If tunnels look wrong, use tunnel summary before opening the full tunnel list.",
                "Only drop into export or replay flows after snapshot tells you which slice matters.",
              ].map((line, index) => (
                <div
                  key={line}
                  className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/25 p-5"
                >
                  <div className="mt-0.5 text-xs font-medium text-cyan-500">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <p className="text-sm leading-6 text-zinc-300">{line}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-black/35">
              <div className="border-b border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Fast staging check
              </div>
              <pre className="overflow-x-auto px-4 py-5 text-sm leading-7 text-zinc-300">
                <code>{`curl -s -H 'Authorization: Bearer <token>' \\
  http://127.0.0.1:9080/api/v1/snapshot

curl -s -H 'Authorization: Bearer <token>' \\
  'http://127.0.0.1:9080/api/v1/events?level=error&limit=20'

curl -s -H 'Authorization: Bearer <token>' \\
  'http://127.0.0.1:9080/api/v1/requests?error_only=true&limit=20'`}</code>
              </pre>
            </div>
          </section>

          <section className="mb-24">
            <h2 className="text-2xl font-semibold text-white">Related guides</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["/docs/readiness", "Readiness", "Understand which checks can move snapshot into degraded or error state."],
                ["/docs/metrics", "Metrics", "Validate the counters snapshot is summarizing."],
                ["/docs/limits", "Quotas & Limits", "Compare tunnel and replay behavior with current plan posture."],
                ["/docs/audit-export", "Audit Export", "Move from recent critical events to portable incident artifacts."],
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
                        layoutId="operator-snapshot-active"
                        className="absolute left-0 top-0 h-full w-0.5 bg-cyan-500"
                      />
                    ) : null}
                    <button
                      onClick={() => {
                        document
                          .getElementById(item.id)
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
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
