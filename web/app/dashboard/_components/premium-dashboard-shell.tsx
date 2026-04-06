/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Activity, Terminal, Zap, Cpu, 
  ShieldCheck, BarChart3, Layers, Search, Command,
  ArrowUpRight
} from "lucide-react";

export function PremiumDashboardShell({
  eyebrow,
  title,
  description,
  highlights,
  panels,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  highlights: ReadonlyArray<{
    label: string;
    value: string;
    note: string;
  }>;
  panels: ReadonlyArray<{
    title: string;
    description: string;
    bullets?: ReadonlyArray<string>;
  }>;
  children?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050506] text-zinc-400 font-sans selection:bg-[#9eff00]/30 overflow-hidden">
      
      {/* 1. ULTRA SLIM TOPBAR */}
      <div className="h-14 border-b border-white/[0.03] bg-zinc-950/20 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-[#9eff00] flex items-center justify-center shadow-[0_0_15px_rgba(158,255,0,0.2)]">
              <Layers className="h-3.5 w-3.5 text-black" />
            </div>
            <span className="text-[10px] font-black tracking-[0.4em] text-white/90 uppercase whitespace-nowrap">
              {eyebrow} <span className="text-zinc-700 ml-2">v2.0.4</span>
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-6 border-l border-white/5 pl-8">
            <StatusDot label="CORE" status="OPTIMAL" />
            <StatusDot label="NETWORK" status="STABLE" />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-mono text-zinc-500">
              <Search className="h-3 w-3" />
              <span>Deep Search...</span>
              <kbd className="opacity-30 ml-2 font-sans underline text-[8px]">⌘K</kbd>
           </div>
           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/10" />
        </div>
      </div>

      <main className="flex h-[calc(100vh-56px)]">
        
        {/* 2. LEFT: OPERATIONAL STATS (Resimdeki Stil) */}
        <aside className="hidden xl:flex w-[320px] shrink-0 flex-col border-r border-white/[0.03] bg-[#080809] p-6 overflow-y-auto space-y-10">
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">Operational Stats</h4>
            <div className="space-y-4">
              {highlights.map((h, i) => (
                <div key={i} className="p-5 rounded-[2rem] bg-zinc-900/40 border border-white/[0.03] group hover:border-[#9eff00]/20 transition-all duration-500">
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-3">{h.label}</p>
                  <p className="text-xl font-bold text-white tracking-tight">{h.value}</p>
                  <div className="mt-4 h-1 w-full bg-zinc-800/50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: "65%" }} 
                      className="h-full bg-gradient-to-r from-[#9eff00] to-cyan-500" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">System Nodes</h4>
            <div className="space-y-2">
              {["edge-sg-01", "edge-us-east", "tunnel-ams-04"].map((node) => (
                <div key={node} className="flex items-center justify-between text-[10px] font-mono p-3 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.05] transition-colors">
                  <span className="text-zinc-400">{node}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#9eff00] text-[8px] font-bold">ONLINE</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#9eff00] animate-pulse shadow-[0_0_8px_#9eff00]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* 3. CENTER: WORKSPACE */}
        <section className="flex-1 min-w-0 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-4xl mx-auto space-y-12">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h1 className="text-5xl font-black tracking-tighter text-white sm:text-7xl leading-[0.9]">
                {title}
              </h1>
              <p className="text-lg text-zinc-500 leading-relaxed font-medium max-w-2xl border-l-2 border-[#9eff00]/20 pl-8">
                {description}
              </p>
            </motion.div>

            <div className="pt-8 border-t border-white/[0.03]">
              {children}
            </div>
          </div>
        </section>

        {/* 4. RIGHT: LOGIC & THROUGHPUT (Resimdeki Stil) */}
        <aside className="hidden lg:flex w-[420px] shrink-0 flex-col border-l border-white/[0.03] bg-[#080809] p-8 overflow-y-auto space-y-8">
          {panels.map((panel, idx) => (
            <div key={idx} className="p-8 rounded-[2.5rem] border border-white/[0.03] bg-[#0c0c0d] relative overflow-hidden group hover:bg-[#0f0f11] transition-all">
              <div className="absolute top-6 right-8 opacity-5 group-hover:opacity-20 transition-opacity">
                <Command className="h-10 w-10 text-white" />
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                   <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                </div>
                <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">Logic Path {idx + 1}</span>
              </div>
              
              <h2 className="text-lg font-bold text-white tracking-tight mb-3 uppercase">{panel.title}</h2>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">{panel.description}</p>
              
              {panel.bullets && (
                <div className="mt-8 space-y-3">
                  {panel.bullets.map((b, i) => (
                    <div key={i} className="group/item flex items-start gap-4 p-4 rounded-2xl bg-black/40 border border-white/[0.02] hover:border-white/5 transition-all">
                      <span className="text-[10px] font-bold text-zinc-800 group-hover/item:text-cyan-500 transition-colors">[{i}]</span>
                      <p className="text-[11px] font-medium leading-relaxed text-zinc-400">{b}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* REALTIME THROUGHPUT (Resimdeki en alt bar) */}
          <div className="mt-auto p-6 rounded-[2rem] border border-white/[0.03] bg-zinc-950/50">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 tracking-widest uppercase">
                 <BarChart3 className="h-3.5 w-3.5" /> Throughput
              </div>
              <span className="text-[11px] font-mono text-white font-bold tracking-tighter">89.4 KB/S</span>
            </div>
            <div className="flex gap-1.5 h-12 items-end px-1">
              {[30, 50, 40, 80, 45, 90, 60, 70, 40, 55, 65, 85, 40, 60].map((h, i) => (
                <motion.div 
                  key={i} 
                  initial={{ height: 0 }} 
                  animate={{ height: `${h}%` }}
                  className="flex-1 bg-cyan-500/10 rounded-t-sm hover:bg-cyan-500/40 transition-colors cursor-help" 
                />
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function StatusDot({ label, status }: { label: string, status: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[8px] font-black text-zinc-600 tracking-widest">{label}</span>
      <span className="text-[9px] font-bold text-white tracking-tighter">{status}</span>
      <div className="w-1 h-1 rounded-full bg-[#9eff00]" />
    </div>
  );
}
