import "server-only";

import { buildApiUrl } from "@/lib/binboi";
import {
  buildTroubleshootingHints,
  searchAssistantDocuments,
  type AssistantSearchResult,
} from "@/lib/assistant-knowledge";
import type {
  AssistantContext,
  AssistantConversationMessage,
  AssistantRequestPayload,
  AssistantResponsePayload,
  AssistantRuntimeHit,
  AssistantSource,
} from "@/lib/assistant-types";

type RuntimeTunnel = {
  id: string;
  subdomain?: string;
  target?: string;
  status?: string;
  request_count?: number;
  public_url?: string;
};

type RuntimeEvent = {
  level?: string;
  message?: string;
  tunnel_subdomain?: string;
  created_at?: string;
};

type RuntimeInstance = {
  instance_name?: string;
  managed_domain?: string;
  auth_mode?: string;
  active_tunnels?: number;
};

const MAX_QUERY_LENGTH = 320;
const MAX_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 1200;
const MAX_CONTEXT_TEXT = 600;
const CONTROL_PLANE_TIMEOUT_MS = 1800;
const OPENAI_TIMEOUT_MS = 12000;

function compactWhitespace(input: string) {
  return input.trim().replace(/\s+/g, " ");
}

function clampText(input: string | undefined, max = MAX_CONTEXT_TEXT) {
  if (!input) {
    return undefined;
  }

  const value = compactWhitespace(input);
  return value ? value.slice(0, max) : undefined;
}

function tokenize(input: string) {
  return input
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function sanitizeMessages(messages?: AssistantConversationMessage[]) {
  return (messages ?? [])
    .filter(
      (message): message is AssistantConversationMessage =>
        Boolean(message) &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string",
    )
    .slice(-MAX_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: compactWhitespace(message.content).slice(0, MAX_MESSAGE_LENGTH),
    }))
    .filter((message) => message.content.length > 0);
}

function sanitizeContext(context?: AssistantContext): AssistantContext | undefined {
  if (!context) {
    return undefined;
  }

  const currentPage = context.currentPage
    ? {
        path: clampText(context.currentPage.path, 200) || "/",
        title: clampText(context.currentPage.title, 120) || "Binboi",
        area: context.currentPage.area,
        summary: clampText(context.currentPage.summary),
        browserTitle: clampText(context.currentPage.browserTitle, 180),
      }
    : undefined;

  const docsContext =
    context.docsContext &&
    (context.docsContext.section ||
      context.docsContext.summary ||
      (context.docsContext.topics && context.docsContext.topics.length > 0))
      ? {
          section: clampText(context.docsContext.section, 100),
          summary: clampText(context.docsContext.summary),
          topics: (context.docsContext.topics ?? [])
            .map((topic) => clampText(topic, 60))
            .filter((topic): topic is string => Boolean(topic))
            .slice(0, 10),
        }
      : undefined;

  const requestContext =
    context.requestContext &&
    (context.requestContext.path ||
      context.requestContext.provider ||
      context.requestContext.source ||
      context.requestContext.target ||
      context.requestContext.destination ||
      context.requestContext.summary ||
      context.requestContext.errorType)
      ? {
          method: clampText(context.requestContext.method, 12),
          path: clampText(context.requestContext.path, 180),
          status:
            typeof context.requestContext.status === "number" ||
            typeof context.requestContext.status === "string"
              ? context.requestContext.status
              : undefined,
          durationMs:
            typeof context.requestContext.durationMs === "number"
              ? context.requestContext.durationMs
              : undefined,
          provider: clampText(context.requestContext.provider, 80),
          source: clampText(context.requestContext.source, 80),
          target: clampText(context.requestContext.target, 180),
          destination: clampText(context.requestContext.destination, 180),
          errorType: clampText(context.requestContext.errorType, 80),
          requestPreview: clampText(context.requestContext.requestPreview, 320),
          responsePreview: clampText(context.requestContext.responsePreview, 320),
          tunnelId: clampText(context.requestContext.tunnelId, 80),
          timestamp: clampText(context.requestContext.timestamp, 120),
          summary: clampText(context.requestContext.summary),
        }
      : undefined;

  const webhookContext =
    context.webhookContext &&
    (context.webhookContext.provider ||
      context.webhookContext.eventType ||
      context.webhookContext.endpoint ||
      context.webhookContext.destination ||
      context.webhookContext.errorClassification ||
      context.webhookContext.summary)
      ? {
          provider: clampText(context.webhookContext.provider, 80),
          eventType: clampText(context.webhookContext.eventType, 120),
          endpoint: clampText(context.webhookContext.endpoint, 180),
          deliveryStatus: clampText(context.webhookContext.deliveryStatus, 60),
          signatureHeader: clampText(context.webhookContext.signatureHeader, 60),
          retries:
            typeof context.webhookContext.retries === "number"
              ? context.webhookContext.retries
              : undefined,
          latencyMs:
            typeof context.webhookContext.latencyMs === "number"
              ? context.webhookContext.latencyMs
              : undefined,
          destination: clampText(context.webhookContext.destination, 180),
          receivedAt: clampText(context.webhookContext.receivedAt, 120),
          errorClassification: clampText(context.webhookContext.errorClassification, 120),
          payloadPreview: clampText(context.webhookContext.payloadPreview, 320),
          responsePreview: clampText(context.webhookContext.responsePreview, 320),
          attemptId: clampText(context.webhookContext.attemptId, 80),
          summary: clampText(context.webhookContext.summary),
        }
      : undefined;

  const logContext =
    context.logContext &&
    (context.logContext.summary ||
      (context.logContext.recent && context.logContext.recent.length > 0))
      ? {
          summary: clampText(context.logContext.summary),
          levels: (context.logContext.levels ?? [])
            .map((level) => clampText(level, 32))
            .filter((level): level is string => Boolean(level))
            .slice(0, 8),
          recent: (context.logContext.recent ?? [])
            .map((log) => clampText(log, 240))
            .filter((log): log is string => Boolean(log))
            .slice(0, 8),
        }
      : undefined;

  return {
    currentPage,
    docsContext,
    requestContext,
    webhookContext,
    logContext,
  };
}

