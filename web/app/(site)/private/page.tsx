"use client";

import React, { ReactNode } from "react";
import { Footer } from "../../../components/site/shared/footer";

// ─── Custom Primitives ────────────────────────────────────────────────────────

function AccentBadge({ children, color = "#9eff00" }: { children: ReactNode, color?: string }) {
  return (
    <div 
      className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(var(--badge-color),0.1)] mb-8"
      style={{ 
        borderColor: `${color}40`, 
        backgroundColor: `${color}10`,
        color: color 
      }}
    >
      <span 
        className="h-1.5 w-1.5 rounded-full animate-pulse" 
        style={{ 
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`
        }} 
      />
      {children}
    </div>
  );
}

export default function PrivateNetworkingPage() {
  return (
    <div className="relative min-h-screen bg-black text-zinc-300 selection:bg-[#9eff00]/30 selection:text-[#9eff00] flex flex-col">
      {/* Background Terminal Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
      
      {/* Top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00ffd1]/5 blur-[120px] pointer-events-none rounded-full z-0" />

      {/* Main Content */}
      <main className="relative z-10 flex-grow pt-32 pb-24 px-6 md:px-12">
        
        {/* Header Section */}
        <header className="mx-auto max-w-4xl text-center mb-16">
          <AccentBadge color="#00ffd1">Private access</AccentBadge>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Private networking is a future Binboi layer, <br className="hidden md:block"/>
            <span className="text-zinc-500">not a hidden MVP feature.</span>
          </h1>
          
          <p className="mx-auto max-w-3xl font-mono text-xs md:text-sm leading-relaxed text-zinc-400">
            The current Binboi product is strongest as a public HTTP tunnel platform with request and webhook debugging. Private overlays, raw TCP segmentation, and policy-heavy enterprise controls come later and should be described honestly.
          </p>
        </header>

        {/* Content Sections (Grid) */}
        <div className="mx-auto max-w-5xl grid gap-6 lg:grid-cols-2">
          
          {/* TODAY PANEL */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#050505]/80 backdrop-blur-md p-8 transition-all duration-500 hover:border-[#00ffd1]/40 hover:shadow-[0_8px_30px_rgba(0,255,209,0.05)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00ffd1]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

            <div className="relative z-10 mb-6 border-b border-zinc-800/50 pb-6">
              <span className="inline-block mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-[#00ffd1]">
                {">"} Status: Today
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                Public HTTP exposure with explicit product boundaries
              </h2>
              <p className="font-mono text-[11px] leading-relaxed text-zinc-500">
                The repository currently exposes services through a managed domain or verified custom domain and relies on the surrounding edge stack for tighter network controls.
              </p>
            </div>
            
            <div className="relative z-10 flex-grow space-y-4 font-mono text-[11px] md:text-xs leading-relaxed text-zinc-400">
              <p className="flex gap-3">
                <span className="text-[#00ffd1]/40 select-none">~</span>
                <span>HTTP tunneling, access tokens, request visibility, logs, and developer-focused debugging are the real MVP surfaces.</span>
              </p>
              <p className="flex gap-3">
                <span className="text-[#00ffd1]/40 select-none">~</span>
                <span>If you need IP restriction or private-edge behavior today, use your own ingress, firewall, VPN, or edge proxy in front of Binboi.</span>
              </p>
            </div>
          </div>

          {/* LATER PANEL */}
          <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#050505]/80 backdrop-blur-md p-8 transition-all duration-500 hover:border-[#9eff00]/40 hover:shadow-[0_8px_30px_rgba(158,255,0,0.05)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#9eff00]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

            <div className="relative z-10 mb-6 border-b border-zinc-800/50 pb-6">
              <span className="inline-block mb-4 font-mono text-[10px] font-bold uppercase tracking-widest text-[#9eff00]">
                {">"} Status: Later
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                What a true private networking release would need
              </h2>
              <p className="font-mono text-[11px] leading-relaxed text-zinc-500">
                Private access is not just a route checkbox. It requires stronger identity, policy enforcement, audit trails, and clear operator guarantees.
              </p>
            </div>
            
            <div className="relative z-10 flex-grow space-y-4 font-mono text-[11px] md:text-xs leading-relaxed text-zinc-400">
              <p className="flex gap-3">
                <span className="text-[#9eff00]/40 select-none">~</span>
                <span>Future private networking should include explicit machine identity, route-aware policy, edge enforcement, and better observability for TCP and non-HTTP traffic.</span>
              </p>
              <p className="flex gap-3">
                <span className="text-[#9eff00]/40 select-none">~</span>
                <span>Binboi will be more trustworthy if it ships those features after the current HTTP and control-plane lifecycle is fully battle-tested.</span>
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}