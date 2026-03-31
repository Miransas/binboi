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
import { docsNavGroups, docsNavItems } from "./_components/docs-navigation";

const toc: TocItem[] = [
  { id: "overview", title: "Overview" },
  { id: "start-here", title: "Start here" },
  { id: "core-model", title: "Core model" },
  { id: "guide-map", title: "Guide map" },
  { id: "operating-notes", title: "Operating notes" },
];

const startHereGuides = docsNavItems.filter((item) =>
  ["/docs/quick-start", "/docs/authentication", "/docs/http-tunnels"].includes(item.href),
);

export default function DocsHomePage() {
  return (
    <DocsPageShell
      eyebrow="Introduction"
      title="Documentation for shipping tunnels, tokens, and webhook debugging without guessing."
      description="Binboi docs are organized as focused guides instead of one giant page. The left rail gives you the product map, the center column explains one topic at a time, and the right rail keeps the current guide readable while you move through it."
      toc={toc}
    >
      <DocsSection
        id="overview"
        eyebrow="Overview"
        title="What Binboi is"
        description="Binboi is a tunneling and webhook inspection platform for developers who need public URLs, clear CLI authentication, and calmer visibility into what reached their local app."
      >
        <p>
          The platform combines a Go relay, a CLI agent, and a dashboard into one workflow. The
          relay gives you a public entry point, the CLI bridges traffic back to your machine, and
          the dashboard explains what is happening with tunnels, tokens, requests, and webhook
          events.
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
            title="Clear request visibility"
            description="Follow request flow, metadata, and webhook debugging with documentation that matches how the product actually behaves."
            tone="emerald"
          />
          <DocsCard
            eyebrow="Operate"
            title="Self-hosted control plane"
            description="Run the relay yourself, keep the platform understandable, and build from a coherent HTTP tunnel baseline."
            tone="amber"
          />
        </DocsCardGrid>
      </DocsSection>

      <DocsSection
        id="start-here"
        eyebrow="Start here"
        title="The fastest path through the docs"
        description="If you are new to Binboi, these three guides are the cleanest sequence."
      >
        <div className="grid gap-4 xl:grid-cols-3">
          {startHereGuides.map((item) => (
            <DocsLinkCard
              key={item.href}
              href={item.href}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>

        <DocsCodeBlock
          title="Shortest useful path"
          language="bash"
          code={`brew install binboi/tap/binboi
binboi login --token <dashboard-token>
binboi whoami
binboi start 3000 my-app`}
          note="The current repository uses `binboi start` for the working HTTP tunnel flow. The docs mention `binboi http` only as the likely product-facing alias."
        />
      </DocsSection>

      <DocsSection
        id="core-model"
        eyebrow="Core model"
        title="The small set of concepts that powers the whole product"
        description="The product gets easier to operate when you keep the model small and consistent."
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
            title="Requests and webhooks"
            description="HTTP traffic that reaches the relay and is forwarded to your app, including callbacks from third-party providers."
          />
          <DocsCard
            title="Access tokens"
            description="Dashboard-issued credentials used by `binboi login` so the CLI can authenticate securely."
          />
          <DocsCard
            title="Logs and dashboard context"
            description="Operator-facing visibility into tunnel state, request flow, and lifecycle events across the product."
          />
        </DocsCardGrid>

        <DocsCallout title="The simplest framing" tone="cyan">
          Binboi is for the moment when you need a public URL for local work, but you also want
          the platform to explain itself instead of behaving like a black box.
        </DocsCallout>
      </DocsSection>

      <DocsSection
        id="guide-map"
        eyebrow="Guide map"
        title="Explore the docs by operating area"
        description="The information architecture stays the same, but the docs home now acts like a proper index into that structure."
      >
        <div className="grid gap-5 xl:grid-cols-2">
          {docsNavGroups.map((group) => (
            <div
              key={group.title}
              className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Guide group
              </p>
              <h3 className="mt-3 text-xl font-semibold text-white">{group.title}</h3>
              <div className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <DocsLinkCard
                    key={item.href}
                    href={item.href}
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection
        id="operating-notes"
        eyebrow="Operating notes"
        title="What the current product is strongest at today"
        description="The docs should tell the truth about what feels mature, what is evolving, and what is still planned."
      >
        <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-zinc-300">
          <p>
            The strongest current product surfaces are HTTP tunnels, dashboard-backed access
            tokens, `binboi login`, `binboi whoami`, relay event logs, and a coherent self-hosted
            control plane.
          </p>
          <p className="mt-3">
            Richer request inspection, replay ergonomics, and broader runtime surfaces are still
            evolving. The docs call that out directly instead of pretending everything is equally
            finished.
          </p>
        </div>

        <DocsCallout title="Why the docs are organized this way" tone="emerald">
          Each route focuses on one slice of the product so the documentation stays maintainable,
          easier to scan, and easier to keep honest as Binboi grows.
        </DocsCallout>
      </DocsSection>
    </DocsPageShell>
  );
}
