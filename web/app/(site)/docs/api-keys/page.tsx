
import Link from "next/link";
import { DocsToc, TocItem } from "../_components/docs-toc";

const toc: TocItem[] = [
  { id: "creating-keys", title: "Creating keys" },
  { id: "viewing-keys", title: "Viewing keys" },
  { id: "revoking-keys", title: "Revoking keys" },
  { id: "key-safety", title: "Key safety" },
];

export default function AccessTokensPage() {
  return (
    <div className="flex gap-8 w-full max-w-7xl mx-auto px-6 py-12">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm font-medium text-primary mb-2">API Keys</p>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Manage dashboard-issued access tokens for the Binboi CLI.
          </h1>
          <p className="text-lg text-muted-foreground">
            The Access Tokens page is the lifecycle center for CLI credentials. It is where users create tokens, review their names and prefixes, monitor last-used time, and revoke access cleanly when a machine or workflow should no longer authenticate.
          </p>
        </div>

        {/* Creating keys section */}
        <section id="creating-keys" className="mb-12 scroll-mt-24">
          <div className="mb-6">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Create</p>
            <h2 className="text-2xl font-bold text-foreground mb-2">Creating keys</h2>
            <p className="text-muted-foreground">A good API key workflow starts with clear ownership and naming.</p>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-card/50 p-5 text-sm leading-7 text-foreground/80 mb-6">
            <p>Create one token per machine, environment, or automation workflow.</p>
            <p>Use names that explain ownership, such as `Local M3 Air`, `Payments staging VM`, or `GitHub Actions smoke test`.</p>
            <p>Copy the full token immediately after creation because the product shows it only once.</p>
          </div>

          <div className="mb-6">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-3">Use a newly created key</p>
            <pre className="bg-secondary rounded-lg p-4 overflow-x-auto text-sm">
              <code className="text-foreground/90 font-mono">
{`binboi login --token <new-token>
binboi whoami`}
              </code>
            </pre>
          </div>
        </section>

        {/* Viewing keys section */}
        <section id="viewing-keys" className="mb-12 scroll-mt-24">
          <div className="mb-6">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Review</p>
            <h2 className="text-2xl font-bold text-foreground mb-2">Viewing and managing keys</h2>
            <p className="text-muted-foreground">The dashboard should help you understand token lifecycle without exposing the full secret again.</p>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Field</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Why it matters</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 text-foreground">Name</td>
                  <td className="py-3 px-4 text-muted-foreground">Helps identify the owner or machine.</td>
                  <td className="py-3 px-4 text-foreground/70 font-mono text-xs">`M2 MacBook`</td>
                </tr>
                <tr className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 text-foreground">Prefix</td>
                  <td className="py-3 px-4 text-muted-foreground">Safe partial identifier for support and debugging.</td>
                  <td className="py-3 px-4 text-foreground/70 font-mono text-xs">`binboi_pat_2e9c4d93`</td>
                </tr>
                <tr className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 text-foreground">Created time</td>
                  <td className="py-3 px-4 text-muted-foreground">Useful for cleanup and audit review.</td>
                  <td className="py-3 px-4 text-foreground/70 font-mono text-xs">`Mar 30, 2026 21:55`</td>
                </tr>
                <tr className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 text-foreground">Last used</td>
                  <td className="py-3 px-4 text-muted-foreground">Helps spot stale or forgotten credentials.</td>
                  <td className="py-3 px-4 text-foreground/70 font-mono text-xs">`Apr 1, 2026 09:12`</td>
                </tr>
                <tr className="hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 text-foreground">Status</td>
                  <td className="py-3 px-4 text-muted-foreground">Shows whether the token is active or revoked.</td>
                  <td className="py-3 px-4 text-foreground/70 font-mono text-xs">`ACTIVE`</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Revoking keys section */}
        <section id="revoking-keys" className="mb-12 scroll-mt-24">
          <div className="mb-6">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Revoke</p>
            <h2 className="text-2xl font-bold text-foreground mb-2">Revoking keys</h2>
            <p className="text-muted-foreground">Revocation is the simplest way to recover from token sprawl, machine turnover, or leaked credentials.</p>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-card/50 p-5 text-sm leading-7 text-foreground/80">
            <p>Revoke tokens when a machine is retired, reimaged, transferred, or no longer trusted.</p>
            <p>Revoke immediately if a token appears in screenshots, shell history, or shared chat logs.</p>
            <p>Prefer creating a replacement token rather than trying to keep one credential alive across too many environments.</p>
          </div>
        </section>

        {/* Key safety section */}
        <section id="key-safety" className="mb-12 scroll-mt-24">
          <div className="mb-6">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Safety</p>
            <h2 className="text-2xl font-bold text-foreground mb-2">Security notes for API keys</h2>
            <p className="text-muted-foreground">The safest token workflow is usually the simplest one.</p>
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 mb-6 text-sm">
            <p className="font-semibold text-primary mb-2">Storage model</p>
            <p className="text-foreground/80 leading-7">
              Binboi stores token prefixes and secure hashes in the database, not the raw token. The full value is returned only once at creation time.
            </p>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-card/50 p-5 text-sm leading-7 text-foreground/80">
            <p>Do not reuse the same token across every laptop, staging box, and CI runner.</p>
            <p>Use the dashboard list to identify old credentials before they become a liability.</p>
            <p>Use `binboi whoami` during support or onboarding to verify which account and plan a machine is authenticating as.</p>
          </div>
        </section>
      </div>

      {/* Sticky TOC */}
      <DocsToc items={toc} />
    </div>
  );
}