import {
  DocsCallout,
  DocsCodeBlock,
  DocsPageShell,
  DocsSection,
  type TocItem,
} from "../_components/docs-primitives";

const toc: TocItem[] = [
  { id: "invalid-token", title: "Invalid token" },
  { id: "tunnel-offline", title: "Tunnel offline" },
  { id: "forwarding-issues", title: "Forwarding issues" },
  { id: "response-errors", title: "404 and 500 errors" },
  { id: "webhook-problems", title: "Webhook problems" },
  { id: "network-issues", title: "Network and region issues" },
];

export default function TroubleshootingPage() {
  return (
    <DocsPageShell
      eyebrow="Troubleshooting"
      title="Fix the most common Binboi failures without guessing."
      description="Most tunnel problems reduce to a few buckets: authentication failure, relay connectivity, target-port mismatch, application-level errors, or provider-specific webhook confusion. This guide walks those buckets in a practical order."
      toc={toc}
    >
      <DocsSection
        id="invalid-token"
        eyebrow="Auth"
        title="Invalid token or login failure"
        description="If the CLI cannot authenticate, nothing after that matters."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>Run `binboi whoami` first to confirm the active token still works.</p>
          <p>If that fails, create a new token in the dashboard and run `binboi login --token &lt;token&gt;` again.</p>
          <p>Confirm `BINBOI_API_URL` points to the correct control plane if you are using a self-hosted or non-default environment.</p>
        </div>
      </DocsSection>

      <DocsSection
        id="tunnel-offline"
        eyebrow="Connectivity"
        title="Tunnel is offline or never connects"
        description="A reserved tunnel is not the same thing as an active tunnel."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>Make sure the CLI is still running and has not exited after printing the public URL.</p>
          <p>Verify that `BINBOI_SERVER_ADDR` points at the correct relay tunnel listener.</p>
          <p>Check the relay logs for authentication rejection or session attach failures.</p>
        </div>
      </DocsSection>

      <DocsSection
        id="forwarding-issues"
        eyebrow="Upstream"
        title="Request is not reaching the local app"
        description="If the tunnel exists but the app never sees traffic, the usual culprit is the target service rather than the public URL."
      >
        <DocsCodeBlock
          title="Fast local checks"
          language="bash"
          code={`binboi whoami
curl http://127.0.0.1:3000/health
binboi http 3000 my-app`}
        />

        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>Make sure the app is listening on the same port you passed to Binboi.</p>
          <p>Check whether the app binds only to a container network interface or to a different host than `127.0.0.1`.</p>
          <p>If `curl localhost` fails locally, fix the application first before debugging the relay.</p>
        </div>
      </DocsSection>

      <DocsSection
        id="response-errors"
        eyebrow="Responses"
        title="404 and 500 errors"
        description="These errors mean different things, and treating them the same wastes time."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>A 404 often suggests the host or route path did not match what your app expects.</p>
          <p>A 500 usually means the request reached your application and the application failed internally.</p>
          <p>Use request inspection or logs to determine whether the route mismatch happened at the relay or inside your framework router.</p>
        </div>
      </DocsSection>

      <DocsSection
        id="webhook-problems"
        eyebrow="Providers"
        title="Webhook signature and payload confusion"
        description="Webhook failures often look mysterious until you separate delivery from verification."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>Confirm the provider is posting to the correct Binboi URL and route path.</p>
          <p>Check the signing secret used locally and compare it to the provider configuration.</p>
          <p>Verify that your framework is exposing the raw body if the provider signs the raw payload.</p>
          <p>Review middleware ordering for anything that could mutate the request before signature verification.</p>
        </div>

        <DocsCallout title="Most common mistake" tone="amber">
          Developers often blame the tunnel when the real problem is body parsing or a stale
          signing secret. If the request arrived, the transport already did its job.
        </DocsCallout>
      </DocsSection>

      <DocsSection
        id="network-issues"
        eyebrow="Network"
        title="Region or connectivity issues"
        description="When the basics look correct but traffic still feels unreliable, look at the network path."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>Reduce variables first: avoid VPN edge cases, corporate proxies, or unusual local firewall rules.</p>
          <p>Keep relay and operator reasonably close together, especially when debugging providers with tighter timeouts.</p>
          <p>Start with a single known-good node before expanding to more regions or operators.</p>
        </div>
      </DocsSection>
    </DocsPageShell>
  );
}
