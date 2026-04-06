/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Apple, Monitor, Terminal, Cpu, 
  CheckCircle2, AlertTriangle, ChevronRight, 
  Command, Download, Boxes, ShieldCheck, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function InstallationPage() {
  return (
    <div className="min-h-screen bg-[#050506] text-zinc-400 font-sans selection:bg-[#9eff00]/30 selection:text-black pb-24">
      
      {/* 1. TOP STATUS NAVIGATION */}
      <nav className="h-16 border-b border-white/[0.03] bg-zinc-950/20 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#9eff00] flex items-center justify-center shadow-[0_0_20px_rgba(158,255,0,0.3)]">
              <Terminal className="h-4 w-4 text-black" />
            </div>
            <span className="text-[11px] font-black tracking-[0.4em] text-white uppercase">BINBOI_INSTALLER / v2.0.4</span>
          </div>
          <div className="h-4 w-px bg-white/10 hidden md:block" />
          <div className="hidden md:flex gap-4 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
            <span className="text-[#9eff00]">● Production_Ready</span>
            <span>OS_Independent</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-[10px] font-mono text-zinc-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
             UPTIME: 99.998%
           </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="max-w-7xl mx-auto px-8 pt-20 pb-16 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.85]">
            GET THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-600">BINARY.</span>
          </h1>
          <p className="mt-8 text-xl text-zinc-500 max-w-3xl leading-relaxed font-medium border-l-2 border-[#9eff00] pl-8">
            Binboi installation is honest. We don&lsquo;t overpromise. Choose the path that matches your machine&#39;s architecture and your risk tolerance. 
            No npm/cargo fluff—just high-performance binaries.
          </p>
        </motion.div>
      </header>

      <main className="max-w-7xl mx-auto px-8 space-y-32">
        
        {/* 3. MACOS SECTION */}
        <OSSection 
          id="macos"
          title="macOS" 
          icon={<Apple className="h-8 w-8" />} 
          accent="cyan"
          summary="Optimized for Apple Silicon (M1/M2/M3) and Intel. Homebrew is the primary delivery vehicle."
        >
          <div className="grid lg:grid-cols-2 gap-8">
            <InstallCard 
              title="Homebrew (Recommended)" 
              command="brew tap miransas/binboi && brew install binboi"
              details={[
                "Automatically manages PATH configuration.",
                "Easiest update path via 'brew upgrade'.",
                "Includes shell completions for Zsh/Bash."
              ]}
            />
            <InstallCard 
              title="Direct Binary" 
              command="curl -O https://releases.binboi.com/macos/binboi.tar.gz"
              details={[
                "No package manager overhead.",
                "Ideal for CI/CD runners and ephemeral environments.",
                "Requires manual PATH export."
              ]}
            />
          </div>
        </OSSection>

        {/* 4. LINUX SECTION */}
        <OSSection 
          id="linux"
          title="Linux" 
          icon={<Cpu className="h-8 w-8" />} 
          accent="emerald"
          summary="Native support for x86_64 and ARM64. Built for high-throughput relay operations."
        >
          <div className="space-y-8">
            <div className="p-8 rounded-[2.5rem] border border-[#9eff00]/10 bg-[#9eff00]/5 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-bold text-white uppercase tracking-tight">The install.sh Script</h3>
                <p className="text-sm text-zinc-400">The fastest way to get Binboi on Linux. Detects architecture, fetches the correct binary, and moves it to /usr/local/bin.</p>
              </div>
              <div className="flex-1 w-full">
                <CodeBlock code="curl -sSf https://install.binboi.com | sh" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <InfoBox title="Architecture Note" text="We support glibc and musl builds. Use the musl binary for Alpine Linux/Docker." />
              <InfoBox title="Sudo Requirements" text="The script requires sudo for bin placement. Use --prefix to install without root." />
            </div>
          </div>
        </OSSection>

        {/* 5. WINDOWS SECTION */}
        <OSSection 
          id="windows"
          title="Windows" 
          icon={<Monitor className="h-8 w-8" />} 
          accent="amber"
          summary="Native .exe builds. No WSL required, though WSL2 is fully supported."
        >
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <InstallCard 
                title="Direct Executable" 
                command="Invoke-WebRequest -Uri https://releases.binboi.com/win/binboi.exe"
                details={[
                  "Signed binaries for SmartScreen bypass.",
                  "Zero external dependencies (Single Binary).",
                  "Support for PowerShell 7 and CMD."
                ]}
              />
            </div>
            <div className="p-8 rounded-[2.5rem] border border-white/[0.03] bg-zinc-900/20 space-y-6">
              <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Logic Path</h4>
              <p className="text-xs text-zinc-500 leading-relaxed italic">
                &ldquo;Windows package managers (Winget/Choco) are on the roadmap. Until then, direct binary is the only source of truth.&ldquo;
              </p>
              <div className="pt-4 border-t border-white/5">
                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Current Status: MANUAL_SETUP</span>
              </div>
            </div>
          </div>
        </OSSection>

        {/* 6. GLOBAL INSTALL MATRIX */}
        <section className="pt-20 border-t border-white/[0.03]">
          <div className="flex items-center gap-4 mb-12">
            <Boxes className="h-6 w-6 text-zinc-500" />
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Unified Install Matrix</h2>
          </div>
          <div className="rounded-[3rem] border border-white/[0.03] bg-[#080809] overflow-hidden">
            <table className="w-full text-left text-[11px] font-mono border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.03]">
                  <th className="p-8 text-zinc-500 uppercase tracking-[0.2em]">Ecosystem</th>
                  <th className="p-8 text-zinc-500 uppercase tracking-[0.2em]">Status</th>
                  <th className="p-8 text-zinc-500 uppercase tracking-[0.2em]">Target</th>
                  <th className="p-8 text-zinc-500 uppercase tracking-[0.2em]">Logic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                <TableRow channel="Homebrew" status="Verified" target="macOS" logic="Managed PATH" />
                <TableRow channel="install.sh" status="Verified" target="Linux/Unix" logic="Auto Arch Detection" />
                <TableRow channel="Direct Binary" status="Stable" target="All Platforms" logic="Zero Dependency" />
                <TableRow channel="Go Build" status="Source" target="Contributors" logic="Custom Compilation" />
                <TableRow channel="NPM / Cargo" status="Roadmap" target="Web/Rust Devs" logic="Pending Testing" muted />
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}

/* --- COMPONENTS --- */

function OSSection({ title, icon, summary, accent, children }: any) {
  return (
    <section className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.03] pb-10">
        <div className="flex items-center gap-6">
          <div className={cn(
            "w-16 h-16 rounded-[2rem] flex items-center justify-center border border-white/5",
            accent === "cyan" && "text-cyan-400 bg-cyan-400/5 shadow-[0_0_30px_rgba(34,211,238,0.1)]",
            accent === "emerald" && "text-[#9eff00] bg-[#9eff00]/5 shadow-[0_0_30px_rgba(158,255,0,0.1)]",
            accent === "amber" && "text-amber-400 bg-amber-400/5 shadow-[0_0_30px_rgba(251,191,36,0.1)]"
          )}>
            {icon}
          </div>
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase">{title}</h2>
            <p className="text-zinc-500 text-sm font-medium mt-1">{summary}</p>
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

function InstallCard({ title, command, details }: any) {
  return (
    <div className="p-8 rounded-[2.5rem] border border-white/[0.03] bg-[#0c0c0d] hover:bg-[#0f0f11] transition-all group">
      <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_cyan]" />
        {title}
      </h3>
      <CodeBlock code={command} />
      <ul className="mt-8 space-y-4">
        {details.map((d: string, i: number) => (
          <li key={i} className="flex gap-3 text-xs text-zinc-500 font-medium">
            <span className="text-cyan-500 opacity-50">[{i}]</span>
            {d}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#9eff00]/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
      <div className="relative p-5 rounded-2xl bg-black border border-white/[0.05] font-mono text-[13px] text-zinc-300 flex items-center justify-between">
        <code className="break-all">{code}</code>
        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-600 hover:text-white">
          <Download size={14} />
        </button>
      </div>
    </div>
  );
}

function InfoBox({ title, text }: any) {
  return (
    <div className="flex gap-4 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.03]">
      <div className="mt-1"><Info className="h-4 w-4 text-zinc-700" /></div>
      <div>
        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{title}</h4>
        <p className="text-xs text-zinc-600 leading-relaxed font-medium">{text}</p>
      </div>
    </div>
  );
}

function TableRow({ channel, status, target, logic, muted = false }: any) {
  return (
    <tr className={cn("hover:bg-white/[0.01] transition-colors", muted && "opacity-30")}>
      <td className="p-8 text-white font-bold">{channel}</td>
      <td className="p-8">
        <span className={cn(
          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
          status === "Verified" ? "bg-[#9eff00]/10 text-[#9eff00] border-[#9eff00]/20" : "bg-zinc-800 text-zinc-500 border-white/5"
        )}>
          {status}
        </span>
      </td>
      <td className="p-8 text-zinc-400 font-medium">{target}</td>
      <td className="p-8 text-zinc-600 italic">{logic}</td>
    </tr>
  );
}