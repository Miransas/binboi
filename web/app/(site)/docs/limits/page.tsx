"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const toc = [
  { id: "endpoint", title: "Limits endpoint" },
  { id: "plans", title: "Plan model" },
  { id: "headers", title: "Quota headers" },
  { id: "reading-limits", title: "How to read them" },
];

export default function LimitsPage() {
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
              Operations
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Read plan quotas before users hit them.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Binboi exposes runtime quota state directly so operators can see
              plan posture, remaining budget, replay limits, and retention
              windows without reverse-engineering headers by hand.
            </p>
          </motion.div>

          <section id="endpoint" className="mb-24 scroll-mt-20">
            <div className="mb-8 border-l border-zinc-800 pl-6">
              <h2 className="text-2xl font-semibold text-white">Limits endpoint</h2>
              <p className="mt-2 text-zinc-400">
                This is the cleanest way to inspect per-scope quotas.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-black/35">
              <div className="border-b border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Endpoints
              </div>
              <pre className="overflow-x-auto px-4 py-5 text-sm leading-7 text-zinc-300">
                <code>{`GET /api/limits
GET /api/v1/limits`}</code>
              </pre>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ["reserved_tunnels", "How many reserved subdomains exist versus the plan cap."],
                ["active_tunnels", "How many tunnels are currently active against the active tunnel limit."],
                ["custom_domains", "Custom domain usage and remaining room."],
                ["requests_per_day", "Daily request budget for the current scope."],
                ["replays_per_hour", "Hourly manual replay quota."],
                ["retention", "Request and event retention windows for the plan."],
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

          <section id="plans" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Current plan model</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-black/30">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-200">
                  <tr>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Reserved</th>
                    <th className="px-4 py-3">Active</th>
                    <th className="px-4 py-3">Domains</th>
                    <th className="px-4 py-3">Requests/day</th>
                    <th className="px-4 py-3">Replays/hour</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-400">
                  <tr>
                    <td className="px-4 py-4 text-white">FREE</td>
                    <td className="px-4 py-4">1</td>
                    <td className="px-4 py-4">1</td>
                    <td className="px-4 py-4">0</td>
                    <td className="px-4 py-4">100</td>
                    <td className="px-4 py-4">10</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 text-white">PRO</td>
                    <td className="px-4 py-4">25</td>
                    <td className="px-4 py-4">25</td>
                    <td className="px-4 py-4">25</td>
                    <td className="px-4 py-4">10000</td>
                    <td className="px-4 py-4">120</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 text-white">SCALE</td>
                    <td className="px-4 py-4">100</td>
                    <td className="px-4 py-4">100</td>
                    <td className="px-4 py-4">100</td>
                    <td className="px-4 py-4">unlimited</td>
                    <td className="px-4 py-4">unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 text-white">PREVIEW</td>
                    <td className="px-4 py-4">3</td>
                    <td className="px-4 py-4">3</td>
                    <td className="px-4 py-4">3</td>
                    <td className="px-4 py-4">1000</td>
                    <td className="px-4 py-4">30</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="headers" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Quota headers on API responses</h2>
            <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>
                Operator routes also emit headers so you can inspect quota state
                from curl, scripts, or dashboards without parsing the whole body.
              </p>
              <p>
                Common examples include
                <code className="mx-1 text-cyan-400">X-Binboi-Plan</code>,
                <code className="mx-1 text-cyan-400">X-Binboi-Quota-Requests-Per-Day-Remaining</code>,
                and
                <code className="mx-1 text-cyan-400">X-Binboi-Quota-Replays-Per-Hour-Remaining</code>.
              </p>
            </div>
          </section>

          <section id="reading-limits" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">How to use limits in practice</h2>
            <div className="mt-6 space-y-4">
              {[
                "Check limits before a demo day or traffic test so request budget surprises do not look like transport failures.",
                "Use replay quota and request history retention together when debugging webhook-heavy incidents.",
                "Treat PREVIEW as a local operator mode, not a production entitlement model.",
                "If a user reports a blocked operation, inspect the specific quota bucket before looking at generic logs.",
              ].map((line, index) => (
                <div key={line} className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/25 p-5">
                  <div className="mt-0.5 text-xs font-medium text-cyan-500">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <p className="text-sm leading-6 text-zinc-300">{line}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-black/35">
              <div className="border-b border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Quick check
              </div>
              <pre className="overflow-x-auto px-4 py-5 text-sm leading-7 text-zinc-300">
                <code>{`curl -i -s -H 'Authorization: Bearer <token>' \\
  http://127.0.0.1:9080/api/v1/limits`}</code>
              </pre>
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
                        layoutId="limits-active"
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
