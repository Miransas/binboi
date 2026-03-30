import type { AssistantContext } from "@/lib/assistant-types";

type RouteAssistantContext = {
  label: string;
  context: AssistantContext;
};

const routeContextCatalog: Record<string, RouteAssistantContext> = {
  "/": {
    label: "Home",
    context: {
      currentPage: {
        path: "/",
        title: "Binboi home",
        area: "site",
        summary: "Landing page for tunnels, request inspection, webhook debugging, and CLI onboarding.",
      },
    },
  },
  "/pricing": {
    label: "Pricing",
    context: {
      currentPage: {
        path: "/pricing",
        title: "Pricing",
        area: "site",
        summary: "Free, Pro, and Scale plans with AI, history, and tunnel-limit packaging.",
      },
    },
  },
  "/blog": {
    label: "Blog",
    context: {
      currentPage: {
        path: "/blog",
        title: "Blog",
        area: "site",
        summary: "Product notes about webhook debugging, tokens, and developer-product design.",
      },
    },
  },
  "/changelog": {
    label: "Changelog",
    context: {
      currentPage: {
        path: "/changelog",
        title: "Changelog",
        area: "site",
        summary: "Release notes for assistant, auth, relay, docs, and dashboard updates.",
      },
    },
  },
  "/privacy": {
    label: "Privacy",
    context: {
      currentPage: {
        path: "/privacy",
        title: "Privacy",
        area: "site",
        summary: "Privacy policy covering account data, token metadata, and tunnel usage signals.",
      },
    },
  },
  "/terms": {
    label: "Terms",
    context: {
      currentPage: {
        path: "/terms",
        title: "Terms",
        area: "site",
        summary: "Terms of service for an early-stage tunnel and webhook inspection product.",
      },
    },
  },
  "/typography": {
    label: "Typography",
    context: {
      currentPage: {
        path: "/typography",
        title: "Typography",
        area: "site",
        summary: "Design system guidance for headings, operational copy, and code presentation.",
      },
    },
  },
  "/private": {
    label: "Private access",
    context: {
      currentPage: {
        path: "/private",
        title: "Private networking",
        area: "site",
        summary: "Notes on future private networking and current public HTTP tunnel boundaries.",
      },
    },
  },
  "/docs": {
    label: "Docs",
    context: {
      currentPage: {
        path: "/docs",
        title: "Documentation",
        area: "docs",
        summary: "Overview of Binboi product concepts, workflow, and self-hosted tunnel operations.",
      },
      docsContext: {
        section: "Introduction",
        summary: "Product overview and why Binboi exists.",
        topics: ["tunnels", "webhooks", "requests", "auth", "logs"],
      },
    },
  },
  "/docs/quick-start": {
    label: "Quick Start",
    context: {
      currentPage: {
        path: "/docs/quick-start",
        title: "Quick Start",
        area: "docs",
        summary: "Install the CLI, log in, and open the first tunnel.",
      },
      docsContext: {
        section: "Quick Start",
        summary: "First-use path from install to the first successful request.",
        topics: ["install", "login", "binboi start", "first tunnel", "whoami"],
      },
    },
  },
  "/docs/installation": {
    label: "Installation",
    context: {
      currentPage: {
        path: "/docs/installation",
        title: "Installation",
        area: "docs",
        summary: "Install with Homebrew, direct binaries, npm direction, or local dev setup.",
      },
      docsContext: {
        section: "Installation",
        summary: "CLI installation and contributor setup.",
        topics: ["brew", "binary", "npm", "local development"],
      },
    },
  },
  "/docs/authentication": {
    label: "Authentication",
    context: {
      currentPage: {
        path: "/docs/authentication",
        title: "Authentication",
        area: "docs",
        summary: "Access token creation, CLI login, and security notes.",
      },
      docsContext: {
        section: "Authentication",
        summary: "Account-backed access tokens and CLI auth.",
        topics: ["tokens", "login", "whoami", "hash storage", "security"],
      },
    },
  },
  "/docs/cli": {
    label: "CLI",
    context: {
      currentPage: {
        path: "/docs/cli",
        title: "CLI usage",
        area: "docs",
        summary: "Command reference for login, whoami, start, and planned commands.",
      },
      docsContext: {
        section: "CLI",
        summary: "Binboi CLI behavior and command shapes.",
        topics: ["binboi login", "binboi whoami", "binboi start", "binboi version"],
      },
    },
  },
  "/docs/http-tunnels": {
    label: "HTTP Tunnels",
    context: {
      currentPage: {
        path: "/docs/http-tunnels",
        title: "HTTP Tunnels",
        area: "docs",
        summary: "Host-based HTTP tunnel routing and forwarding behavior.",
      },
      docsContext: {
        section: "HTTP Tunnels",
        summary: "Public URL mapping, forwarding flow, and HTTP limitations.",
        topics: ["host routing", "public url", "forwarding", "localhost", "http"],
      },
    },
  },
  "/docs/webhooks": {
    label: "Webhooks",
    context: {
      currentPage: {
        path: "/docs/webhooks",
        title: "Webhook Debugging",
        area: "docs",
        summary: "Provider debugging patterns for Stripe, Clerk, Supabase, GitHub, Neon, and Linear.",
      },
      docsContext: {
        section: "Webhooks",
        summary: "Debugging webhook delivery and signature failures.",
        topics: ["stripe", "clerk", "supabase", "github", "neon", "linear", "signature"],
      },
    },
  },
  "/docs/requests": {
    label: "Requests",
    context: {
      currentPage: {
        path: "/docs/requests",
        title: "Request Inspection",
        area: "docs",
        summary: "Headers, payload previews, response previews, statuses, and error types.",
      },
      docsContext: {
        section: "Requests",
        summary: "How to interpret request inspection data.",
        topics: ["headers", "payload", "status", "duration", "error type"],
      },
    },
  },
  "/docs/api-keys": {
    label: "API Keys",
    context: {
      currentPage: {
        path: "/docs/api-keys",
        title: "API Keys",
        area: "docs",
        summary: "Create, view, revoke, and secure dashboard-issued access tokens.",
      },
      docsContext: {
        section: "API Keys",
        summary: "Token lifecycle and safety guidance.",
        topics: ["access tokens", "dashboard", "revoke", "copy once", "last used"],
      },
    },
  },
  "/docs/logs": {
    label: "Logs",
    context: {
      currentPage: {
        path: "/docs/logs",
        title: "Logs and Events",
        area: "docs",
        summary: "Raw relay logs, activity events, and request-level views.",
      },
      docsContext: {
        section: "Logs",
        summary: "How to use logs to explain transport and lifecycle behavior.",
        topics: ["relay logs", "events", "activity", "transport", "debugging"],
      },
    },
  },
  "/docs/regions": {
    label: "Regions",
    context: {
      currentPage: {
        path: "/docs/regions",
        title: "Regions and Nodes",
        area: "docs",
        summary: "Latency, region selection, and node placement guidance.",
      },
      docsContext: {
        section: "Regions",
        summary: "How regions affect latency and webhook timeouts.",
        topics: ["regions", "nodes", "latency", "timeouts", "location"],
      },
    },
  },
  "/docs/troubleshooting": {
    label: "Troubleshooting",
    context: {
      currentPage: {
        path: "/docs/troubleshooting",
        title: "Troubleshooting",
        area: "docs",
        summary: "Invalid token, tunnel offline, forwarding failures, and webhook confusion.",
      },
      docsContext: {
        section: "Troubleshooting",
        summary: "Practical debugging guide for common Binboi failures.",
        topics: ["invalid token", "offline", "404", "500", "signature", "connectivity"],
      },
    },
  },
  "/dashboard": {
    label: "Overview",
    context: {
      currentPage: {
        path: "/dashboard",
        title: "Dashboard overview",
        area: "dashboard",
        summary: "Control-plane overview with active tunnels, throughput, and relay event stream.",
      },
    },
  },
  "/dashboard/setup": {
    label: "Setup",
    context: {
      currentPage: {
        path: "/dashboard/setup",
        title: "Setup",
        area: "dashboard",
        summary: "Instance information, installation guidance, and first-time setup steps.",
      },
    },
  },
  "/dashboard/access-tokens": {
    label: "Access Tokens",
    context: {
      currentPage: {
        path: "/dashboard/access-tokens",
        title: "Access Tokens",
        area: "dashboard",
        summary: "Manage dashboard-issued access tokens for CLI machines.",
      },
    },
  },
  "/dashboard/billing": {
    label: "Billing",
    context: {
      currentPage: {
        path: "/dashboard/billing",
        title: "Billing",
        area: "dashboard",
        summary: "Current plan, Paddle subscription status, upgrade paths, and cancellation controls.",
      },
    },
  },
  "/dashboard/tunnel": {
    label: "Tunnels",
    context: {
      currentPage: {
        path: "/dashboard/tunnel",
        title: "Tunnels",
        area: "dashboard",
        summary: "Reserve, connect, and inspect tunnel lifecycle state.",
      },
    },
  },
  "/dashboard/requests": {
    label: "Requests",
    context: {
      currentPage: {
        path: "/dashboard/requests",
        title: "Requests",
        area: "dashboard",
        summary:
          "Request inspection surface with method, path, status, duration, previews, and AI-powered failure explanation.",
      },
    },
  },
  "/dashboard/webhooks": {
    label: "Webhooks",
    context: {
      currentPage: {
        path: "/dashboard/webhooks",
        title: "Webhooks",
        area: "dashboard",
        summary:
          "Webhook delivery investigation surface with provider filtering, previews, retries, and AI-powered failure explanation.",
      },
    },
  },
  "/dashboard/endpoints": {
    label: "Webhook debugger",
    context: {
      currentPage: {
        path: "/dashboard/endpoints",
        title: "Webhook debugger",
        area: "dashboard",
        summary:
          "Webhook delivery investigation surface with provider filtering, previews, retries, and AI-powered failure explanation.",
      },
    },
  },
  "/dashboard/ai": {
    label: "AI Assistant",
    context: {
      currentPage: {
        path: "/dashboard/ai",
        title: "AI Assistant",
        area: "dashboard",
        summary: "Search docs, runtime context, and troubleshooting guidance from one panel.",
      },
    },
  },
};

function deriveFallbackContext(pathname: string): RouteAssistantContext {
  if (pathname.startsWith("/docs")) {
    return {
      label: "Docs",
      context: {
        currentPage: {
          path: pathname,
          title: "Documentation",
          area: "docs",
          summary: "Binboi docs page.",
        },
      },
    };
  }

  if (pathname.startsWith("/dashboard")) {
    return {
      label: "Dashboard",
      context: {
        currentPage: {
          path: pathname,
          title: "Dashboard",
          area: "dashboard",
          summary: "Binboi dashboard surface.",
        },
      },
    };
  }

  return {
    label: "Binboi",
    context: {
      currentPage: {
        path: pathname,
        title: "Binboi",
        area: "site",
        summary: "Binboi site page.",
      },
    },
  };
}

export function getRouteAssistantContext(pathname: string): RouteAssistantContext {
  return routeContextCatalog[pathname] ?? deriveFallbackContext(pathname);
}
