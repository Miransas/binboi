"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { DocsSidebar } from "./_components/docs-sidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#08090c] text-white">
      <div className="mx-auto flex w-full max-w-[1600px] gap-0 px-0 lg:px-6 xl:px-8">
        <DocsSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/[0.05] bg-[#08090c]/88 px-5 backdrop-blur-xl sm:px-6 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-200"
              aria-label="Open docs navigation"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Binboi Docs
              </p>
              <p className="mt-1 text-sm text-zinc-300">Documentation</p>
            </div>
          </header>

          <main className="min-w-0 px-5 py-8 sm:px-6 sm:py-10 lg:px-6 lg:py-12 xl:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
