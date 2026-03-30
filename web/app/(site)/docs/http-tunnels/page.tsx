import {
  DocsCallout,
  DocsCodeBlock,
  DocsPageShell,
  DocsSection,
  DocsTable,
  type TocItem,
} from "../_components/docs-primitives";

const toc: TocItem[] = [
  { id: "http-model", title: "HTTP model" },
  { id: "public-url-mapping", title: "Public URL mapping" },
  { id: "forwarding-behavior", title: "Forwarding behavior" },
  { id: "common-examples", title: "Common examples" },
  { id: "mvp-limits", title: "MVP limits" },
];

export default function HttpTunnelsPage() {
  return (
    <DocsPageShell
      eyebrow="HTTP Tunnels"
      title="How Binboi exposes localhost over HTTP."
      description="HTTP tunnels are the clearest and strongest current Binboi surface. The relay maps a public host to a connected agent, forwards incoming HTTP traffic to your local target, and keeps enough tunnel context for the dashboard and logs to explain what happened."
      toc={toc}
    >
      <DocsSection
        id="http-model"
        eyebrow="Model"
        title="How the HTTP tunnel model works"
        description="A tunnel is a route plus an active agent connection. When both exist, a public URL can behave like a front door to your local service."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>The public relay receives an inbound request and identifies the target tunnel by host.</p>
          <p>If the tunnel is active, the relay opens a stream over the existing agent session.</p>
          <p>The CLI forwards the request to your local target port and returns the upstream response to the client.</p>
        </div>

        <DocsCodeBlock
          title="Basic HTTP tunnel"
          language="bash"
          code={`binboi start 3000 marketing-site

# Product-facing alias planned
binboi http 3000`}
        />
      </DocsSection>

      <DocsSection
        id="public-url-mapping"
        eyebrow="Routing"
        title="How public URL mapping works"
        description="Binboi primarily routes HTTP traffic by host and subdomain."
      >
        <DocsTable
          title="Routing concepts"
          columns={["Concept", "Meaning", "Example"]}
          rows={[
            ["Managed domain", "The base domain used by the relay to generate public URLs.", "`binboi.link` or `binboi.localhost`"],
            ["Subdomain", "The tunnel-specific label mapped to your service.", "`marketing-site`"],
            ["Public URL", "The external URL clients can reach.", "`https://marketing-site.binboi.link`"],
            ["Target", "The local HTTP service the CLI forwards traffic to.", "`http://127.0.0.1:3000`"],
          ]}
        />
      </DocsSection>

      <DocsSection
        id="forwarding-behavior"
        eyebrow="Behavior"
        title="What forwarding looks like in practice"
        description="Once the relay has matched a public URL to an active tunnel, the forwarding behavior should feel simple and predictable."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>The relay preserves the original host and adds forwarding headers for upstream context.</p>
          <p>The tunnel is considered active only while a live agent session is attached.</p>
          <p>If the agent disconnects, the route may remain reserved but traffic will fail until the session returns.</p>
          <p>Request counts and transferred bytes can be aggregated at the tunnel level for dashboard reporting.</p>
        </div>
      </DocsSection>

      <DocsSection
        id="common-examples"
        eyebrow="Examples"
        title="Common HTTP tunnel examples"
        description="The best early use cases are the ones where deployment would be overkill but public reachability still matters."
      >
        <DocsCodeBlock
          title="Examples"
          language="bash"
          code={`# Local admin tool
binboi start 3000 admin-tool

# Express API
binboi start 8080 internal-api

# Webhook receiver
binboi start 3000 stripe-events`}
        />

        <DocsCallout title="Good first wins" tone="emerald">
          Webhook receivers, staging admin tools, browser-accessible QA previews, OAuth callback
          routes, and mobile-app callback testing are the best fits for Binboi&apos;s current HTTP
          tunnel model.
        </DocsCallout>
      </DocsSection>

      <DocsSection
        id="mvp-limits"
        eyebrow="MVP limits"
        title="Current HTTP tunnel limitations"
        description="The docs should describe the working path clearly without pretending the product is broader than it currently is."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>HTTP is the strongest runtime path in the repository today.</p>
          <p>Path-based routing across multiple local targets is not yet a polished first-class feature.</p>
          <p>Raw TCP is still planned and should not be treated as equally mature.</p>
          <p>Structured request inspection is evolving from relay events and tunnel metadata rather than a fully finished replay interface.</p>
        </div>
      </DocsSection>
    </DocsPageShell>
  );
}
