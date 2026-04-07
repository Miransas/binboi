export type DocsNavItem = {
  title: string;
  href: string;
  description: string;
};

export type DocsNavGroup = {
  title: string;
  items: DocsNavItem[];
};

export const docsNavGroups: DocsNavGroup[] = [
  {
    title: "Foundation",
    items: [
      {
        title: "Introduction",
        href: "/docs",
        description: "What Binboi is, why teams use it, and how the platform fits together.",
      },
      {
        title: "Quick Start",
        href: "/docs/quick-start",
        description: "Install, log in, and ship your first public URL in a few steps.",
      },
      {
        title: "Authentication",
        href: "/docs/authentication",
        description: "Access tokens, dashboard token creation, login, and security notes.",
      },
    ],
  },
  {
    title: "Installation",
    items: [
      {
        title: "Install Overview",
        href: "/docs/installation",
        description: "Supported install paths, platform guidance, and how to choose the right channel.",
      },
      {
        title: "macOS",
        href: "/docs/installation/macos",
        description: "Homebrew, install script, direct binary, and post-install verification on macOS.",
      },
      {
        title: "Linux",
        href: "/docs/installation/linux",
        description: "Install script, direct binary, source build, and PATH notes for Linux hosts.",
      },
      {
        title: "Windows",
        href: "/docs/installation/windows",
        description: "Direct binary setup, PATH guidance, and the safest current Windows workflow.",
      },
      {
        title: "Package Managers",
        href: "/docs/installation/package-managers",
        description: "Which package channels are supported now and which ones are still roadmap only.",
      },
    ],
  },
  {
    title: "Deployment",
    items: [
      {
        title: "Environments",
        href: "/docs/environments",
        description: "Local preview, full-stack, staging, and production-like environment models for Binboi.",
      },
      {
        title: "Deploy Readiness",
        href: "/docs/deploy-readiness",
        description: "The final operator checklist before a serious staging push or public rollout.",
      },
      {
        title: "Staging Runbook",
        href: "/docs/staging-runbook",
        description: "Shortest serious bring-up path for staging with real auth, tokens, tunnels, and public forwarding.",
      },
      {
        title: "Smoke Testing",
        href: "/docs/smoke-testing",
        description: "The fastest operator checklist for validating tunnels, metrics, requests, and forwarding before release.",
      },
    ],
  },
  {
    title: "Core Workflows",
    items: [
      {
        title: "CLI",
        href: "/docs/cli",
        description: "Commands, examples, and what is implemented versus planned.",
      },
      {
        title: "HTTP Tunnels",
        href: "/docs/http-tunnels",
        description: "How Binboi forwards HTTP traffic and common local development patterns.",
      },
      {
        title: "Requests",
        href: "/docs/requests",
        description: "Request inspection, metadata, response previews, and error classifications.",
      },
      {
        title: "Webhooks",
        href: "/docs/webhooks",
        description: "Clerk, Neon, Supabase, Stripe, GitHub, and Linear debugging workflows.",
      },
      {
        title: "API Gateway",
        href: "/docs/api-gateway",
        description: "Current HTTP gateway contract, routing model, and how public traffic reaches your app.",
      },
    ],
  },
  {
    title: "Diagnostics & Ops",
    items: [
      {
        title: "Readiness",
        href: "/docs/readiness",
        description: "How to read health versus ready, degraded workers, and the checks behind deployment gates.",
      },
      {
        title: "Quotas & Limits",
        href: "/docs/limits",
        description: "Plan quotas, response headers, retention windows, and the runtime limits Binboi enforces.",
      },
      {
        title: "Metrics",
        href: "/docs/metrics",
        description: "JSON metrics, Prometheus export, request IDs, and the counters that matter during rollout.",
      },
      {
        title: "Audit Export",
        href: "/docs/audit-export",
        description: "Export audit trails, slice incidents by time and resource, and hand off smaller summaries cleanly.",
      },
      {
        title: "Operator Snapshot",
        href: "/docs/operator-snapshot",
        description: "One endpoint for health, readiness, limits, metrics, recent failures, and tunnel state.",
      },
      {
        title: "API Keys",
        href: "/docs/api-keys",
        description: "Create, review, revoke, and safely operate CLI credentials.",
      },
      {
        title: "Logs",
        href: "/docs/logs",
        description: "Raw relay logs, activity events, and tunnel lifecycle visibility.",
      },
      {
        title: "Request Replay",
        href: "/docs/request-replay",
        description: "Archive, export, replay, replay policy, and how to operate redelivery safely.",
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        title: "Domains & TLS",
        href: "/docs/domains-and-tls",
        description: "Custom domain verification, ACME readiness, TLS mode selection, and rollout checks.",
      },
      {
        title: "Production Domains",
        href: "/docs/production-domains",
        description: "Per-domain rollout sheet for DNS, TXT verification, TLS readiness, and HTTPS validation.",
      },
      {
        title: "Regions",
        href: "/docs/regions",
        description: "Regions, nodes, latency, and selection guidance for self-hosted teams.",
      },
      {
        title: "Troubleshooting",
        href: "/docs/troubleshooting",
        description: "Invalid token, tunnel offline, forwarding failures, and webhook confusion.",
      },
    ],
  },
];

export const docsNavItems = docsNavGroups.flatMap((group) => group.items);

export function getDocsNavContext(pathname: string) {
  const matchedIndex = docsNavItems.findIndex((item) => item.href === pathname);
  const currentIndex = matchedIndex >= 0 ? matchedIndex : 0;
  const currentItem = docsNavItems[currentIndex] ?? null;
  const currentGroup =
    docsNavGroups.find((group) =>
      group.items.some((item) => item.href === currentItem?.href),
    ) ?? null;

  return {
    currentGroup,
    currentItem,
    currentIndex,
    previousItem: currentIndex > 0 ? docsNavItems[currentIndex - 1] : null,
    nextItem:
      currentIndex >= 0 && currentIndex < docsNavItems.length - 1
        ? docsNavItems[currentIndex + 1]
        : null,
  };
}
