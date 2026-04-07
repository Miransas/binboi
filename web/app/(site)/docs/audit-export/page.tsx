"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const toc = [
  { id: "endpoints", title: "Endpoints" },
  { id: "filters", title: "Filters" },
  { id: "formats", title: "Formats" },
  { id: "summary", title: "Summary exports" },
  { id: "incident-flow", title: "Incident flow" },
];

export default function AuditExportPage() {
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
              Slice audit history into something operators can actually use.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Audit export is for incident review, handoff, and compliance-style
              traceability. Binboi lets you export event history in lightweight
              or full formats, filtered by time, resource, request id, and scope.
            </p>
          </motion.div>

          <section id="endpoints" className="mb-24 scroll-mt-20">
            <div className="mb-8 border-l border-zinc-800 pl-6">
              <h2 className="text-2xl font-semibold text-white">Audit export endpoints</h2>
              <p className="mt-2 text-zinc-400">
                Use list endpoints when you want to browse. Use export endpoints
                when you need a portable artifact.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-black/35">
              <div className="border-b border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Event endpoints
              </div>
              <pre className="overflow-x-auto px-4 py-5 text-sm leading-7 text-zinc-300">
                <code>{`GET /api/v1/events
GET /api/v1/events/export`}</code>
              </pre>
            </div>
          </section>

          <section id="filters" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Useful filters</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["level", "Filter for info, warn, or error depending on the incident."],
                ["action", "Focus on actions like request.replay or domain.verify."],
                ["resource_type", "Narrow to tunnels, domains, requests, or other resource groups."],
                ["resource_id", "Pull the history for one exact object."],
                ["request_id", "Correlate one request across API, audit, and logs."],
                ["access_scope", "Separate token-based operator actions from trusted-local access."],
                ["since / until", "Build a clean time window around the incident."],
                ["sort", "Use asc for reconstruction and desc for newest-first triage."],
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

          <section id="formats" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Formats and transport</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-black/30">
              <div className="grid gap-px bg-zinc-800 sm:grid-cols-3">
                <div className="bg-zinc-950 p-5">
                  <div className="text-sm font-medium text-white">json</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Best for scripts and human-readable structured payloads.
                  </p>
                </div>
                <div className="bg-zinc-950 p-5">
                  <div className="text-sm font-medium text-white">ndjson</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Best for streaming large event sequences line by line.
                  </p>
                </div>
                <div className="bg-zinc-950 p-5">
                  <div className="text-sm font-medium text-white">csv</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Best for spreadsheets, handoff, and simple ops review.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>
                Audit export can be gzip-compressed when the client sends
                <code className="mx-1 text-cyan-400">Accept-Encoding: gzip</code>.
              </p>
              <p>
                Export size is guarded by
                <code className="mx-1 text-cyan-400">BINBOI_EXPORT_MAX_BYTES</code>.
                If the export is too large, reduce the time window, narrow the
                action or resource filters, or use a summary export.
              </p>
            </div>
          </section>

          <section id="summary" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Use summary mode for handoff</h2>
            <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>
                <code className="text-cyan-400">summary=true</code> removes
                heavy detail payloads and keeps the export focused on time,
                level, message, resource identity, access scope, and request id.
              </p>
              <p>
                This is usually the best format for an incident thread, handoff
                to another operator, or a compact timeline artifact.
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-black/35">
              <div className="border-b border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Example
              </div>
              <pre className="overflow-x-auto px-4 py-5 text-sm leading-7 text-zinc-300">
                <code>{`curl -s -H 'Authorization: Bearer <token>' \\
  'http://127.0.0.1:9080/api/v1/events/export?format=json&summary=true&action=request.replay&since=2026-04-07T09:00:00Z&until=2026-04-07T10:00:00Z'`}</code>
              </pre>
            </div>
          </section>

          <section id="incident-flow" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">A practical incident flow</h2>
            <div className="mt-6 space-y-4">
              {[
                "Start with snapshot to see whether the system is broadly healthy and whether recent critical events already explain the issue.",
                "Use event filters to isolate one action, resource, or request id.",
                "Export a summary artifact for the time window you actually care about.",
                "If you need deeper request context, pivot from request_id into request archive and replay docs.",
                "Keep the full export only when details_json is actually needed for the investigation.",
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
                        layoutId="audit-export-active"
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
