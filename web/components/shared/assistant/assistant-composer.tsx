import { Loader2, Search, Sparkles } from "lucide-react";

import type { RefObject } from "react";

type AssistantComposerProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  suggestions: string[];
  onSuggestionClick: (value: string) => void;
  loading: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
};

export function AssistantComposer({
  query,
  onQueryChange,
  onSubmit,
  suggestions,
  onSuggestionClick,
  loading,
  inputRef,
}: AssistantComposerProps) {
  return (
    <form
      className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(7,7,9,0.9),rgba(3,3,4,0.98))] px-4 py-4 backdrop-blur sm:px-5"
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
              placeholder="Ask about tunnels, webhook signatures, request failures, or logs"
              className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-[1.25rem] bg-miransas-cyan px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Thinking" : "Ask Binboi"}
          </button>
        </div>

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
      </div>
    </form>
  );
}
