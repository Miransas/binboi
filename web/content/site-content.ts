export type BlogPostSummary = {
  slug: string;
  title: string;
  category: string;
  publishedAt: string;
  readTime: string;
  excerpt: string;
  highlights: string[];
  searchBody: string;
};

export type ChangelogEntry = {
  version: string;
  releasedAt: string;
  title: string;
  summary: string;
  sections: Array<{
    label: string;
    items: string[];
  }>;
};

export const blogPosts: BlogPostSummary[] = [
  {
    slug: "webhook-debugging-without-redeploys",
    title: "Webhook debugging without redeploys",
    category: "Product",
    publishedAt: "March 30, 2026",
    readTime: "6 min read",
    excerpt:
      "Why Binboi treats webhooks as a first-class workflow: public URLs, request inspection, and faster answers when signatures or payloads go sideways.",
    highlights: [
      "Stabilize one public endpoint for local development.",
      "Capture headers and payload previews before the failure disappears.",
      "Move from guessing to a repeatable debugging loop across Stripe, Clerk, Supabase, and GitHub.",
    ],
    searchBody:
      "Binboi helps debug webhook deliveries by exposing localhost, keeping request metadata visible, and guiding developers through signature, routing, and timeout failures without redeploying preview apps.",
  },
  {
    slug: "why-binboi-separates-users-and-cli-tokens",
    title: "Why Binboi separates users and CLI tokens",
    category: "Security",
    publishedAt: "March 24, 2026",
    readTime: "5 min read",
    excerpt:
      "Operator accounts belong in the dashboard. Machines belong behind revocable access tokens. That split makes the MVP safer and easier to reason about.",
    highlights: [
      "Full tokens are shown once and only stored as hashes plus prefixes.",
      "Each machine can be rotated independently without changing dashboard access.",
      "The same model scales from self-hosted preview to a future multi-user product.",
    ],
    searchBody:
      "Binboi authentication uses dashboard-issued personal access tokens for the CLI, stores only token hashes in the database, and keeps account access separate from machine access.",
  },
  {
    slug: "designing-an-honest-tunnel-dashboard",
    title: "Designing an honest tunnel dashboard",
    category: "Design",
    publishedAt: "March 18, 2026",
    readTime: "7 min read",
    excerpt:
      "A control plane earns trust by being clear about what is live, what is mocked, and what still needs backend work. Binboi now leans into that discipline.",
    highlights: [
      "Useful empty states beat beautiful dead ends.",
      "Logs, tokens, and tunnel state are more valuable than speculative AI panels.",
      "A premium UI still has to tell the operational truth.",
    ],
    searchBody:
      "The Binboi dashboard focuses on tunnel state, access tokens, logs, and practical setup guidance. It intentionally labels MVP features and avoids pretending that unfinished flows are ready.",
  },
];

export const changelogEntries: ChangelogEntry[] = [
  {
    version: "v0.5.0",
    releasedAt: "2026-03-30",
    title: "Developer assistant and premium marketing refresh",
    summary:
      "Introduced a secure Binboi assistant MVP for docs and troubleshooting, redesigned the landing page, and turned placeholder content routes into real product surfaces.",
    sections: [
      {
        label: "Assistant",
        items: [
          "Added a server-side search and assistant route that can combine product docs with live control-plane context.",
          "Introduced graceful fallback behavior when OpenAI credentials are not configured.",
          "Added a reusable assistant entry point for the website and dashboard surfaces.",
        ],
      },
      {
        label: "Marketing",
        items: [
          "Redesigned the landing page around webhook debugging, request inspection, and CLI onboarding.",
          "Filled blog, changelog, privacy, terms, and typography with real product content.",
        ],
      },
    ],
  },
  {
    version: "v0.4.0",
    releasedAt: "2026-03-30",
    title: "Account-backed access tokens",
    summary:
      "Moved Binboi to account-created access tokens, prefix-plus-hash storage, and CLI login and whoami commands that behave like a real developer product.",
    sections: [
      {
        label: "Auth",
        items: [
          "Added token creation, listing, revocation, and one-time display in the dashboard.",
          "Implemented binboi login, binboi whoami, and config-based token storage for the CLI.",
          "Added Homebrew-ready version output and release documentation foundations.",
        ],
      },
    ],
  },
  {
    version: "v0.3.0",
    releasedAt: "2026-03-29",
    title: "Control plane cleanup",
    summary:
      "Rebuilt the control plane around a coherent MVP data story so tunnels, domains, nodes, and events feel like one product instead of disconnected experiments.",
    sections: [
      {
        label: "Backend",
        items: [
          "Standardized the SQLite-backed preview control plane.",
          "Added cleaner tunnel lifecycle handling, domain verification endpoints, and event feeds.",
          "Improved dashboard fallback behavior when the backend is offline.",
        ],
      },
    ],
  },
  {
    version: "v0.2.0",
    releasedAt: "2026-03-28",
    title: "Dashboard and docs stabilization",
    summary:
      "Removed blank pages, added route-backed docs, and replaced confusing placeholder surfaces with honest MVP messaging.",
    sections: [
      {
        label: "Docs and UI",
        items: [
          "Built a proper docs center with route-based guides.",
          "Added setup guidance, access token management, and better empty states.",
          "Reworked the homepage so the product can be understood without reading source code first.",
        ],
      },
    ],
  },
];

export const integrationCards = [
  {
    name: "Stripe",
    label: "Payments",
    summary:
      "Keep a stable public URL for local payment webhooks and diagnose signature failures before pushing a preview deployment.",
  },
  {
    name: "Clerk",
    label: "Authentication",
    summary:
      "Inspect auth events, signature headers, and callback behavior when identity webhooks hit your local development environment.",
  },
  {
    name: "Supabase",
    label: "Backend",
    summary:
      "Route auth and database-triggered callbacks into local handlers while preserving the headers you need for verification.",
  },
  {
    name: "GitHub",
    label: "Developer workflows",
    summary:
      "Receive webhook deliveries for issues, pull requests, and app callbacks without exposing your entire stack permanently.",
  },
  {
    name: "Neon",
    label: "Data platforms",
    summary:
      "Validate database event delivery and compare payloads against the exact local route that handled them.",
  },
  {
    name: "Linear",
    label: "Ops and automation",
    summary:
      "Test issue automation and webhook consumers with clear request visibility and reproducible callback URLs.",
  },
];

export const assistantPromptSuggestions = [
  "Why is my webhook signature failing?",
  "How do I log in the Binboi CLI?",
  "What should I check when a tunnel stays offline?",
  "Show me the docs for HTTP tunnels.",
  "How do logs differ from request inspection?",
];
