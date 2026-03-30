"use client";

import { LayoutDashboard, Sparkles } from "lucide-react";

import { useAssistantContext } from "@/components/shared/assistant-context";
import { AssistantLauncher } from "@/components/site/shared/assistant-launcher";

export default function DashboardHeader() {
  const { pageLabel, context } = useAssistantContext();

  return (
    <div className="sticky top-0 z-30 border-b border-white/10 bg-[#050506]/88 backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <LayoutDashboard className="h-5 w-5 text-miransas-cyan" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Binboi dashboard
            </p>
            <h1 className="mt-2 text-lg font-semibold text-white">{pageLabel}</h1>
            <p className="mt-1 text-sm text-zinc-400">
              {context.currentPage?.summary ||
                "Search docs, runtime clues, and troubleshooting guidance from the dashboard."}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:w-[30rem]">
          <AssistantLauncher variant="dashboard" storageKey="dashboard-global" />
          <div className="flex items-center gap-2 px-1 text-xs text-zinc-500">
            <Sparkles className="h-3.5 w-3.5 text-miransas-cyan" />
            Assistant uses page context plus server-side runtime lookups when available.
          </div>
        </div>
      </div>
    </div>
  );
}
