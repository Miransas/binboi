import {
  DocsCallout,
  DocsCodeBlock,
  DocsPageShell,
  DocsSection,
  DocsTable,
  type TocItem,
} from "../_components/docs-primitives";

const toc: TocItem[] = [
  { id: "token-model", title: "Token model" },
  { id: "dashboard-flow", title: "Dashboard flow" },
  { id: "login-command", title: "binboi login" },
  { id: "token-storage", title: "Storage and validation" },
  { id: "security-notes", title: "Security notes" },
];

export default function AuthenticationPage() {
  return (
    <DocsPageShell
      eyebrow="Authentication"
      title="Authenticate the CLI with dashboard-issued access tokens."
      description="Binboi separates dashboard identity from CLI credentials. Users create access tokens in the dashboard, then use those tokens with `binboi login` so the CLI can authenticate securely against the backend."
      toc={toc}
    >
      <DocsSection
        id="token-model"
        eyebrow="Model"
        title="How access tokens work"
        description="The dashboard is where people sign in. The CLI is where machines authenticate. Access tokens are the bridge between those two ideas."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>Each token belongs to a user account and should usually represent one machine or workflow.</p>
          <p>When the CLI presents a token, the backend validates the token and returns account information through `GET /api/v1/auth/me`.</p>
          <p>That same validation model is reused when the agent opens a tunnel session, so login and runtime auth share one coherent story.</p>
        </div>

        <DocsCallout title="Why this split matters" tone="cyan">
          A human signs in to the website. A machine uses a token. That separation makes
          revocation, auditing, and future RBAC much cleaner than a shared relay secret.
        </DocsCallout>
      </DocsSection>

      <DocsSection
        id="dashboard-flow"
        eyebrow="Dashboard"
        title="Create a token in the dashboard"
        description="The Access Tokens page is the operator-facing source of truth for CLI credentials."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>1. Open `/dashboard/access-tokens`.</p>
          <p>2. Choose a clear token name such as `M2 MacBook`, `CI smoke runner`, or `payments-staging VM`.</p>
          <p>3. Create the token and copy it immediately.</p>
          <p>4. Store it locally with `binboi login --token &lt;token&gt;`.</p>
          <p>5. Use the dashboard list later to review token prefix, created time, last used time, and status.</p>
        </div>

        <DocsCallout title="One-time reveal rule" tone="amber">
          The dashboard shows the full token only at creation time. After that, the UI exposes a
          safe prefix and lifecycle metadata, not the secret itself.
        </DocsCallout>
      </DocsSection>

      <DocsSection
        id="login-command"
        eyebrow="CLI"
        title="How `binboi login` works"
        description="The login command validates the token first, then writes local auth state if the backend accepts it."
      >
        <DocsCodeBlock
          title="Login and verify"
          language="bash"
          code={`binboi login --token <dashboard-token>
binboi whoami`}
        />

        <DocsTable
          title="Token source precedence"
          columns={["Source", "When it is used", "Why it exists"]}
          rows={[
            ["`--token` flag", "Highest priority", "Best for copy-paste setup or explicit scripting."],
            ["`BINBOI_AUTH_TOKEN`", "If no flag is provided", "Useful in CI or non-interactive shell environments."],
            ["`~/.binboi/config.json`", "Fallback", "Best for day-to-day local development after one successful login."],
          ]}
        />
      </DocsSection>

      <DocsSection
        id="token-storage"
        eyebrow="Validation"
        title="How tokens are stored and validated"
        description="Binboi treats access tokens as secrets, not as a normal user-facing string to keep around forever."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>The database stores a token prefix and a secure hash, not the raw token.</p>
          <p>The CLI stores the raw token locally in `~/.binboi/config.json` so it can authenticate later without asking you to paste the token every time.</p>
          <p>The backend compares the presented token against the stored hash after narrowing the search by prefix.</p>
        </div>
      </DocsSection>

      <DocsSection
        id="security-notes"
        eyebrow="Security"
        title="Security notes worth keeping in mind"
        description="Token safety is mostly about disciplined handling rather than fancy ceremony."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>Use one token per machine or workflow so revocation stays precise.</p>
          <p>Do not paste full tokens into screenshots, team chats, or shell history you do not control.</p>
          <p>If a token leaks, revoke it in the dashboard immediately and create a new one.</p>
          <p>Use `binboi whoami` before debugging tunnel failures so you can rule out auth drift early.</p>
        </div>
      </DocsSection>
    </DocsPageShell>
  );
}
