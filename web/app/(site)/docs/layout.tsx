"use client";

import type { CSSProperties, ReactNode } from "react";
import { Menu } from "lucide-react";
import { useState } from "react";

import { DocsSidebar } from "./_components/docs-sidebar";

export default function DocsLayout({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const layoutStyle = {
    "--docs-sidebar-width": isCollapsed ? "5.5rem" : "18rem",
  } as CSSProperties;

  return (
    <div className="min-h-screen bg-[#03060d]" style={layoutStyle}>
      <DocsSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-4 top-[5.25rem] z-30 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[rgba(8,13,23,0.9)] text-zinc-300 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl transition hover:border-white/20 hover:text-white lg:hidden"
        aria-label="Open docs navigation"
      >
        <Menu className="h-4.5 w-4.5" />
      </button>

      <main className="transition-[padding-left] duration-300 ease-out lg:pl-[var(--docs-sidebar-width)]">
        <div className="mx-auto max-w-5xl px-6 py-24 sm:px-8 lg:px-12">
          <article className="prose prose-invert max-w-none">
            {children}
          </article>
        </div>
      </main>
    </div>
  );
}
