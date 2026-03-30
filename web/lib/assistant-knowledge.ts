import { blogPosts, changelogEntries } from "@/content/site-content";
import type { AssistantContext } from "@/lib/assistant-types";

export type AssistantDocument = {
  id: string;
  title: string;
  href: string;
  kind: "docs" | "guide" | "marketing" | "blog" | "changelog" | "dashboard";
  excerpt: string;
  body: string;
  keywords: string[];
};

export type AssistantSearchResult = AssistantDocument & {
  score: number;
};

export const assistantDocuments: AssistantDocument[] = [
  {
    id: "overview",
    title: "What Binboi is",
    href: "/docs",
    kind: "docs",
    excerpt:
      "Binboi is a tunneling and webhook inspection product with a Go relay, CLI agent, and Next.js control plane.",
    body:
      "Use Binboi when you need a public URL for localhost, cleaner access token flows, and debugging help around requests, webhooks, and logs. The core MVP is strongest for HTTP tunneling, webhook debugging, and self-hosted control-plane visibility.",
    keywords: ["intro", "overview", "product", "ngrok", "self-hosted", "webhook", "tunnel"],
  },
  {
    id: "quick-start",
    title: "Quick start",
    href: "/docs/quick-start",
    kind: "guide",
    excerpt:
      "Install the CLI, create an access token, log in, and expose a local app with one command.",
    body:
      "The shortest trusted path is install the CLI, create a dashboard token, run binboi login --token, then binboi start 3000 my-app. After that, confirm the public URL reaches the same route that works on localhost.",
    keywords: ["quick start", "first tunnel", "login", "binboi start", "whoami", "install"],
  },
  {
    id: "installation",
    title: "Installation",
    href: "/docs/installation",
    kind: "guide",
    excerpt:
      "Install Binboi with Homebrew, a direct binary, npm direction, or a contributor setup from source.",
    body:
      "Homebrew is the cleanest path for operators. Direct tar.gz binaries are the release artifact shape. npm is positioned as a future wrapper direction, and contributors can build the Go and Next.js surfaces locally from the repository.",
    keywords: ["brew", "binary", "install", "homebrew", "npm", "local development"],
  },
  {
    id: "authentication",
    title: "Authentication and access tokens",
    href: "/docs/authentication",
    kind: "guide",
    excerpt:
      "Dashboard users create revocable access tokens for machines. The backend stores only token prefixes and hashes.",
    body:
      "Tokens are created in the dashboard and shown in full only once. binboi login stores the token in ~/.binboi/config.json. binboi whoami verifies the token against GET /api/v1/auth/me. If authentication fails, rotate the token and confirm the correct API address.",
    keywords: ["token", "auth", "login", "whoami", "access token", "prefix", "hash", "security"],
  },
  {
    id: "cli",
    title: "CLI usage",
    href: "/docs/cli",
    kind: "guide",
    excerpt:
      "Reference for login, whoami, start, and the planned command shape for future Binboi ergonomics.",
    body:
      "The working command today is binboi start for HTTP tunnels. The docs also describe planned ergonomic aliases like binboi http and future commands such as logs, stop, regions, and config so the product direction stays clear without pretending every command already exists.",
    keywords: ["cli", "commands", "binboi login", "binboi whoami", "binboi start", "binboi version"],
  },
  {
    id: "http-tunnels",
    title: "HTTP tunnels",
    href: "/docs/http-tunnels",
    kind: "guide",
    excerpt:
      "Host-based HTTP tunnels are the strongest runtime surface in Binboi today.",
    body:
      "The relay maps a public host to a tunnel record, attaches traffic to the connected agent, and forwards HTTP requests to your local target port. HTTP is production-shaped in the MVP. Raw TCP remains planned and should not be treated as equally mature yet.",
    keywords: ["http", "tunnel", "public url", "host routing", "forwarding", "localhost"],
  },
  {
    id: "webhooks",
    title: "Webhook debugging",
    href: "/docs/webhooks",
    kind: "guide",
    excerpt:
      "Use Binboi to receive and inspect webhook deliveries from Stripe, Clerk, Supabase, Neon, GitHub, and Linear.",
    body:
      "Binboi gives third-party providers a stable public callback URL for your local app. The most common webhook failures come from signature verification, wrong routes, raw-body handling, middleware ordering, and provider retries rather than transport alone.",
    keywords: [
      "webhooks",
      "stripe",
      "clerk",
      "supabase",
      "neon",
      "github",
      "linear",
      "signature",
      "payload",
    ],
  },
  {
    id: "requests",
    title: "Request inspection",
    href: "/docs/requests",
    kind: "guide",
    excerpt:
      "Request inspection should show inbound metadata, headers, payload previews, durations, statuses, and the target service.",
    body:
      "Binboi is moving from relay events toward a richer request view. Even in the MVP, the product should help answer whether a request arrived, which tunnel received it, what local service handled it, and whether the failure was auth, transport, or application level.",
    keywords: ["requests", "headers", "payload", "response preview", "status", "duration", "inspection"],
  },
  {
    id: "api-keys",
    title: "API keys and token management",
    href: "/docs/api-keys",
    kind: "guide",
    excerpt:
      "Create, copy once, track last-used timestamps, and revoke dashboard-issued access tokens.",
    body:
      "The dashboard shows token name, prefix, created time, last used time, and status. Full token values are returned only at creation time. Revoke immediately if a token lands in shell history, screenshots, or shared chat logs.",
    keywords: ["api keys", "access tokens", "revoke", "last used", "dashboard", "token page"],
  },
  {
    id: "logs",
    title: "Logs and events",
    href: "/docs/logs",
    kind: "guide",
    excerpt:
      "Separate raw relay logs, activity events, and request-level views so operators start with the right lens.",
    body:
      "Raw relay logs tell the transport truth. Activity events explain lifecycle changes like tunnel creation, token rotation, or connection attach. Request inspection focuses on one request or webhook. In the MVP, relay logs and events are stronger than full replay tooling.",
    keywords: ["logs", "events", "activity", "relay logs", "request view", "lifecycle"],
  },
  {
    id: "regions",
    title: "Regions and nodes",
    href: "/docs/regions",
    kind: "guide",
    excerpt:
      "Choose regions to reduce latency and lower webhook timeout risk, especially when providers are far from your local machine.",
    body:
      "Regions matter because they affect response time and reliability. The current repository behaves like a compact single-node product, but the docs frame how operators should think about node placement, latency, and future expansion.",
    keywords: ["region", "nodes", "latency", "location", "timeouts", "routing"],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting guide",
    href: "/docs/troubleshooting",
    kind: "guide",
    excerpt:
      "Practical fixes for invalid tokens, offline tunnels, forwarding problems, 404 and 500 responses, and webhook signature confusion.",
    body:
      "Start with authentication and tunnel connectivity. If localhost works but the public URL fails, check token validity, relay connectivity, target-port mismatch, and route handling. For webhooks, verify the route, signature secret, raw-body handling, and middleware order before blaming transport.",
    keywords: ["troubleshooting", "invalid token", "offline", "404", "500", "timeout", "signature"],
  },
  {
    id: "dashboard-ai",
    title: "AI assistant",
    href: "/dashboard/ai",
    kind: "dashboard",
    excerpt:
      "Ask Binboi for docs, logs, request context, and troubleshooting guidance through a read-only assistant.",
    body:
      "The assistant is designed as a safe read-only layer. It searches product docs, static product pages, and live runtime data when the control plane is reachable. If OpenAI credentials are configured on the server, it can add concise summaries and troubleshooting guidance.",
    keywords: ["ai", "assistant", "search", "summaries", "troubleshooting", "logs"],
  },
  {
    id: "dashboard-overview",
    title: "Dashboard overview",
    href: "/dashboard",
    kind: "dashboard",
    excerpt:
      "The control-plane overview shows active tunnels, throughput, authentication mode, and relay event visibility.",
    body:
      "Use the dashboard overview to understand whether the relay is online, how many tunnels are active, and whether the current session is signed in or running in preview mode. It is the fastest path to current operational state.",
    keywords: ["dashboard", "overview", "relay", "throughput", "preview", "active tunnels"],
  },
  {
    id: "dashboard-tunnel",
    title: "Tunnel inventory",
    href: "/dashboard/tunnel",
    kind: "dashboard",
    excerpt:
      "Reserve subdomains, connect agents, inspect request counts, and manage tunnel lifecycle state.",
    body:
      "The tunnel page models the real Binboi MVP lifecycle: reserve a tunnel first, connect the CLI later, then inspect status, request count, bandwidth, and current target mapping from the dashboard.",
    keywords: ["dashboard", "tunnel", "subdomain", "reservation", "active", "request count"],
  },
  {
    id: "dashboard-access-tokens",
    title: "Access token manager",
    href: "/dashboard/access-tokens",
    kind: "dashboard",
    excerpt:
      "Create, copy once, inspect last-used timestamps, and revoke CLI credentials from the dashboard.",
    body:
      "The access token manager is the source of truth for dashboard-issued machine tokens. It supports Free and Pro plan limits, one-time token display, and immediate revocation for compromised credentials.",
    keywords: ["dashboard", "access tokens", "token manager", "revoke", "plan limits", "last used"],
  },
  {
    id: "pricing",
    title: "Pricing foundations",
    href: "/pricing",
    kind: "marketing",
    excerpt:
      "Free and Pro plan foundations clarify token and tunnel limits without pretending billing is fully mature.",
    body:
      "Free is designed for local development and self-hosted evaluation. Pro increases token and tunnel limits and sets expectations for future managed infrastructure, custom domains, and usage insights. Enterprise remains a future operator motion, not a finished checkout flow.",
    keywords: ["pricing", "free", "pro", "limits", "plans", "tokens", "tunnels"],
  },
  {
    id: "privacy",
    title: "Privacy policy",
    href: "/privacy",
    kind: "marketing",
    excerpt:
      "Binboi handles account data, usage metadata, and token hashes with a narrow early-stage SaaS privacy posture.",
    body:
      "The privacy policy explains what account information, access-token metadata, and runtime usage signals Binboi may collect. It also describes retention, infrastructure providers, and why operators should avoid sending unnecessary secrets or highly sensitive internal systems through public URLs unless they control the deployment.",
    keywords: ["privacy", "data", "retention", "security", "token hash", "usage data"],
  },
  {
    id: "terms",
    title: "Terms of service",
    href: "/terms",
    kind: "marketing",
    excerpt:
      "Usage terms for an early-stage tunnel platform, including acceptable use, beta boundaries, and liability limits.",
    body:
      "The terms describe acceptable use, access, suspension, billing foundations, beta limitations, and restrictions on using Binboi for unlawful traffic, credential abuse, malware, or other high-risk activity. They also warn that the product is still maturing and should not be treated like an unlimited high-availability edge network.",
    keywords: ["terms", "acceptable use", "beta", "billing", "suspension", "liability"],
  },
  {
    id: "typography",
    title: "Typography and design system",
    href: "/typography",
    kind: "marketing",
    excerpt:
      "The Binboi typography page documents heading scale, operational copy tone, code styling, and interface rhythm.",
    body:
      "Typography is part of product trust. Binboi uses strong contrast, calm spacing, a technical monospace accent for commands and logs, and concise operational copy that says what works, what is planned, and what is not yet ready.",
    keywords: ["typography", "design", "style guide", "copy", "ui", "voice"],
  },
  ...blogPosts.map((post) => ({
    id: `blog-${post.slug}`,
    title: post.title,
    href: "/blog",
    kind: "blog" as const,
    excerpt: post.excerpt,
    body: `${post.excerpt} ${post.highlights.join(" ")} ${post.searchBody}`,
    keywords: [post.category.toLowerCase(), "blog", ...post.title.toLowerCase().split(/\s+/)],
  })),
  ...changelogEntries.map((entry) => ({
    id: `changelog-${entry.version}`,
    title: `${entry.version} ${entry.title}`,
    href: "/changelog",
    kind: "changelog" as const,
    excerpt: entry.summary,
    body: `${entry.summary} ${entry.sections
      .map((section) => `${section.label} ${section.items.join(" ")}`)
      .join(" ")}`,
    keywords: [entry.version.toLowerCase(), "release", "changelog", "release notes"],
  })),
];

