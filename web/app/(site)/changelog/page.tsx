/* eslint-disable react/jsx-no-comment-textnodes */
"use client"
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Terminal } from "lucide-react";

// --- Types ---
type TagType = "network" | "cli" | "dashboard" | "perf" | "fix";

interface ChangelogEntryData {
  id: string;
  date: string;
  year: number;
  type: "major" | "minor";
  version: string;
  title: string;
  description: string;
  tags: TagType[];
  svg?: React.ReactNode;
  features?: string[];
  fixes?: string[];
  codeBlock?: React.ReactNode;
}

// --- Data ---
const CHANGELOG_DATA: ChangelogEntryData[] = [
  {
    id: "v2-0",
    date: "Apr 05\n2026",
    year: 2026,
    type: "major",
    version: "v2.0",
    title: "Edge Network & Webhook Debugger",
    description: "Introduction of our globally distributed API Gateway, automated TLS termination, and real-time webhook payload inspection.",
    tags: ["network", "dashboard"],
    features: [
      "Globally distributed Edge Network for lower latency",
      "Automated TLS (Let's Encrypt) for Custom Domains",
      "Real-time Webhook Debugger in the Next.js Dashboard",
      "Round-robin Connection Pooling for multiple CLI agents",
    ],
    fixes: [
      "Fixed connection drop on sudden CLI termination",
      "Resolved memory leak in long-lived HTTP streams",
    ],
    codeBlock: (
      <div className="bg-black/50 border border-zinc-800 rounded-lg p-4 font-mono text-xs leading-relaxed overflow-x-auto mb-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
        <span className="text-zinc-500">// Start a tunnel with a custom domain</span>
        <br />
        <span className="text-[#9eff00]">$</span> binboi http 3000 <span className="text-[#9eff00]">--domain</span> api.mycompany.com
        <br />
        <span className="text-zinc-400">
          Tunnel Status: <span className="text-[#9eff00] drop-shadow-[0_0_5px_rgba(158,255,0,0.8)]">Online</span>
          <br />
          Forwarding:    https://api.mycompany.com -{">"} localhost:3000
        </span>
      </div>
    ),
    svg: (
      <svg className="w-full aspect-[16/7] block" viewBox="0 0 760 210" xmlns="http://www.w3.org/2000/svg">
        <rect width="760" height="210" fill="#09090b" />
        {/* Grid Background */}
        <g stroke="#27272a" strokeWidth="1" opacity="0.5">
          <line x1="0" y1="52" x2="760" y2="52" /><line x1="0" y1="105" x2="760" y2="105" /><line x1="0" y1="157" x2="760" y2="157" />
          <line x1="190" y1="0" x2="190" y2="210" /><line x1="380" y1="0" x2="380" y2="210" /><line x1="570" y1="0" x2="570" y2="210" />
        </g>
        {/* Network Nodes & Lines - Neon Green */}
        <path d="M 190 105 Q 285 105 380 105 T 570 105" fill="none" stroke="#9eff00" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse shadow-[0_0_10px_rgba(158,255,0,0.5)]" />
        {/* Client Node */}
        <circle cx="190" cy="105" r="24" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
        <text x="190" y="109" fontFamily="var(--font-mono)" fontSize="10" fill="#a1a1aa" textAnchor="middle">CLI</text>
        {/* Edge Node (Glowing Neon Green) */}
        <circle cx="380" cy="105" r="40" fill="rgba(158,255,0,0.05)" stroke="#9eff00" strokeWidth="2" />
        <circle cx="380" cy="105" r="32" fill="none" stroke="#9eff00" strokeWidth="1" opacity="0.5" />
        <text x="380" y="109" fontFamily="var(--font-mono)" fontSize="12" fill="#9eff00" textAnchor="middle" fontWeight="bold">EDGE</text>
        {/* Target Node */}
        <circle cx="570" cy="105" r="24" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
        <text x="570" y="109" fontFamily="var(--font-mono)" fontSize="10" fill="#a1a1aa" textAnchor="middle">WEB</text>
        
        <text x="380" y="186" fontFamily="var(--font-mono)" fontSize="11" fill="#71717a" textAnchor="middle">
          BINBOI ROUTING ARCHITECTURE
        </text>
      </svg>
    ),
  },
  {
    id: "v1-5",
    date: "Mar 12\n2026",
    year: 2026,
    type: "major",
    version: "v1.5",
    title: "Next.js Dashboard & Access Control",
    description: "A complete overhaul of the control plane web app. Manage your tunnels, inspect traffic, and control PATs from a beautiful new interface.",
    tags: ["dashboard", "cli"],
    features: [
      "Personal Access Token (PAT) generation and revocation",
      "Live Request Feed with Header/Payload inspection",
      "New `binboi login --token` workflow",
      "Light/Dark mode support for the web dashboard",
    ],
    fixes: [
      "Fixed OAuth redirect mismatch in GitHub login",
      "Corrected timezone display in request logs",
    ],
    svg: (
      <svg className="w-full aspect-[16/7] block" viewBox="0 0 760 210" xmlns="http://www.w3.org/2000/svg">
        <rect width="760" height="210" fill="#09090b" />
        <defs>
          <pattern id="dotGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#27272a" />
          </pattern>
        </defs>
        <rect width="760" height="210" fill="url(#dotGrid)" />
        {/* Abstract Dashboard UI */}
        <rect x="180" y="40" width="400" height="130" rx="8" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
        <rect x="180" y="40" width="100" height="130" rx="8" fill="#09090b" stroke="#3f3f46" strokeWidth="1" />
        <line x1="200" y1="60" x2="260" y2="60" stroke="#3f3f46" strokeWidth="4" strokeLinecap="round" />
        <line x1="200" y1="80" x2="240" y2="80" stroke="#9eff00" strokeWidth="4" strokeLinecap="round" />
        <line x1="200" y1="100" x2="250" y2="100" stroke="#3f3f46" strokeWidth="4" strokeLinecap="round" />
        
        <rect x="300" y="60" width="260" height="40" rx="4" fill="#27272a" />
        <rect x="300" y="110" width="260" height="40" rx="4" fill="#27272a" />
        <circle cx="320" cy="80" r="6" fill="#10b981" />
        <circle cx="320" cy="130" r="6" fill="#9eff00" />
      </svg>
    ),
  },
  {
    id: "v1-4-2",
    date: "Feb 28\n2026",
    year: 2026,
    type: "minor",
    version: "v1.4.2",
    title: "Routing latency & proxy optimizations",
    description: "Rewrote core Go proxy handlers to bypass unnecessary buffer copies, reducing P99 latency by ~30%.",
    tags: ["perf", "network"],
  },
  {
    id: "v1-4-0",
    date: "Jan 15\n2026",
    year: 2026,
    type: "minor",
    version: "v1.4.0",
    title: "Local Preview Mode Release",
    description: "Introduced BINBOI_ALLOW_PREVIEW_MODE for developers who want to run the control plane completely locally with SQLite (no Postgres required).",
    tags: ["cli", ],
  },
];

