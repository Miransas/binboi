"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  History,
  Loader2,
  Search,
  Sparkles,
  TerminalSquare,
  Trash2,
  Waypoints,
} from "lucide-react";

import { useAssistantContext } from "@/components/shared/assistant-context";
import { assistantPromptSuggestions } from "@/content/site-content";
import type {
  AssistantContext,
  AssistantConversationMessage,
  AssistantResponsePayload,
} from "@/lib/assistant-types";
import { cn } from "@/lib/utils";

type Variant = "hero" | "drawer" | "dashboard";

type StoredAssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  response?: AssistantResponsePayload;
};

const variantClasses: Record<Variant, string> = {
  hero: "rounded-[2rem] border border-white/10 bg-[#070709]/90 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.4)] sm:p-6",
  drawer:
    "rounded-[2rem] border border-white/10 bg-[#070709]/95 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:p-6",
  dashboard: "rounded-[2rem] border border-white/10 bg-[#080808] p-5 sm:p-6",
};

function createMessage(
  role: "user" | "assistant",
  content: string,
  response?: AssistantResponsePayload,
): StoredAssistantMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: Date.now(),
    response,
  };
}

function toConversationMessages(messages: StoredAssistantMessage[]): AssistantConversationMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

function mergeAssistantContext(base: AssistantContext, extra?: AssistantContext) {
  if (!extra) {
    return base;
  }

  return {
    ...base,
    ...extra,
    currentPage: extra.currentPage ?? base.currentPage,
    docsContext: { ...base.docsContext, ...extra.docsContext },
    requestContext: { ...base.requestContext, ...extra.requestContext },
    webhookContext: { ...base.webhookContext, ...extra.webhookContext },
    logContext: {
      ...base.logContext,
      ...extra.logContext,
      levels: extra.logContext?.levels ?? base.logContext?.levels,
      recent: extra.logContext?.recent ?? base.logContext?.recent,
    },
  };
}

