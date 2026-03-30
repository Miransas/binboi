export type BillingPlan = "FREE" | "PRO" | "SCALE";

export type PricingPlan = {
  id: BillingPlan;
  name: string;
  price: string;
  cadence: string;
  description: string;
  tagline: string;
  accent: "neutral" | "cyan" | "violet";
  featured?: boolean;
  ctaLabel: string;
  limits: {
    activeTunnels: number | null;
    randomPublicUrlsOnly: boolean;
    requestsPerDay: number | null;
    requestHistory: number | null;
    aiExplainsPerDay: number | null;
    logsRetention: string;
    customDomains: boolean;
    fullWebhookDebugging: boolean;
    advancedLogs: boolean;
    priorityRouting: string;
    apiAccess: string;
    teamSupport: string;
  };
  cardFeatures: string[];
};

export type PricingComparisonRow = {
  label: string;
  values: Record<BillingPlan, string>;
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "FREE",
    name: "Free",
    price: "$0",
    cadence: "/month",
    description: "For solo development, quick demos, and validating the tunnel flow before you commit.",
    tagline: "Debug faster, not harder.",
    accent: "neutral",
    ctaLabel: "Start Free",
    limits: {
      activeTunnels: 1,
      randomPublicUrlsOnly: true,
      requestsPerDay: 100,
      requestHistory: 50,
      aiExplainsPerDay: 5,
      logsRetention: "~1 hour",
      customDomains: false,
      fullWebhookDebugging: false,
      advancedLogs: false,
      priorityRouting: "Rate limited",
      apiAccess: "Not included",
      teamSupport: "Community help",
    },
    cardFeatures: [
      "1 active tunnel",
      "Random public URL only",
      "100 requests per day",
      "Last 50 requests history",
      "Basic webhook debugging",
      "AI explain limited to 5 per day",
      "Logs retained for about 1 hour",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: "$9",
    cadence: "/month",
    description: "For developers who live in tunnels every day and want real debugging depth without friction.",
    tagline: "See every request, understand every failure.",
    accent: "cyan",
    featured: true,
    ctaLabel: "Upgrade to Pro",
    limits: {
      activeTunnels: null,
      randomPublicUrlsOnly: false,
      requestsPerDay: 10000,
      requestHistory: null,
      aiExplainsPerDay: null,
      logsRetention: "7-30 days",
      customDomains: true,
      fullWebhookDebugging: true,
      advancedLogs: false,
      priorityRouting: "Priority routing",
      apiAccess: "Planned",
      teamSupport: "Fast support",
    },
    cardFeatures: [
      "Unlimited tunnels",
      "Custom domains and custom subdomains",
      "10k+ requests per day",
      "Full request history",
      "Full webhook debugging",
      "Unlimited AI explain",
      "7-30 days log retention",
      "Priority handling",
    ],
  },
  {
    id: "SCALE",
    name: "Scale",
    price: "$19",
    cadence: "/month",
    description: "For heavier teams that want more headroom, better operational tooling, and future-ready controls.",
    tagline: "Stop guessing webhook errors.",
    accent: "violet",
    ctaLabel: "Go Scale",
    limits: {
      activeTunnels: null,
      randomPublicUrlsOnly: false,
      requestsPerDay: null,
      requestHistory: null,
      aiExplainsPerDay: null,
      logsRetention: "30 days+",
      customDomains: true,
      fullWebhookDebugging: true,
      advancedLogs: true,
      priorityRouting: "Priority infrastructure",
      apiAccess: "Future API access",
      teamSupport: "Team support",
    },
    cardFeatures: [
      "Everything in Pro",
      "Unlimited usage",
      "Advanced logs",
      "Team support ready",
      "Priority infrastructure",
      "Future multi-region controls",
      "Future API access",
    ],
  },
];

export const pricingComparisonRows: PricingComparisonRow[] = [
  {
    label: "Active tunnels",
    values: {
      FREE: "1 active tunnel",
      PRO: "Unlimited",
      SCALE: "Unlimited",
    },
  },
  {
    label: "Public URLs",
    values: {
      FREE: "Random URL only",
      PRO: "Custom subdomains + custom domains",
      SCALE: "Everything in Pro",
    },
  },
  {
    label: "Requests per day",
    values: {
      FREE: "100/day",
      PRO: "10k+/day",
      SCALE: "Unlimited",
    },
  },
  {
    label: "Request history",
    values: {
      FREE: "Last 50 requests",
      PRO: "Full history",
      SCALE: "Full history",
    },
  },
  {
    label: "Webhook debugging",
    values: {
      FREE: "Basic",
      PRO: "Full debugger",
      SCALE: "Full + advanced logs",
    },
  },
  {
    label: "AI explain",
    values: {
      FREE: "5/day",
      PRO: "Unlimited",
      SCALE: "Unlimited",
    },
  },
  {
    label: "Logs retention",
    values: {
      FREE: "~1 hour",
      PRO: "7-30 days",
      SCALE: "30 days+",
    },
  },
  {
    label: "Routing priority",
    values: {
      FREE: "Rate limited",
      PRO: "Priority",
      SCALE: "Priority infrastructure",
    },
  },
  {
    label: "Team support",
    values: {
      FREE: "Not included",
      PRO: "Fast support",
      SCALE: "Team-ready",
    },
  },
  {
    label: "API access and multi-region",
    values: {
      FREE: "Not included",
      PRO: "Planned",
      SCALE: "Future-ready placeholders",
    },
  },
];

export function normalizeBillingPlan(input?: string | null): BillingPlan {
  const value = String(input || "").toUpperCase();
  if (value === "PRO" || value === "SCALE") {
    return value;
  }
  return "FREE";
}

export function getPricingPlan(plan: BillingPlan): PricingPlan {
  return pricingPlans.find((item) => item.id === plan) ?? pricingPlans[0];
}

export function getNextPlan(plan: BillingPlan): BillingPlan | null {
  if (plan === "FREE") {
    return "PRO";
  }
  if (plan === "PRO") {
    return "SCALE";
  }
  return null;
}

export function planRank(plan: BillingPlan) {
  switch (plan) {
    case "SCALE":
      return 3;
    case "PRO":
      return 2;
    default:
      return 1;
  }
}

export function pickHigherPlan(base: BillingPlan, candidate: BillingPlan) {
  return planRank(candidate) > planRank(base) ? candidate : base;
}

export function formatPlanLimit(value: number | null, unit: string) {
  if (value === null) {
    return `Unlimited ${unit}`;
  }
  return `${value} ${unit}`;
}
