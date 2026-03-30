import {
  DocsCallout,
  DocsCodeBlock,
  DocsPageShell,
  DocsSection,
  DocsTable,
  type TocItem,
} from "../_components/docs-primitives";

const toc: TocItem[] = [
  { id: "log-types", title: "Log types" },
  { id: "activity-events", title: "Activity events" },
  { id: "lifecycle-events", title: "Tunnel lifecycle" },
  { id: "operating-with-logs", title: "Using logs well" },
];

export default function LogsPage() {
  return (
    <DocsPageShell
      eyebrow="Logs"
      title="Use logs and events to explain what the relay actually did."
      description="Not every visibility stream serves the same purpose. Binboi benefits from keeping raw relay logs, activity events, and richer request-level views conceptually separate so developers can start with the right lens."
      toc={toc}
    >
      <DocsSection
        id="log-types"
        eyebrow="Types"
        title="Raw logs versus request views"
        description="A healthy docs system teaches users which visibility surface to consult first."
      >
        <DocsTable
          title="Visibility layers"
          columns={["Layer", "Best for", "Examples"]}
          rows={[
            ["Raw relay logs", "Transport truth", "Token rejected, agent connected, proxy error, stream closed."],
            ["Activity events", "Operator history", "Tunnel reserved, token created, domain verified, session revoked."],
            ["Request views", "One-request debugging", "Headers, payload preview, response status, duration, target service."],
          ]}
        />

        <DocsCallout title="Current MVP reality" tone="amber">
          The current repository already has live relay events and recent event storage. Richer
          request inspection is still being built on top of that base rather than replacing it.
        </DocsCallout>
      </DocsSection>

      <DocsSection
        id="activity-events"
        eyebrow="History"
        title="Activity events"
        description="Activity events are the operator-facing history of what changed in the control plane."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>Use activity events to answer questions like who created a token, when a tunnel was reserved, or whether a domain verification step completed.</p>
          <p>These events should be quieter and more human-readable than transport logs because their audience is often the operator, not only the debugger.</p>
        </div>
      </DocsSection>

      <DocsSection
        id="lifecycle-events"
        eyebrow="Lifecycle"
        title="Tunnel lifecycle events"
        description="A tunnel has a lifecycle, and the logs should reflect it clearly."
      >
        <DocsCodeBlock
          title="Typical lifecycle progression"
          language="text"
          code={`Tunnel reserved
Agent authenticated
Tunnel connected
Request forwarded
Proxy error or upstream response
Tunnel disconnected
Token revoked or rotated`}
        />
      </DocsSection>

      <DocsSection
        id="operating-with-logs"
        eyebrow="Practice"
        title="How to use logs well"
        description="Good operators use the right level of detail for the question they are trying to answer."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>Start with activity events when you suspect a configuration or lifecycle issue.</p>
          <p>Move to raw relay logs when you need transport truth, such as authentication failure or proxy behavior.</p>
          <p>Use request views when the tunnel is healthy but the application-level outcome is confusing.</p>
        </div>
      </DocsSection>
    </DocsPageShell>
  );
}
