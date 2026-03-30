import {
  DocsCallout,
  DocsCard,
  DocsCardGrid,
  DocsCodeBlock,
  DocsPageShell,
  DocsSection,
  type TocItem,
} from "../_components/docs-primitives";

const toc: TocItem[] = [
  { id: "webhook-model", title: "Webhook model" },
  { id: "provider-examples", title: "Provider examples" },
  { id: "debugging-patterns", title: "Debugging patterns" },
  { id: "integration-direction", title: "Integration direction" },
];

export default function WebhooksPage() {
  return (
    <DocsPageShell
      eyebrow="Webhooks"
      title="Debug provider callbacks with a public URL and a calmer inspection workflow."
      description="Webhook debugging is one of the strongest reasons to use Binboi. The relay gives providers a stable public target during local development, and the dashboard plus logs help explain whether the failure happened in delivery, signature handling, routing, or your application itself."
      toc={toc}
    >
      <DocsSection
        id="webhook-model"
        eyebrow="Model"
        title="Why Binboi works well for webhooks"
        description="Webhook providers do not care that your app is local. They only care that they can reach a public URL and that your service responds correctly."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>Binboi solves the public-reachability problem by giving your local handler a stable external URL.</p>
          <p>Once delivery is no longer blocked by localhost, the next job is to figure out whether the request reached the correct route and whether your app handled it correctly.</p>
          <p>That is where request metadata, relay logs, and webhook-specific debugging patterns become useful.</p>
        </div>

        <DocsCodeBlock
          title="Typical webhook tunnel"
          language="bash"
          code={`binboi start 3000 webhook-dev

# Example endpoint configured in a provider
https://webhook-dev.binboi.link/api/webhooks/stripe`}
        />
      </DocsSection>

      <DocsSection
        id="provider-examples"
        eyebrow="Examples"
        title="Realistic provider debugging scenarios"
        description="Different providers use different signatures and payload shapes, but the debugging questions are usually the same."
      >
        <DocsCardGrid columns={2}>
          <DocsCard
            eyebrow="Clerk"
            title="Auth events and Svix signatures"
            description="Inspect `svix-id`, `svix-timestamp`, and `svix-signature`, then verify your app uses the raw request body before signature verification."
            tone="cyan"
          />
          <DocsCard
            eyebrow="Neon"
            title="Database and branch automation"
            description="Use a local Binboi URL for project callbacks and compare the incoming JSON payload with the exact provisioning logic your app expected."
            tone="emerald"
          />
          <DocsCard
            eyebrow="Supabase"
            title="Auth and project webhooks"
            description="Confirm the target route, review provider headers, and check whether framework middleware rewrote or rejected the request before your handler ran."
          />
          <DocsCard
            eyebrow="Stripe"
            title="Payment event debugging"
            description="A stable tunnel plus request visibility makes it easier to diagnose `checkout.session.completed`, `invoice.paid`, and signature failures without deploying a preview app."
            tone="cyan"
          />
          <DocsCard
            eyebrow="GitHub"
            title="Repository and deployment hooks"
            description="Delivery IDs, event names, and retry timing matter. Binboi helps you prove that the callback reached the intended local route."
          />
          <DocsCard
            eyebrow="Linear"
            title="Issue and workflow events"
            description="Use the tunnel like any other webhook endpoint today, then layer provider-specific debugging guidance on top as the integration surface matures."
            tone="amber"
          />
        </DocsCardGrid>

        <DocsCodeBlock
          title="Stripe local example"
          language="bash"
          code={`binboi start 3000 stripe-events

# Configure Stripe to send events to:
https://stripe-events.binboi.link/webhooks/stripe

# Local checks
binboi whoami
grep STRIPE_WEBHOOK_SECRET .env`}
        />
      </DocsSection>

      <DocsSection
        id="debugging-patterns"
        eyebrow="Practice"
        title="Debugging patterns that work across providers"
        description="The provider changes, but the operator workflow stays consistent."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>First prove the tunnel is online and authenticated.</p>
          <p>Then verify the provider is sending to the expected path and host.</p>
          <p>Next inspect signature headers, raw-body handling, and any middleware that could interfere before the handler sees the request.</p>
          <p>Only after that should you dive into provider-specific payload semantics or application business logic.</p>
        </div>

        <DocsCallout title="Most webhook failures are not transport failures" tone="emerald">
          Once the provider can reach a Binboi URL, the usual problems are wrong route paths,
          signature handling, secret drift, raw-body parsing, or exceptions in your local app.
        </DocsCallout>
      </DocsSection>

      <DocsSection
        id="integration-direction"
        eyebrow="Product direction"
        title="How Binboi thinks about integrations"
        description="Provider integrations are about shortening time-to-debug, not just adding logos to the dashboard."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>A strong integration should include provider-aware setup instructions.</p>
          <p>It should show the relevant signature headers, common route shapes, and example payload expectations.</p>
          <p>Where the repository still provides generic tunnel behavior instead of one-click provider flows, the docs say so clearly and label the richer experience as MVP or planned.</p>
        </div>
      </DocsSection>
    </DocsPageShell>
  );
}
