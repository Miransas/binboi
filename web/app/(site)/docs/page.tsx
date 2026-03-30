import {
  DocsCallout,
  DocsCard,
  DocsCardGrid,
  DocsCodeBlock,
  DocsLinkCard,
  DocsPageShell,
  DocsSection,
  type TocItem,
} from "./_components/docs-primitives";
import { docsNavItems } from "./_components/docs-navigation";

const toc: TocItem[] = [
  { id: "overview", title: "Overview" },
  { id: "why-binboi", title: "Why teams use it" },
  { id: "core-model", title: "Core model" },
  { id: "quick-start-preview", title: "Quick-start preview" },
  { id: "docs-map", title: "Explore the docs" },
];

export default function DocsHomePage() {
  return (
    <DocsPageShell
      eyebrow="Introduction"
      title="Binboi docs, split into maintainable guides instead of one giant page."
      description="Binboi is a tunneling and webhook inspection platform for developers who need public URLs, clear CLI authentication, and a calmer way to debug what reached their local app. This landing page introduces the product, explains the model, and points you to the focused documentation guides."
      toc={toc}
    >
      <DocsSection
        id="overview"
        eyebrow="Overview"
        title="What Binboi is"
        description="Binboi combines a Go relay, a CLI agent, and a dashboard into one developer workflow. The relay gives you a public endpoint, the CLI bridges traffic back to your machine, and the dashboard explains what is happening with tunnels, tokens, logs, and webhook-oriented debugging."
      >
        <p className="text-base leading-8 text-zinc-300">
          The platform sits in the same family of tools as ngrok, but the product direction
          leans harder into dashboard visibility, request debugging, and self-hosted control
          plane clarity. Binboi is especially useful when local development needs to interact
          with systems that demand a public callback URL, such as payment providers, auth
          systems, source-control events, or internal QA workflows.
        </p>

        <DocsCardGrid columns={3}>
          <DocsCard
            eyebrow="Expose"
            title="Public URLs for localhost"
            description="Turn a service running on your machine into a reachable public endpoint without deploying a full preview environment first."
            tone="cyan"
          />
          <DocsCard
            eyebrow="Inspect"
            title="Developer-friendly visibility"
            description="Move from raw guesswork toward structured visibility around tokens, tunnel state, request metadata, and webhook failures."
            tone="emerald"
          />
          <DocsCard
            eyebrow="Operate"
            title="Self-hosted control plane"
            description="Run the relay yourself, keep product behavior understandable, and build up from a coherent HTTP tunnel MVP."
            tone="amber"
          />
        </DocsCardGrid>
      </DocsSection>

      <DocsSection
        id="why-binboi"
        eyebrow="Why use it"
        title="Why someone would choose Binboi"
        description="Most teams reach for Binboi when localhost stops being enough but a full deployment still feels too heavy."
      >
        <DocsCardGrid columns={2}>
          <DocsCard
            title="Webhook development"
            description="Stripe, Clerk, GitHub, Supabase, and other providers need a public URL. Binboi gives you one while keeping the code local and the debugging loop tight."
          />
          <DocsCard
            title="Local QA and demos"
            description="You can share a stable tunnel URL with another engineer, QA tester, or stakeholder without asking them to run the project locally."
          />
          <DocsCard
            title="Safer debugging"
            description="The docs and product model are designed to help you answer practical questions quickly: did the request arrive, which token was used, which route handled it, and where did it fail?"
          />
          <DocsCard
            title="Self-hosting control"
            description="If you want a tunnel system with a transparent control plane instead of an opaque hosted service, Binboi gives you a cleaner starting point."
          />
        </DocsCardGrid>

        <DocsCallout title="The simplest framing" tone="cyan">
          Binboi is for the moment when you need a public URL for local work, but you also want
          the product to explain itself instead of behaving like a black box.
        </DocsCallout>
      </DocsSection>

      <DocsSection
        id="core-model"
        eyebrow="Core model"
        title="The small set of concepts that powers the whole product"
        description="The product becomes much easier to reason about when you keep the model small and consistent."
      >
        <DocsCardGrid columns={3}>
          <DocsCard
            title="Tunnel"
            description="A reserved route between a public URL and a local target service reachable through a connected agent."
          />
          <DocsCard
            title="Agent"
            description="The CLI process that authenticates to the relay and forwards traffic to your target port."
          />
          <DocsCard
            title="Public URL"
            description="The external host assigned by the relay, such as `https://orders.binboi.link`."
          />
          <DocsCard
            title="Target service"
            description="Your local application, typically `localhost:<port>` or a service inside your development container network."
          />
          <DocsCard
            title="Requests and webhooks"
            description="HTTP traffic that reaches the relay and is forwarded to your app, including third-party callbacks from providers."
          />
          <DocsCard
            title="Access tokens"
            description="Dashboard-issued credentials used by `binboi login` so the CLI can authenticate securely."
          />
        </DocsCardGrid>

        <p className="text-base leading-8 text-zinc-300">
          The platform architecture follows directly from those concepts: the dashboard manages
          operator workflows, the control plane validates tokens and tracks tunnel state, and the
          CLI keeps a transport session open between the public relay and your machine.
        </p>
      </DocsSection>

      <DocsSection
        id="quick-start-preview"
        eyebrow="Preview"
        title="A short quick-start before you dive deeper"
        description="The basic path is straightforward: install the CLI, create a token in the dashboard, log in once, and start an HTTP tunnel."
      >
        <DocsCodeBlock
          title="Shortest useful path"
          language="bash"
          code={`brew install binboi/tap/binboi
binboi login --token <dashboard-token>
binboi whoami
binboi start 3000 my-app`}
          note="The current repository uses `binboi start` for the working HTTP tunnel flow. Product-facing `binboi http` is documented as the likely ergonomic alias."
        />

        <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
          <h3 className="text-lg font-semibold text-white">What success looks like</h3>
          <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
            <p>1. `binboi login` validates your token and writes it to `~/.binboi/config.json`.</p>
            <p>2. `binboi whoami` confirms the CLI can still authenticate against the backend.</p>
            <p>3. `binboi start 3000 my-app` prints a public URL and keeps the agent session online.</p>
            <p>4. Requests to that URL are forwarded to your local service and surfaced through the dashboard and relay logs.</p>
          </div>
        </div>
      </DocsSection>

      <DocsSection
        id="docs-map"
        eyebrow="Docs map"
        title="Explore the main guides"
        description="Each route focuses on one slice of the product so the docs stay maintainable and easier to update."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {docsNavItems
            .filter((item) => item.href !== "/docs")
            .map((item) => (
              <DocsLinkCard
                key={item.href}
                href={item.href}
                title={item.title}
                description={item.description}
              />
            ))}
        </div>

        <DocsCallout title="What is implemented today" tone="emerald">
          The strongest current product surfaces are HTTP tunnels, dashboard-backed access
          tokens, `binboi login`, `binboi whoami`, relay event logs, and a coherent self-hosted
          control plane. Some richer request inspection and integration flows are still MVP or
          planned, and the docs call that out directly instead of hiding it.
        </DocsCallout>
      </DocsSection>
    </DocsPageShell>
  );
}
