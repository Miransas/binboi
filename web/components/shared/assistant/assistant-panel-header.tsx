import { Sparkles, Trash2 } from "lucide-react";

import type { AssistantResponsePayload } from "@/lib/assistant-types";

type AssistantPanelHeaderProps = {
  mode: "idle" | "conversation";
  title: string;
  description: string;
  response: AssistantResponsePayload | null;
  onClear: () => void;
};

function HeaderPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

export function AssistantPanelHeader({
  mode,
  title,
  description,
  response,
  onClear,
}: AssistantPanelHeaderProps) {
  const conversationActive = mode === "conversation";
  const runtimeHits = response?.runtime.hits.length ?? 0;
  const sourceCount = response?.sources.length ?? 0;

  return (
    <div className="sticky top-0 z-10 border-b border-white/10 bg-[linear-gradient(180deg,rgba(10,10,12,0.98),rgba(10,10,12,0.86))] px-4 py-4 backdrop-blur sm:px-5">
      <div
        className={
          conversationActive
            ? "flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between"
            : "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
        }
      >
        <div className={conversationActive ? "max-w-3xl" : "max-w-2xl"}>
          <div className="inline-flex items-center gap-2 rounded-full border border-miransas-cyan/15 bg-miransas-cyan/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-miransas-cyan">
            <Sparkles className="h-3.5 w-3.5" />
            Binboi Assistant
          </div>
          <h2
            className={
              conversationActive
                ? "mt-3 text-lg font-black tracking-tight text-white sm:text-xl"
                : "mt-4 text-xl font-black tracking-tight text-white sm:text-2xl"
            }
          >
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
            {conversationActive
              ? "Conversation mode is active. The transcript now takes priority while sources and runtime context step back."
              : description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {conversationActive ? (
            <div className="flex flex-wrap items-center gap-2">
              <HeaderPill
                label="Mode"
                value={
                  response?.mode ? (response.mode === "ai" ? "AI answer" : "Search answer") : "Thinking"
                }
              />
              <HeaderPill label="Sources" value={sourceCount ? `${sourceCount} matched` : "Waiting"} />
              <HeaderPill
                label="Runtime"
                value={runtimeHits ? `${runtimeHits} context hits` : "Docs only"}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:w-[18rem]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Scope
                </p>
                <p className="mt-2 text-sm font-medium text-white">Docs + runtime</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Security
                </p>
                <p className="mt-2 text-sm font-medium text-white">Server-side only</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
