import {
  DocsCallout,
  DocsCodeBlock,
  DocsPageShell,
  DocsSection,
  DocsTable,
  type TocItem,
} from "../_components/docs-primitives";

const toc: TocItem[] = [
  { id: "creating-keys", title: "Creating keys" },
  { id: "viewing-keys", title: "Viewing keys" },
  { id: "revoking-keys", title: "Revoking keys" },
  { id: "key-safety", title: "Key safety" },
];

export default function ApiKeysPage() {
  return (
    <DocsPageShell
      eyebrow="API Keys"
      title="Manage dashboard-issued access tokens for the Binboi CLI."
      description="The Access Tokens page is the lifecycle center for CLI credentials. It is where users create tokens, review their names and prefixes, monitor last-used time, and revoke access cleanly when a machine or workflow should no longer authenticate."
      toc={toc}
    >
      <DocsSection
        id="creating-keys"
        eyebrow="Create"
        title="Creating keys"
        description="A good API key workflow starts with clear ownership and naming."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>Create one token per machine, environment, or automation workflow.</p>
          <p>Use names that explain ownership, such as `Local M3 Air`, `Payments staging VM`, or `GitHub Actions smoke test`.</p>
          <p>Copy the full token immediately after creation because the product shows it only once.</p>
        </div>

        <DocsCodeBlock
          title="Use a newly created key"
          language="bash"
          code={`binboi login --token <new-token>
binboi whoami`}
        />
      </DocsSection>

      <DocsSection
        id="viewing-keys"
        eyebrow="Review"
        title="Viewing and managing keys"
        description="The dashboard should help you understand token lifecycle without exposing the full secret again."
      >
        <DocsTable
          title="Fields worth showing in the UI"
          columns={["Field", "Why it matters", "Example"]}
          rows={[
            ["Name", "Helps identify the owner or machine.", "`M2 MacBook`"],
            ["Prefix", "Safe partial identifier for support and debugging.", "`binboi_pat_2e9c4d93`"],
            ["Created time", "Useful for cleanup and audit review.", "`Mar 30, 2026 21:55`"],
            ["Last used", "Helps spot stale or forgotten credentials.", "`Apr 1, 2026 09:12`"],
            ["Status", "Shows whether the token is active or revoked.", "`ACTIVE`"],
          ]}
        />
      </DocsSection>

      <DocsSection
        id="revoking-keys"
        eyebrow="Revoke"
        title="Revoking keys"
        description="Revocation is the simplest way to recover from token sprawl, machine turnover, or leaked credentials."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>Revoke tokens when a machine is retired, reimaged, transferred, or no longer trusted.</p>
          <p>Revoke immediately if a token appears in screenshots, shell history, or shared chat logs.</p>
          <p>Prefer creating a replacement token rather than trying to keep one credential alive across too many environments.</p>
        </div>
      </DocsSection>

      <DocsSection
        id="key-safety"
        eyebrow="Safety"
        title="Security notes for API keys"
        description="The safest token workflow is usually the simplest one."
      >
        <DocsCallout title="Storage model" tone="emerald">
          Binboi stores token prefixes and secure hashes in the database, not the raw token. The
          full value is returned only once at creation time.
        </DocsCallout>

        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>Do not reuse the same token across every laptop, staging box, and CI runner.</p>
          <p>Use the dashboard list to identify old credentials before they become a liability.</p>
          <p>Use `binboi whoami` during support or onboarding to verify which account and plan a machine is authenticating as.</p>
        </div>
      </DocsSection>
    </DocsPageShell>
  );
}