function tokenize(input: string) {
  return input
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function buildContextTerms(context?: AssistantContext) {
  if (!context) {
    return [];
  }

  return tokenize(
    [
      context.currentPage?.title,
      context.currentPage?.summary,
      context.currentPage?.path,
      context.docsContext?.section,
      context.docsContext?.summary,
      context.docsContext?.topics?.join(" "),
      context.requestContext?.method,
      context.requestContext?.path,
      context.requestContext?.target,
      context.requestContext?.errorType,
      context.requestContext?.summary,
      String(context.requestContext?.status ?? ""),
      context.webhookContext?.provider,
      context.webhookContext?.eventType,
      context.webhookContext?.endpoint,
      context.webhookContext?.deliveryStatus,
      context.webhookContext?.signatureHeader,
      context.webhookContext?.summary,
      context.logContext?.summary,
      context.logContext?.levels?.join(" "),
      context.logContext?.recent?.join(" "),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export function searchAssistantDocuments(
  query: string,
  options?: { context?: AssistantContext; conversationTerms?: string[] },
): AssistantSearchResult[] {
  const queryTerms = tokenize(query);
  const contextTerms = buildContextTerms(options?.context);
  const conversationTerms = tokenize((options?.conversationTerms ?? []).join(" "));
  const allTerms = Array.from(new Set([...queryTerms, ...contextTerms, ...conversationTerms]));
  if (!allTerms.length) {
    return [];
  }

  const scored = assistantDocuments
    .map((document) => {
      const title = document.title.toLowerCase();
      const excerpt = document.excerpt.toLowerCase();
      const body = document.body.toLowerCase();
      const keywords = document.keywords.join(" ").toLowerCase();

      let score = 0;
      for (const term of queryTerms) {
        if (title.includes(term)) score += 16;
        if (keywords.includes(term)) score += 11;
        if (excerpt.includes(term)) score += 7;
        if (body.includes(term)) score += 4;
      }

      for (const term of contextTerms) {
        if (title.includes(term)) score += 8;
        if (keywords.includes(term)) score += 6;
        if (excerpt.includes(term)) score += 4;
        if (body.includes(term)) score += 2;
      }

      for (const term of conversationTerms) {
        if (title.includes(term)) score += 4;
        if (keywords.includes(term)) score += 3;
        if (excerpt.includes(term)) score += 2;
        if (body.includes(term)) score += 1;
      }

      if (
        options?.context?.currentPage?.path &&
        options.context.currentPage.path === document.href
      ) {
        score += 14;
      }

      return { ...document, score };
    })
    .filter((document) => document.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  return scored;
}

export function buildTroubleshootingHints(
  query: string,
  context?: AssistantContext,
): string[] {
  const lower = query.toLowerCase();
  const hints: string[] = [];

  if (lower.includes("token") || lower.includes("login") || lower.includes("whoami")) {
    hints.push("Confirm the CLI token is active and rerun `binboi whoami` against the expected API address.");
  }
  if (lower.includes("offline") || lower.includes("connect") || lower.includes("attach")) {
    hints.push("If the tunnel stays offline, verify the relay is reachable and that the agent is attaching to the reserved subdomain.");
  }
  if (lower.includes("404") || lower.includes("500") || lower.includes("route")) {
    hints.push("Compare the public request path with the exact localhost route that succeeds. 404 often means route mismatch, while 500 usually means your app ran and failed.");
  }
  if (
    lower.includes("webhook") ||
    lower.includes("stripe") ||
    lower.includes("clerk") ||
    lower.includes("supabase") ||
    lower.includes("github") ||
    lower.includes("linear")
  ) {
    hints.push("For webhook issues, inspect signature headers, raw-body handling, middleware order, and provider retry behavior before blaming the tunnel.");
  }
  if (lower.includes("log") || lower.includes("event")) {
    hints.push("Start with raw relay logs for transport truth, then use request or webhook context to understand application-level failures.");
  }
  if (context?.requestContext?.errorType) {
    hints.push(
      `The current request context reports ${context.requestContext.errorType}. Focus on the exact route, target service, and whether the failure happened before or after the app handled the request.`,
    );
  }
  if (context?.webhookContext?.provider) {
    hints.push(
      `This page is already scoped to ${context.webhookContext.provider}. Check provider-specific signature headers, retry behavior, and the configured endpoint before changing tunnel settings.`,
    );
  }
  if (context?.logContext?.recent?.length) {
    hints.push("Recent logs are available in context. Compare the latest log lines against the tunnel status and the request path before assuming the relay is broken.");
  }
  if (context?.currentPage?.area === "docs") {
    hints.push("You are already in the docs flow, so the assistant should prefer guide-backed answers and related documentation links over speculative runtime guesses.");
  }

  if (hints.length === 0) {
    hints.push("Start with the Quick Start and Troubleshooting guides, then compare runtime logs against the exact command and token you are using.");
  }

  return hints;
}
