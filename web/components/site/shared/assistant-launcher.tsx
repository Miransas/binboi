"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

import { BinboiAssistant } from "@/components/shared/binboi-assistant";
import { cn } from "@/lib/utils";

import { AssistantOverlay } from "./assistant-overlay";

export function AssistantLauncher({
  variant = "site",
  storageKey,
}: {
  variant?: "site" | "dashboard";
  storageKey?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-left text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white",
          variant === "dashboard"
            ? "w-full justify-between"
            : "w-full min-w-[17rem] max-w-[22rem] justify-between",
        )}
      >
        <span className="flex min-w-0 items-center gap-3">
          <Search className="h-4 w-4 shrink-0 text-zinc-500 transition group-hover:text-miransas-cyan" />
          <span className="truncate">
            {variant === "dashboard" ? "Search docs, logs, or ask Binboi" : "Search or ask Binboi"}
          </span>
        </span>
        <span className="hidden rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-zinc-500 md:inline-flex">
          Cmd K
        </span>
      </button>

      {open && (
        <AssistantOverlay
          open={open}
          variant={variant}
          anchorRef={triggerRef}
          onClose={() => setOpen(false)}
        >
          <BinboiAssistant
            variant="drawer"
            autoFocus
            storageKey={storageKey || `launcher-${variant}`}
            title="Search docs, runtime, and troubleshooting from one place"
            description="Ask about CLI authentication, tunnels, request failures, webhook signatures, or logs. The assistant keeps history for this browser session and stays useful even without live AI access."
            className="h-full"
          />
        </AssistantOverlay>
      )}
    </>
  );
}
