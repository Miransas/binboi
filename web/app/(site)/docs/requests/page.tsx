import {
  DocsCallout,
  DocsCard,
  DocsCardGrid,
  DocsPageShell,
  DocsSection,
  DocsTable,
  type TocItem,
} from "../_components/docs-primitives";

const toc: TocItem[] = [
  { id: "inspection-model", title: "Inspection model" },
  { id: "visible-metadata", title: "Visible metadata" },
  { id: "response-preview", title: "Response preview" },
  { id: "error-types", title: "Error types" },
];

export default function RequestsPage() {
  return (
    <DocsPageShell
      eyebrow="Requests"
      title="Inspect inbound requests with enough context to explain failures."
      description="Request inspection in Binboi means more than printing a method and path. It means giving developers the metadata they need to answer what arrived, where it was routed, what the upstream service returned, and whether the error belongs to auth, transport, or application code."
      toc={toc}
    >
      <DocsSection
        id="inspection-model"
        eyebrow="Model"
        title="What request inspection means"
        description="A useful request view should help a developer reconstruct the life of one request without reading a whole stream of unrelated logs."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>At minimum, the request view should tell you which tunnel received the request and which target service handled it.</p>
          <p>It should show when the request arrived, how long it took, and what status code came back.</p>
          <p>For webhooks, it should also preserve enough header and payload detail to explain signature and schema mismatches.</p>
        </div>

        <DocsCallout title="Current MVP note" tone="amber">
          In the repository today, the richest implemented visibility surface is still relay logs
          plus tunnel metadata. The full request-inspection experience described here is the
          product target the rest of the control plane is moving toward.
        </DocsCallout>
      </DocsSection>

      <DocsSection
        id="visible-metadata"
        eyebrow="Metadata"
        title="What metadata should be visible"
        description="A developer-friendly request inspection surface should prioritize context that leads to action."
      >
        <DocsCardGrid columns={3}>
          <DocsCard
            title="Request identity"
            description="Method, scheme, host, path, query string, tunnel name, and receive timestamp."
            tone="cyan"
          />
          <DocsCard
            title="Headers"
            description="Forwarding headers, content type, provider-specific webhook headers, and trace-friendly identifiers."
            tone="emerald"
          />
          <DocsCard
            title="Payload preview"
            description="Readable body previews that help debug shape mismatches without turning the UI into a data dump."
          />
          <DocsCard
            title="Target details"
            description="Which local service or upstream target handled the request and whether the route matched what the operator expected."
          />
          <DocsCard
            title="Timing"
            description="Duration, receive time, completion time, and clues about whether slowness came from the app or the network path."
          />
          <DocsCard
            title="Outcome"
            description="Status code, selected response headers, and a small response preview when it is safe and useful."
            tone="amber"
          />
        </DocsCardGrid>
      </DocsSection>

      <DocsSection
        id="response-preview"
        eyebrow="Response"
        title="Headers, payload previews, and response previews"
        description="The most useful request UIs help you compare inbound context and outbound response in one place."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>Show headers that explain routing, auth, or provider intent.</p>
          <p>Preview payloads at a size that is practical for debugging but still safe for operators.</p>
          <p>Preview response status, timing, and any short body excerpt that explains whether the upstream app succeeded or failed.</p>
          <p>Always include the target service identity so the operator knows which local process actually answered.</p>
        </div>
      </DocsSection>

      <DocsSection
        id="error-types"
        eyebrow="Errors"
        title="Useful error classifications"
        description="Classifying failures correctly is half the debugging battle."
      >
        <DocsTable
          title="Request error types"
          columns={["Type", "What it usually means", "What to check first"]}
          rows={[
            ["`AUTH_ERROR`", "The CLI token is invalid or the session could not authenticate.", "`binboi whoami`, token status, API URL configuration."],
            ["`UPSTREAM_CONNECT`", "The relay reached the agent, but the agent could not reach the local target.", "Is the app listening on the expected port?"],
            ["`UPSTREAM_TIMEOUT`", "The request reached the app, but the app did not respond in time.", "Long handlers, startup lag, database waits."],
            ["`HOST_MISMATCH`", "The incoming host did not resolve to a valid or active tunnel.", "Subdomain spelling, reserved tunnel state, domain config."],
            ["`WEBHOOK_SIGNATURE`", "The request arrived, but signature verification failed in your app.", "Signing secret, raw-body handling, middleware order."],
            ["`APPLICATION_500`", "Your app ran and threw a failure.", "Application logs, stack traces, route code."],
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  );
}
