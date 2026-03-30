"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import { getRouteAssistantContext } from "@/lib/assistant-route-context";
import type { AssistantContext } from "@/lib/assistant-types";

type AssistantContextValue = {
  context: AssistantContext;
  pageLabel: string;
  registerContext: (id: string, context: AssistantContext) => void;
  unregisterContext: (id: string) => void;
};

const Context = createContext<AssistantContextValue | null>(null);

function mergeStringArrays(first?: string[], second?: string[]) {
  const values = [...(first ?? []), ...(second ?? [])];
  return values.length > 0 ? Array.from(new Set(values)).slice(0, 8) : undefined;
}

function mergeContext(base: AssistantContext, override: AssistantContext): AssistantContext {
  return {
    currentPage: override.currentPage ?? base.currentPage,
    docsContext:
      base.docsContext || override.docsContext
        ? {
            section: override.docsContext?.section ?? base.docsContext?.section,
            summary: override.docsContext?.summary ?? base.docsContext?.summary,
            topics: mergeStringArrays(base.docsContext?.topics, override.docsContext?.topics),
          }
        : undefined,
    requestContext:
      base.requestContext || override.requestContext
        ? {
            method: override.requestContext?.method ?? base.requestContext?.method,
            path: override.requestContext?.path ?? base.requestContext?.path,
            status: override.requestContext?.status ?? base.requestContext?.status,
            durationMs:
              override.requestContext?.durationMs ?? base.requestContext?.durationMs,
            provider: override.requestContext?.provider ?? base.requestContext?.provider,
            source: override.requestContext?.source ?? base.requestContext?.source,
            target: override.requestContext?.target ?? base.requestContext?.target,
            destination:
              override.requestContext?.destination ?? base.requestContext?.destination,
            errorType: override.requestContext?.errorType ?? base.requestContext?.errorType,
            requestPreview:
              override.requestContext?.requestPreview ?? base.requestContext?.requestPreview,
            responsePreview:
              override.requestContext?.responsePreview ?? base.requestContext?.responsePreview,
            tunnelId: override.requestContext?.tunnelId ?? base.requestContext?.tunnelId,
            timestamp: override.requestContext?.timestamp ?? base.requestContext?.timestamp,
            summary: override.requestContext?.summary ?? base.requestContext?.summary,
          }
        : undefined,
    webhookContext:
      base.webhookContext || override.webhookContext
        ? {
            provider: override.webhookContext?.provider ?? base.webhookContext?.provider,
            eventType: override.webhookContext?.eventType ?? base.webhookContext?.eventType,
            endpoint: override.webhookContext?.endpoint ?? base.webhookContext?.endpoint,
            deliveryStatus:
              override.webhookContext?.deliveryStatus ?? base.webhookContext?.deliveryStatus,
            signatureHeader:
              override.webhookContext?.signatureHeader ?? base.webhookContext?.signatureHeader,
            retries: override.webhookContext?.retries ?? base.webhookContext?.retries,
            latencyMs: override.webhookContext?.latencyMs ?? base.webhookContext?.latencyMs,
            destination:
              override.webhookContext?.destination ?? base.webhookContext?.destination,
            receivedAt:
              override.webhookContext?.receivedAt ?? base.webhookContext?.receivedAt,
            errorClassification:
              override.webhookContext?.errorClassification ??
              base.webhookContext?.errorClassification,
            payloadPreview:
              override.webhookContext?.payloadPreview ?? base.webhookContext?.payloadPreview,
            responsePreview:
              override.webhookContext?.responsePreview ?? base.webhookContext?.responsePreview,
            attemptId: override.webhookContext?.attemptId ?? base.webhookContext?.attemptId,
            summary: override.webhookContext?.summary ?? base.webhookContext?.summary,
          }
        : undefined,
    logContext:
      base.logContext || override.logContext
        ? {
            summary: override.logContext?.summary ?? base.logContext?.summary,
            levels: mergeStringArrays(base.logContext?.levels, override.logContext?.levels),
            recent: mergeStringArrays(base.logContext?.recent, override.logContext?.recent),
          }
        : undefined,
  };
}

export function AssistantContextProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [registeredContexts, setRegisteredContexts] = useState<Record<string, AssistantContext>>({});

  const routeContext = useMemo(() => getRouteAssistantContext(pathname), [pathname]);

  const registerContext = useCallback((id: string, context: AssistantContext) => {
    setRegisteredContexts((previous) => ({ ...previous, [id]: context }));
  }, []);

  const unregisterContext = useCallback((id: string) => {
    setRegisteredContexts((previous) => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
  }, []);

  const value = useMemo<AssistantContextValue>(() => {
    const merged = Object.values(registeredContexts).reduce(
      (accumulator, context) => mergeContext(accumulator, context),
      {
        ...routeContext.context,
        currentPage: routeContext.context.currentPage
          ? {
              ...routeContext.context.currentPage,
              browserTitle:
                typeof document !== "undefined" ? document.title : routeContext.context.currentPage.browserTitle,
            }
          : undefined,
      } satisfies AssistantContext,
    );

    return {
      context: merged,
      pageLabel: routeContext.label,
      registerContext,
      unregisterContext,
    };
  }, [registerContext, registeredContexts, routeContext, unregisterContext]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAssistantContext() {
  const value = useContext(Context);
  if (!value) {
    throw new Error("useAssistantContext must be used inside AssistantContextProvider.");
  }
  return value;
}

export function useRegisterAssistantContext(id: string, context: AssistantContext) {
  const { registerContext, unregisterContext } = useAssistantContext();
  const serialized = JSON.stringify(context);
  const stableContext = useMemo(
    () => JSON.parse(serialized) as AssistantContext,
    [serialized],
  );

  useEffect(() => {
    registerContext(id, stableContext);
    return () => unregisterContext(id);
  }, [id, registerContext, stableContext, unregisterContext]);
}

export function AssistantContextBridge({
  id,
  context,
}: {
  id: string;
  context: AssistantContext;
}) {
  useRegisterAssistantContext(id, context);
  return null;
}
