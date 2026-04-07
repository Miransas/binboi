"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const toc = [
  { id: "flow", title: "Flow" },
  { id: "endpoints", title: "Endpoints" },
  { id: "policy", title: "Replay policy" },
  { id: "exports", title: "Archive & export" },
  { id: "failure-modes", title: "Failure modes" },
];

export default function RequestReplayPage() {
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
              Debugging
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Archive, export, and replay without guessing.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Request replay in Binboi is an operator tool, not blind transport
              duplication. The control plane stores archive data, exposes export
              views, applies replay policy, and records replay outcomes in the
              audit trail.
            </p>
          </motion.div>

          <section id="flow" className="mb-24 scroll-mt-20">
            <div className="mb-8 border-l border-zinc-800 pl-6">
              <h2 className="text-2xl font-semibold text-white">Basic operator flow</h2>
              <p className="mt-2 text-zinc-400">
                Confirm tunnel health first, then move through archive and replay
                in a fixed order.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "List request history and find the target request id.",
                "Fetch the full archive for headers, bodies, metadata, and replay policy.",
                "Inspect provider, delivery id, event type, and signature context.",
                "Replay once through the public proxy path.",
                "Confirm the replayed request lands back in request history with replay_of_request_id.",
                "Check request.replay, request.replay.blocked, or request.replay.failed in the audit trail.",
              ].map((line, index) => (
                <div key={line} className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/25 p-5">
                  <div className="mt-0.5 text-xs font-medium text-cyan-500">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <p className="text-sm leading-6 text-zinc-300">{line}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="endpoints" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Core endpoints</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-black/35">
              <div className="border-b border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Request operations
              </div>
              <pre className="overflow-x-auto px-4 py-5 text-sm leading-7 text-zinc-300">
                <code>{`GET  /api/v1/requests
GET  /api/v1/requests/:id/archive
GET  /api/v1/requests/export
POST /api/v1/requests/:id/replay

GET  /api/v1/events?action=request.replay
GET  /api/v1/events?action=request.replay.blocked
GET  /api/v1/events?action=request.replay.failed`}</code>
              </pre>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ["filters", "Use provider, event_type, delivery_id, method, path_prefix, status, since, until, and sort."],
                ["archive", "Archive includes text or base64 bodies, headers, metadata, and replay policy."],
                ["summary export", "Use summary=true when you only need ids, status, timing, and route context."],
                ["gzip export", "Export responses can be gzip-compressed for lighter operator handoff."],
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

          <section id="policy" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Replay policy is intentional</h2>
            <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>
                Replay is blocked if the request body was truncated, if the
                request is already a replay, or if the original request has hit
                its replay cap.
              </p>
              <p>
                Binboi also enforces hourly replay quota per access scope and
                sends redelivery headers like
                <code className="mx-1 text-cyan-400">X-Binboi-Redelivery</code>,
                <code className="mx-1 text-cyan-400">X-Binboi-Redelivery-Attempt</code>,
                and provider-specific context.
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-black/35">
              <div className="border-b border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Provider-aware notes
              </div>
              <pre className="overflow-x-auto px-4 py-5 text-sm leading-7 text-zinc-300">
                <code>{`GitHub  -> dedupe around X-GitHub-Delivery
Stripe -> replay is manual header replay, not a Stripe-native retry
Clerk  -> check Svix-Id and signature freshness
Generic -> fallback dedupe key becomes binboi-request:<request-id>`}</code>
              </pre>
            </div>
          </section>

          <section id="exports" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Archive and export posture</h2>
            <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>
                Archived request and response bodies stay raw in SQLite so replay
                stays correct.
              </p>
              <p>
                Export responses can be compressed and are protected by
                <code className="mx-1 text-cyan-400">BINBOI_EXPORT_MAX_BYTES</code>.
                If an export is too large, tighten filters or lower the limit.
              </p>
              <p>
                Use <code className="text-cyan-400">summary=true</code> for
                faster incident handoff when full previews and metadata are not
                needed.
              </p>
            </div>
          </section>

          <section id="failure-modes" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Most common replay failure modes</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-black/30">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-200">
                  <tr>
                    <th className="px-4 py-3">Case</th>
                    <th className="px-4 py-3">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-400">
                  <tr>
                    <td className="px-4 py-4 text-white">409 replay blocked</td>
                    <td className="px-4 py-4">Nested replay, truncated body, or per-request replay cap reached.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 text-white">403 replay quota</td>
                    <td className="px-4 py-4">Hourly replay quota for the current plan or scope was exhausted.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 text-white">502 or 503</td>
                    <td className="px-4 py-4">Tunnel is offline, stream could not open, or upstream rejected the replayed request.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 text-white">upstream reject after replay</td>
                    <td className="px-4 py-4">Often valid for freshness, timestamp, or dedupe-sensitive providers.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-24">
            <h2 className="text-2xl font-semibold text-white">Related guides</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["/docs/requests", "Requests", "Start with captured request history before moving into archive and replay."],
                ["/docs/audit-export", "Audit Export", "Export replay success, blocked, or failed actions for incident review."],
                ["/docs/operator-snapshot", "Operator Snapshot", "Check recent critical events before opening a replay incident."],
                ["/docs/smoke-testing", "Smoke Testing", "Fold one replay pass into your release-day validation loop when needed."],
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
                        layoutId="request-replay-active"
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
