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
        title: "API Keys",
        href: "/docs/api-keys",
        description: "Create, review, revoke, and safely operate CLI credentials.",
      },
      {
        title: "Logs",
        href: "/docs/logs",
        description: "Raw relay logs, activity events, and tunnel lifecycle visibility.",
      },
    ],
  },
  {
    title: "Operations",
    items: [
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
