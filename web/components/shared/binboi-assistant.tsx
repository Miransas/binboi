"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Loader2,
  Search,
  Sparkles,
  TerminalSquare,
  Waypoints,
} from "lucide-react";

import { assistantPromptSuggestions } from "@/content/site-content";
import type { AssistantResponsePayload } from "@/lib/assistant-types";
import { cn } from "@/lib/utils";

type Variant = "hero" | "drawer" | "dashboard";

const variantClasses: Record<Variant, string> = {
  hero: "rounded-[2rem] border border-white/10 bg-[#070709]/90 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.4)] sm:p-6",
  drawer: "rounded-[2rem] border border-white/10 bg-[#070709]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:p-6",
  dashboard: "rounded-[2rem] border border-white/10 bg-[#080808] p-5 sm:p-6",
};

export function BinboiAssistant({
  variant = "hero",
  className,
  autoFocus = false,
  title,
  description,
  initialQuery = "",
}: {
  variant?: Variant;
  className?: string;
  autoFocus?: boolean;
  title?: string;
  description?: string;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<AssistantResponsePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  async function runQuery(nextQuery?: string) {
    const value = (nextQuery ?? query).trim();
    if (!value) {
      setError("Enter a question to search docs, requests, webhooks, or logs.");
      return;
    }

    setQuery(value);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: value }),
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

      setResult(body as AssistantResponsePayload);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Binboi could not answer that query right now.",
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const activeTitle =
    title ||
    (variant === "dashboard" ? "Ask Binboi" : "Search docs, logs, and webhook guidance");
  const activeDescription =
    description ||
    "Search product docs and marketing content, then layer in live runtime clues when the control plane is reachable.";

  return (
    <section className={cn(variantClasses[variant], className)}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
        </div>

        <form
          className="rounded-[1.75rem] border border-white/10 bg-black/40 p-3"
          onSubmit={(event) => {
            event.preventDefault();
            void runQuery();
          }}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-zinc-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ask about tunnels, webhook signatures, request logs, or CLI setup"
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
                onClick={() => void runQuery(suggestion)}
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

        {result ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
            <article className="rounded-[1.75rem] border border-white/10 bg-black/35 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]",
                    result.mode === "ai"
                      ? "bg-miransas-cyan/12 text-miransas-cyan"
                      : "bg-white/8 text-zinc-300",
                  )}
                >
                  {result.mode === "ai" ? "AI summary" : "Search summary"}
                </span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                  {result.runtime.available ? "Runtime checked" : "Docs only"}
                </span>
              </div>

              <div className="mt-4 whitespace-pre-line text-sm leading-7 text-zinc-200">
                {result.summary}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Suggested next moves
                </p>
                <div className="mt-3 space-y-2 text-sm leading-7 text-zinc-300">
                  {result.suggestions.map((suggestion) => (
                    <p key={suggestion}>{suggestion}</p>
                  ))}
                </div>
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
                  {result.sources.length > 0 ? (
                    result.sources.map((source) => (
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
                            <h4 className="mt-2 text-sm font-semibold text-white">
                              {source.title}
                            </h4>
                          </div>
                          <ArrowRight className="h-4 w-4 text-zinc-600 transition group-hover:text-miransas-cyan" />
                        </div>
                        <p className="mt-3 text-sm leading-6 text-zinc-400">{source.excerpt}</p>
                      </Link>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-zinc-400">
                      No direct source matches yet. Try a more specific phrase such as
                      {" "}
                      <span className="text-white">webhook signature</span>
                      ,
                      {" "}
                      <span className="text-white">binboi login</span>
                      , or
                      {" "}
                      <span className="text-white">http tunnels</span>.
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
                <p className="mt-3 text-sm leading-7 text-zinc-400">{result.runtime.note}</p>

                <div className="mt-4 space-y-3">
                  {result.runtime.hits.length > 0 ? (
                    result.runtime.hits.map((hit) => (
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
                      No live runtime matches were found for this query yet. The assistant is still
                      useful for docs, setup, request debugging patterns, and webhook troubleshooting.
                    </p>
                  )}
                </div>
              </article>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
            <article className="rounded-[1.75rem] border border-white/10 bg-black/35 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                What this MVP does well
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
                <p>Search docs and product pages for tunnels, tokens, CLI flows, and operations guidance.</p>
                <p>Pull in live tunnel and event context when the control plane is reachable.</p>
                <p>Provide AI-assisted summaries only from server-side credentials and fall back safely when they are missing.</p>
              </div>
            </article>

            <article className="rounded-[1.75rem] border border-white/10 bg-black/35 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Good first prompts
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
                <p>Why is my Stripe signature failing locally?</p>
                <p>What does `binboi whoami` verify?</p>
                <p>How do logs differ from request inspection?</p>
                <p>What should I check if the tunnel URL returns 404?</p>
              </div>
            </article>
          </div>
        )}
      </div>
    </section>
  );
}
