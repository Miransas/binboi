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
  target?: string;
  errorType?: string;
  summary?: string;
};

export type AssistantWebhookContext = {
  provider?: string;
  eventType?: string;
  endpoint?: string;
  deliveryStatus?: string;
  signatureHeader?: string;
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