async function fetchJson<T>(path: string, timeoutMs = CONTROL_PLANE_TIMEOUT_MS): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildApiUrl(path), {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function pushRuntimeHit(hits: AssistantRuntimeHit[], hit: AssistantRuntimeHit) {
  const key = `${hit.kind}:${hit.title}:${hit.detail}`;
  if (!hits.some((existing) => `${existing.kind}:${existing.title}:${existing.detail}` === key)) {
    hits.push(hit);
  }
}

function buildContextHits(context?: AssistantContext): AssistantRuntimeHit[] {
  const hits: AssistantRuntimeHit[] = [];
  if (!context) {
    return hits;
  }

  if (context.currentPage) {
    pushRuntimeHit(hits, {
      kind: "page",
      title: context.currentPage.title,
      detail: `${context.currentPage.area.toUpperCase()} page at ${context.currentPage.path}${
        context.currentPage.summary ? `. ${context.currentPage.summary}` : "."
      }`,
    });
  }

  if (context.requestContext) {
    pushRuntimeHit(hits, {
      kind: "request",
      title: [
        context.requestContext.method,
        context.requestContext.path || context.requestContext.target || "Request",
      ]
        .filter(Boolean)
        .join(" "),
      detail: [
        context.requestContext.summary,
        context.requestContext.status
          ? `Status: ${context.requestContext.status}.`
          : undefined,
        context.requestContext.durationMs
          ? `Duration: ${context.requestContext.durationMs}ms.`
          : undefined,
        context.requestContext.provider || context.requestContext.source
          ? `Source: ${context.requestContext.provider || context.requestContext.source}.`
          : undefined,
        context.requestContext.target
          ? `Target: ${context.requestContext.target}.`
          : undefined,
        context.requestContext.destination
          ? `Destination: ${context.requestContext.destination}.`
          : undefined,
        context.requestContext.errorType
          ? `Error type: ${context.requestContext.errorType}.`
          : undefined,
        context.requestContext.requestPreview
          ? `Request preview: ${context.requestContext.requestPreview}.`
          : undefined,
        context.requestContext.responsePreview
          ? `Response preview: ${context.requestContext.responsePreview}.`
          : undefined,
        context.requestContext.tunnelId
          ? `Tunnel: ${context.requestContext.tunnelId}.`
          : undefined,
        context.requestContext.timestamp
          ? `At: ${context.requestContext.timestamp}.`
          : undefined,
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  if (context.webhookContext) {
    pushRuntimeHit(hits, {
      kind: "webhook",
      title: context.webhookContext.provider
        ? `${context.webhookContext.provider} webhook`
        : "Webhook context",
      detail: [
        context.webhookContext.summary,
        context.webhookContext.eventType
          ? `Event: ${context.webhookContext.eventType}.`
          : undefined,
        context.webhookContext.endpoint
          ? `Endpoint: ${context.webhookContext.endpoint}.`
          : undefined,
        context.webhookContext.destination
          ? `Destination: ${context.webhookContext.destination}.`
          : undefined,
        context.webhookContext.deliveryStatus
          ? `Delivery: ${context.webhookContext.deliveryStatus}.`
          : undefined,
        typeof context.webhookContext.retries === "number"
          ? `Retries: ${context.webhookContext.retries}.`
          : undefined,
        typeof context.webhookContext.latencyMs === "number"
          ? `Latency: ${context.webhookContext.latencyMs}ms.`
          : undefined,
        context.webhookContext.receivedAt
          ? `Received: ${context.webhookContext.receivedAt}.`
          : undefined,
        context.webhookContext.errorClassification
          ? `Error class: ${context.webhookContext.errorClassification}.`
          : undefined,
        context.webhookContext.signatureHeader
          ? `Signature header: ${context.webhookContext.signatureHeader}.`
          : undefined,
        context.webhookContext.payloadPreview
          ? `Payload preview: ${context.webhookContext.payloadPreview}.`
          : undefined,
        context.webhookContext.responsePreview
          ? `Response preview: ${context.webhookContext.responsePreview}.`
          : undefined,
        context.webhookContext.attemptId
          ? `Attempt: ${context.webhookContext.attemptId}.`
          : undefined,
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  if (context.logContext) {
    pushRuntimeHit(hits, {
      kind: "log",
      title: "Log context",
      detail: [
        context.logContext.summary,
        context.logContext.levels?.length
          ? `Levels: ${context.logContext.levels.join(", ")}.`
          : undefined,
        context.logContext.recent?.length
          ? `Recent lines: ${context.logContext.recent.slice(0, 3).join(" | ")}`
          : undefined,
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  return hits;
}

function buildRuntimeHits(input: {
  query: string;
  context?: AssistantContext;
  instance: RuntimeInstance | null;
  tunnels: RuntimeTunnel[] | null;
  events: RuntimeEvent[] | null;
}): AssistantRuntimeHit[] {
  const terms = tokenize(
    [
      input.query,
      input.context?.requestContext?.path,
      input.context?.requestContext?.provider,
      input.context?.requestContext?.source,
      input.context?.requestContext?.target,
      input.context?.requestContext?.destination,
      input.context?.requestContext?.responsePreview,
      input.context?.webhookContext?.provider,
      input.context?.webhookContext?.eventType,
      input.context?.webhookContext?.destination,
      input.context?.webhookContext?.errorClassification,
    ]
      .filter(Boolean)
      .join(" "),
  );

  const hits = buildContextHits(input.context);

  if (input.instance) {
    pushRuntimeHit(hits, {
      kind: "instance",
      title: input.instance.instance_name || "Binboi control plane",
      detail: `Auth mode: ${input.instance.auth_mode || "unknown"}. Active tunnels: ${
        input.instance.active_tunnels ?? 0
      }. Managed domain: ${input.instance.managed_domain || "not reported"}.`,
    });
  }

  const matchedTunnels =
    input.tunnels?.filter((tunnel) => {
      if (!terms.length) {
        return false;
      }

      const haystack = [
        tunnel.subdomain,
        tunnel.target,
        tunnel.status,
        tunnel.public_url,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return terms.some((term) => haystack.includes(term));
    }) ?? [];

  const recentTunnels =
    matchedTunnels.length > 0 ? matchedTunnels : (input.tunnels ?? []).slice(0, 3);
  for (const tunnel of recentTunnels.slice(0, 3)) {
    pushRuntimeHit(hits, {
      kind: "tunnel",
      title: tunnel.subdomain
        ? `${tunnel.subdomain}.binboi.link`
        : tunnel.public_url || "Tunnel",
      detail: `Status: ${tunnel.status || "unknown"}. Target: ${
        tunnel.target || "not reported"
      }. Requests: ${tunnel.request_count ?? 0}.`,
    });
  }

  const matchedEvents =
    input.events?.filter((event) => {
      if (!terms.length) {
        return false;
      }

      const haystack = [event.level, event.message, event.tunnel_subdomain]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return terms.some((term) => haystack.includes(term));
    }) ?? [];
  const recentEvents =
    matchedEvents.length > 0 ? matchedEvents : (input.events ?? []).slice(0, 4);
  for (const event of recentEvents.slice(0, 4)) {
    pushRuntimeHit(hits, {
      kind: "event",
      title: event.level ? event.level.toUpperCase() : "Event",
      detail: `${event.message || "No event message."}${
        event.tunnel_subdomain ? ` Tunnel: ${event.tunnel_subdomain}.` : ""
      }`,
    });
  }

  return hits.slice(0, 8);
}

function serializeSources(results: AssistantSearchResult[]): AssistantSource[] {
  return results.slice(0, 6).map((result) => ({
    title: result.title,
    href: result.href,
    kind: result.kind,
    excerpt: result.excerpt,
  }));
}

function buildContextNote(context?: AssistantContext) {
  if (!context) {
    return "No explicit page, request, webhook, or log context was supplied with this question.";
  }

  const parts: string[] = [];
  if (context.currentPage) {
    parts.push(`Current page: ${context.currentPage.title} (${context.currentPage.path}).`);
  }
  if (context.docsContext?.section) {
    parts.push(`Docs section: ${context.docsContext.section}.`);
  }
  if (context.requestContext?.summary || context.requestContext?.errorType) {
    parts.push(
      `Request context: ${context.requestContext.summary || context.requestContext.errorType}.`,
    );
  }
  if (context.requestContext?.status || context.requestContext?.durationMs) {
    parts.push(
      `Request status: ${
        context.requestContext.status ?? "unknown"
      } with duration ${context.requestContext.durationMs ?? "unknown"}ms.`,
    );
  }
  if (context.webhookContext?.provider || context.webhookContext?.summary) {
    parts.push(
      `Webhook context: ${
        context.webhookContext.summary || context.webhookContext.provider
      }.`,
    );
  }
  if (context.webhookContext?.deliveryStatus || context.webhookContext?.errorClassification) {
    parts.push(
      `Webhook delivery: ${
        context.webhookContext.deliveryStatus ?? "unknown"
      } with class ${context.webhookContext.errorClassification ?? "unspecified"}.`,
    );
  }
  if (context.logContext?.summary) {
    parts.push(`Log context: ${context.logContext.summary}.`);
  }

  return parts.join(" ") || "No explicit page, request, webhook, or log context was supplied.";
}

function buildFallbackMessage(input: {
  query: string;
  results: AssistantSearchResult[];
  runtimeHits: AssistantRuntimeHit[];
  runtimeAvailable: boolean;
  context?: AssistantContext;
  suggestions: string[];
}) {
  const [primary, secondary] = input.results;
  const firstParagraph = primary
    ? `Binboi searched the current docs and product surfaces for "${input.query}". The strongest match is ${primary.title}, which is about ${primary.excerpt.toLowerCase()}.`
    : `Binboi could not find a strong direct document match for "${input.query}", so this answer falls back to troubleshooting guidance and the context already available on the page.`;

  const secondParagraph = input.runtimeAvailable
    ? `Live control-plane data was checked as well. ${
        input.runtimeHits.length > 0
          ? `Relevant runtime context is available, including ${input.runtimeHits
              .slice(0, 2)
              .map((hit) => hit.title)
              .join(" and ")}.`
          : "The control plane responded, but it did not produce a strong runtime match for this question."
      }`
    : `Live control-plane data was not reachable, so the answer is based on product docs, page context, and known Binboi debugging patterns. ${buildContextNote(
        input.context,
      )}`;

  const relatedLine = secondary
    ? `Related source: ${secondary.title}.`
    : "No second ranked source stood out strongly enough to quote directly.";

  const nextSteps = input.suggestions.slice(0, 3).map((item) => `- ${item}`).join("\n");

  return [firstParagraph, secondParagraph, relatedLine, nextSteps].join("\n\n");
}

function extractOpenAIText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  if (typeof record.output_text === "string" && record.output_text.trim()) {
    return record.output_text.trim();
  }

  const output = Array.isArray(record.output) ? record.output : [];
  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const itemRecord = item as Record<string, unknown>;
    const content = Array.isArray(itemRecord.content) ? itemRecord.content : [];
    for (const part of content) {
      if (!part || typeof part !== "object") {
        continue;
      }

      const partRecord = part as Record<string, unknown>;
      if (typeof partRecord.text === "string" && partRecord.text.trim()) {
        return partRecord.text.trim();
      }

      const textValue = partRecord.text;
      if (
        textValue &&
        typeof textValue === "object" &&
        typeof (textValue as Record<string, unknown>).value === "string"
      ) {
        return ((textValue as Record<string, unknown>).value as string).trim();
      }
    }
  }

  return null;
}

async function generateAiMessage(input: {
  query: string;
  messages: AssistantConversationMessage[];
  context?: AssistantContext;
  results: AssistantSearchResult[];
  runtimeHits: AssistantRuntimeHit[];
  suggestions: string[];
  fallbackMessage: string;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

  const conversation = input.messages
    .slice(-8)
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n");

  const sourceLines = input.results
    .slice(0, 5)
    .map(
      (result) =>
        `- ${result.title} (${result.kind}, ${result.href}): ${result.excerpt} ${result.body}`,
    )
    .join("\n");

  const runtimeLines =
    input.runtimeHits.length > 0
      ? input.runtimeHits.map((hit) => `- ${hit.kind}: ${hit.title}. ${hit.detail}`).join("\n")
      : "- No runtime hit was available.";

  const prompt = [
    "You are the Binboi assistant for a tunneling and webhook inspection product.",
    "Answer as a concise and practical developer support engineer.",
    "Use only the provided context. Never invent product behavior or runtime facts.",
    "If the request, webhook, or log context is incomplete, say that clearly.",
    "Prefer troubleshooting guidance over marketing language.",
    "Return 2 short paragraphs followed by up to 3 bullet suggestions.",
    "",
    `User query: ${input.query}`,
    "",
    "Conversation history:",
    conversation || "- No prior conversation.",
    "",
    "Context note:",
    buildContextNote(input.context),
    "",
    "Product sources:",
    sourceLines || "- No matching sources.",
    "",
    "Runtime hits:",
    runtimeLines,
    "",
    "Draft fallback answer:",
    input.fallbackMessage,
    "",
    "Suggested next steps:",
    input.suggestions.map((item) => `- ${item}`).join("\n"),
  ].join("\n");

  try {
    const response = await fetch(`${baseUrl}/responses`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_output_tokens: 500,
        input: [
          {
            role: "user",
            content: [{ type: "input_text", text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as unknown;
    return extractOpenAIText(payload);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function runAssistantAssist(
  payload: AssistantRequestPayload,
): Promise<AssistantResponsePayload> {
  const query = compactWhitespace(payload.query).slice(0, MAX_QUERY_LENGTH);
  const messages = sanitizeMessages(payload.messages);
  const context = sanitizeContext(payload.context);
  const conversationTerms = messages.map((message) => message.content);
  const results = searchAssistantDocuments(query, {
    context,
    conversationTerms,
  });
  const suggestions = buildTroubleshootingHints(query, context).slice(0, 4);

  const [instance, tunnels, events] = await Promise.all([
    fetchJson<RuntimeInstance>("/api/instance"),
    fetchJson<RuntimeTunnel[]>("/api/tunnels"),
    fetchJson<RuntimeEvent[]>("/api/events"),
  ]);

  const runtimeAvailable = Boolean(instance || tunnels || events);
  const runtimeHits = buildRuntimeHits({
    query,
    context,
    instance,
    tunnels,
    events,
  });

  const fallbackMessage = buildFallbackMessage({
    query,
    results,
    runtimeHits,
    runtimeAvailable,
    context,
    suggestions,
  });

  const aiMessage = await generateAiMessage({
    query,
    messages,
    context,
    results,
    runtimeHits,
    suggestions,
    fallbackMessage,
  });

  return {
    query,
    message: aiMessage || fallbackMessage,
    mode: aiMessage ? "ai" : "search",
    sources: serializeSources(results),
    runtime: {
      available: runtimeAvailable,
      inspected: true,
      note: runtimeAvailable
        ? "Live control-plane data was checked and merged with any page-level assistant context."
        : "Live control-plane data was unavailable, so the assistant relied on docs, product content, and page-level context only.",
      hits: runtimeHits,
    },
    suggestions,
  };
}
