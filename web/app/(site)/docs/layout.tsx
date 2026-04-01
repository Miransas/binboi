"use client";

import { useState } from "react";
import { DocsSidebar } from "./_components/docs-sidebar";

// Sidebar ile tam senkronize değerler
const SIDEBAR_OPEN_W  = 260;
const SIDEBAR_CLOSE_W = 68; // 56'dan 68'e çektik, iconlar tam sığsın

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white selection:bg-emerald-500/30">
      {/* Sidebar */}
      <DocsSidebar isOpen={open} onToggle={() => setOpen((v) => !v)} />

      {/* Main Wrapper */}
      <div
        className="flex flex-col min-h-screen transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          // Masaüstünde sidebar genişliği kadar margin, mobilde 0
          marginLeft: typeof window !== "undefined" && window.innerWidth < 1024 
            ? 0 
            : (open ? SIDEBAR_OPEN_W : SIDEBAR_CLOSE_W)
        }}
      >
        {/* ── Mobile Top Bar ── */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-white/[0.05] bg-[#0b0b0d]/80 px-6 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/50 active:scale-95 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-emerald-400" />
            <span className="text-sm font-bold tracking-tight text-white/90">Binboi Docs</span>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 w-full max-w-full mx-auto px-6 md:px-10 py-12 lg:py-16">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>

       
      </div>
    </div>
  );
}