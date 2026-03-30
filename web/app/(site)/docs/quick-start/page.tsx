import {
  DocsCallout,
  DocsCodeBlock,
  DocsPageShell,
  DocsSection,
  type TocItem,
} from "../_components/docs-primitives";

const toc: TocItem[] = [
  { id: "before-you-start", title: "Before you start" },
  { id: "install-and-login", title: "Install and login" },
  { id: "first-http-tunnel", title: "First tunnel" },
  { id: "first-request-flow", title: "First request flow" },
  { id: "what-to-check-next", title: "What to check next" },
];

export default function QuickStartPage() {
  return (
    <DocsPageShell
      eyebrow="Quick Start"
      title="Install Binboi, log in, and expose your first local service."
      description="This guide is the shortest trustworthy path from a fresh machine to a working public URL. It assumes you already have a local web service listening on a port such as 3000."
      toc={toc}
    >
      <DocsSection
        id="before-you-start"
        eyebrow="Preparation"
        title="Before you start"
        description="You need three ingredients: a running local service, a Binboi dashboard token, and access to the relay you want the CLI to talk to."
      >
        <div className="rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>
            Make sure your local app is already reachable on
            {" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-[13px] text-zinc-100">
              localhost:&lt;port&gt;
            </code>
            {" "}
            before you introduce Binboi into the loop.
          </p>
          <p className="mt-3">If the app itself is not healthy, a tunnel will only make that failure public faster.</p>
        </div>

        <DocsCallout title="Typical starting point" tone="cyan">
          A Next.js app on port 3000, an Express API on 8080, or a webhook receiver route inside a local development server are the most common first-use cases.
        </DocsCallout>
      </DocsSection>

      <DocsSection
        id="install-and-login"
        eyebrow="Step 1"
        title="Install the CLI and authenticate once"
        description="The first successful Binboi session usually takes less than five minutes when the token flow is already available in the dashboard."
      >
        <DocsCodeBlock
          title="Install and authenticate"
          language="bash"
          code={`brew install binboi/tap/binboi
binboi login --token <dashboard-token>
binboi whoami`}
        />

        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>1. Install Binboi using the package path that fits your environment.</p>
          <p>2. Open the dashboard Access Tokens page and create a token for your machine.</p>
          <p>3. Copy the token immediately. The full token is shown only once.</p>
          <p>4. Run `binboi login --token &lt;token&gt;` so the CLI can validate the credential and write it to `~/.binboi/config.json`.</p>
          <p>5. Run `binboi whoami` to confirm the API URL, token, and local config all agree.</p>
        </div>
      </DocsSection>

      <DocsSection
        id="first-http-tunnel"
        eyebrow="Step 2"
        title="Start your first HTTP tunnel"
        description="Once you are authenticated, the practical move is to expose one local service with a named subdomain."
      >
        <DocsCodeBlock
          title="Open a public URL for localhost"
          language="bash"
          code={`binboi start 3000 my-app

# Product-facing alias planned
binboi http 3000`}
          note="The working command in the current repository is `binboi start`. The docs mention `binboi http` because it is the likely long-term ergonomic command shape."
        />

        <div className="rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>When the agent connects successfully, Binboi prints a public URL and keeps the tunnel session online.</p>
          <p className="mt-3">That URL now behaves like a public front door for your local process. Browsers, webhook providers, CI jobs, or teammates can hit it while your app continues to run on your machine.</p>
        </div>
      </DocsSection>

      <DocsSection
        id="first-request-flow"
        eyebrow="Step 3"
        title="Understand the first successful request flow"
        description="A healthy first request confirms more than just network reachability. It proves the token, relay, agent, and local service are all aligned."
      >
        <DocsCodeBlock
          title="Verify the end-to-end path"
          language="bash"
          code={`curl https://my-app.binboi.link/health
curl http://127.0.0.1:3000/health`}
        />

        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>1. A client hits the Binboi public URL.</p>
          <p>2. The relay matches the incoming host to the reserved tunnel record.</p>
          <p>3. The relay opens a stream over the connected agent session.</p>
          <p>4. The CLI forwards the request to your local service on port 3000.</p>
          <p>5. Your app responds, and the response travels back through the same path to the client.</p>
        </div>

        <DocsCallout title="If the public URL fails but localhost works" tone="amber">
          The problem is usually auth, relay connectivity, or target-port mismatch. It is much
          less often the provider or browser itself.
        </DocsCallout>
      </DocsSection>

      <DocsSection
        id="what-to-check-next"
        eyebrow="Step 4"
        title="What to check next"
        description="Once the first tunnel is healthy, the best next step depends on what you are building."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>If you are receiving callbacks from third parties, move next to the Webhooks guide.</p>
          <p>If you need to explain failures or latency, open the Requests and Logs guides.</p>
          <p>If the token flow felt confusing, read the Authentication and API Keys guides before scaling to more machines.</p>
        </div>
      </DocsSection>
    </DocsPageShell>
  );
}
