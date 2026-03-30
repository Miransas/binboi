import type { RefObject } from "react";
import { History, Loader2 } from "lucide-react";

import type { AssistantResponsePayload } from "@/lib/assistant-types";
import { cn } from "@/lib/utils";

type AssistantTranscriptMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  response?: AssistantResponsePayload;
};

type AssistantTranscriptProps = {
  messages: AssistantTranscriptMessage[];
  loading: boolean;
  transcriptRef: RefObject<HTMLDivElement | null>;
};

export function AssistantTranscript({
  messages,
  loading,
  transcriptRef,
}: AssistantTranscriptProps) {
  return (
    <article className="grid min-h-[22rem] overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/35 xl:min-h-0 xl:grid-rows-[auto,minmax(0,1fr)]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-miransas-cyan" />
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-300">
            Conversation
          </h3>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-500">
          Session history
        </span>
      </div>

      <div
        ref={transcriptRef}
        className="custom-scrollbar min-h-0 space-y-4 overflow-y-auto px-5 py-5"
      >
        {messages.length === 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                What this MVP does well
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
                <p>
                  Search docs and product pages for tunnels, CLI auth, requests, logs, and webhook
                  debugging.
                </p>
                <p>
                  Merge page context and live control-plane data when available, then explain
                  missing context honestly when it is not.
                </p>
                <p>
                  Use OpenAI only on the server side, with a deterministic fallback when
                  credentials are not configured.
                </p>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Good first prompts
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
                <p>Why is my Stripe signature failing locally?</p>
                <p>What does `binboi whoami` verify?</p>
                <p>How do logs differ from request inspection?</p>
                <p>What should I check if the tunnel URL returns 404?</p>
              </div>
            </div>
          </div>
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
      </div>
    </article>
  );
}
