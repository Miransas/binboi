export const dashboardPageContent = {
  ai: {
    eyebrow: "Developer assistant",
    title: "Search docs, logs, and tunnel context with a safe assistant",
    description:
      "The first Binboi AI surface is intentionally read-only. It searches product docs, static guides, and live control-plane data when available, then adds optional server-side summaries without exposing credentials to the browser.",
    highlights: [
      { label: "Status", value: "Read only", note: "The assistant answers questions and searches context. It does not mutate traffic." },
      { label: "Fallback", value: "Docs first", note: "Without AI credentials, Binboi still returns product-search results and troubleshooting guidance." },
      { label: "Security", value: "Server-side", note: "Environment variables stay on the server. No OpenAI key is exposed to the client." },
    ],
    panels: [
      {
        title: "What works today",
        description: "The assistant can search product docs, marketing pages, runtime tunnels, and recent events where the control plane exposes them.",
        bullets: [
          "Live control-plane instance, tunnel, and event context when reachable.",
          "Docs and troubleshooting search across installation, auth, requests, webhooks, and logs.",
          "Optional server-side summaries for faster operator answers.",
        ],
      },
      {
        title: "What remains out of scope",
        description: "Binboi still avoids risky autonomous behavior. This feature is for search, explanation, and troubleshooting only.",
        bullets: [
          "No traffic rewriting, blocking, or mutation.",
          "No secret handling in the client.",
          "No autonomous remediation or tunnel management actions.",
        ],
      },
    ],
  },
  ca: {
    eyebrow: "Certificates",
    title: "Private certificate authority",
    description:
      "The MVP relies on a managed base domain plus any reverse proxy or ingress that you already operate. Binboi does not issue a private CA or device certificates yet.",
    highlights: [
      { label: "Managed today", value: "Edge TLS", note: "Terminate TLS in Caddy, Nginx, Traefik, or another edge proxy that fronts Binboi." },
      { label: "Stored in core", value: "None", note: "The control plane does not persist certificates or private keys." },
      { label: "Future scope", value: "Enterprise", note: "Private CA support belongs in a later, policy-heavy release." },
    ],
    panels: [
      {
        title: "Current recommendation",
        description: "Keep certificate management outside the tunnel relay for now.",
        bullets: [
          "Use the managed wildcard domain for local and staging access.",
          "Verify custom domains with DNS before adding TLS at the edge.",
          "Avoid storing long-lived private keys in the Binboi SQLite database.",
        ],
      },
      {
        title: "Why it is not in the MVP",
        description: "Certificate authority features add lifecycle, rotation, audit, and compromise handling that are out of scope for the first self-hosted release.",
      },
    ],
  },
  endpoints: {
    eyebrow: "HTTP routing",
    title: "Endpoint behavior",
    description:
      "Binboi currently exposes HTTP endpoints by matching the request host to a reserved subdomain and proxying the request over the active yamux session.",
    highlights: [
      { label: "Routing", value: "Host based", note: "Requests are matched by subdomain on the managed base domain." },
      { label: "Tunnel type", value: "HTTP", note: "The public proxy understands HTTP traffic and forwards it to your local port." },
      { label: "Headers", value: "Forwarded", note: "The relay adds forwarded headers and keeps the original host visible to the app." },
    ],
    panels: [
      {
        title: "MVP endpoint contract",
        description: "These are the assumptions the CLI, proxy, and dashboard now share.",
        bullets: [
          "A tunnel subdomain can be reserved in the dashboard before the agent connects.",
          "The agent authenticates with a dashboard-issued access token.",
          "The relay marks a tunnel ACTIVE only when a live session is attached.",
        ],
      },
      {
        title: "Known limits",
        description: "The first release is intentionally narrow to keep the data story clean.",
        bullets: [
          "One primary HTTP relay node.",
          "No per-route policy engine inside the core yet.",
          "No path-based tunnel mapping across multiple local targets.",
        ],
      },
    ],
  },
  identities: {
    eyebrow: "Agent identity",
    title: "Account tokens and agent identity",
    description:
      "The MVP now separates dashboard users from CLI credentials. Create an account, mint a personal access token, and use that token with `binboi login` on each machine that should open tunnels.",
    highlights: [
      { label: "Auth mode", value: "Access tokens", note: "Each CLI machine can use its own revocable credential instead of a shared relay secret." },
      { label: "Storage", value: "Prefix + hash", note: "The dashboard stores only token prefixes, hashes, and usage timestamps." },
      { label: "Revocation", value: "Immediate", note: "A revoked token can no longer authenticate new CLI sessions." },
    ],
    panels: [
      {
        title: "Why this is acceptable for the MVP",
        description: "The first release now has the right product shape: people sign in to the dashboard, machines use access tokens, and the relay validates those tokens without storing raw secrets.",
      },
      {
        title: "What should come next",
        description: "If Binboi grows into a multi-user SaaS, the next layer should separate operator accounts from machine credentials.",
        bullets: [
          "Scoped machine identities per agent.",
          "Audit trails for token creation and rotation.",
          "Role-based permissions for team workspaces.",
        ],
      },
    ],
  },
  ip: {
    eyebrow: "Network policy",
    title: "IP allowlists and deny rules",
    description:
      "The self-hosted MVP does not enforce IP policy inside the relay yet. Treat the current release as an exposure tool and use your upstream edge or firewall for network restrictions.",
    highlights: [
      { label: "Enforcement", value: "External", note: "Use Caddy, Nginx, cloud firewalls, or security groups to control source IPs." },
      { label: "Relay state", value: "Documented", note: "This page exists to make the lack of inline IP policy explicit." },
      { label: "Next step", value: "Per tunnel", note: "Any future allowlist should be attached to a tunnel record, not a global toggle." },
    ],
    panels: [
      {
        title: "Recommended MVP pattern",
        description: "Put coarse network restrictions in front of Binboi and keep the relay focused on transport and control-plane state.",
      },
      {
        title: "Before building in-core policy",
        description: "Binboi should first capture the client IP and request metadata reliably in the event stream.",
      },
    ],
  },
  k8s: {
    eyebrow: "Operations",
    title: "Kubernetes deployment",
    description:
      "Binboi is ready to run as a containerized control plane, but it does not yet ship first-party Helm charts or operators. The current recommendation is a small deployment plus external ingress.",
    highlights: [
      { label: "Packaging", value: "Manual", note: "Use the Docker image and inject the relay environment variables explicitly." },
      { label: "State", value: "SQLite by default", note: "Mount persistent storage if you keep the default SQLite-backed control plane." },
      { label: "Ingress", value: "Required", note: "Expose the API, tunnel listener, and proxy with the ingress pattern you already trust." },
    ],
    panels: [
      {
        title: "Suggested first deployment",
        description: "Run one relay pod, mount a persistent volume, and put an ingress or load balancer in front of the HTTP proxy.",
      },
      {
        title: "What is still missing",
        description: "An operator should only arrive after the single-node lifecycle is well tested.",
        bullets: [
          "Chart values for managed domain configuration.",
          "Persistent storage defaults.",
          "Pod disruption and upgrade guidance.",
        ],
      },
    ],
  },
  secrets: {
    eyebrow: "Secrets",
    title: "Secret handling in the MVP",
    description:
      "Binboi stores hashed access tokens plus control-plane state. It does not yet manage application secrets, environment sync, or secret delivery to agents.",
    highlights: [
      { label: "Stored today", value: "Token hashes", note: "The dashboard persists access token prefixes, hashes, and usage timestamps." },
      { label: "Not stored", value: "App secrets", note: "Your local service secrets stay wherever your app already keeps them." },
      { label: "Guidance", value: "External vault", note: "Use your existing secret manager for anything beyond Binboi access tokens." },
    ],
    panels: [
      {
        title: "MVP boundary",
        description: "Binboi authenticates agents. It does not become the source of truth for application credentials.",
      },
      {
        title: "Future direction",
        description: "Secret references could become useful later, but only after audit logging and per-agent identities exist.",
      },
    ],
  },
  tcp: {
    eyebrow: "Transport",
    title: "TCP addresses",
    description:
      "The first Binboi MVP is an HTTP tunnel product. Raw TCP exposure is not wired into the public proxy yet, and the dashboard now says that clearly instead of pretending otherwise.",
    highlights: [
      { label: "Current support", value: "HTTP only", note: "The public proxy accepts HTTP traffic and routes it by host." },
      { label: "Agent transport", value: "yamux", note: "The CLI still uses one multiplexed TCP connection to the relay." },
      { label: "Future scope", value: "Optional", note: "Raw TCP should ship only when connection lifecycle and access policy are ready." },
    ],
    panels: [
      {
        title: "Why HTTP comes first",
        description: "HTTP tunneling covers the main local development use case while keeping the proxy and dashboard easy to reason about.",
      },
      {
        title: "What a TCP release needs",
        description: "A true TCP product would need reserved addresses, connection quotas, clearer security defaults, and better observability than the MVP has today.",
      },
    ],
  },
  tls: {
    eyebrow: "TLS",
    title: "TLS termination and custom domains",
    description:
      "Binboi can track managed and custom domains in the control plane, but TLS termination should still live at the edge proxy that fronts your relay.",
    highlights: [
      { label: "Base domain", value: "Managed", note: "The backend keeps a verified base domain record for the instance." },
      { label: "Custom domains", value: "DNS verify", note: "You can register a domain and verify ownership by TXT record." },
      { label: "TLS source", value: "External edge", note: "Terminate certificates in Caddy, Nginx, Traefik, or your cloud ingress." },
    ],
    panels: [
      {
        title: "Current control-plane role",
        description: "The relay stores domain metadata and verification state so the dashboard can explain what is ready and what still needs DNS work.",
      },
      {
        title: "Recommended setup",
        description: "Keep certificate automation outside the core until Binboi has a stronger ownership and audit model.",
      },
    ],
  },
} as const;
