/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Terminal, Cpu, ShieldAlert, CheckCircle2, 
  Info, ArrowRight, HardDrive, GitBranch, 
  ChevronRight, Copy, ExternalLink 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LinuxInstallationPage() {
  return (
    <div className="min-h-screen bg-[#050506] text-zinc-400 font-sans selection:bg-[#9eff00]/30 selection:text-black">
      
      {/* HEADER / STATUS BAR */}
      <nav className="h-14 border-b border-white/[0.03] bg-zinc-950/40 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-white uppercase">
            <div className="w-2 h-2 rounded-full bg-[#9eff00] animate-pulse" />
            Binboi_OS / Linux_Deploy
          </div>
        </div>
        <div className="flex gap-6 items-center">
          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Target: amd64_arm64</span>
          <div className="h-4 w-px bg-white/5" />
          <a href="/docs/installation" className="text-[9px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
            Back to Map <ChevronRight size={10} />
          </a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 pt-24 pb-32">
        
        {/* HERO SECTION */}
        <header className="mb-24 space-y-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none uppercase">
              Linux <span className="text-zinc-700">Core</span><br />
              Installation.
            </h1>
            <p className="mt-8 text-lg text-zinc-500 max-w-2xl leading-relaxed font-medium">
              Binboi is a high-performance tunneling engine built in Go. On Linux, we prioritize explicit control over magic. Use <code>install.sh</code> for speed, or direct binaries for production rigidity.
            </p>
          </motion.div>
        </header>

        <div className="space-y-32">
          
          {/* 01. THE FASTEST PATH: INSTALL.SH */}
          <section className="group">
            <StepHeader number="01" title="The Automated Script" />
            <div className="grid lg:grid-cols-5 gap-12 mt-12">
              <div className="lg:col-span-3">
                <TerminalBlock 
                  title="install.sh"
                  code={`curl -fsSL https://raw.githubusercontent.com/Miransas/binboi/main/install.sh | bash`} 
                />
                <div className="mt-8 p-6 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] space-y-4">
                  <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Script Internal Logic:</h4>
                  <ul className="space-y-3 text-xs text-zinc-500 font-medium">
                    <li className="flex gap-3"><CheckCircle2 size={14} className="text-[#9eff00]" /> Detects Kernel and Architecture (AMD64/ARM64).</li>
                    <li className="flex gap-3"><CheckCircle2 size={14} className="text-[#9eff00]" /> Fetches latest signed binary from release artifacts.</li>
                    <li className="flex gap-3"><CheckCircle2 size={14} className="text-[#9eff00]" /> Moves <code>binboi</code> to <code>/usr/local/bin</code> (requires sudo).</li>
                  </ul>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-6">
                <LogicNote 
                  title="Why use a script?"
                  text="It eliminates the risk of architecture mismatch. If you are on an ARM machine (like a Graviton instance), the script will pull the arm64 archive automatically."
                />
                <div className="p-8 rounded-[2.5rem] border border-cyan-500/10 bg-cyan-500/5">
                  <ShieldAlert className="h-5 w-5 text-cyan-400 mb-4" />
                  <p className="text-xs text-cyan-400/80 leading-relaxed font-semibold uppercase tracking-tight">
                    Always inspect scripts before piping to bash. Our source is open for audit on GitHub.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 02. DIRECT BINARY: THE MANUAL PATH */}
          <section>
            <StepHeader number="02" title="Manual Binary Deployment" />
            <div className="mt-12 space-y-8">
              <div className="p-8 rounded-[3rem] border border-white/[0.03] bg-[#0c0c0d] overflow-hidden">
                <div className="flex items-center gap-3 mb-8">
                  <HardDrive className="text-zinc-700" size={20} />
                  <span className="text-xs font-black text-white uppercase tracking-widest">Step-by-step extraction</span>
                </div>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <span className="text-[9px] font-bold text-zinc-600 uppercase">1. Extract archive</span>
                       <CodeSmall code="tar -xzf binboi_linux_amd64.tar.gz" />
                    </div>
                    <div className="space-y-2">
                       <span className="text-[9px] font-bold text-zinc-600 uppercase">2. Permissions</span>
                       <CodeSmall code="chmod +x binboi" />
                    </div>
                  </div>
                  <div className="pt-4">
                    <span className="text-[9px] font-bold text-zinc-600 uppercase">3. System Move (Optional)</span>
                    <CodeSmall code="sudo mv binboi /usr/local/bin/binboi" />
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <InfoBox icon={<Info />} title="Sudo Logic" text="Sudo is only needed for /usr/local/bin. Use $HOME/.local/bin for rootless installs." />
                <InfoBox icon={<Cpu />} title="Arch Support" text="We provide specific builds for ARM64 and AMD64. Ensure you match the binary to your host." />
                <InfoBox icon={<CheckCircle2 />} title="Checksums" text="Verify downloads with sha256sum to ensure artifact integrity before execution." />
              </div>
            </div>
          </section>

          {/* 03. SOURCE BUILD: THE CONTRIBUTOR PATH */}
          <section>
            <StepHeader number="03" title="Source Build (Go)" />
            <div className="mt-12 grid lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <p className="text-sm text-zinc-500 leading-relaxed italic border-l border-zinc-800 pl-6">
                  &ldquo;If you are modifying the relay, CLI, or auth behavior, source builds are the most direct path to testing changes.&ldquo;
                </p>
                <div className="flex items-center gap-4 py-4">
                  <div className="px-3 py-1 rounded bg-zinc-900 border border-white/5 text-[10px] font-mono text-zinc-500">Go 1.21+</div>
                  <div className="px-3 py-1 rounded bg-zinc-900 border border-white/5 text-[10px] font-mono text-zinc-500">GCC / Build-essential</div>
                </div>
              </div>
              <TerminalBlock 
                title="Build Command"
                code={`git clone https://github.com/Miransas/binboi.git
cd binboi
go build -o binboi ./cmd/binboi-client`} 
              />
            </div>
          </section>

          {/* 04. VERIFICATION */}
          <section className="pt-20 border-t border-white/[0.03]">
            <div className="flex flex-col items-center text-center space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">04 / Verify Setup</h2>
                <p className="text-zinc-500 text-sm max-w-lg">Confirm that the CLI is on your PATH and correctly reading your account identity.</p>
              </div>
              
              <div className="w-full max-w-2xl bg-black rounded-[2.5rem] border border-[#9eff00]/20 p-10 shadow-[0_0_50px_rgba(158,255,0,0.05)]">
                <pre className="text-left text-sm font-mono text-[#9eff00]/80 leading-loose">
                  <code>
                    $ binboi version <br />
                    $ binboi login --token &lt;dashboard-token&gt; <br />
                    $ binboi whoami
                  </code>
                </pre>
                <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">Deployment Verified</span>
                  <button className="flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest hover:text-[#9eff00] transition-colors">
                    Start Tunneling <ArrowRight size={14} />
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

/* --- LOCAL COMPONENTS --- */

function StepHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-6">
      <span className="text-6xl font-black text-white/5 tracking-tighter">{number}</span>
      <h2 className="text-2xl font-black text-white uppercase tracking-tight">{title}</h2>
      <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );
}

function TerminalBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="rounded-[2rem] border border-white/[0.05] bg-black overflow-hidden shadow-2xl">
      <div className="px-6 py-3 border-b border-white/[0.05] bg-zinc-950/50 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
        </div>
        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{title}</span>
        <Copy size={12} className="text-zinc-600 hover:text-white cursor-pointer transition-colors" />
      </div>
      <div className="p-8 font-mono text-sm leading-relaxed">
        <span className="text-[#9eff00] mr-3">$</span>
        <span className="text-zinc-300 break-all whitespace-pre-wrap">{code}</span>
      </div>
    </div>
  );
}

function CodeSmall({ code }: { code: string }) {
  return (
    <div className="p-4 rounded-xl bg-black border border-white/5 font-mono text-xs text-zinc-400 flex justify-between items-center group">
      <code>{code}</code>
      <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-[#9eff00]" />
    </div>
  );
}

function LogicNote({ title, text }: { title: string; text: string }) {
  return (
    <div className="p-8 rounded-[2rem] border border-white/[0.03] bg-zinc-900/10">
      <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
        <GitBranch size={12} className="text-zinc-600" /> {title}
      </h4>
      <p className="text-xs text-zinc-600 leading-relaxed font-medium italic">&ldquo;{text}&ldquo;</p>
    </div>
  );
}

function InfoBox({ icon, title, text }: any) {
  return (
    <div className="p-6 rounded-3xl bg-white/[0.01] border border-white/[0.03] space-y-3">
      <div className="text-zinc-700">{React.cloneElement(icon, { size: 16 })}</div>
      <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{title}</h4>
      <p className="text-[11px] text-zinc-600 leading-relaxed font-medium">{text}</p>
    </div>
  );
}