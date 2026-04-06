/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Package, Box, Globe, Cpu, 
  Lock, AlertTriangle, CheckCircle2, 
  Terminal, GitBranch, Info, 
  ChevronRight, Timer, Construction
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PackageManagersInstallationPage() {
  return (
    <div className="min-h-screen bg-[#050506] text-zinc-400 font-sans selection:bg-[#9eff00]/30 selection:text-black">
      
      {/* HEADER / STATUS BAR */}
      <nav className="h-14 border-b border-white/[0.03] bg-zinc-950/40 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-white uppercase font-mono">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]" />
            Binboi_OS / Ecosystem_Registry
          </div>
        </div>
        <div className="flex gap-6 items-center font-mono">
          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Registry: Public_Beta</span>
          <div className="h-4 w-px bg-white/5" />
          <a href="/docs/installation" className="text-[9px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
            Installation Map <ChevronRight size={10} />
          </a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 pt-24 pb-32">
        
        {/* HERO SECTION */}
        <header className="mb-24 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.85] uppercase">
              Package <span className="text-zinc-800">Status.</span>
            </h1>
            <p className="mt-8 text-xl text-zinc-500 max-w-2xl leading-relaxed font-medium border-l-2 border-amber-500 pl-8">
              We separate channels that are usable today from ecosystems that still need packaging and publishing work. No fake promises, just the current truth.
            </p>
          </motion.div>
        </header>

        <div className="space-y-32">
          
          {/* 01. THE TRUTH MATRIX */}
          <section>
            <StepHeader number="01" title="Current Truth Matrix" />
            <div className="mt-12 rounded-[3rem] border border-white/[0.03] bg-[#080809] overflow-hidden">
              <table className="w-full text-left text-[11px] font-mono border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/[0.03]">
                    <th className="p-8 text-zinc-500 uppercase tracking-[0.2em]">Channel</th>
                    <th className="p-8 text-zinc-500 uppercase tracking-[0.2em]">Status</th>
                    <th className="p-8 text-zinc-500 uppercase tracking-[0.2em]">Current Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  <StatusRow channel="Homebrew" status="SUPPORTED" result="Installs verified binary on macOS." active />
                  <StatusRow channel="install.sh" status="SUPPORTED" result="Automated Unix/Linux deployment." active />
                  <StatusRow channel="Direct Binary" status="SUPPORTED" result="Universal architecture access." active />
                  <StatusRow channel="Go Build" status="SOURCE_ONLY" result="Contributor-led local build." />
                  <StatusRow channel="NPM / Bun" status="ROADMAP" result="Pending @binboi/cli publish." roadmap />
                  <StatusRow channel="Cargo / Rust" status="ROADMAP" result="Crate packaging in progress." roadmap />
                  <StatusRow channel="APT / Debian" status="ROADMAP" result="Repository hosting pending." roadmap />
                  <StatusRow channel="PIP / PyPI" status="ROADMAP" result="Python wrapper pending." roadmap />
                </tbody>
              </table>
            </div>
          </section>

          {/* 02. JAVASCRIPT ECOSYSTEM (ROADMAP) */}
          <section>
            <StepHeader number="02" title="JavaScript Ecosystem" />
            <div className="mt-12 grid lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <p className="text-sm text-zinc-500 leading-relaxed font-medium italic">
                  &quot;Node-native install flows are on the horizon. We will mark these as supported only after the package flow is tested on real-world CI/CD environments.&quot;
                </p>
                <div className="p-8 rounded-[2.5rem] border border-amber-500/10 bg-amber-500/5 flex items-start gap-4">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  <p className="text-[11px] text-amber-500/80 leading-relaxed font-bold uppercase tracking-tight">
                    Warning: Do not attempt to install @binboi/cli via npm yet. It belongs in the roadmap until officially announced.
                  </p>
                </div>
              </div>
              <TerminalBlock 
                title="Roadmap Preview Only"
                code={`npm install -g @binboi/cli\nbun add -g @binboi/cli`}
                isRoadmap
              />
            </div>
          </section>

          {/* 03. SYSTEM & LANGUAGE REPOSITORIES */}
          <section>
            <StepHeader number="03" title="System Repositories" />
            <div className="mt-12 grid md:grid-cols-3 gap-8">
              <RoadmapCard 
                icon={<Lock size={20} />} 
                title="Cargo (Rust)" 
                desc="Crate-based installation for Rust-heavy environments." 
                command="cargo install binboi"
              />
              <RoadmapCard 
                icon={<Construction size={20} />} 
                title="APT (Debian/Ubuntu)" 
                desc="Native .deb packaging and repository hosting." 
                command="sudo apt install binboi"
              />
              <RoadmapCard 
                icon={<Timer size={20} />} 
                title="PIP (Python)" 
                desc="PyPI distribution for Python-based workflow integration." 
                command="pip install binboi"
              />
            </div>
          </section>

          {/* 04. THE GO SOURCE TRUTH */}
          <section className="pt-20 border-t border-white/[0.03]">
            <div className="grid lg:grid-cols-5 gap-12 items-center">
              <div className="lg:col-span-2 space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <GitBranch className="text-cyan-400" size={24} />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Contributor Build</h2>
                <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                  Go source builds are different from unsupported ecosystems because they work **today** inside the repository. This is for contributors, not end-users.
                </p>
                <ul className="space-y-3">
                  {["Requires Go 1.21+", "Builds from /cmd/binboi-client", "Ideal for auth-logic testing"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[10px] font-black text-zinc-700 uppercase tracking-widest">
                      <div className="w-1 h-1 rounded-full bg-zinc-800" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:col-span-3">
                <TerminalBlock 
                  title="Source Build (Working Path)"
                  code={`git clone https://github.com/Miransas/binboi.git\ncd binboi\ngo build -o binboi ./cmd/binboi-client`}
                />
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

/* --- COMPONENTS --- */

function StepHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-6 group">
      <span className="text-7xl font-black text-white/5 tracking-tighter group-hover:text-amber-500/10 transition-colors">{number}</span>
      <h2 className="text-2xl font-black text-white uppercase tracking-tight">{title}</h2>
      <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );
}

function TerminalBlock({ title, code, isRoadmap = false }: { title: string; code: string; isRoadmap?: boolean }) {
  return (
    <div className={cn(
      "rounded-[2.5rem] border overflow-hidden shadow-2xl transition-all",
      isRoadmap ? "bg-zinc-900/10 border-white/5 opacity-50 grayscale hover:grayscale-0" : "bg-black border-white/[0.05]"
    )}>
      <div className="px-8 py-4 border-b border-white/[0.05] bg-zinc-950/50 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-white/5" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-white/5" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-white/5" />
        </div>
        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest font-mono">
          {isRoadmap ? "[ROADMAP_PREVIEW]" : title}
        </span>
        <Lock size={12} className={cn("text-zinc-700", !isRoadmap && "hidden")} />
      </div>
      <div className="p-10 font-mono text-sm leading-relaxed">
        <span className={cn("font-black mr-4", isRoadmap ? "text-zinc-700" : "text-[#9eff00]")}>
          {isRoadmap ? "?" : "❯"}
        </span>
        <span className={cn("break-all whitespace-pre-wrap", isRoadmap ? "text-zinc-600" : "text-zinc-300")}>{code}</span>
      </div>
      {isRoadmap && (
        <div className="bg-amber-500/10 p-4 text-center border-t border-amber-500/20">
          <span className="text-[9px] font-black text-amber-600 uppercase tracking-[0.2em]">Developmental Only / Not Active</span>
        </div>
      )}
    </div>
  );
}

function StatusRow({ channel, status, result, active = false, roadmap = false }: any) {
  return (
    <tr className={cn("hover:bg-white/[0.01] transition-colors group", !active && !roadmap && "opacity-60")}>
      <td className="p-8 text-white font-bold tracking-tight uppercase">{channel}</td>
      <td className="p-8">
        <span className={cn(
          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
          active ? "bg-[#9eff00]/10 text-[#9eff00] border-[#9eff00]/20" : 
          roadmap ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
          "bg-zinc-800 text-zinc-500 border-white/5"
        )}>
          {status}
        </span>
      </td>
      <td className="p-8 text-zinc-600 italic font-medium group-hover:text-zinc-400 transition-colors">&quot;{result}&ldquo;</td>
    </tr>
  );
}

function RoadmapCard({ icon, title, desc, command }: any) {
  return (
    <div className="p-8 rounded-[2.5rem] border border-white/[0.03] bg-zinc-900/10 space-y-6 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all hover:bg-zinc-900/20">
      <div className="flex items-center justify-between">
        <div className="text-zinc-700 group-hover:text-amber-500 transition-colors">{icon}</div>
        <span className="text-[8px] font-black text-zinc-800 uppercase tracking-widest border border-zinc-800 px-2 py-0.5 rounded">LOCKED</span>
      </div>
      <div className="space-y-2">
        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-tight">{title}</h4>
        <p className="text-[11px] text-zinc-600 leading-relaxed font-medium italic">&quot;{desc}&quot;</p>
      </div>
      <div className="pt-4 border-t border-white/5 font-mono text-[10px] text-zinc-700">
        <code>$ {command}</code>
      </div>
    </div>
  );
}