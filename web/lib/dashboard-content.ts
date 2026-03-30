export const dashboardPageContent = {
  ai: {
    eyebrow: "Traffic intelligence",
    title: "AI inspection is not part of the MVP yet",
    description:
      "The current Binboi MVP focuses on reliable HTTP tunneling, instance tokens, and a stable control plane. AI traffic inspection should only ship after the relay lifecycle and audit trail are complete.",
    highlights: [
      { label: "Status", value: "Planned", note: "No inline request mutation or model routing is running in production code." },
      { label: "Safe fallback", value: "Logs only", note: "Use the request log stream and event feed to inspect tunnel behavior today." },
      { label: "Next step", value: "Read-only analysis", note: "Start with header and status-code inspection before any blocking or rewriting." },
    ],
    panels: [
      {
        title: "What works today",
        description: "The control plane can already show tunnel activity, request events, token usage, and relay connectivity.",
        bullets: [
          "Live WebSocket logs from the relay.",
          "Persistent tunnel records stored by the backend.",
          "Instance-level audit events for connect, disconnect, and token actions.",
        ],
      },
      {
        title: "What should happen before AI features",
        description: "Ship reliable observability and policy hooks before attaching any AI layer to customer traffic.",
        bullets: [
          "Store request metadata in a structured event stream.",
          "Add explicit opt-in policies per tunnel.",
          "Define cost and privacy boundaries for body inspection.",
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
          "The agent authenticates with a single instance token.",
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
    title: "Instance token and agent identity",
    description:
      "The MVP uses one instance token for the whole control plane. That keeps the first self-hosted flow simple: reserve a tunnel, copy the token, and connect the CLI agent.",
    highlights: [
      { label: "Auth mode", value: "Instance token", note: "There is one active token used by all CLI agents that connect to this relay." },
      { label: "Rotation", value: "Manual", note: "Generate a new token from the dashboard when you need to rotate access." },
      { label: "Revocation", value: "Immediate", note: "The revoke action closes all active tunnel sessions." },
    ],
    panels: [
      {
        title: "Why this is acceptable for the MVP",
        description: "A single-instance token fits self-hosted teams and avoids building a half-finished user and machine identity model.",
      },
      {
        title: "What should come next",
        description: "If Binboi grows into a multi-user SaaS, the next layer should separate operator accounts from machine credentials.",
        bullets: [
          "Per-user API tokens.",
          "Scoped machine identities per agent.",
          "Audit trails for token creation and rotation.",
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
      "Binboi stores one instance token and control-plane state in the backend database. It does not yet manage application secrets, environment sync, or secret delivery to agents.",
    highlights: [
      { label: "Stored today", value: "Instance token", note: "The relay persists the active token and tunnel records in SQLite." },
      { label: "Not stored", value: "App secrets", note: "Your local service secrets stay wherever your app already keeps them." },
      { label: "Guidance", value: "External vault", note: "Use your existing secret manager for anything beyond the relay token." },
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
