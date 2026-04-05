"use client"
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// --- Types ---
interface TocItem {
  id: string;
  title: string;
}

const toc: TocItem[] = [
  { id: "log-types", title: "Log types" },
  { id: "activity-events", title: "Activity events" },
  { id: "lifecycle-events", title: "Tunnel lifecycle" },
  { id: "operating-with-logs", title: "Using logs well" },
];

export default function LogsPage() {
  const [activeId, setActiveId] = useState("");

  // Intersection Observer for ScrollSpy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0% -35% 0%", threshold: 0.5 }
    );

    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 selection:bg-cyan-500/30">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:flex lg:gap-x-12">
        
        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 lg:max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <span className="text-sm font-medium tracking-widest text-cyan-500 uppercase font-mono">Visibility</span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Explain what the relay actually did.
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              Not every visibility stream serves the same purpose. Binboi separates raw relay logs, 
              activity events, and request-level views so you can debug with the right lens.
            </p>
          </motion.div>

          {/* Section: Log Types */}
          <section id="log-types" className="mb-24 scroll-mt-20">
            <div className="border-l-2 border-zinc-800 pl-6 mb-10">
              <h2 className="text-2xl font-semibold text-white">Raw logs versus request views</h2>
              <p className="mt-2 text-zinc-400">A healthy docs system teaches users which visibility surface to consult first.</p>
            </div>

            {/* Custom Table Implementation */}
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-zinc-900/50 text-zinc-100 font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Layer</th>
                    <th className="px-4 py-3">Best for</th>
                    <th className="px-4 py-3">Examples</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  <TableRow 
                    cols={["Raw relay logs", "Transport truth", "Token rejected, proxy error, stream closed."]} 
                  />
                  <TableRow 
                    cols={["Activity events", "Operator history", "Tunnel reserved, token created, session revoked."]} 
                  />
                  <TableRow 
                    cols={["Request views", "Debugging", "Headers, payload preview, duration, status."]} 
                  />
                </tbody>
              </table>
            </div>

            <Callout 
              title="Current MVP reality" 
              text="The current repository already has live relay events. Richer request inspection is still being built on top of that base."
              tone="amber"
            />
          </section>

          {/* Section: Activity Events */}
          <section id="activity-events" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-4">Activity events</h2>
            <div className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-zinc-400 leading-relaxed">
              <p>Use activity events to answer questions like who created a token, when a tunnel was reserved, or whether a domain verification step completed.</p>
              <p>These events are <span className="text-zinc-200">quieter and more human-readable</span> than transport logs because their audience is often the operator.</p>
            </div>
          </section>

          {/* Section: Lifecycle Events */}
          <section id="lifecycle-events" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-4">Tunnel lifecycle</h2>
            <CodeBlock 
              title="Typical lifecycle progression"
              code={[
                "Tunnel reserved",
                "Agent authenticated",
                "Tunnel connected",
                "Request forwarded",
                "Proxy error or upstream response",
                "Tunnel disconnected",
                "Token revoked or rotated"
              ].join('\n')}
            />
          </section>

          {/* Section: Operating with Logs */}
          <section id="operating-with-logs" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-4">How to use logs well</h2>
            <div className="grid gap-4">
              <PracticeCard 
                step="01" 
                title="Activity events" 
                desc="Start here when you suspect a configuration or lifecycle issue."
              />
              <PracticeCard 
                step="02" 
                title="Raw relay logs" 
                desc="Move here when you need transport truth, such as auth failures."
              />
              <PracticeCard 
                step="03" 
                title="Request views" 
                desc="Use these when the tunnel is healthy but the application outcome is confusing."
              />
            </div>
          </section>
        </main>

        {/* --- RIGHT SIDEBAR: NAV --- */}
        <aside className="hidden lg:block lg:w-64">
          <div className="sticky top-16">
            <h4 className="text-xs font-bold text-white mb-6 uppercase tracking-widest opacity-40">On this page</h4>
            <nav className="relative">
              <div className="absolute left-0 top-0 h-full w-px bg-zinc-800" />
              <ul className="space-y-4">
                {toc.map((item) => (
                  <li key={item.id} className="relative pl-6">
                    {activeId === item.id && (
                      <motion.div 
                        layoutId="active-nav-indicator"
                        className="absolute left-0 top-0 h-full w-0.5 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                      />
                    )}
                    <button
                      onClick={() => scrollTo(item.id)}
                      className={`text-sm text-left transition-colors duration-200 ${
                        activeId === item.id ? "text-cyan-400 font-medium" : "text-zinc-500 hover:text-zinc-300"
                      }`}
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

// --- Internal UI Components ---

function TableRow({ cols }: { cols: string[] }) {
  return (
    <tr className="hover:bg-white/[0.02] transition-colors">
      {cols.map((col, i) => (
        <td key={i} className={`px-4 py-4 ${i === 0 ? "text-cyan-400 font-mono text-xs" : "text-zinc-400"}`}>
          {col}
        </td>
      ))}
    </tr>
  );
}

function PracticeCard({ step, title, desc }: { step: string, title: string, desc: string }) {
  return (
    <div className="flex gap-6 p-5 rounded-xl border border-zinc-800 bg-zinc-900/20 items-start">
      <span className="text-xs font-mono text-zinc-600 mt-1">{step}</span>
      <div>
        <h4 className="text-white font-semibold mb-1">{title}</h4>
        <p className="text-sm text-zinc-400 leading-6">{desc}</p>
      </div>
    </div>
  );
}

function CodeBlock({ title, code }: { title: string, code: string }) {
  return (
    <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
      <div className="px-4 py-2 bg-zinc-900/50 border-b border-zinc-800 flex justify-between items-center">
        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{title}</span>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-zinc-800" />
          <div className="w-2 h-2 rounded-full bg-zinc-800" />
        </div>
      </div>
      <pre className="p-5 overflow-x-auto text-sm font-mono text-zinc-300 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Callout({ title, text, tone = "amber" }: { title: string, text: string, tone?: string }) {
  const colors = tone === "amber" ? "bg-amber-500/5 border-amber-500/20 text-amber-200/80" : "bg-cyan-500/5 border-cyan-500/20 text-cyan-200/80";
  const iconColor = tone === "amber" ? "text-amber-500" : "text-cyan-500";

  return (
    <div className={`my-8 flex gap-4 p-5 border rounded-xl ${colors}`}>
      <div className={`mt-1 ${iconColor}`}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <strong className={`block font-semibold mb-1 ${iconColor}`}>{title}</strong>
        <p className="text-sm leading-6">{text}</p>
      </div>
    </div>
  );
}