/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Apple, Terminal, ShieldCheck, Zap, 
  Cpu, Command, ChevronRight, Copy, 
  ExternalLink, Info, AlertCircle, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MacosInstallationPage() {
  return (
    <div className="min-h-screen bg-[#050506] text-zinc-400 font-sans selection:bg-[#9eff00]/30 selection:text-black">
      
      {/* 1. TOP NAV / SYSTEM STATUS */}
      <nav className="h-14 border-b border-white/[0.03] bg-zinc-950/40 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-white uppercase">
            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_cyan]" />
            Binboi_OS / Darwin_Xnu
          </div>
        </div>
        <div className="flex gap-6 items-center">
          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Platform: macOS_11.0+</span>
          <div className="h-4 w-px bg-white/5" />
          <a href="/docs/installation" className="text-[9px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
            Installation Map <ChevronRight size={10} />
          </a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 pt-24 pb-32">
        
        {/* 2. HERO / ARCHITECTURE FOCUS */}
        <header className="mb-24 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.85] uppercase">
              macOS <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-800">Deployment.</span>
            </h1>
            <p className="mt-8 text-xl text-zinc-500 max-w-2xl leading-relaxed font-medium">
              Native Darwin builds optimized for Apple Silicon. We recommend Homebrew for its clean PATH management and unified upgrade flow.
            </p>
          </motion.div>
        </header>

        <div className="space-y-32">
          
          {/* 01. HOMEBREW: THE PRIMARY PATH */}
          <section>
            <StepHeader number="01" title="The Standard: Homebrew" />
            <div className="grid lg:grid-cols-5 gap-12 mt-12">
              <div className="lg:col-span-3">
                <TerminalBlock 
                  title="brew_install.sh"
                  code={`brew tap miransas/binboi && brew install binboi`} 
                />
                <div className="mt-8 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] space-y-6">
                  <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Why Homebrew?</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-xs text-white font-bold uppercase">Managed PATH</p>
                      <p className="text-[11px] text-zinc-500 leading-relaxed italic">&quot;Automatically symlinks to /opt/homebrew/bin on M1/M2/M3 chips.&ldquo;</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-white font-bold uppercase">Binary Signing</p>
                      <p className="text-[11px] text-zinc-500 leading-relaxed italic">&quot;Ensures macOS Gatekeeper recognizes the binary as safe.&quot;</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-6">
                <LogicNote 
                  title="M1/M2/M3 Optimization"
                  text="Homebrew detects your ARM64 architecture natively. This avoids Rosetta 2 overhead and keeps the binary running on efficiency cores when idle."
                />
                <div className="p-8 rounded-[2.5rem] border border-[#9eff00]/10 bg-[#9eff00]/5 flex items-start gap-4">
                  <Zap className="h-5 w-5 text-[#9eff00] shrink-0" />
                  <p className="text-xs text-[#9eff00]/80 leading-relaxed font-semibold uppercase tracking-tight">
                    Update anytime with &lsquo;brew upgrade binboi&lsquo;.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 02. INSTALL.SH: THE FALLBACK */}
          <section>
            <StepHeader number="02" title="Scripted Fallback" />
            <div className="mt-12 space-y-8">
              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                   <p className="text-sm text-zinc-500 leading-relaxed">
                     The install script is a lightweight alternative when you don&apos;t want to use Homebrew. It pulls the Darwin archive directly and attempts to move it to your system path.
                   </p>
                   <div className="flex gap-4">
                      <InfoBox icon={<ShieldCheck />} title="Verified" text="Checksum verified." />
                      <InfoBox icon={<Cpu />} title="Universal" text="Auto-arch detection." />
                   </div>
                </div>
                <TerminalBlock 
                  title="install.sh"
                  code={`curl -fsSL https://install.binboi.com/darwin | bash`} 
                />
              </div>
            </div>
          </section>

          {/* 03. MANUAL BINARY: FOR THE PURISTS */}
          <section>
            <StepHeader number="03" title="Manual Binary Control" />
            <div className="mt-12">
              <div className="p-8 rounded-[3rem] border border-white/[0.03] bg-[#0c0c0d] overflow-hidden">
                <div className="flex flex-col md:flex-row gap-12">
                  <div className="flex-1 space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">Select Archive</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <ArchiveCard title="Apple Silicon" arch="darwin_arm64" active />
                        <ArchiveCard title="Intel Core" arch="darwin_amd64" />
                      </div>
                    </div>
                    <div className="space-y-2">
                       <span className="text-[9px] font-bold text-zinc-600 uppercase">Extraction & PATH Setup</span>
                       <div className="space-y-3">
                          <CodeSmall code="tar -xzf binboi_darwin_arm64.tar.gz" />
                          <CodeSmall code="chmod +x binboi" />
                          <CodeSmall code="sudo mv binboi /usr/local/bin/binboi" />
                       </div>
                    </div>
                  </div>
                  <div className="w-full md:w-72 p-8 rounded-[2rem] bg-black border border-white/5 space-y-6">
                     <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Logic Path</h4>
                     <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                       &ldquo;Manual placement is ideal for CI machines or when you need multiple versions of the CLI for testing.&ldquo;
                     </p>
                     <div className="pt-4 border-t border-white/5">
                        <AlertCircle className="h-4 w-4 text-amber-500 mb-2" />
                        <p className="text-[9px] text-zinc-600 font-bold uppercase">Gatekeeper Note: You may need to allow the binary in Security & Privacy settings.</p>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 04. VERIFICATION */}
          <section className="pt-20 border-t border-white/[0.03]">
            <div className="flex flex-col items-center text-center space-y-12">
              <div className="space-y-4 text-center">
                <div className="inline-flex h-12 w-12 rounded-full border border-[#9eff00]/20 bg-[#9eff00]/5 items-center justify-center mb-4">
                   <Command className="h-5 w-5 text-[#9eff00]" />
                </div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">04 / Final Verification</h2>
                <p className="text-zinc-500 text-sm max-w-lg">Run these commands to confirm Darwin has indexed the binary and authenticated your account.</p>
              </div>
              
              <div className="w-full max-w-3xl bg-black rounded-[2.5rem] border border-[#9eff00]/20 p-12 shadow-[0_0_60px_rgba(158,255,0,0.03)] group transition-all hover:border-[#9eff00]/40">
                <div className="flex items-start justify-between">
                  <pre className="text-left text-[15px] font-mono text-zinc-300 leading-[2.5]">
                    <code>
                      <span className="text-[#9eff00]">$</span> binboi version <br />
                      <span className="text-[#9eff00]">$</span> binboi login --token &lt;dashboard-token&gt; <br />
                      <span className="text-[#9eff00]">$</span> binboi whoami
                    </code>
                  </pre>
                  <div className="flex flex-col gap-2">
                    <span className="px-2 py-1 rounded bg-[#9eff00]/10 text-[#9eff00] text-[9px] font-black uppercase tracking-widest">Ready</span>
                    <span className="px-2 py-1 rounded bg-white/5 text-zinc-600 text-[9px] font-black uppercase tracking-widest">Authenticated</span>
                  </div>
                </div>
                <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
                  <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest italic">Success: Darwin Instance Linked</p>
                  <button className="px-8 py-3 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-[#9eff00] transition-colors flex items-center gap-3">
                    Start Proxy <ArrowRight size={14} />
                  </button>
                </div>
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
      <span className="text-7xl font-black text-white/5 tracking-tighter group-hover:text-white/10 transition-colors">{number}</span>
      <h2 className="text-3xl font-black text-white uppercase tracking-tight">{title}</h2>
      <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );
}

function TerminalBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="rounded-[2.5rem] border border-white/[0.05] bg-black overflow-hidden shadow-2xl">
      <div className="px-8 py-4 border-b border-white/[0.05] bg-zinc-950/50 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-white/5" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-white/5" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-white/5" />
        </div>
        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest font-mono">{title}</span>
        <Copy size={14} className="text-zinc-600 hover:text-white cursor-pointer transition-colors" />
      </div>
      <div className="p-10 font-mono text-sm leading-relaxed">
        <span className="text-[#9eff00] font-black mr-4">❯</span>
        <span className="text-zinc-200 break-all">{code}</span>
      </div>
    </div>
  );
}

function ArchiveCard({ title, arch, active = false }: any) {
  return (
    <div className={cn(
      "p-6 rounded-[1.5rem] border transition-all cursor-pointer",
      active ? "bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.05)]" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
    )}>
      <h5 className={cn("text-[10px] font-black uppercase mb-1", active ? "text-cyan-400" : "text-zinc-600")}>{title}</h5>
      <p className="text-[11px] font-mono text-zinc-400">{arch}</p>
    </div>
  );
}

function CodeSmall({ code }: { code: string }) {
  return (
    <div className="p-4 rounded-2xl bg-black border border-white/5 font-mono text-xs text-zinc-400 flex justify-between items-center group">
      <code>{code}</code>
      <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-cyan-400" />
    </div>
  );
}

function LogicNote({ title, text }: { title: string; text: string }) {
  return (
    <div className="p-8 rounded-[2.5rem] border border-white/[0.03] bg-zinc-900/10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
        <Apple size={60} className="text-white" />
      </div>
      <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Info size={14} className="text-zinc-600" /> {title}
      </h4>
      <p className="text-xs text-zinc-600 leading-relaxed font-medium italic relative z-10">&quot;{text}&quot;</p>
    </div>
  );
}

function InfoBox({ icon, title, text }: any) {
  return (
    <div className="flex-1 p-6 rounded-[1.5rem] bg-white/[0.01] border border-white/[0.03] space-y-3">
      <div className="text-zinc-700">{icon}</div>
      <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{title}</h4>
      <p className="text-[10px] text-zinc-600 leading-relaxed font-medium">{text}</p>
    </div>
  );
}