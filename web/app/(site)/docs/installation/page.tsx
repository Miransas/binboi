"use client"
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// --- Types ---
interface TocItem {
  id: string;
  title: string;
}

const toc: TocItem[] = [
  { id: "install-overview", title: "Install overview" },
  { id: "homebrew", title: "Homebrew" },
  { id: "npm", title: "npm direction" },
  { id: "direct-binary", title: "Direct binary" },
  { id: "contributors", title: "Contributor setup" },
];

export default function InstallationPage() {
  const [activeId, setActiveId] = useState("");

  // ScrollSpy logic to track the active section
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
        
        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 lg:max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <span className="text-sm font-medium tracking-widest text-cyan-500 uppercase">Installation</span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Choose the install path that matches how your team works.
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              Binboi is designed to be comfortable as a packaged CLI and straightforward to build from source. 
              This guide covers Homebrew, npm wrapper direction, direct release binaries, and local contributor setup.
            </p>
          </motion.div>

          {/* Section: Overview */}
          <section id="install-overview" className="mb-24 scroll-mt-20">
            <div className="border-l-2 border-zinc-800 pl-6 mb-10">
              <h2 className="text-2xl font-semibold text-white">Installation paths at a glance</h2>
              <p className="mt-2 text-zinc-400">Most users should prefer a packaged binary, while contributors often build from source.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card 
                title="Homebrew" 
                badge="Recommended" 
                desc="The cleanest macOS developer install path once your release artifacts are published." 
                color="border-cyan-500/20 bg-cyan-500/5"
              />
              <Card 
                title="npm global wrapper" 
                badge="Planned" 
                desc="A convenient future path for JavaScript-heavy teams already using npm-based tooling." 
                color="border-amber-500/20 bg-amber-500/5"
              />
              <Card 
                title="Direct release binary" 
                badge="Supported" 
                desc="Download the correct tar.gz for your OS and architecture and place it on your PATH." 
                color="border-emerald-500/20 bg-emerald-500/5"
              />
              <Card 
                title="Build from source" 
                badge="Contributors" 
                desc="Ideal when you are modifying the relay, CLI, or dashboard locally." 
                color="border-zinc-700 bg-zinc-800/20"
              />
            </div>
          </section>

          {/* Section: Homebrew */}
          <section id="homebrew" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-4">Install with Homebrew</h2>
            <CodeBlock 
              command="brew install binboi/tap/binboi" 
              output="binboi version 0.4.0"
            />
            <p className="mt-6 leading-7 text-zinc-400">
              The repository now includes release-friendly artifact naming, a sample Homebrew formula,
              and a stable <code className="text-cyan-400">binboi version</code> command for formula testing.
            </p>
          </section>

          {/* Section: npm */}
          <section id="npm" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-4">npm global install direction</h2>
            <Callout 
              title="Why document it now?" 
              text="Because teams evaluating the product often ask how the CLI will be distributed in real life. The docs should answer that honestly."
            />
            <CodeBlock command="npm install -g @binboi/cli" note="Planned npm flow" />
          </section>

          {/* Section: Binary */}
          <section id="direct-binary" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-4">Direct binary installation</h2>
            <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800 mb-6">
              <code className="text-emerald-400 block mb-2">tar -xzf binboi_0.4.0_darwin_arm64.tar.gz</code>
              <code className="text-zinc-500 block">sudo mv binboi /usr/local/bin/binboi</code>
            </div>
            <p className="text-sm text-zinc-500">
              Release artifact naming follows the pattern: binboi_&lt;version&gt;_&lt;os&gt;_&lt;arch&gt;.tar.gz
            </p>
          </section>

          {/* Section: Contributors */}
          <section id="contributors" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-4">Contributor setup</h2>
            <p className="mb-6 text-zinc-400">Build the server and CLI directly from source when you are changing tunnel lifecycle or auth.</p>
            <CodeBlock 
              command="git clone https://github.com/Miransas/binboi.git && cd binboi && go build -o binboi ./cmd/binboi-client" 
            />
          </section>
        </main>

        {/* --- RIGHT SIDEBAR: NAVIGATION --- */}
        <aside className="hidden lg:block lg:w-64">
          <div className="sticky top-16">
            <h4 className="text-xs font-bold text-white mb-6 uppercase tracking-widest opacity-50">On this page</h4>
            <nav className="relative">
              <div className="absolute left-0 top-0 h-full w-px bg-zinc-800" />
              <ul className="space-y-4">
                {toc.map((item) => (
                  <li key={item.id} className="relative pl-6">
                    {activeId === item.id && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="absolute left-0 top-0 h-full w-0.5 bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
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

function Card({ title, badge, desc, color }: { title: string, badge: string, desc: string, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -4, borderColor: "rgba(255,255,255,0.2)" }}
      className={`p-6 rounded-2xl border transition-all duration-300 ${color}`}
    >
      <span className="text-[10px] uppercase tracking-widest font-bold opacity-70 text-zinc-300">{badge}</span>
      <h3 className="text-lg font-semibold text-white mt-2">{title}</h3>
      <p className="text-sm mt-2 text-zinc-400 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function CodeBlock({ command, output, note }: { command: string, output?: string, note?: string }) {
  return (
    <div className="group relative bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
        </div>
        <span className="text-[10px] text-zinc-500 font-mono uppercase">{note || "terminal"}</span>
      </div>
      <div className="p-5 font-mono text-sm leading-relaxed overflow-x-auto">
        <div className="flex">
          <span className="text-zinc-600 mr-4 select-none">$</span>
          <span className="text-cyan-400 whitespace-nowrap">{command}</span>
        </div>
        {output && <div className="text-zinc-500 mt-1">{output}</div>}
      </div>
    </div>
  );
}

function Callout({ title, text }: { title: string, text: string }) {
  return (
    <div className="my-8 flex gap-4 p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl text-amber-200/80">
      <div className="mt-1">
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <strong className="block text-amber-500 font-semibold mb-1">{title}</strong>
        <p className="text-sm leading-6">{text}</p>
      </div>
    </div>
  );
}