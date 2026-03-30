export type AssistantConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AssistantCurrentPageContext = {
  path: string;
  title: string;
  area: "site" | "docs" | "dashboard";
  summary?: string;
  browserTitle?: string;
};

export type AssistantDocsContext = {
  section?: string;
  summary?: string;
  topics?: string[];
};

export type AssistantRequestContext = {
  method?: string;
  path?: string;
  status?: number | string;
  durationMs?: number;
  provider?: string;
  source?: string;
  target?: string;
  destination?: string;
  errorType?: string;
  requestPreview?: string;
  responsePreview?: string;
  tunnelId?: string;
  timestamp?: string;
  summary?: string;
};

export type AssistantWebhookContext = {
  provider?: string;
  eventType?: string;
  endpoint?: string;
  deliveryStatus?: string;
  signatureHeader?: string;
  retries?: number;
  latencyMs?: number;
  destination?: string;
  receivedAt?: string;
  errorClassification?: string;
  payloadPreview?: string;
  responsePreview?: string;
  attemptId?: string;
  summary?: string;
};

export type AssistantLogContext = {
  summary?: string;
  levels?: string[];
  recent?: string[];
};

export type AssistantContext = {
  currentPage?: AssistantCurrentPageContext;
  docsContext?: AssistantDocsContext;
  requestContext?: AssistantRequestContext;
  webhookContext?: AssistantWebhookContext;
  logContext?: AssistantLogContext;
};

export type AssistantRequestPayload = {
  query: string;
  messages?: AssistantConversationMessage[];
  context?: AssistantContext;
};

export type AssistantSource = {
  title: string;
  href: string;
  kind: string;
  excerpt: string;
};

export type AssistantRuntimeHit = {
  kind: "instance" | "tunnel" | "event" | "page" | "request" | "webhook" | "log";
  title: string;
  detail: string;
};

export type AssistantResponsePayload = {
  query: string;
  message: string;
  mode: "ai" | "search";
  sources: AssistantSource[];
  runtime: {
    available: boolean;
    inspected: boolean;
    note: string;
    hits: AssistantRuntimeHit[];
  };
  suggestions: string[];
};
