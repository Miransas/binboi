/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Monitor, Terminal, ShieldAlert, Cpu, 
  Settings, CheckCircle2, ChevronRight, 
  Copy, ArrowRight, Info, HardDrive, AlertTriangle 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function WindowsInstallationPage() {
  return (
    <div className="min-h-screen bg-[#050506] text-zinc-400 font-sans selection:bg-[#9eff00]/30 selection:text-black">
      
      {/* 1. TOP NAV / SYSTEM STATUS */}
      <nav className="h-14 border-b border-white/[0.03] bg-zinc-950/40 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-white uppercase font-mono">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
            Binboi_OS / Windows_Kernel
          </div>
        </div>
        <div className="flex gap-6 items-center font-mono">
          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Build: Win_x64_Native</span>
          <div className="h-4 w-px bg-white/5" />
          <a href="/docs/installation" className="text-[9px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
            Deployment Map <ChevronRight size={10} />
          </a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 pt-24 pb-32">
        
        {/* 2. HERO / WINDOWS FOCUS */}
        <header className="mb-24 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.85] uppercase">
              Windows <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-800">Runtime.</span>
            </h1>
            <p className="mt-8 text-xl text-zinc-500 max-w-3xl leading-relaxed font-medium border-l-2 border-blue-600 pl-8">
              Windows support is built on native binaries. We prioritize direct execution over complex installers to ensure zero hidden dependencies and maximum transparency.
            </p>
          </motion.div>
        </header>

        <div className="space-y-32">
          
          {/* 01. THE HONEST PATH: DIRECT BINARY */}
          <section>
            <StepHeader number="01" title="Direct Deployment" />
            <div className="grid lg:grid-cols-5 gap-12 mt-12">
              <div className="lg:col-span-3">
                <TerminalBlock 
                  title="powershell_setup.ps1"
                  code={`Expand-Archive .\\binboi_windows_amd64.zip -DestinationPath .\\binboi\nMove-Item .\\binboi\\binboi.exe $HOME\\bin\\binboi.exe`} 
                />
                <div className="mt-8 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] space-y-6">
                  <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Execution Logic:</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-xs text-white font-bold uppercase">No Registry Bloat</p>
                      <p className="text-[11px] text-zinc-500 leading-relaxed italic">&quot;Binboi doesn&apos;t touch the Windows Registry. Everything is contained within the executable.&quot;</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-white font-bold uppercase">Safe Extraction</p>
                      <p className="text-[11px] text-zinc-500 leading-relaxed italic">&quot;Expand-Archive ensures the binary integrity is maintained during unpacking.&quot;</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-6">
                <LogicNote 
                  title="Why no Winget?"
                  text="Windows package managers are on our roadmap. We only publish when the manifest automation is 100% stable. Until then, the binary is the only source of truth."
                />
                <div className="p-8 rounded-[2.5rem] border border-amber-500/10 bg-amber-500/5 flex items-start gap-4">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-500/80 leading-relaxed font-semibold uppercase tracking-tight">
                    Native .exe builds are signed for SmartScreen bypass.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 02. PATH CONFIGURATION */}
          <section>
            <StepHeader number="02" title="Environment Setup" />
            <div className="mt-12 space-y-8">
              <div className="p-8 rounded-[3rem] border border-white/[0.03] bg-[#0c0c0d] overflow-hidden">
                <div className="flex items-center gap-3 mb-8">
                  <Settings className="text-blue-500" size={20} />
                  <span className="text-xs font-black text-white uppercase tracking-widest">Automated PATH Injection</span>
                </div>
                <div className="grid lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <p className="text-sm text-zinc-500 leading-relaxed italic">
                      &quot;To use Binboi from any terminal (PowerShell, CMD, or Git Bash), the directory containing <code>binboi.exe</code> must be in your User PATH.&quot;
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                       <InfoBox icon={<HardDrive size={16}/>} title="Location" text="$HOME\bin" />
                       <InfoBox icon={<CheckCircle2 size={16}/>} title="Scope" text="User Variable" />
                    </div>
                  </div>
                  <TerminalBlock 
                    title="update_path.ps1"
                    code={`$target = "$HOME\\bin"\n[Environment]::SetEnvironmentVariable(\n  "Path",\n  $env:Path + ";$target",\n  "User"\n)`} 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 03. ARCHITECTURE SELECTION */}
          <section>
            <StepHeader number="03" title="Target Architectures" />
            <div className="mt-12 grid md:grid-cols-2 gap-8">
              <ArchCard 
                title="Windows x64" 
                arch="amd64" 
                desc="The standard for most Windows desktops and servers. High-performance relay support." 
                active 
              />
              <ArchCard 
                title="Windows ARM64" 
                arch="arm64" 
                desc="Optimized for Windows on ARM devices (Surface Pro X, etc). Native execution." 
              />
            </div>
          </section>

          {/* 04. VERIFICATION */}
          <section className="pt-20 border-t border-white/[0.03]">
            <div className="flex flex-col items-center text-center space-y-12">
              <div className="space-y-4">
                <div className="inline-flex h-12 w-12 rounded-full border border-blue-500/20 bg-blue-500/5 items-center justify-center mb-4">
                   <Monitor className="h-5 w-5 text-blue-400" />
                </div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">04 / Logic Verification</h2>
                <p className="text-zinc-500 text-sm max-w-lg">Restart your terminal and run these checks to ensure the Windows Kernel has indexed the Binboi binary.</p>
              </div>
              
              <div className="w-full max-w-3xl bg-black rounded-[2.5rem] border border-blue-500/20 p-12 shadow-[0_0_60px_rgba(59,130,246,0.03)]">
                <pre className="text-left text-[15px] font-mono text-zinc-300 leading-[2.5]">
                  <code>
                    <span className="text-blue-500">PS &gt;</span> binboi version <br />
                    <span className="text-blue-500">PS &gt;</span> binboi login --token &lt;token&gt; <br />
                    <span className="text-blue-500">PS &gt;</span> binboi whoami
                  </code>
                </pre>
                <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
                  <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest italic">Status: Windows_Session_Active</p>
                  <button className="px-8 py-3 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all flex items-center gap-3">
                    Open Tunnel <ArrowRight size={14} />
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
      <span className="text-7xl font-black text-white/5 tracking-tighter group-hover:text-blue-500/10 transition-colors">{number}</span>
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
        <span className="text-blue-500 font-black mr-4">PS &gt;</span>
        <span className="text-zinc-200 break-all whitespace-pre-wrap">{code}</span>
      </div>
    </div>
  );
}

function ArchCard({ title, arch, desc, active = false }: any) {
  return (
    <div className={cn(
      "p-8 rounded-[2.5rem] border transition-all cursor-pointer group",
      active ? "bg-blue-500/5 border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.05)]" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
    )}>
      <div className="flex justify-between items-start mb-6">
        <h4 className={cn("text-lg font-black uppercase tracking-tight", active ? "text-white" : "text-zinc-500")}>{title}</h4>
        <span className={cn("px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border", active ? "border-blue-500/30 text-blue-400" : "border-zinc-800 text-zinc-700")}>
          {arch}
        </span>
      </div>
      <p className="text-xs text-zinc-600 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function LogicNote({ title, text }: { title: string; text: string }) {
  return (
    <div className="p-8 rounded-[2.5rem] border border-white/[0.03] bg-zinc-900/10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
        <Monitor size={60} className="text-white" />
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
    <div className="p-6 rounded-[1.5rem] bg-white/[0.01] border border-white/[0.03] space-y-3">
      <div className="text-zinc-700">{icon}</div>
      <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{title}</h4>
      <p className="text-[10px] text-zinc-600 leading-relaxed font-medium">{text}</p>
    </div>
  );
}