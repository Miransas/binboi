"use client";

import { useState } from "react";
import { DocsSidebar } from "./_components/docs-sidebar";
// adjust path if needed

const SIDEBAR_OPEN_W  = 260;
const SIDEBAR_CLOSE_W = 56;

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <DocsSidebar isOpen={open} onToggle={() => setOpen((v) => !v)} />

      {/* Content shifts with sidebar */}
      <div
        style={{
          marginLeft: open ? SIDEBAR_OPEN_W : SIDEBAR_CLOSE_W,
          transition: "margin-left 220ms cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Mobile top bar */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-white/[0.06] bg-[#0a0a0b]/90 px-5 backdrop-blur-md lg:hidden">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <span className="text-[13px] font-semibold tracking-tight text-white/80">Binboi Docs</span>
        </header>

        {/* Page content */}
        <main className="mx-auto max-w-full px-8 py-12">
          {children}
        </main>
      </div>
    </div>
  );
}