// --- Main Page Component ---
export default function Changelog() {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filteredData = CHANGELOG_DATA.filter(
    (item) => activeFilter === "all" || item.tags.includes(activeFilter as TagType)
  );

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-[#9eff00]/30 selection:text-[#9eff00]">
      {/* Terminal Grid Background Eklendi */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Hero */}
      <header className="relative z-10 max-w-[900px] mx-auto pt-24 pb-16 px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 border border-[#9eff00]/20 bg-[#9eff00]/5 rounded-full px-4 py-1 text-[11px] font-mono text-[#9eff00] mb-8 shadow-[0_0_15px_rgba(158,255,0,0.1)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#9eff00] animate-pulse shadow-[0_0_8px_rgba(158,255,0,0.8)]" />
          Latest: v2.0 — Edge Network
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white"
        >
          What&#39;s <em className="not-italic text-[#9eff00] drop-shadow-[0_0_10px_rgba(158,255,0,0.3)]">new</em>
          <br /> in Binboi
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-[15px] text-zinc-500 font-mono"
        >
          // tunnel updates, dashboard improvements, cli releases
        </motion.p>
      </header>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 flex flex-wrap justify-center gap-2 px-8 pb-12"
      >
        {[
          { label: "All", value: "all" },
          { label: "Network", value: "network" },
          { label: "CLI", value: "cli" },
          { label: "Dashboard", value: "dashboard" },
          { label: "Performance", value: "perf" },
          { label: "Fixes", value: "fix" },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`px-4 py-1.5 rounded-full border text-[11px] font-mono uppercase tracking-widest transition-all ${
              activeFilter === filter.value
                ? "border-[#9eff00]/50 text-[#9eff00] bg-[#9eff00]/10 shadow-[0_0_10px_rgba(158,255,0,0.2)]"
                : "border-zinc-800 bg-black/50 text-zinc-500 hover:border-[#9eff00]/30 hover:text-[#9eff00] hover:bg-[#9eff00]/5 backdrop-blur-sm"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </motion.div>

      {/* Timeline */}
      <main className="relative z-10 max-w-[760px] mx-auto px-8 pb-24">
        {filteredData.map((item, index) => {
          const showYear = index === 0 || item.year !== filteredData[index - 1].year;

          return (
            <React.Fragment key={item.id}>
              {showYear && (
                <div className="flex items-center gap-3 py-8 text-[11px] font-mono text-zinc-600 uppercase tracking-[0.12em]">
                  {item.year}
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>
              )}
              <ChangelogEntry item={item} />
            </React.Fragment>
          );
        })}
      </main>
    </div>
  );
}

// --- Individual Entry Component ---
function ChangelogEntry({ item }: { item: ChangelogEntryData }) {
  const isMajor = item.type === "major";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className={`grid grid-cols-[80px_1fr] gap-x-6 mb-[1.5px] ${isMajor ? "group/major" : ""}`}
    >
      {/* Date & Dot */}
      <div className="relative pt-6 font-mono text-[11px] text-zinc-500 text-right leading-relaxed whitespace-pre-line">
        {item.date}
        <div
          className={`absolute -right-[1.5rem] top-[1.6rem] translate-x-1/2 translate-y-1 w-2 h-2 rounded-full border-[1.5px] z-10 transition-colors duration-300 ${
            isMajor
              ? "bg-[#9eff00] border-[#9eff00] shadow-[0_0_12px_rgba(158,255,0,0.6)]"
              : "bg-zinc-900 border-zinc-700 group-hover/major:border-[#9eff00]/50"
          }`}
        />
      </div>

      {/* Card Content */}
      <div className="border-l border-zinc-800 py-5 pl-6">
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isMajor
              ? "bg-black/40 backdrop-blur-sm border border-zinc-800/80 rounded-2xl hover:border-[#9eff00]/30 hover:shadow-[0_8px_30px_rgba(158,255,0,0.05)] hover:-translate-y-0.5 cursor-pointer"
              : "bg-transparent rounded-xl hover:bg-zinc-900/30 hover:border-zinc-800/50 border border-transparent p-4 transition-all"
          }`}
        >
          {isMajor && item.svg && (
            <div className="w-full bg-black/80 relative overflow-hidden border-b border-zinc-800/50">{item.svg}</div>
          )}

          <div className={isMajor ? "p-6" : ""}>
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {item.tags.map((tag) => (
                <span key={tag} className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${getTagStyle(tag)}`}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="inline-block font-mono text-[10px] border border-zinc-700/50 text-zinc-400 px-2 py-0.5 rounded mb-2.5 bg-zinc-800/20">
              {item.version}
            </div>

            <h3 className={`font-bold text-white leading-snug mb-2 transition-colors ${isMajor ? "text-xl group-hover/major:text-[#9eff00]" : "text-[15px]"}`}>
              {item.title}
            </h3>
            
            <p className="text-[13px] text-zinc-400 font-mono leading-relaxed mb-4">
              {item.description}
            </p>

            {item.codeBlock && item.codeBlock}

            {isMajor && (
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-zinc-800/30">
                <button className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-500 uppercase tracking-widest hover:text-[#9eff00] transition-colors group">
                  Read release notes
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
                <span className="font-mono text-[11px] text-zinc-600">
                  {item.date.replace("\n", ", ")}
                </span>
              </div>
            )}
          </div>

          {/* Accordions for Major Entries */}
          {isMajor && item.features && (
            <ExpandableSection title="Features" items={item.features} />
          )}
          {isMajor && item.fixes && (
            <ExpandableSection title="Bug Fixes" items={item.fixes} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// --- Accordion Sub-Component ---
function ExpandableSection({ title, items }: { title: string; items: string[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-zinc-800/30 bg-black/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-3 text-[12px] font-mono text-zinc-500 uppercase tracking-widest hover:text-[#9eff00] transition-colors"
      >
        <span>{title}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-180 text-[#9eff00]" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ul className="px-6 pb-5 pt-1 text-[12px] font-mono text-zinc-400 leading-relaxed space-y-1">
              {items.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[#9eff00]/50 shrink-0">—</span>
                  <span dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Utility function for tags ---
function getTagStyle(tag: string) {
  switch (tag) {
    case "network": return "border-[#9eff00]/30 text-[#9eff00] bg-[#9eff00]/10";
    case "cli": return "border-zinc-300/30 text-zinc-200 bg-zinc-300/10";
    case "dashboard": return "border-indigo-500/30 text-indigo-400 bg-indigo-500/10";
    case "perf": return "border-amber-500/30 text-amber-400 bg-amber-500/10";
    default: return "border-zinc-700 text-zinc-400 bg-zinc-800/30";
  }
}