export function BinboiAssistant({
  variant = "hero",
  className,
  autoFocus = false,
  title,
  description,
  initialQuery = "",
  storageKey,
  baseContext,
}: {
  variant?: Variant;
  className?: string;
  autoFocus?: boolean;
  title?: string;
  description?: string;
  initialQuery?: string;
  storageKey?: string;
  baseContext?: AssistantContext;
}) {
  const pathname = usePathname();
  const { context: providedContext } = useAssistantContext();
  const [query, setQuery] = useState(initialQuery);
  const [messages, setMessages] = useState<StoredAssistantMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const activeTitle =
    title ||
    (variant === "dashboard" ? "Ask Binboi" : "Search docs, logs, and webhook guidance");
  const activeDescription =
    description ||
    "Search product docs and live runtime context, then get concise troubleshooting guidance without exposing any server credentials to the browser.";
  const resolvedStorageKey =
    storageKey || `binboi-assistant:${variant}:${pathname.replace(/[^a-z0-9/-]/gi, "_")}`;

  const requestContext = useMemo(
    () => mergeAssistantContext(providedContext, baseContext),
    [baseContext, providedContext],
  );

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(resolvedStorageKey);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as StoredAssistantMessage[];
      if (Array.isArray(parsed)) {
        setMessages(
          parsed.filter(
            (message): message is StoredAssistantMessage =>
              Boolean(message) &&
              (message.role === "user" || message.role === "assistant") &&
              typeof message.content === "string",
          ),
        );
      }
    } catch {
    }
  }, [resolvedStorageKey]);

  useEffect(() => {
    try {
      sessionStorage.setItem(resolvedStorageKey, JSON.stringify(messages));
    } catch {
    }
  }, [messages, resolvedStorageKey]);

  useEffect(() => {
    const container = transcriptRef.current;
    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [loading, messages]);

  async function submit(nextQuery?: string) {
    const value = (nextQuery ?? query).trim();
    if (!value) {
      setError("Enter a question to search docs, requests, webhooks, or logs.");
      return;
    }

    const userMessage = createMessage("user", value);
    const nextMessages = [...messages, userMessage];

    setQuery("");
    setError(null);
    setLoading(true);
    setMessages(nextMessages);

    try {
      const response = await fetch("/api/ai/assist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: value,
          messages: toConversationMessages(nextMessages),
          context: requestContext,
        }),
      });

      const body = (await response.json().catch(() => ({}))) as
        | AssistantResponsePayload
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in body && typeof body.error === "string"
            ? body.error
            : "Binboi could not answer that query right now.",
        );
      }

      const assistantMessage = createMessage(
        "assistant",
        (body as AssistantResponsePayload).message,
        body as AssistantResponsePayload,
      );
      setMessages((current) => [...current, assistantMessage]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Binboi could not answer that query right now.",
      );
    } finally {
      setLoading(false);
    }
  }

  function clearHistory() {
    setMessages([]);
    setError(null);
    try {
      sessionStorage.removeItem(resolvedStorageKey);
    } catch {
    }
  }

  const latestAssistantMessage = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");
  const latestResponse = latestAssistantMessage?.response ?? null;

  return (
    <section className={cn(variantClasses[variant], className)}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-miransas-cyan/15 bg-miransas-cyan/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-miransas-cyan">
              <Sparkles className="h-3.5 w-3.5" />
              Binboi Assistant
            </div>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
              {activeTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">{activeDescription}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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

            <button
              type="button"
              onClick={clearHistory}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>

        <form
          className="rounded-[1.75rem] border border-white/10 bg-black/40 p-3"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-zinc-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ask about tunnels, webhook signatures, request failures, or logs"
                className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-[1.25rem] bg-miransas-cyan px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {loading ? "Thinking" : "Ask Binboi"}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {assistantPromptSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => void submit(suggestion)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </form>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
          <article className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/35">
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
              className="custom-scrollbar max-h-[32rem] min-h-[20rem] space-y-4 overflow-y-auto px-5 py-5"
            >
              {messages.length === 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                      What this MVP does well
                    </p>
                    <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
                      <p>Search docs and product pages for tunnels, CLI auth, requests, logs, and webhook debugging.</p>
                      <p>Merge page context and live control-plane data when available, then explain missing context honestly when it is not.</p>
                      <p>Use OpenAI only on the server side, with a deterministic fallback when credentials are not configured.</p>
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
                      "rounded-[1.5rem] border px-4 py-4",
                      message.role === "assistant"
                        ? "border-white/10 bg-white/[0.03]"
                        : "ml-auto max-w-[85%] border-miransas-cyan/20 bg-miransas-cyan/10",
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
                        "mt-3 whitespace-pre-line text-sm leading-7",
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

          <div className="space-y-4">
            <article className="rounded-[1.75rem] border border-white/10 bg-black/35 p-5">
              <div className="flex items-center gap-2">
                <Waypoints className="h-4 w-4 text-miransas-cyan" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-300">
                  Product sources
                </h3>
              </div>
              <div className="mt-4 space-y-3">
                {latestResponse?.sources.length ? (
                  latestResponse.sources.map((source) => (
                    <Link
                      key={`${source.href}-${source.title}`}
                      href={source.href}
                      className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                            {source.kind}
                          </p>
                          <h4 className="mt-2 text-sm font-semibold text-white">{source.title}</h4>
                        </div>
                        <ArrowRight className="h-4 w-4 text-zinc-600 transition group-hover:text-miransas-cyan" />
                      </div>
                      <p className="mt-3 text-sm leading-6 text-zinc-400">{source.excerpt}</p>
                    </Link>
                  ))
                ) : (
                  <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-zinc-400">
                    Ask a question to see matching docs and product sources here.
                  </p>
                )}
              </div>
            </article>

            <article className="rounded-[1.75rem] border border-white/10 bg-black/35 p-5">
              <div className="flex items-center gap-2">
                <TerminalSquare className="h-4 w-4 text-miransas-cyan" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-300">
                  Runtime context
                </h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                {latestResponse?.runtime.note ||
                  "The assistant will show matched page, request, webhook, log, and control-plane context here."}
              </p>

              <div className="mt-4 space-y-3">
                {latestResponse?.runtime.hits.length ? (
                  latestResponse.runtime.hits.map((hit) => (
                    <div
                      key={`${hit.kind}-${hit.title}-${hit.detail}`}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                        {hit.kind}
                      </p>
                      <h4 className="mt-2 text-sm font-semibold text-white">{hit.title}</h4>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">{hit.detail}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-zinc-400">
                    No runtime context has been attached yet. The assistant can still answer from
                    docs and product knowledge.
                  </p>
                )}
              </div>
            </article>

            <article className="rounded-[1.75rem] border border-white/10 bg-black/35 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Suggested next moves
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
                {latestResponse?.suggestions.length ? (
                  latestResponse.suggestions.map((suggestion) => (
                    <p key={suggestion}>{suggestion}</p>
                  ))
                ) : (
                  <p>
                    Suggested debugging steps will appear here once the assistant has answered at
                    least one question.
                  </p>
                )}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
