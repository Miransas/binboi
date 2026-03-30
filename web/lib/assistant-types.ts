export type AssistantSource = {
  title: string;
  href: string;
  kind: string;
  excerpt: string;
};

export type AssistantRuntimeHit = {
  kind: "instance" | "tunnel" | "event";
  title: string;
  detail: string;
};

export type AssistantResponsePayload = {
  query: string;
  mode: "ai" | "search";
  summary: string;
  suggestions: string[];
  sources: AssistantSource[];
  runtime: {
    available: boolean;
    inspected: boolean;
    note: string;
    hits: AssistantRuntimeHit[];
  };
};
