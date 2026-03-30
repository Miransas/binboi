"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Globe,
  KeyRound,
  Network,
  Server,
  Shield,
  TerminalSquare,
  Waypoints,
  Webhook,
  Wrench,
} from "lucide-react";

type CardTone = "cyan" | "emerald" | "amber" | "zinc";
type CalloutTone = "info" | "success" | "warning";

type DocsCardItem = {
  title: string;
  description: string;
  eyebrow?: string;
  badge?: string;
  tone?: CardTone;
  code?: string;
};

type DocsBlock =
  | { type: "paragraph"; body: string }
  | { type: "cards"; title?: string; columns?: 2 | 3; items: DocsCardItem[] }
  | { type: "list"; title?: string; ordered?: boolean; items: string[] }
  | {
      type: "steps";
      title?: string;
      items: { title: string; description: string }[];
    }
  | {
      type: "code";
      title: string;
      language: string;
      code: string;
      note?: string;
    }
  | { type: "callout"; tone: CalloutTone; title: string; body: string }
  | {
      type: "table";
      title: string;
      columns: string[];
      rows: string[][];
    };

type DocsSection = {
  id: string;
  group: string;
  kicker: string;
  title: string;
  summary: string;
  blocks: DocsBlock[];
};

const docsSections: DocsSection[] = [
  {
    id: "introduction",
    group: "Getting Started",
    kicker: "Introduction",
    title: "What Binboi is and why teams adopt it",
    summary:
      "Binboi is a tunnel, webhook inspection, and local debugging platform built around three cooperating surfaces: a Go relay, a CLI agent, and a developer dashboard. Its purpose is simple: turn a service running on your machine into a safe public endpoint that you can inspect, share, test, and debug without turning your local setup into a mystery box.",
    blocks: [
      {
        type: "paragraph",
        body:
          "Teams reach for Binboi when local-only development starts fighting against real-world integrations. Webhook providers need a public URL. QA wants to hit a branch preview before deployment. Support engineers need to replay a failing request. Platform teams want a tunnel product they can self-host and still explain to other developers in one whiteboard session. Binboi exists for that gap between localhost convenience and production realism.",
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            eyebrow: "Primary job",
            title: "Expose local services",
            description:
              "Map a public URL to an HTTP service on your machine so collaborators, browsers, CI jobs, and webhook providers can reach it immediately.",
            tone: "cyan",
          },
          {
            eyebrow: "Secondary job",
            title: "Inspect real traffic",
            description:
              "Give developers a calmer way to understand what actually arrived, what target handled it, and where the request failed.",
            tone: "emerald",
          },
          {
            eyebrow: "Operating model",
            title: "Self-hosted friendly",
            description:
              "Run the relay yourself, keep the dashboard close to your team, and evolve from MVP tunnel workflows toward richer request debugging over time.",
            tone: "amber",
          },
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Product positioning",
        body:
          "Binboi sits in the same family of tools as ngrok, but the product direction leans harder into a developer dashboard, webhook visibility, and a control plane you can understand and self-host.",
      },
    ],
  },
  {
    id: "core-concepts",
    group: "Getting Started",
    kicker: "Core Concepts",
    title: "The vocabulary Binboi uses throughout the product",
    summary:
      "If you understand the terms on this page, the rest of the product becomes straightforward. Binboi keeps its model intentionally small so that tunnel behavior, dashboard state, and CLI output all describe the same thing.",
    blocks: [
      {
        type: "cards",
        columns: 3,
        items: [
          {
            title: "Tunnel",
            description:
              "A reserved route between a public address and a target service reachable through a connected Binboi agent.",
          },
          {
            title: "Agent",
            description:
              "The CLI process that authenticates to the relay, opens a persistent session, and forwards streams to your local port.",
          },
          {
            title: "Public URL",
            description:
              "The externally reachable address assigned by the relay, such as `https://shop-admin.binboi.link`.",
          },
          {
            title: "Target service",
            description:
              "The application you actually care about, usually `localhost:<port>` on your machine or inside a local container network.",
          },
          {
            title: "Requests",
            description:
              "Inbound HTTP traffic flowing through a tunnel, including method, path, headers, latency, status, and upstream outcome.",
          },
          {
            title: "Webhooks",
            description:
              "Provider-driven requests from systems like Clerk, Stripe, GitHub, and Supabase that need a public endpoint during local development.",
          },
          {
            title: "API tokens",
            description:
              "Personal access tokens generated in the dashboard and used by `binboi login` so the CLI can authenticate securely.",
          },
        ],
      },
      {
        type: "steps",
        title: "How the concepts connect",
        items: [
          {
            title: "Reserve or name a tunnel",
            description:
              "You decide which public subdomain or tunnel slot you want Binboi to use for a service.",
          },
          {
            title: "Authenticate an agent",
            description:
              "The CLI logs in with an access token and opens a relay session on behalf of your account.",
          },
          {
            title: "Attach a target service",
            description:
              "Incoming traffic is forwarded to your local service, and the dashboard can associate that flow with one tunnel identity.",
          },
        ],
      },
      {
        type: "callout",
        tone: "success",
        title: "Mental model to keep",
        body:
          "A tunnel is not your app. It is a route and a connection. The agent is not the public server. It is the bridge between the public server and your app.",
      },
    ],
  },
  {
    id: "quick-start",
    group: "Getting Started",
    kicker: "Quick Start",
    title: "From zero to a working public URL in a few commands",
    summary:
      "The fastest path is: install the CLI, create an access token in the dashboard, log the CLI in once, and start a tunnel for a local port. The example below assumes you already have a web service listening on port 3000.",
    blocks: [
      {
        type: "steps",
        title: "Fast path",
        items: [
          {
            title: "Install Binboi",
            description:
              "Use Homebrew, a release tarball, or a local contributor build depending on how you work.",
          },
          {
            title: "Create a dashboard token",
            description:
              "Open the Access Tokens page, create a token, and copy it immediately. The full value is only shown once.",
          },
          {
            title: "Log in once",
            description:
              "Run `binboi login --token <token>` to validate the token against the control plane and write it to `~/.binboi/config.json`.",
          },
          {
            title: "Start the tunnel",
            description:
              "Run `binboi start 3000 my-app` and use the returned public URL for a browser, webhook provider, or teammate.",
          },
        ],
      },
      {
        type: "code",
        title: "Happy path example",
        language: "bash",
        code: `brew install binboi/tap/binboi
binboi login --token binboi_pat_2e9c4d93_6a4de4f8f5b51f5bb4ef7a91a9d7c8f2d95d
binboi whoami
binboi start 3000 shop-admin
curl https://shop-admin.binboi.link/health`,
        note:
          "Today in this repository the working tunnel command is `binboi start`. The shorter `binboi http` form is documented below as the product direction and planned ergonomic alias.",
      },
      {
        type: "code",
        title: "What a first successful run should feel like",
        language: "text",
        code: `Authenticated as Jane Doe <jane@example.com>
Plan: FREE
Token: binboi_pat_2e9c4d93 (flag)
Saved to ~/.binboi/config.json

BINBOI AGENT
Status:   ● ONLINE
Tunnel:   https://shop-admin.binboi.link
Subdomain:shop-admin
Local:    localhost:3000`,
      },
    ],
  },
  {
    id: "installation",
    group: "Getting Started",
    kicker: "Installation",
    title: "Installation paths for users, operators, and contributors",
    summary:
      "Binboi is designed to be easy to consume as a CLI but also easy to build from source. The supported install shape depends on whether you are using a packaged binary, experimenting with the npm wrapper direction, or contributing directly to the repository.",
    blocks: [
      {
        type: "cards",
        columns: 2,
        items: [
          {
            eyebrow: "Recommended",
            title: "Homebrew",
            description:
              "The release groundwork now includes artifact naming and a sample formula, making Homebrew the cleanest developer install story on macOS.",
            badge: "Preferred",
            tone: "cyan",
            code: "brew install binboi/tap/binboi",
          },
          {
            eyebrow: "Direction",
            title: "npm global wrapper",
            description:
              "The product direction includes an npm-distributed wrapper for JavaScript-heavy teams, but treat it as packaging direction unless your published package already exists.",
            badge: "Planned",
            tone: "amber",
            code: "npm install -g @binboi/cli",
          },
          {
            eyebrow: "Manual",
            title: "Direct binary install",
            description:
              "Download the correct `tar.gz` release artifact for your operating system and architecture, extract it, and place `binboi` on your PATH.",
            badge: "Supported",
            tone: "emerald",
            code: "tar -xzf binboi_0.4.0_darwin_arm64.tar.gz",
          },
          {
            eyebrow: "Contributors",
            title: "Build from source",
            description:
              "If you are extending the relay or dashboard, build locally from the repository and run the web app and server side by side.",
            badge: "Available",
            tone: "zinc",
            code: "go build -o binboi ./cmd/binboi-client",
          },
        ],
      },
      {
        type: "code",
        title: "Contributor install flow",
        language: "bash",
        code: `git clone https://github.com/sardorazimov/binboi.git
cd binboi
go build -o binboi-server ./cmd/binboi-server
go build -o binboi ./cmd/binboi-client
cd web
npm install
npm run dev`,
      },
      {
        type: "callout",
        tone: "info",
        title: "Release artifact naming",
        body:
          "Release-ready CLI archives follow the pattern `binboi_<version>_<os>_<arch>.tar.gz`. That keeps Homebrew, direct downloads, and CI packaging aligned around one predictable binary layout.",
      },
    ],
  },
  {
    id: "authentication",
    group: "Getting Started",
    kicker: "Authentication",
    title: "How Binboi access tokens work",
    summary:
      "Binboi separates website identity from CLI credentials. Users sign in to the dashboard, generate personal access tokens, and then use those tokens in the CLI. The relay validates the token during login and again when a tunnel session is established.",
    blocks: [
      {
        type: "steps",
        title: "Authentication flow",
        items: [
          {
            title: "Create a token in the dashboard",
            description:
              "Open `/dashboard/access-tokens`, choose a token name like `MacBook Pro` or `CI smoke runner`, and create the token.",
          },
          {
            title: "Copy the token immediately",
            description:
              "The full token value is shown only once. Binboi stores a token prefix and secure hash, not the raw token.",
          },
          {
            title: "Run `binboi login`",
            description:
              "The CLI sends the token to `GET /api/v1/auth/me`, validates your identity, and persists the token to `~/.binboi/config.json`.",
          },
          {
            title: "Use `binboi whoami` as a sanity check",
            description:
              "This is the fastest way to prove the token, API URL, and stored config are all aligned before debugging tunnel traffic.",
          },
        ],
      },
      {
        type: "code",
        title: "Authentication commands",
        language: "bash",
        code: `binboi login --token binboi_pat_2e9c4d93_6a4de4f8f5b51f5bb4ef7a91a9d7c8f2d95d
binboi whoami`,
      },
      {
        type: "list",
        title: "Token security notes",
        items: [
          "The database stores only a token prefix plus a secure hash, never the raw token.",
          "The dashboard returns the full token only once at creation time.",
          "Revoking a token prevents future CLI authentication with that value.",
          "Treat tokens like deployment secrets: do not paste them into screenshots, shell history you do not control, or shared chat threads.",
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Preview mode behavior",
        body:
          "When Postgres-backed website auth is not configured, the repo falls back to a local preview auth mode. That mode is intentionally honest: it still powers `binboi login` and `binboi whoami`, but it represents preview relay auth rather than the full multi-token SaaS behavior.",
      },
    ],
  },
  {
    id: "cli-usage",
    group: "Using Binboi",
    kicker: "CLI Usage",
    title: "Command surface, current availability, and product direction",
    summary:
      "Binboi's CLI is intentionally compact, but the documentation describes both what works in the repository today and which commands are planned as ergonomic aliases or upcoming surfaces. The goal is to keep the docs useful without pretending unfinished commands already ship.",
    blocks: [
      {
        type: "table",
        title: "Command reference",
        columns: ["Command", "Status", "What it does"],
        rows: [
          ["`binboi login --token <token>`", "Available", "Validate an access token and save it to `~/.binboi/config.json`."],
          ["`binboi logout`", "Planned", "Will remove local auth state. For now, delete or edit `~/.binboi/config.json`."],
          ["`binboi whoami`", "Available", "Verify the configured token against the backend and print account information."],
          ["`binboi http 3000`", "Alias planned", "Intended shorthand for HTTP tunnels. Today use `binboi start 3000 my-app`."],
          ["`binboi tcp 5432`", "Planned", "Reserved for raw TCP exposure once the transport surface is ready."],
          ["`binboi tunnels`", "Planned", "Intended list view of current tunnels and reserved routes."],
          ["`binboi stop`", "Planned", "Intended local stop command for a running tunnel session."],
          ["`binboi logs`", "Planned", "Intended tail of structured request or relay events."],
          ["`binboi regions`", "Planned", "Will list relay regions and nodes when multi-region is available."],
          ["`binboi config`", "Planned", "Will expose config inspection and mutation helpers around the local config file."],
          ["`binboi version`", "Available", "Print the CLI version, used by packaging tests and support workflows."],
        ],
      },
      {
        type: "cards",
        columns: 2,
        items: [
          {
            title: "Current MVP tunnel command",
            description:
              "Use `binboi start 3000 my-app` to expose a local HTTP service. This is the working command in the repository today.",
            badge: "Implemented",
            tone: "cyan",
          },
          {
            title: "Near-term ergonomics",
            description:
              "The docs use `binboi http` and `binboi tcp` as the product-facing command language because they are clearer for users and likely future aliases.",
            badge: "Roadmap",
            tone: "amber",
          },
        ],
      },
      {
        type: "code",
        title: "Useful real commands today",
        language: "bash",
        code: `binboi login --token <token>
binboi whoami
binboi start 3000 my-app
binboi version`,
      },
    ],
  },
  {
    id: "http-tunnels",
    group: "Using Binboi",
    kicker: "Running HTTP Tunnels",
    title: "Expose localhost over HTTP and understand the forwarding behavior",
    summary:
      "HTTP tunneling is the most complete Binboi path today. The relay maps a public host to a connected agent, then forwards incoming HTTP traffic through the session to your local service. That makes it ideal for app previews, callback URLs, OAuth return paths, and webhook endpoints.",
    blocks: [
      {
        type: "paragraph",
        body:
          "In practical terms, you point Binboi at a local port and it gives you a public URL. Incoming requests are matched by host, forwarded through the relay session, and delivered to your application with forwarding headers that preserve request context. If your app already listens on `localhost:3000`, the tunnel behaves like a public front door for that process.",
      },
      {
        type: "code",
        title: "Common HTTP tunnel examples",
        language: "bash",
        code: `# Stable named subdomain
binboi start 3000 marketing-site

# API server on a different port
binboi start 8080 internal-api

# Planned ergonomic alias
binboi http 3000`,
      },
      {
        type: "list",
        title: "Forwarding behavior to expect",
        items: [
          "The public URL maps to a tunnel record and is considered active only when an agent is connected.",
          "The relay forwards the original host and adds forwarded headers so your app can reason about external context.",
          "If the agent disconnects, the tunnel remains reserved but returns an offline or bad-gateway style experience until the session reconnects.",
          "Request counts and transferred bytes are tracked at the tunnel level so the dashboard can summarize usage.",
        ],
      },
      {
        type: "callout",
        tone: "success",
        title: "Great first use cases",
        body:
          "Webhook endpoints, browser-based QA of a local branch, mobile app callbacks, OAuth redirect testing, and previewing admin tools without deploying them first are the clearest Binboi wins.",
      },
    ],
  },
  {
    id: "tcp-tunnels",
    group: "Using Binboi",
    kicker: "Running TCP Tunnels",
    title: "How raw TCP fits into the roadmap",
    summary:
      "TCP tunneling is the natural sibling to HTTP tunneling, but Binboi treats it as a deliberate extension instead of pretending the feature is fully baked. The concept is simple: forward a raw TCP address through the agent to a local port. The operational details are where the product needs more work.",
    blocks: [
      {
        type: "cards",
        columns: 2,
        items: [
          {
            title: "Typical use cases",
            description:
              "Database demos, private admin protocols, SSH-style experiments, or proprietary integrations that do not speak HTTP.",
            tone: "cyan",
          },
          {
            title: "Why Binboi is cautious",
            description:
              "Raw TCP needs stronger connection accounting, reserved address policy, and clearer security defaults than HTTP tunneling alone.",
            tone: "amber",
          },
        ],
      },
      {
        type: "code",
        title: "Planned product shape",
        language: "bash",
        code: `# Planned raw TCP exposure
binboi tcp 5432

# Example target
public-db.us-east.binboi.link:5432 -> localhost:5432`,
        note:
          "The repo documentation includes this command because it is part of the product direction. The current MVP is still HTTP-first.",
      },
      {
        type: "callout",
        tone: "warning",
        title: "MVP limitation",
        body:
          "Treat TCP tunnels as planned documentation rather than a finished runtime feature. The current self-hosted MVP is designed around HTTP routing and webhook debugging first.",
      },
    ],
  },
  {
    id: "dashboard-overview",
    group: "Using Binboi",
    kicker: "Dashboard Overview",
    title: "The dashboard as the product control plane",
    summary:
      "The Binboi dashboard is more than a marketing shell. It is where users understand tunnel state, create access tokens, inspect relay activity, manage domains, and eventually move from raw logs toward richer request and webhook workflows.",
    blocks: [
      {
        type: "cards",
        columns: 2,
        items: [
          {
            eyebrow: "Home",
            title: "Main dashboard",
            description:
              "Shows active tunnels, throughput summaries, quick-start guidance, and a live view of whether the relay feels healthy.",
          },
          {
            eyebrow: "Network",
            title: "Tunnel list",
            description:
              "Reserve subdomains, inspect tunnel status, and understand which routes are active versus merely reserved.",
          },
          {
            eyebrow: "Inspection",
            title: "Requests and webhooks",
            description:
              "The documentation treats this as a major product surface. In the repo today, rich structured inspection is evolving from relay events and log streaming.",
          },
          {
            eyebrow: "Security",
            title: "API keys",
            description:
              "The Access Tokens page already behaves like a real product surface with one-time token reveal and revoke semantics.",
          },
          {
            eyebrow: "Operations",
            title: "Logs",
            description:
              "Live relay events are available today and provide the most direct explanation of connect, disconnect, and traffic behavior.",
          },
          {
            eyebrow: "Control plane",
            title: "Settings and integrations",
            description:
              "Some areas are MVP or planned, but the dashboard now makes that status explicit instead of presenting empty shells.",
          },
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Design intent",
        body:
          "The long-term Binboi dashboard should feel closer to a debugging cockpit than a status page. That means tunnel data, request context, webhook outcomes, and operator actions all need to share one readable story.",
      },
    ],
  },
  {
    id: "request-inspection",
    group: "Using Binboi",
    kicker: "Request Inspection",
    title: "What request inspection means in Binboi",
    summary:
      "Request inspection is the practice of explaining a live inbound request without forcing a developer to guess. For Binboi, that means capturing enough metadata to answer the questions developers actually ask: what arrived, where was it sent, how long did it take, what responded, and where did it fail.",
    blocks: [
      {
        type: "cards",
        columns: 3,
        items: [
          {
            title: "Request metadata",
            description:
              "Method, scheme, host, path, query string, region, tunnel identity, and receive timestamp.",
          },
          {
            title: "Header visibility",
            description:
              "Forwarding headers, provider-specific webhook headers, and application-relevant identifiers such as delivery IDs.",
          },
          {
            title: "Body previews",
            description:
              "Payload previews should stay readable, truncated when needed, and safe enough for operators to debug without turning the product into a data leak.",
          },
          {
            title: "Response previews",
            description:
              "Status code, duration, selected headers, and small response previews help explain success versus failure fast.",
          },
          {
            title: "Target awareness",
            description:
              "The inspection surface should always show which local target service handled the request and how it was resolved.",
          },
          {
            title: "Error classification",
            description:
              "Binboi should differentiate relay/auth errors from upstream application failures so debugging starts in the right place.",
          },
        ],
      },
      {
        type: "table",
        title: "Useful error classifications",
        columns: ["Classification", "What it usually means", "What to check first"],
        rows: [
          ["AUTH_ERROR", "The CLI could not authenticate or the token is invalid.", "`binboi whoami`, dashboard token status, API URL configuration."],
          ["UPSTREAM_CONNECT", "The relay reached the agent, but the agent could not reach your local app.", "Is the app listening on the expected port? Is it bound to localhost?"],
          ["UPSTREAM_TIMEOUT", "The request reached the target but no response came back in time.", "Application startup, long-running handlers, background locks, database waits."],
          ["HOST_MISMATCH", "The public host did not map to a valid tunnel.", "Subdomain spelling, reserved tunnel status, managed domain configuration."],
          ["WEBHOOK_SIGNATURE", "The provider reached your app but signature verification failed.", "Signing secret, raw-body handling, middleware order."],
          ["REGION_PATH", "The selected node or network path added latency or instability.", "Region choice, VPN behavior, edge routing, corporate proxy behavior."],
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Current MVP note",
        body:
          "In the repository today, the richest implemented inspection surface is the relay event stream plus tunnel metadata. The docs describe the intended request-inspection shape so teams can build toward it honestly.",
      },
    ],
  },
  {
    id: "webhook-debugging",
    group: "Debugging & Integrations",
    kicker: "Webhook Debugging",
    title: "Debug third-party callbacks without guessing",
    summary:
      "Webhook debugging is one of the clearest reasons to use a tunnel product in the first place. Binboi helps by giving providers a public URL during local development and by surfacing enough context to explain why the provider thinks a delivery succeeded, retried, timed out, or failed signature checks.",
    blocks: [
      {
        type: "cards",
        columns: 2,
        items: [
          {
            eyebrow: "Clerk",
            title: "Auth events and Svix signatures",
            description:
              "Use Binboi to receive Clerk webhooks locally, inspect `svix-id`, `svix-timestamp`, and `svix-signature`, and confirm your app is using the raw body before verification.",
          },
          {
            eyebrow: "Neon",
            title: "Project or branch automation",
            description:
              "Neon callbacks are easiest to debug when you can inspect the exact JSON payload and compare it to the local code path that should provision or sync resources.",
          },
          {
            eyebrow: "Supabase",
            title: "Auth and database hooks",
            description:
              "Use Binboi to verify the incoming project event, the headers Supabase sends, and whether local middleware rewrote or rejected the request unexpectedly.",
          },
          {
            eyebrow: "Stripe",
            title: "Payment event replay",
            description:
              "Public URLs plus request inspection make it much easier to diagnose `invoice.paid`, `checkout.session.completed`, or `payment_intent.succeeded` failures without deploying a preview build.",
          },
          {
            eyebrow: "GitHub and Linear",
            title: "Issue, PR, and deployment hooks",
            description:
              "Delivery IDs, event names, retry behavior, and your app's response window matter. Binboi gives the callback a stable route and the operator a place to examine what happened.",
          },
          {
            eyebrow: "Cross-provider pattern",
            title: "Compare expected versus actual",
            description:
              "The useful debugging move is always the same: compare the provider's expected payload, headers, and response window with the request Binboi actually delivered to your local service.",
          },
        ],
      },
      {
        type: "code",
        title: "Stripe local webhook example",
        language: "bash",
        code: `# Start a local tunnel
binboi start 3000 stripe-events

# Configure Stripe to send events to:
https://stripe-events.binboi.link/webhooks/stripe

# Typical local checks
grep STRIPE_WEBHOOK_SECRET .env
binboi whoami`,
      },
      {
        type: "callout",
        tone: "success",
        title: "Most webhook bugs are not transport bugs",
        body:
          "The request usually arrived. What failed is often the secret, route path, middleware chain, body parsing mode, or a local exception thrown after receipt. Binboi's job is to remove uncertainty about the delivery itself.",
      },
    ],
  },
  {
    id: "integrations",
    group: "Debugging & Integrations",
    kicker: "Integrations",
    title: "Provider integrations and what they should mean in practice",
    summary:
      "Binboi integrations are about shortening the path between a provider and a working local debug session. Some integration flows are present today as product guidance and dashboard structure, while one-click provider-specific automation is still evolving.",
    blocks: [
      {
        type: "cards",
        columns: 2,
        items: [
          {
            title: "Clerk",
            badge: "MVP-ready flow",
            tone: "cyan",
            description:
              "Create a tunnel, paste the public URL into Clerk's webhook settings, and verify your signing secret handling locally. The main value is local callback visibility plus repeatable tunnel URLs.",
          },
          {
            title: "Neon",
            badge: "Guided setup",
            tone: "zinc",
            description:
              "Use Binboi as the public callback surface for branch or database-related automation. Provider-aware inspection is part of the long-term integrations story.",
          },
          {
            title: "Supabase",
            badge: "Guided setup",
            tone: "zinc",
            description:
              "Point Supabase hooks or edge-callback workflows at your Binboi URL, then inspect requests and upstream behavior when auth or database actions misbehave.",
          },
          {
            title: "Stripe",
            badge: "MVP-ready flow",
            tone: "cyan",
            description:
              "Stable HTTP tunnels plus request visibility make Stripe local development much less painful. Replay and signature-focused affordances are natural next steps.",
          },
          {
            title: "GitHub",
            badge: "MVP-ready flow",
            tone: "emerald",
            description:
              "Repository and organization webhooks work well with a tunnel-first debugging model, especially when delivery IDs and event names are surfaced prominently.",
          },
          {
            title: "Linear",
            badge: "Planned refinement",
            tone: "amber",
            description:
              "Linear works with a generic webhook flow today. Provider-specific setup helpers, docs snippets, and troubleshooting affordances are good candidates for the next iteration.",
          },
        ],
      },
      {
        type: "list",
        title: "What a strong Binboi integration should provide",
        items: [
          "Provider-specific setup instructions from inside the dashboard.",
          "Suggested endpoint paths, example payloads, and signature header references.",
          "Clear mapping between a delivery attempt and the exact local handler that processed it.",
          "Replay-friendly debugging once structured request storage is deeper than relay event logs.",
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Be explicit about MVP versus planned",
        body:
          "When a provider has only generic tunnel support today, the docs say so clearly. The goal is to be useful without pretending a half-built integration is already a polished workflow.",
      },
    ],
  },
  {
    id: "api-keys",
    group: "Debugging & Integrations",
    kicker: "API Keys",
    title: "Creating, managing, and revoking access tokens",
    summary:
      "The Access Tokens page is the CLI authentication center for Binboi. Users create tokens there, copy the value once, and then manage lifecycle from the dashboard by reviewing token names, prefixes, creation time, last-used time, and revocation state.",
    blocks: [
      {
        type: "steps",
        title: "Recommended token hygiene",
        items: [
          {
            title: "Use one token per machine or workflow",
            description:
              "Separate tokens make it much easier to revoke stale access without interrupting healthy development environments.",
          },
          {
            title: "Name tokens intentionally",
            description:
              "Good names are things like `M2 MacBook`, `CI smoke runner`, or `payments-staging VM`, not `test` or `default`.",
          },
          {
            title: "Review last used time",
            description:
              "This helps you spot dead credentials, forgotten machines, or tokens that should no longer exist.",
          },
          {
            title: "Revoke instead of reusing",
            description:
              "If a token has been copied too widely or lost in shell history, revoke it and mint a new one immediately.",
          },
        ],
      },
      {
        type: "code",
        title: "Dashboard-backed CLI flow",
        language: "bash",
        code: `# 1. Create token in the dashboard
# 2. Copy it once
binboi login --token <copied-token>

# Optional verification
binboi whoami`,
      },
      {
        type: "callout",
        tone: "success",
        title: "Storage model",
        body:
          "Binboi stores token prefixes and secure hashes in the database. That means the control plane can validate tokens without keeping the original secret around after creation.",
      },
    ],
  },
  {
    id: "regions-and-nodes",
    group: "Debugging & Integrations",
    kicker: "Regions and Nodes",
    title: "Why regions matter and how Binboi thinks about nodes",
    summary:
      "Regions are where your relay nodes live, and nodes are the actual edge or relay instances serving traffic. For developer tunnel products, latency matters because it shapes perceived responsiveness, webhook timeout behavior, and whether local debugging feels immediate or sluggish.",
    blocks: [
      {
        type: "paragraph",
        body:
          "In a mature Binboi deployment, users would choose a region close to themselves or close to the services sending traffic. That decision affects the round-trip from provider to relay and from relay to your local machine. If the wrong region is chosen, the tunnel still works, but every request can feel heavier and some providers may become more retry-prone during slow paths.",
      },
      {
        type: "table",
        title: "Region model in practice",
        columns: ["Concept", "What it means", "Current repository state"],
        rows: [
          ["Region", "A logical location such as `us-east`, `eu-west`, or `local`.", "The current MVP defaults to a single `local` region."],
          ["Node", "A concrete relay instance serving tunnels.", "The current MVP behaves like a single primary node."],
          ["Selection", "How a user chooses where traffic should enter.", "Planned for richer multi-node control planes."],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Operator guidance",
        body:
          "If you self-host Binboi for a team, start with one region that matches your engineers or staging environment. Multi-region only pays off once you can observe node health, latency, and token-scoped routing cleanly.",
      },
    ],
  },
  {
    id: "logs-and-events",
    group: "Debugging & Integrations",
    kicker: "Logs and Events",
    title: "Understand the difference between logs, request views, and lifecycle events",
    summary:
      "Not every piece of observability serves the same purpose. Binboi benefits from keeping raw relay logs, request-level inspection, and activity events separate so developers can choose the right lens instead of digging through a single noisy stream.",
    blocks: [
      {
        type: "cards",
        columns: 3,
        items: [
          {
            title: "Raw logs",
            description:
              "Good for transport-level truth: agent connected, stream opened, proxy error, tunnel detached, token rejected.",
          },
          {
            title: "Request and webhook views",
            description:
              "Good for understanding one inbound request as a coherent unit with metadata, status, latency, and payload context.",
          },
          {
            title: "Activity events",
            description:
              "Good for operator history: token created, domain verified, tunnel reserved, tunnel removed, session revoked.",
          },
        ],
      },
      {
        type: "list",
        title: "Tunnel lifecycle events worth surfacing",
        items: [
          "Tunnel reserved",
          "Agent authenticated",
          "Tunnel connected",
          "Request forwarded",
          "Proxy failure or upstream failure",
          "Tunnel disconnected",
          "Token rotated or revoked",
        ],
      },
      {
        type: "callout",
        tone: "warning",
        title: "Current MVP note",
        body:
          "The repository already exposes live relay events and stores recent event history. Richer structured request views are the next layer rather than something the docs hide behind vague wording.",
      },
    ],
  },
  {
    id: "configuration",
    group: "Operating Binboi",
    kicker: "Configuration",
    title: "Config file location, environment variables, and practical defaults",
    summary:
      "Binboi keeps local CLI configuration intentionally small. The CLI primarily needs an access token and knowledge of which control plane and relay it should speak to. The server side has a broader set of environment variables because it owns the relay ports, managed domain, and backing storage.",
    blocks: [
      {
        type: "code",
        title: "CLI config file",
        language: "json",
        code: `{
  "token": "binboi_pat_2e9c4d93_6a4de4f8f5b51f5bb4ef7a91a9d7c8f2d95d"
}`,
        note: "Default path: `~/.binboi/config.json`",
      },
      {
        type: "table",
        title: "Useful environment variables",
        columns: ["Variable", "Used by", "Purpose"],
        rows: [
          ["`BINBOI_API_URL`", "CLI", "Base URL for `login` and `whoami` auth checks."],
          ["`BINBOI_SERVER_ADDR`", "CLI", "Relay listener address for tunnel traffic."],
          ["`BINBOI_AUTH_TOKEN`", "CLI", "Non-interactive token source, useful in CI or scripted flows."],
          ["`BINBOI_DASHBOARD_URL`", "CLI", "Friendly dashboard URL printed in missing-token guidance."],
          ["`BINBOI_API_ADDR`", "Server", "HTTP bind address for the control plane API."],
          ["`BINBOI_TUNNEL_ADDR`", "Server", "TCP bind address for agent tunnel connections."],
          ["`BINBOI_PROXY_ADDR`", "Server", "Public proxy address serving tunnel traffic."],
          ["`BINBOI_BASE_DOMAIN`", "Server", "Managed base domain used to generate public URLs."],
          ["`BINBOI_DATABASE_PATH`", "Server", "SQLite path for relay state and recent event storage."],
          ["`BINBOI_AUTH_DATABASE_URL` / `DATABASE_URL`", "Server + web", "Postgres connection used for users and hashed access tokens."],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Precedence rule",
        body:
          "For CLI authentication, the explicit `--token` flag wins first, then environment variables, then the local config file. That keeps scripted automation predictable while preserving a comfortable default for day-to-day use.",
      },
    ],
  },
  {
    id: "self-hosting-architecture",
    group: "Operating Binboi",
    kicker: "Self-Hosting and Architecture",
    title: "A high-level architecture view without academic overhead",
    summary:
      "Binboi is easiest to understand when you keep the architecture practical: the dashboard manages operator workflows, the Go control plane tracks tunnel lifecycle and exposes APIs, and the CLI agent bridges public traffic back to your local target. Optional Postgres stores account and token state. SQLite stores relay-local state for the self-hosted MVP.",
    blocks: [
      {
        type: "code",
        title: "High-level request path",
        language: "text",
        code: `Browser / provider / teammate
           |
           v
   Public URL on Binboi relay
           |
           v
     Go proxy and control plane
           |
           v
     yamux session to CLI agent
           |
           v
       localhost:<target-port>
           |
           v
      Your local application`,
      },
      {
        type: "cards",
        columns: 3,
        items: [
          {
            title: "Dashboard role",
            description:
              "Identity, access tokens, tunnel reservation, domain management, and the operator-facing explanation of product state.",
            tone: "cyan",
          },
          {
            title: "Backend role",
            description:
              "Token validation, tunnel session lifecycle, public URL routing, event recording, and proxy coordination.",
            tone: "emerald",
          },
          {
            title: "CLI role",
            description:
              "Authenticate, open a session to the relay, accept multiplexed streams, and forward them to the configured local target.",
            tone: "amber",
          },
        ],
      },
      {
        type: "paragraph",
        body:
          "The data story is intentionally explicit: use SQLite for relay state in the MVP, and add Postgres when you want real website accounts and hashed personal access tokens. That split keeps the transport side self-hostable and lightweight while still allowing a more SaaS-shaped authentication model.",
      },
    ],
  },
  {
    id: "troubleshooting",
    group: "Operating Binboi",
    kicker: "Troubleshooting",
    title: "Solve the most common tunnel and webhook failures quickly",
    summary:
      "Good troubleshooting docs save more developer time than fancy marketing copy ever will. Most Binboi issues reduce to one of a few buckets: auth mismatch, agent not connected, target app not listening, provider signature handling, or network path confusion.",
    blocks: [
      {
        type: "cards",
        columns: 2,
        items: [
          {
            title: "Tunnel will not connect",
            description:
              "Check `binboi whoami`, confirm the relay addresses are correct, and verify the server-side tunnel listener is reachable from your machine.",
          },
          {
            title: "Invalid token",
            description:
              "Generate a new access token, copy it once, and run `binboi login --token <token>` again. Old or revoked tokens should fail cleanly.",
          },
          {
            title: "Request never reaches the local app",
            description:
              "Confirm the app is listening on the expected port and that the Binboi agent started with the correct target. A healthy tunnel does not guarantee a healthy upstream app.",
          },
          {
            title: "404 or 500 from the public URL",
            description:
              "A 404 often points to host or route mismatch. A 500 usually means your application ran and failed. Use logs or request views to distinguish them.",
          },
          {
            title: "Webhook signature confusion",
            description:
              "Revisit raw-body handling, middleware ordering, and provider secrets before assuming the provider sent a bad request.",
          },
          {
            title: "Region or connectivity instability",
            description:
              "Reduce variables first: avoid VPN edge cases, keep relay and developer close together, and start with a single known-good node.",
          },
        ],
      },
      {
        type: "code",
        title: "Fast troubleshooting checklist",
        language: "bash",
        code: `binboi version
binboi whoami
curl -I https://my-app.binboi.link
curl http://127.0.0.1:3000/health`,
      },
      {
        type: "callout",
        tone: "success",
        title: "Debug in order",
        body:
          "Start at auth, then relay connectivity, then local target reachability, then provider-specific behavior. Skipping straight to webhook code when the tunnel is offline wastes time.",
      },
    ],
  },
  {
    id: "faq",
    group: "Operating Binboi",
    kicker: "FAQ",
    title: "Questions developers ask before committing to a tunnel workflow",
    summary:
      "These are the questions teams typically ask before they adopt or self-host Binboi. The answers are short on buzzwords and intentionally direct about what is implemented today versus what is still evolving.",
    blocks: [
      {
        type: "cards",
        columns: 2,
        items: [
          {
            title: "Is Binboi like ngrok?",
            description:
              "Yes in the sense that it creates public tunnels to local services. The difference is Binboi's product direction toward a stronger dashboard, request visibility, and self-hosted control plane clarity.",
          },
          {
            title: "Can I use it for webhooks?",
            description:
              "Absolutely. Webhook debugging is one of the strongest reasons to use Binboi, especially for Clerk, Stripe, GitHub, and similar providers.",
          },
          {
            title: "Does it support self-hosting?",
            description:
              "Yes. Self-hosting is a first-class framing for the repository. The relay, dashboard, SQLite state, and optional Postgres auth layer are all documented with that in mind.",
          },
          {
            title: "Is everything production-ready?",
            description:
              "No. HTTP tunnels and token flow are the strongest implemented surfaces. TCP, deeper request inspection, and broader integrations still carry MVP or planned status.",
          },
          {
            title: "How are tokens stored?",
            description:
              "The product stores a prefix and secure hash, not the raw token. The full token is returned only at creation time.",
          },
          {
            title: "Do I need Postgres?",
            description:
              "For the full account-backed token story, yes. For local preview and core relay experimentation, the repo can still run in a lighter preview mode.",
          },
        ],
      },
    ],
  },
  {
    id: "roadmap",
    group: "Operating Binboi",
    kicker: "Next Steps and Roadmap",
    title: "What is implemented, what is MVP, and what comes next",
    summary:
      "The healthiest product docs end by grounding the reader in reality. Binboi already has a coherent HTTP tunnel path, dashboard-backed access tokens, and a workable self-hosted control plane. It also has clear next steps that should not be disguised as already-complete features.",
    blocks: [
      {
        type: "cards",
        columns: 3,
        items: [
          {
            eyebrow: "Implemented",
            title: "Strong current surfaces",
            description:
              "HTTP tunnels, CLI login and whoami, dashboard access tokens, relay lifecycle, event logs, and domain management.",
            tone: "emerald",
          },
          {
            eyebrow: "MVP",
            title: "Honest in-between surfaces",
            description:
              "Dashboard request inspection, richer provider integrations, plan-aware usage limits, and more structured traffic views.",
            tone: "amber",
          },
          {
            eyebrow: "Planned",
            title: "Next product pushes",
            description:
              "Raw TCP, richer webhook replay, regions and nodes, scoped machine identities, and deeper team-facing controls.",
            tone: "cyan",
          },
        ],
      },
      {
        type: "list",
        title: "High-value next milestones",
        items: [
          "Generate and apply database migrations for access tokens and plan data.",
          "Enforce plan-aware limits at tunnel creation and runtime, not only in the UI.",
          "Evolve relay events into a real request and webhook inspection model.",
          "Add ergonomic CLI aliases such as `binboi http`, `binboi logs`, and `binboi logout`.",
          "Expand self-hosting guidance around nodes, regions, and operator safety defaults.",
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "How to use the current repo well",
        body:
          "Treat the current codebase as a serious HTTP tunnel MVP with a strong auth flow and an improving dashboard, not as a finished hosted platform. That framing makes the product feel coherent instead of confusing.",
      },
    ],
  },
];

const navGroups = [
  {
    title: "Getting Started",
    ids: [
      "introduction",
      "core-concepts",
      "quick-start",
      "installation",
      "authentication",
    ],
  },
  {
    title: "Using Binboi",
    ids: [
      "cli-usage",
      "http-tunnels",
      "tcp-tunnels",
      "dashboard-overview",
      "request-inspection",
    ],
  },
  {
    title: "Debugging & Integrations",
    ids: [
      "webhook-debugging",
      "integrations",
      "api-keys",
      "regions-and-nodes",
      "logs-and-events",
    ],
  },
  {
    title: "Operating Binboi",
    ids: [
      "configuration",
      "self-hosting-architecture",
      "troubleshooting",
      "faq",
      "roadmap",
    ],
  },
];

function scrollToSection(id: string) {
  const section = document.getElementById(id);
  if (!section) return;

  section.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", `#${id}`);
}

function toneClasses(tone: CardTone) {
  switch (tone) {
    case "cyan":
      return "border-miransas-cyan/20 bg-miransas-cyan/5";
    case "emerald":
      return "border-emerald-400/20 bg-emerald-400/5";
    case "amber":
      return "border-amber-400/20 bg-amber-400/5";
    default:
      return "border-white/10 bg-black/30";
  }
}

function badgeClasses(label: string) {
  const value = label.toLowerCase();
  if (value.includes("implemented") || value.includes("available") || value.includes("supported") || value.includes("preferred")) {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
  }
  if (value.includes("planned") || value.includes("roadmap") || value.includes("alias")) {
    return "border-amber-400/25 bg-amber-400/10 text-amber-200";
  }
  if (value.includes("mvp") || value.includes("preview")) {
    return "border-white/10 bg-white/5 text-zinc-300";
  }
  return "border-miransas-cyan/20 bg-miransas-cyan/10 text-miransas-cyan";
}

function calloutClasses(tone: CalloutTone) {
  switch (tone) {
    case "success":
      return "border-emerald-400/20 bg-emerald-400/8 text-emerald-100";
    case "warning":
      return "border-amber-400/20 bg-amber-400/8 text-amber-100";
    default:
      return "border-miransas-cyan/20 bg-miransas-cyan/8 text-zinc-100";
  }
}

function DocsSidebar({
  activeSection,
}: {
  activeSection: string;
}) {
  return (
    <aside className="hidden lg:block lg:w-80 lg:shrink-0">
      <div className="sticky top-24 overflow-hidden rounded-[2rem] border border-white/10 bg-[#070707]/95 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="border-b border-white/10 pb-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
            <BookOpen className="h-3.5 w-3.5 text-miransas-cyan" />
            Docs navigation
          </div>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            One anchored documentation hub covering the tunnel model, CLI workflow, dashboard usage, webhook debugging, and self-hosting basics.
          </p>
        </div>

        <div className="mt-5 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <p className="px-3 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">
                {group.title}
              </p>
              <div className="mt-2 space-y-1.5">
                {group.ids.map((id) => {
                  const section = docsSections.find((item) => item.id === id);
                  if (!section) return null;
                  const isActive = activeSection === id;

                  return (
                    <a
                      key={id}
                      href={`#${id}`}
                      onClick={(event) => {
                        event.preventDefault();
                        scrollToSection(id);
                      }}
                      className={`flex items-center justify-between rounded-2xl border px-3 py-3 text-sm transition ${
                        isActive
                          ? "border-miransas-cyan/20 bg-miransas-cyan/10 text-white"
                          : "border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                          {String(docsSections.findIndex((item) => item.id === id) + 1).padStart(2, "0")}
                        </span>
                        <span>{section.kicker}</span>
                      </span>
                      <ChevronRight className={`h-4 w-4 ${isActive ? "text-miransas-cyan" : "text-zinc-600"}`} />
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function RenderBlock({ block }: { block: DocsBlock }) {
  if (block.type === "paragraph") {
    return <p className="text-base leading-8 text-zinc-300">{block.body}</p>;
  }

  if (block.type === "cards") {
    return (
      <div>
        {block.title && (
          <h3 className="mb-4 text-lg font-semibold text-white">{block.title}</h3>
        )}
        <div
          className={`grid gap-4 ${
            block.columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"
          }`}
        >
          {block.items.map((item) => (
            <article
              key={`${item.title}-${item.description}`}
              className={`rounded-3xl border p-5 ${toneClasses(item.tone ?? "zinc")}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                {item.eyebrow && (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                    {item.eyebrow}
                  </span>
                )}
                {item.badge && (
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${badgeClasses(item.badge)}`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-300">{item.description}</p>
              {item.code && (
                <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/8 bg-black/50 p-4 text-xs leading-6 text-miransas-cyan">
                  <code>{item.code}</code>
                </pre>
              )}
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "list") {
    const ListTag = block.ordered ? "ol" : "ul";
    return (
      <div>
        {block.title && (
          <h3 className="mb-4 text-lg font-semibold text-white">{block.title}</h3>
        )}
        <ListTag className="space-y-3">
          {block.items.map((item) => (
            <li
              key={item}
              className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-sm leading-7 text-zinc-300"
            >
              {item}
            </li>
          ))}
        </ListTag>
      </div>
    );
  }

  if (block.type === "steps") {
    return (
      <div>
        {block.title && (
          <h3 className="mb-4 text-lg font-semibold text-white">{block.title}</h3>
        )}
        <div className="space-y-4">
          {block.items.map((item, index) => (
            <div
              key={item.title}
              className="flex gap-4 rounded-3xl border border-white/10 bg-black/25 p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-miransas-cyan/20 bg-miransas-cyan/10 text-sm font-semibold text-miransas-cyan">
                {index + 1}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-300">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "code") {
    return (
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/35">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-400">
              {block.title}
            </h3>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-600">
              {block.language}
            </p>
          </div>
        </div>
        <pre className="overflow-x-auto px-5 py-5 text-sm leading-7 text-miransas-cyan">
          <code>{block.code}</code>
        </pre>
        {block.note && (
          <div className="border-t border-white/10 px-5 py-4 text-sm leading-7 text-zinc-400">
            {block.note}
          </div>
        )}
      </div>
    );
  }

  if (block.type === "callout") {
    return (
      <div className={`rounded-3xl border p-5 ${calloutClasses(block.tone)}`}>
        <h3 className="text-lg font-semibold text-white">{block.title}</h3>
        <p className="mt-3 text-sm leading-7 text-inherit">{block.body}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/25">
      <div className="border-b border-white/10 px-5 py-4">
        <h3 className="text-lg font-semibold text-white">{block.title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-white/[0.03]">
            <tr>
              {block.columns.map((column) => (
                <th
                  key={column}
                  className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {block.rows.map((row) => (
              <tr key={row.join("-")} className="align-top">
                {row.map((cell) => (
                  <td
                    key={cell}
                    className="px-5 py-4 text-sm leading-7 text-zinc-300"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window === "undefined") {
      return docsSections[0]?.id ?? "introduction";
    }

    const initial = window.location.hash.replace("#", "");
    return docsSections.some((section) => section.id === initial)
      ? initial
      : docsSections[0]?.id ?? "introduction";
  });

  const totalSections = docsSections.length;

  useEffect(() => {
    const ids = docsSections.map((section) => section.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: [0.12, 0.2, 0.4],
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, []);

  const activeMeta = useMemo(
    () => docsSections.find((section) => section.id === activeSection),
    [activeSection],
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040404] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,255,209,0.12),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.05),_transparent_30%),linear-gradient(to_bottom,_rgba(255,255,255,0.02),_transparent_25%)]" />

      <div className="relative mx-auto max-w-[1580px] px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#070707]/95 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="grid gap-8 border-b border-white/10 px-6 py-8 lg:grid-cols-[1.25fr_0.75fr] lg:px-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-400">
                <BookOpen className="h-4 w-4 text-miransas-cyan" />
                Developer documentation
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Binboi documentation for tunnels, webhooks, and the control plane behind them.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-300">
                This is a single-page, anchored documentation hub with a dedicated docs sidebar. It is written as serious product documentation: enough for first-time users to get started, and detailed enough for operators and contributors to understand what is implemented, what is still MVP, and how the pieces fit together.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-2xl bg-miransas-cyan px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
                >
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/access-tokens"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
                >
                  Manage access tokens
                  <KeyRound className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-3xl border border-miransas-cyan/15 bg-miransas-cyan/8 p-5">
                <div className="flex items-center gap-3">
                  <TerminalSquare className="h-5 w-5 text-miransas-cyan" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
                    CLI and auth
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-zinc-200">
                  Covers `binboi login`, `whoami`, tunnel startup, config precedence, release installs, and the product-facing command roadmap.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-3">
                  <Webhook className="h-5 w-5 text-miransas-cyan" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
                    Webhook workflows
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-zinc-300">
                  Includes Clerk, Neon, Supabase, Stripe, GitHub, and Linear examples, plus request inspection and troubleshooting guidance.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-miransas-cyan" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
                    Current docs scope
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-zinc-300">
                  {totalSections} anchored sections across getting started, usage, integrations, operations, FAQ, and roadmap. The active section right now is{" "}
                  <span className="font-semibold text-white">
                    {activeMeta?.kicker ?? "Introduction"}
                  </span>.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-6 sm:grid-cols-2 xl:grid-cols-4 lg:px-10">
            {[
              {
                icon: Globe,
                title: "Public URL mapping",
                description:
                  "Understand how host-based routing maps a public URL to a connected local target.",
              },
              {
                icon: Shield,
                title: "Access token model",
                description:
                  "Learn how the dashboard issues tokens and why the backend stores only prefixes and hashes.",
              },
              {
                icon: Waypoints,
                title: "Tunnel lifecycle",
                description:
                  "See how reserve, connect, forward, inspect, disconnect, and revoke all fit together.",
              },
              {
                icon: Network,
                title: "Self-hosted architecture",
                description:
                  "Read the practical architecture story without having to reverse-engineer the whole repository first.",
              },
            ].map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-3xl border border-white/10 bg-black/30 p-5"
              >
                <div className="inline-flex rounded-2xl border border-miransas-cyan/15 bg-miransas-cyan/10 p-3 text-miransas-cyan">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-zinc-400">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 lg:hidden">
          <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#070707]/95 p-3 backdrop-blur">
            <div className="flex min-w-max gap-2">
              {docsSections.map((section, index) => {
                const isActive = section.id === activeSection;
                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(event) => {
                      event.preventDefault();
                      scrollToSection(section.id);
                    }}
                    className={`rounded-2xl border px-3 py-2 text-sm transition ${
                      isActive
                        ? "border-miransas-cyan/20 bg-miransas-cyan/10 text-white"
                        : "border-white/10 bg-black/30 text-zinc-400"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")} {section.kicker}
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <DocsSidebar activeSection={activeSection} />

          <div className="min-w-0 flex-1">
            <div className="space-y-8">
              {docsSections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-28 rounded-[2rem] border border-white/10 bg-[#070707]/95 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.25)] backdrop-blur sm:p-8 lg:p-10"
                >
                  <div className="max-w-4xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-miransas-cyan">
                        {section.kicker}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                        {section.group}
                      </span>
                    </div>
                    <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                      {section.title}
                    </h2>
                    <p className="mt-5 text-base leading-8 text-zinc-300">
                      {section.summary}
                    </p>
                  </div>

                  <div className="mt-8 space-y-6">
                    {section.blocks.map((block, index) => (
                      <RenderBlock key={`${section.id}-${block.type}-${index}`} block={block} />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <section className="mt-8 rounded-[2rem] border border-white/10 bg-[#070707]/95 p-6 sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-miransas-cyan">
                    Documentation center
                  </p>
                  <h2 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
                    Keep the docs close to the product surface.
                  </h2>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
                    The most useful docs are the ones a developer can open during a failing webhook run, a confusing auth issue, or the first setup of a new machine. Binboi&apos;s docs are intentionally anchored, readable, and product-specific so they can serve that role.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => scrollToSection("quick-start")}
                    className="inline-flex items-center gap-2 rounded-2xl bg-miransas-cyan px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
                  >
                    Jump to quick start
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => scrollToSection("troubleshooting")}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
                  >
                    Open troubleshooting
                    <Wrench className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
