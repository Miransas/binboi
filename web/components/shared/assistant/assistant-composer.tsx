import Link from "next/link";
import { Loader2, Search, Sparkles } from "lucide-react";

import type { RefObject } from "react";

type AssistantComposerProps = {
  mode: "idle" | "conversation";
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  suggestions: string[];
  onSuggestionClick: (value: string) => void;
  loading: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  aiUsageLabel?: string;
  limitReached?: boolean;
  aiAvailable?: boolean;
};

export function AssistantComposer({
  mode,
  query,
  onQueryChange,
  onSubmit,
  suggestions,
  onSuggestionClick,
  loading,
  inputRef,
  aiUsageLabel,
  limitReached = false,
  aiAvailable = true,
}: AssistantComposerProps) {
  const conversationActive = mode === "conversation";

  return (
    <form
      className="sticky bottom-0 z-10 border-t border-white/10 bg-[linear-gradient(180deg,rgba(7,7,9,0.9),rgba(3,3,4,0.98))] px-4 py-4 backdrop-blur sm:px-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="rounded-[1.75rem] border border-white/10 bg-black/40 p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-zinc-500" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={
                conversationActive
                  ? "Ask a follow-up about the request, webhook, tunnel, or docs guidance"
                  : "Ask about tunnels, webhook signatures, request failures, or logs"
              }
              className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            />
          </label>

          {aiAvailable && (
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-[1.25rem] bg-miransas-cyan px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Thinking" : conversationActive ? "Send" : "Ask Binboi"}
            </button>
          )}
        </div>

        {limitReached ? (
          <div className="mt-3 flex flex-col gap-3 rounded-[1.25rem] border border-amber-300/18 bg-amber-400/10 px-4 py-3 text-sm text-amber-100 sm:flex-row sm:items-center sm:justify-between">
            <p>AI limit reached. Upgrade for unlimited debugging help.</p>
            <Link
              href="/pricing?focus=pro"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-miransas-cyan px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:brightness-110"
            >
              Upgrade
            </Link>
          </div>
        ) : conversationActive ? (
          <p className="mt-3 text-xs text-zinc-500">
            Conversation mode keeps the transcript in focus. Ask follow-ups, paste an error, or
            compare runtime clues against the latest answer.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSuggestionClick(suggestion)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {!limitReached && aiUsageLabel ? (
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-zinc-500">
            <span>{aiUsageLabel}</span>
            <Link
              href="/pricing?focus=pro"
              className="text-miransas-cyan transition hover:text-white"
            >
              Upgrade
            </Link>
          </div>
        ) : null}
      </div>
    </form>
  );
}
