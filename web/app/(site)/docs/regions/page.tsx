"use client"

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// --- Types ---
interface TocItem {
  id: string;
  title: string;
}

const toc: TocItem[] = [
  { id: "region-basics", title: "Region basics" },
  { id: "nodes", title: "Nodes" },
  { id: "latency", title: "Latency" },
  { id: "selection-guidance", title: "Selection guidance" },
];

export default function RegionsPage() {
  const [activeId, setActiveId] = useState("");

  // ScrollSpy: Tracks active section for the sidebar
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
            <span className="text-sm font-medium tracking-widest text-cyan-500 uppercase font-mono">Infrastructure</span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Regions and Nodes
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              Even in a debugging product, latency matters. Regions are the logical entry points, 
              while nodes are the concrete relay instances that shape the tunnel experience.
            </p>
          </motion.div>

          {/* Section: Region Basics */}
          <section id="region-basics" className="mb-24 scroll-mt-20">
            <div className="border-l-2 border-zinc-800 pl-6 mb-8">
              <h2 className="text-2xl font-semibold text-white">What a region is</h2>
              <p className="mt-2 text-zinc-400">Logical locations like us-east or local that help reason about traffic flow.</p>
            </div>
            
            <InfoBox>
              <p>In a mature deployment, users choose a region close to themselves or close to the systems generating traffic.</p>
              <p className="mt-3">This affects response time, webhook timeout risk, and how predictable the development experience feels.</p>
            </InfoBox>
          </section>

          {/* Section: Nodes (Table) */}
          <section id="nodes" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-6">Nodes and Instances</h2>
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-zinc-900/50 text-zinc-100 font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Concept</th>
                    <th className="px-4 py-3">Meaning</th>
                    <th className="px-4 py-3">MVP Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  <TableRow 
                    cols={["Region", "Logical entry point for traffic.", "Defaults to a single 'local' region."]} 
                  />
                  <TableRow 
                    cols={["Node", "Concrete relay instance serving tunnels.", "Behaves like a single primary node."]} 
                  />
                  <TableRow 
                    cols={["Selection", "How an operator chooses an entry point.", "Planned for multi-region controls."]} 
                  />
                </tbody>
              </table>
            </div>
          </section>

          {/* Section: Latency */}
          <section id="latency" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-4">Why latency matters</h2>
            <p className="mb-6 text-zinc-400 leading-relaxed">
              Tunnel products are network products. Slow regions make every request feel heavier and increase webhook retries for providers with tight timeouts.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/10">
                <h4 className="text-white font-medium mb-2">Provider Timeouts</h4>
                <p className="text-xs text-zinc-500 leading-5">High latency can trigger automatic retries from webhook providers like Stripe or GitHub.</p>
              </div>
              <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/10">
                <h4 className="text-white font-medium mb-2">Debug Flow</h4>
                <p className="text-xs text-zinc-500 leading-5">A 500ms overhead on every hot-reload or request cycle breaks the developer&lsquo;s &#34;state of flow.&ldquo;</p>
              </div>
            </div>
          </section>

          {/* Section: Selection Guidance */}
          <section id="selection-guidance" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-4">How to choose a region</h2>
            <div className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-zinc-400 leading-relaxed text-sm">
              <p>• For self-hosted teams, start with one known-good region matching your engineers.</p>
              <p>• Add more nodes only after you can observe health and route behavior clearly.</p>
              <p>• If debugging webhooks, choose the region that best matches the provider&lsquo;s data center.</p>
            </div>

            <Callout 
              title="Current MVP note" 
              text="The repository is currently single-region. We explain this model now to help teams self-host with realistic expectations for future scaling."
              tone="amber"
            />
          </section>
        </main>

        {/* --- RIGHT SIDEBAR: NAVIGATION --- */}
        <aside className="hidden lg:block lg:w-64">
          <div className="sticky top-16">
            <h4 className="text-[10px] font-bold text-white mb-6 uppercase tracking-[0.2em] opacity-40">On this page</h4>
            <nav className="relative">
              <div className="absolute left-0 top-0 h-full w-px bg-zinc-800" />
              <ul className="space-y-4">
                {toc.map((item) => (
                  <li key={item.id} className="relative pl-6">
                    {activeId === item.id && (
                      <motion.div 
                        layoutId="region-nav-indicator"
                        className="absolute left-0 top-0 h-full w-0.5 bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
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
    <tr className="hover:bg-white/[0.02] transition-colors group">
      {cols.map((col, i) => (
        <td key={i} className={`px-4 py-4 ${i === 0 ? "text-cyan-400 font-mono text-xs font-semibold" : "text-zinc-400"}`}>
          {col}
        </td>
      ))}
    </tr>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 text-sm leading-7 text-zinc-400">
      {children}
    </div>
  );
}

function Callout({ title, text, tone = "amber" }: { title: string, text: string, tone?: "amber" | "cyan" }) {
  const isAmber = tone === "amber";
  return (
    <div className={`my-8 flex gap-4 p-5 rounded-xl border ${isAmber ? 'bg-amber-500/5 border-amber-500/20' : 'bg-cyan-500/5 border-cyan-500/20'}`}>
      <div className={`mt-1 ${isAmber ? 'text-amber-500' : 'text-cyan-500'}`}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="text-sm">
        <strong className={`block font-semibold mb-1 ${isAmber ? 'text-amber-500' : 'text-cyan-500'}`}>{title}</strong>
        <p className="text-zinc-400 leading-6">{text}</p>
      </div>
    </div>
  );
}