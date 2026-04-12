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
    slug: "10-tunnel-tips-for-local-development",
    title: "10 tunnel tips for faster local development",
    category: "Tips",
    publishedAt: "April 10, 2026",
    readTime: "7 min read",
    excerpt:
      "Practical habits that make tunneling a seamless part of your dev workflow — from naming conventions and token rotation to keeping your public URL stable across restarts.",
    highlights: [
      "Name tunnels by feature, not port, so URLs stay readable in logs.",
      "Use one long-lived token per machine and rotate on offboarding.",
      "Pair binboi http with a local HTTPS proxy to match production TLS exactly.",
    ],
    searchBody:
      "Tips for using Binboi tunnels efficiently: stable naming, token management, TLS matching, reconnect behaviour, webhook replay, and local development workflow improvements.",
  },
  {
    slug: "self-hosting-binboi-on-a-vps",
    title: "Self-hosting Binboi on a €5/month VPS",
    category: "Guide",
    publishedAt: "April 3, 2026",
    readTime: "9 min read",
    excerpt:
      "A step-by-step walkthrough for deploying the full Binboi stack — Go relay, Next.js control plane, Caddy, and Postgres — on any cheap Linux box with a domain you control.",
    highlights: [
      "docker compose up gets the whole stack running in under five minutes.",
      "Caddy handles wildcard TLS automatically via DNS-01 challenge.",
      "A single JWT secret and a Postgres database are the only real configuration requirements.",
    ],
    searchBody:
      "How to self-host Binboi: VPS setup, docker-compose, Caddy wildcard TLS, DNS configuration, Postgres database, JWT secret, environment variables, and production checklist.",
  },
  {
    slug: "debugging-webhooks-stripe-clerk-supabase",
    title: "Debugging webhooks from Stripe, Clerk, and Supabase",
    category: "Debugging",
    publishedAt: "March 27, 2026",
    readTime: "8 min read",
    excerpt:
      "Each provider fails differently. Here is how to use Binboi request inspection to diagnose signature errors, payload mismatches, and silent delivery failures before they reach production.",
    highlights: [
      "Stripe signature failures are almost always a raw-body vs parsed-body mismatch.",
      "Clerk's svix-id header doubles as an idempotency key — useful for replaying events.",
      "Supabase realtime webhooks time out at 5 s — keep handler latency low.",
    ],
    searchBody:
      "Debugging webhooks with Binboi: Stripe signature verification, Clerk svix headers, Supabase timeout behaviour, payload inspection, request replay, and common failure patterns.",
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
          "Standardized the SQLite-backed local control plane.",
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
      "Keep a stable public URL for local payment webhooks and diagnose signature failures before shipping a remote test build.",
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
