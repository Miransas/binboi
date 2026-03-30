import type { ReactNode } from "react";
import Link from "next/link";

import { DocsSidebar } from "./_components/docs-sidebar";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#040404] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,255,209,0.1),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.05),_transparent_28%)]" />

      <div className="relative mx-auto max-w-[1580px] px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[#070707]/90 backdrop-blur">
          <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                Binboi docs
              </p>
              <p className="mt-2 text-sm text-zinc-300">
                Tunneling, webhook inspection, CLI auth, and self-hosted operator guidance.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
              >
                Open dashboard
              </Link>
              <Link
                href="/dashboard/access-tokens"
                className="rounded-2xl bg-miransas-cyan px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
              >
                Create access token
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <DocsSidebar />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
