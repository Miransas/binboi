import Link from "next/link";
import type { RefObject } from "react";
import { BookOpen, History, Loader2, MessageSquareMore } from "lucide-react";

import { AssistantEmptyState } from "@/components/shared/assistant/assistant-empty-state";
import type { AssistantResponsePayload } from "@/lib/assistant-types";
import { cn } from "@/lib/utils";

type AssistantTranscriptMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  response?: AssistantResponsePayload;
};

type DocSearchResult = {
  id: string;
  title: string;
  href: string;
  kind: string;
  excerpt: string;
};

type AssistantTranscriptProps = {
  mode: "idle" | "conversation";
  messages: AssistantTranscriptMessage[];
  loading: boolean;
  transcriptRef: RefObject<HTMLDivElement | null>;
  endRef: RefObject<HTMLDivElement | null>;
  searchResults?: DocSearchResult[];
  searching?: boolean;
};

export function AssistantTranscript({
  mode,
  messages,
  loading,
  transcriptRef,
  endRef,
  searchResults,
  searching,
}: AssistantTranscriptProps) {
  const conversationActive = mode === "conversation";

  return (
    <article className="grid h-full min-h-0 overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/35 grid-rows-[auto,minmax(0,1fr)]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2">
          {conversationActive ? (
            <MessageSquareMore className="h-4 w-4 text-miransas-cyan" />
          ) : (
            <History className="h-4 w-4 text-miransas-cyan" />
          )}
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-300">
            {conversationActive ? "Active conversation" : "Conversation"}
          </h3>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-500">
          {conversationActive ? "Chat-first mode" : "Session history"}
        </span>
      </div>

      <div
        ref={transcriptRef}
        className="custom-scrollbar min-h-0 space-y-4 overflow-y-auto overscroll-y-contain px-5 py-5"
      >
        {messages.length === 0 ? (
          searching ? (
            <div className="flex items-center gap-2 text-sm text-zinc-500 px-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-miransas-cyan" />
              Searching docs...
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="space-y-2">
              <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Docs results
              </p>
              {searchResults.map((result) => (
                <Link
                  key={result.id}
                  href={result.href}
                  className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm transition hover:border-white/16 hover:bg-white/[0.05]"
                >
                  <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-miransas-cyan" />
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-200 truncate">{result.title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-zinc-500 line-clamp-2">{result.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <AssistantEmptyState />
          )
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "max-w-full rounded-[1.5rem] border px-4 py-4",
                message.role === "assistant"
                  ? "border-white/10 bg-white/[0.03]"
                  : "ml-auto max-w-[88%] border-miransas-cyan/20 bg-miransas-cyan/10",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]",
                    message.role === "assistant"
                      ? "bg-white/8 text-zinc-300"
                      : "bg-black/20 text-miransas-cyan",
                  )}
                >
                  {message.role === "assistant" ? "Binboi" : "You"}
                </span>
                {message.response && (
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]",
                      message.response.mode === "ai"
                        ? "bg-miransas-cyan/12 text-miransas-cyan"
                        : "bg-white/8 text-zinc-400",
                    )}
                  >
                    {message.response.mode}
                  </span>
                )}
              </div>
              <div
                className={cn(
                  "mt-3 whitespace-pre-wrap break-words text-sm leading-7",
                  message.role === "assistant" ? "text-zinc-200" : "text-white",
                )}
              >
                {message.content}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-300">
                Binboi
              </span>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-miransas-cyan" />
            </div>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Searching docs, product content, and runtime context...
            </p>
          </div>
        )}

        <div ref={endRef} className="h-px w-full" />
      </div>
    </article>
  );
}
