"use client"
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
interface TocItem {
  id: string;
  title: string;
}

const toc: TocItem[] = [
  { id: "inspection-model", title: "Inspection model" },
  { id: "visible-metadata", title: "Visible metadata" },
  { id: "response-preview", title: "Response preview" },
  { id: "error-types", title: "Error types" },
];

export default function RequestsPage() {
  const [activeId, setActiveId] = useState("");

  // Intersection Observer for the right-side ScrollSpy
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
    <div className="min-h-screen bg-zinc-950 text-zinc-300 selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:flex lg:gap-x-12">
        
        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 lg:max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <span className="text-sm font-medium tracking-widest text-cyan-500 uppercase font-mono">Debugging</span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Inspect Inbound Requests
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              Request inspection in Binboi means more than printing a method and path. 
              It provides the metadata needed to explain what arrived, where it was routed, 
              and why it might have failed.
            </p>
          </motion.div>

          {/* Section: Inspection Model */}
          <section id="inspection-model" className="mb-24 scroll-mt-20">
            <div className="border-l-2 border-zinc-800 pl-6 mb-10">
              <h2 className="text-2xl font-semibold text-white">What request inspection means</h2>
              <p className="mt-2 text-zinc-400">Reconstruct the life of one request without noise.</p>
            </div>
            
            <InfoBox>
              <p>At minimum, the request view identifies which tunnel received the request and which target service handled it.</p>
              <p className="mt-4">For webhooks, it preserves enough header and payload detail to explain signature or schema mismatches immediately.</p>
            </InfoBox>

            <Callout 
              title="Current MVP note" 
              text="In the repository today, visibility focuses on relay logs. The full request inspection UI is the target the rest of the control plane is moving toward."
              tone="amber"
            />
          </section>

          {/* Section: Visible Metadata (Grid) */}
          <section id="visible-metadata" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-8">What metadata should be visible</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MetadataCard title="Request identity" desc="Method, host, path, query string, and timestamp." tone="cyan" />
              <MetadataCard title="Headers" desc="Forwarding headers, content type, and trace IDs." tone="emerald" />
              <MetadataCard title="Payload preview" desc="Readable body previews to debug shape mismatches." />
              <MetadataCard title="Target details" desc="Which local service or upstream target handled it." />
              <MetadataCard title="Timing" desc="Duration, receive time, and network path clues." />
              <MetadataCard title="Outcome" desc="Status code and response header snapshots." tone="amber" />
            </div>
          </section>

          {/* Section: Response Preview */}
          <section id="response-preview" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-6">Response Previews</h2>
            <div className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-zinc-400 leading-relaxed text-sm">
              <p className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Compare inbound context and outbound response in one place.</p>
              <p className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-zinc-700" /> Preview payloads at a safe, practical size for operators.</p>
              <p className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-zinc-700" /> Identify the specific local process that answered the request.</p>
            </div>
          </section>

          {/* Section: Error Types (Table) */}
          <section id="error-types" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-6">Useful error classifications</h2>
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30 shadow-xl">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-zinc-900/50 text-zinc-100 font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Meaning</th>
                    <th className="px-4 py-3">Check First</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  <TableRow cols={["AUTH_ERROR", "Invalid CLI token or session.", "binboi whoami status."]} />
                  <TableRow cols={["UPSTREAM_CONNECT", "Agent could not reach local app.", "Is the app port open?"]} />
                  <TableRow cols={["UPSTREAM_TIMEOUT", "App did not respond in time.", "App startup or DB lag."]} />
                  <TableRow cols={["HOST_MISMATCH", "Invalid subdomain or host.", "Tunnel state & spelling."]} />
                </tbody>
              </table>
            </div>
          </section>
        </main>

        {/* --- RIGHT SIDEBAR: NAVIGATION --- */}
        <aside className="hidden lg:block lg:w-64">
          <div className="sticky top-16">
            <h4 className="text-[10px] font-bold text-white mb-6 uppercase tracking-widest opacity-40 font-mono">Contents</h4>
            <nav className="relative">
              <div className="absolute left-0 top-0 h-full w-px bg-zinc-800" />
              <ul className="space-y-4">
                {toc.map((item) => (
                  <li key={item.id} className="relative pl-6">
                    {activeId === item.id && (
                      <motion.div 
                        layoutId="req-nav-active"
                        className="absolute left-0 top-0 h-full w-0.5 bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                      />
                    )}
                    <button
                      onClick={() => scrollTo(item.id)}
                      className={`text-sm text-left transition-all duration-300 ${
                        activeId === item.id ? "text-cyan-400 font-medium translate-x-1" : "text-zinc-500 hover:text-zinc-300"
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

// --- Internal UI Elements ---

function MetadataCard({ title, desc, tone }: { title: string, desc: string, tone?: string }) {
  const getBorder = () => {
    if (tone === "cyan") return "border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500/40";
    if (tone === "emerald") return "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40";
    if (tone === "amber") return "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40";
    return "border-zinc-800 bg-zinc-900/10 hover:border-zinc-700";
  };

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 group ${getBorder()}`}>
      <h4 className="text-sm font-semibold text-white mb-2">{title}</h4>
      <p className="text-xs text-zinc-500 leading-5 group-hover:text-zinc-400">{desc}</p>
    </div>
  );
}

function TableRow({ cols }: { cols: string[] }) {
  return (
    <tr className="hover:bg-white/[0.02] transition-colors group">
      {cols.map((col, i) => (
        <td key={i} className={`px-4 py-4 ${i === 0 ? "text-rose-400 font-mono text-[11px]" : "text-zinc-400"}`}>
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

function Callout({ title, text, tone }: { title: string, text: string, tone: "amber" | "cyan" }) {
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