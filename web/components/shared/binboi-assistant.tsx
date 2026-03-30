"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAssistantContext } from "@/components/shared/assistant-context";
import { AssistantComposer } from "@/components/shared/assistant/assistant-composer";
import { AssistantInsights } from "@/components/shared/assistant/assistant-insights";
import { AssistantPanelHeader } from "@/components/shared/assistant/assistant-panel-header";
import { AssistantTranscript } from "@/components/shared/assistant/assistant-transcript";
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
  hero:
    "rounded-[2rem] border border-white/10 bg-[#070709]/90 shadow-[0_40px_120px_rgba(0,0,0,0.4)] h-[44rem] max-h-[calc(100dvh-8rem)]",
  drawer:
    "rounded-[2rem] border border-white/10 bg-[#070709]/95 shadow-[0_30px_90px_rgba(0,0,0,0.35)] h-full min-h-0",
  dashboard:
    "rounded-[2rem] border border-white/10 bg-[#080808] h-[48rem] max-h-[calc(100dvh-10rem)]",
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
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(0);

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
    const end = transcriptEndRef.current;
    if (!container || !end) {
      return;
    }

    const nextBehavior =
      messages.length > previousMessageCountRef.current || loading ? "smooth" : "auto";
    const frame = window.requestAnimationFrame(() => {
      end.scrollIntoView({
        block: "end",
        behavior: nextBehavior,
      });
      previousMessageCountRef.current = messages.length;
    });

    return () => window.cancelAnimationFrame(frame);
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
  const panelMode: "idle" | "conversation" = messages.length > 0 || loading ? "conversation" : "idle";

  return (
    <section className={cn(variantClasses[variant], "min-w-0 overflow-hidden", className)}>
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <AssistantPanelHeader
          mode={panelMode}
          title={activeTitle}
          description={activeDescription}
          response={latestResponse}
          onClear={clearHistory}
        />

        <div className="min-h-0 flex-1 overflow-hidden px-4 py-4 sm:px-5">
          <div className="flex h-full min-h-0 flex-col gap-4">
            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div
              className={cn(
                "grid min-h-0 flex-1 gap-4 transition-[grid-template-columns] duration-300 ease-out",
                panelMode === "conversation"
                  ? "xl:grid-cols-[minmax(0,1fr)_0fr]"
                  : "xl:grid-cols-[minmax(0,1.08fr)_minmax(21rem,0.92fr)]",
              )}
            >
              <AssistantTranscript
                mode={panelMode}
                messages={messages}
                loading={loading}
                transcriptRef={transcriptRef}
                endRef={transcriptEndRef}
              />

              <AssistantInsights mode={panelMode} response={latestResponse} />
            </div>
          </div>
        </div>

        <AssistantComposer
          mode={panelMode}
          query={query}
          onQueryChange={setQuery}
          onSubmit={() => {
            void submit();
          }}
          suggestions={assistantPromptSuggestions}
          onSuggestionClick={(suggestion) => {
            void submit(suggestion);
          }}
          loading={loading}
          inputRef={inputRef}
        />
      </div>
    </section>
  );
}
