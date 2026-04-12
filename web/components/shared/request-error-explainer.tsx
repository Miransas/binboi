"use client";

import { useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";

import { cn } from "@/lib/utils";

export function RequestErrorExplainer({
  className,
  buttonLabel = "Explain error",
}: {
  context?: Record<string, unknown>;
  className?: string;
  buttonLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-miransas-cyan/20 bg-miransas-cyan/10 px-3.5 py-2 text-sm font-medium text-white transition hover:border-miransas-cyan/35 hover:bg-miransas-cyan/14",
          className,
        )}
      >
        <Sparkles className="h-4 w-4 text-miransas-cyan" />
        {buttonLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-[90]">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-white/10 bg-[#060608]/96 shadow-[-30px_0_100px_rgba(0,0,0,0.6)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-miransas-cyan">
                  AI request analysis
                </p>
                <h3 className="mt-3 text-xl font-semibold text-white">Explain this error</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/10 bg-white/[0.03] p-2 text-zinc-400 transition hover:border-white/20 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-1 items-center justify-center px-5 py-8">
              <p className="text-center text-sm text-zinc-500">
                Use the AI chat widget (bottom-right) to ask about this error.
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
