"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Sparkles, X } from "lucide-react";

import { usePricingPlan } from "@/components/provider/pricing-plan-provider";
import { useAssistantContext } from "@/components/shared/assistant-context";
import type {
  AssistantContext,
  AssistantResponsePayload,
} from "@/lib/assistant-types";
import { cn } from "@/lib/utils";

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

function buildExplainQuery(context: AssistantContext) {
  const provider =
    context.webhookContext?.provider || context.requestContext?.provider || context.requestContext?.source;
  const path = context.requestContext?.path || context.webhookContext?.endpoint;
  const status = context.requestContext?.status || context.webhookContext?.deliveryStatus;

  return [
    "Explain this failed request and suggest the most likely cause plus the next debugging steps.",
    provider ? `Provider or source: ${provider}.` : undefined,
    path ? `Path: ${path}.` : undefined,
    status ? `Status: ${status}.` : undefined,
    "Use the supplied request and webhook context only. Do not invent missing runtime data.",
  ]
    .filter(Boolean)
    .join(" ");
}

export function RequestErrorExplainer({
  context,
  className,
  buttonLabel = "Explain error",
}: {
  context: AssistantContext;
  className?: string;
  buttonLabel?: string;
}) {
  const { context: ambientContext } = useAssistantContext();
  const { consumeAiExplain, plan } = usePricingPlan();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AssistantResponsePayload | null>(null);

  const requestContext = useMemo(
    () => mergeAssistantContext(ambientContext, context),
    [ambientContext, context],
  );

  async function runExplain() {
    setOpen(true);
    setError(null);

    if (response || loading) {
      return;
    }

    if (!consumeAiExplain()) {
      setResponse(null);
      setError("AI limit reached. Upgrade for unlimited debugging help.");
      return;
    }

    setLoading(true);

    try {
      const result = await fetch("/api/ai/assist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: buildExplainQuery(requestContext),
          context: requestContext,
        }),
      });

      const body = (await result.json().catch(() => ({}))) as
        | AssistantResponsePayload
        | { error?: string };

      if (!result.ok) {
        throw new Error(
          "error" in body && typeof body.error === "string"
            ? body.error
            : "Binboi could not explain this failure right now.",
        );
      }

      setResponse(body as AssistantResponsePayload);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Binboi could not explain this failure right now.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void runExplain()}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-miransas-cyan/20 bg-miransas-cyan/10 px-3.5 py-2 text-sm font-medium text-white transition hover:border-miransas-cyan/35 hover:bg-miransas-cyan/14",
          className,
        )}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin text-miransas-cyan" /> : <Sparkles className="h-4 w-4 text-miransas-cyan" />}
        {buttonLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-[90]">
          <button
            type="button"
            aria-label="Close error explanation"
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
                <p className="mt-2 text-sm leading-7 text-zinc-400">
                  Binboi combines the current request, webhook, and page context with docs and
                  troubleshooting guidance.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/10 bg-white/[0.03] p-2 text-zinc-400 transition hover:border-white/20 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Context snapshot
                </p>
                <div className="mt-3 space-y-2 text-sm leading-7 text-zinc-300">
                  {requestContext.requestContext?.method && requestContext.requestContext?.path && (
                    <p>
                      {requestContext.requestContext.method} {requestContext.requestContext.path}
                    </p>
                  )}
                  {(requestContext.requestContext?.status ||
                    requestContext.webhookContext?.deliveryStatus) && (
                    <p>
                      Status:{" "}
                      {requestContext.requestContext?.status ||
                        requestContext.webhookContext?.deliveryStatus}
                    </p>
                  )}
                  {requestContext.requestContext?.errorType && (
                    <p>Error type: {requestContext.requestContext.errorType}</p>
                  )}
                  {requestContext.webhookContext?.errorClassification && (
                    <p>Webhook class: {requestContext.webhookContext.errorClassification}</p>
                  )}
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-7 text-red-200">
                  <p>{error}</p>
                  {plan === "FREE" && error.includes("AI limit reached") ? (
                    <Link
                      href="/pricing?focus=pro"
                      className="mt-3 inline-flex items-center gap-2 rounded-full bg-miransas-cyan px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:brightness-110"
                    >
                      Upgrade to Pro
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                </div>
              )}

              {loading && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-miransas-cyan" />
                    Preparing a focused explanation from the current failure context...
                  </div>
                </div>
              )}

              {response && (
                <>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-miransas-cyan/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-miransas-cyan">
                        {response.mode}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        Practical explanation
                      </span>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-zinc-200">
                      {response.message}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                      Suggested next steps
                    </p>
                    <div className="mt-3 space-y-3 text-sm leading-7 text-zinc-300">
                      {response.suggestions.map((suggestion) => (
                        <p key={suggestion}>{suggestion}</p>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                      Relevant sources
                    </p>
                    <div className="mt-3 space-y-3">
                      {response.sources.map((source) => (
                        <Link
                          key={`${source.href}-${source.title}`}
                          href={source.href}
                          className="group block rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-white/20 hover:bg-black/35"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                                {source.kind}
                              </p>
                              <h4 className="mt-2 text-sm font-semibold text-white">{source.title}</h4>
                            </div>
                            <ArrowRight className="h-4 w-4 text-zinc-600 transition group-hover:text-miransas-cyan" />
                          </div>
                          <p className="mt-3 text-sm leading-6 text-zinc-400">{source.excerpt}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
