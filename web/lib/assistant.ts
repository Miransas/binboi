import "server-only";

import { buildApiUrl } from "@/lib/binboi";
import {
  buildTroubleshootingHints,
  searchAssistantDocuments,
  type AssistantSearchResult,
} from "@/lib/assistant-knowledge";
import type {
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

function tokenize(input: string) {
  return input
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(buildApiUrl(path), { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function buildRuntimeHits(
  query: string,
  runtime: {
    instance: RuntimeInstance | null;
    tunnels: RuntimeTunnel[] | null;
    events: RuntimeEvent[] | null;
  },
): AssistantRuntimeHit[] {
  const terms = tokenize(query);
  const hits: AssistantRuntimeHit[] = [];

  if (runtime.instance) {
    hits.push({
      kind: "instance",
      title: runtime.instance.instance_name || "Binboi control plane",
      detail: `Auth mode: ${runtime.instance.auth_mode || "unknown"}. Active tunnels: ${
        runtime.instance.active_tunnels ?? 0
      }. Managed domain: ${runtime.instance.managed_domain || "not reported"}.`,
    });
  }

  const matchedTunnels =
    runtime.tunnels?.filter((tunnel) => {
      if (!terms.length) return false;
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
    matchedTunnels.length > 0
      ? matchedTunnels
      : (runtime.tunnels ?? []).slice(0, 3);

  for (const tunnel of recentTunnels.slice(0, 3)) {
    hits.push({
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
    runtime.events?.filter((event) => {
      if (!terms.length) return false;
      const haystack = [event.level, event.message, event.tunnel_subdomain]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return terms.some((term) => haystack.includes(term));
    }) ?? [];

  const recentEvents =
    matchedEvents.length > 0 ? matchedEvents : (runtime.events ?? []).slice(0, 4);

  for (const event of recentEvents.slice(0, 4)) {
    hits.push({
      kind: "event",
      title: event.level ? event.level.toUpperCase() : "Event",
      detail: `${event.message || "No event message."}${
        event.tunnel_subdomain ? ` Tunnel: ${event.tunnel_subdomain}.` : ""
      }`,
    });
  }

  return hits.slice(0, 6);
}

function buildFallbackSummary(
  query: string,
  results: AssistantSearchResult[],
  runtimeHits: AssistantRuntimeHit[],
  runtimeAvailable: boolean,
  suggestions: string[],
) {
  const lead = results[0];
  const second = results[1];

  const lines = [
    `Binboi searched the product docs and site content for "${query}".`,
    lead
      ? `The strongest match is ${lead.title}, which points to ${lead.excerpt.toLowerCase()}.`
      : "No direct document match was found, so the assistant is falling back to general Binboi troubleshooting guidance.",
  ];

  if (second) {
    lines.push(`A related source is ${second.title}, which expands on ${second.excerpt.toLowerCase()}.`);
  }

  if (runtimeAvailable && runtimeHits.length > 0) {
    lines.push(
      `Live runtime context is available, so the assistant also checked current tunnels and event data for extra clues.`,
    );
  } else {
    lines.push(
      "Live runtime context was not available, so this answer is based on the current docs, product pages, and known troubleshooting patterns.",
    );
  }

  if (suggestions.length > 0) {
    lines.push(`Next best move: ${suggestions[0]}`);
  }

  return lines.join(" ");
}

function serializeSources(results: AssistantSearchResult[]): AssistantSource[] {
  return results.slice(0, 6).map((result) => ({
    title: result.title,
    href: result.href,
    kind: result.kind,
    excerpt: result.excerpt,
  }));
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

async function generateAiSummary(input: {
  query: string;
  results: AssistantSearchResult[];
  runtimeHits: AssistantRuntimeHit[];
  suggestions: string[];
}): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
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
      : "- No live runtime context was available.";
  const suggestionLines = input.suggestions.map((item) => `- ${item}`).join("\n");

  const prompt = [
    "You are the Binboi product assistant.",
    "Answer as a concise developer support expert.",
    "Use only the supplied Binboi context. Do not invent product capabilities.",
    "If a feature is partial or MVP, say so clearly.",
    "Return 2 short paragraphs followed by up to 3 bullet suggestions.",
    "",
    `User question: ${input.query}`,
    "",
    "Product sources:",
    sourceLines,
    "",
    "Live runtime context:",
    runtimeLines,
    "",
    "Troubleshooting suggestions:",
    suggestionLines,
  ].join("\n");

  try {
    const response = await fetch(`${baseUrl}/responses`, {
      method: "POST",
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
  }
}

export async function runAssistant(query: string): Promise<AssistantResponsePayload> {
  const normalizedQuery = query.trim().replace(/\s+/g, " ").slice(0, 300);
  const results = searchAssistantDocuments(normalizedQuery);
  const suggestions = buildTroubleshootingHints(normalizedQuery);

  const [instance, tunnels, events] = await Promise.all([
    fetchJson<RuntimeInstance>("/api/instance"),
    fetchJson<RuntimeTunnel[]>("/api/tunnels"),
    fetchJson<RuntimeEvent[]>("/api/events"),
  ]);

  const runtimeAvailable = Boolean(instance || tunnels || events);
  const runtimeHits = buildRuntimeHits(normalizedQuery, { instance, tunnels, events });
  const aiSummary = await generateAiSummary({
    query: normalizedQuery,
    results,
    runtimeHits,
    suggestions,
  });

  return {
    query: normalizedQuery,
    mode: aiSummary ? "ai" : "search",
    summary: aiSummary || buildFallbackSummary(normalizedQuery, results, runtimeHits, runtimeAvailable, suggestions),
    suggestions: suggestions.slice(0, 4),
    sources: serializeSources(results),
    runtime: {
      available: runtimeAvailable,
      inspected: true,
      note: runtimeAvailable
        ? "Live control-plane data was checked for matching tunnels and recent events."
        : "Control-plane runtime data was unavailable, so the assistant relied on product docs and static guides.",
      hits: runtimeHits,
    },
  };
}
