"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Terminal, Info, AlertTriangle } from "lucide-react";
import { ScrollReveal } from "../_components/scroll-reaval";
import { DocsToc } from "../_components/docs-toc";


const tocItems = [
  { id: "token-model", title: "Token model" },
  { id: "dashboard-flow", title: "Dashboard flow" },
  { id: "login-command", title: "binboi login" },
  { id: "token-storage", title: "Storage and validation" },
  { id: "security-notes", title: "Security notes" },
];

export default function AuthenticationPage() {
  return (
    <div className="flex gap-10 px-6 py-10 md:px-10 lg:px-16 max-w-7xl mx-auto">
      {/* Main content */}
      <article className="flex-1 min-w-0 space-y-16">
        {/* Header */}
        <ScrollReveal>
          <header className="space-y-4">
            <p className="text-sm font-medium text-primary tracking-wide uppercase">Authentication</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight text-balance">
              Authenticate the CLI with dashboard-issued access tokens.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Binboi separates dashboard identity from CLI credentials. Users create access tokens in the dashboard, then use those tokens with <code className="text-sm bg-secondary px-1.5 py-0.5 rounded">binboi login</code> so the CLI can authenticate securely against the backend.
            </p>
          </header>
        </ScrollReveal>

        {/* Token Model */}
        <ScrollReveal delay={0.05}>
          <section id="token-model" className="scroll-mt-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Model</p>
              <h2 className="text-2xl font-semibold text-foreground">How access tokens work</h2>
              <p className="text-muted-foreground">
                The dashboard is where people sign in. The CLI is where machines authenticate. Access tokens are the bridge between those two ideas.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/50 p-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>Each token belongs to a user account and should usually represent one machine or workflow.</p>
              <p>When the CLI presents a token, the backend validates the token and returns account information through <code className="text-xs bg-secondary px-1 rounded">GET /api/v1/auth/me</code>.</p>
              <p>That same validation model is reused when the agent opens a tunnel session, so login and runtime auth share one coherent story.</p>
            </div>

            <div className="flex gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
              <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-cyan-400">Why this split matters</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A human signs in to the website. A machine uses a token. That separation makes revocation, auditing, and future RBAC much cleaner than a shared relay secret.
                </p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Dashboard Flow */}
        <ScrollReveal delay={0.1}>
          <section id="dashboard-flow" className="scroll-mt-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Dashboard</p>
              <h2 className="text-2xl font-semibold text-foreground">Create a token in the dashboard</h2>
              <p className="text-muted-foreground">
                The Access Tokens page is the operator-facing source of truth for CLI credentials.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/50 p-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>1. Open <code className="text-xs bg-secondary px-1 rounded">/dashboard/access-tokens</code>.</p>
              <p>2. Choose a clear token name such as <code className="text-xs bg-secondary px-1 rounded">M2 MacBook</code>, <code className="text-xs bg-secondary px-1 rounded">CI smoke runner</code>, or <code className="text-xs bg-secondary px-1 rounded">payments-staging VM</code>.</p>
              <p>3. Create the token and copy it immediately.</p>
              <p>4. Store it locally with <code className="text-xs bg-secondary px-1 rounded">binboi login --token &lt;token&gt;</code>.</p>
              <p>5. Use the dashboard list later to review token prefix, created time, last used time, and status.</p>
            </div>

            <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-400">One-time reveal rule</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The dashboard shows the full token only at creation time. After that, the UI exposes a safe prefix and lifecycle metadata, not the secret itself.
                </p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Login Command */}
        <ScrollReveal delay={0.15}>
          <section id="login-command" className="scroll-mt-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">CLI</p>
              <h2 className="text-2xl font-semibold text-foreground">How binboi login works</h2>
              <p className="text-muted-foreground">
                The login command validates the token first, then writes local auth state if the backend accepts it.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-secondary/30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/50">
                <span className="text-xs font-medium text-muted-foreground">Login and verify</span>
                <Terminal className="w-4 h-4 text-muted-foreground/60" />
              </div>
              <pre className="p-4 text-sm overflow-x-auto">
                <code className="text-foreground/90">{`binboi login --token <dashboard-token>
binboi whoami`}</code>
              </pre>
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border bg-secondary/50">
                <span className="text-xs font-medium text-muted-foreground">Token source precedence</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-4 py-3 text-left font-medium text-foreground">Source</th>
                      <th className="px-4 py-3 text-left font-medium text-foreground">When it is used</th>
                      <th className="px-4 py-3 text-left font-medium text-foreground">Why it exists</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-3"><code className="text-xs bg-secondary px-1.5 py-0.5 rounded">--token</code> flag</td>
                      <td className="px-4 py-3 text-muted-foreground">Highest priority</td>
                      <td className="px-4 py-3 text-muted-foreground">Best for copy-paste setup or explicit scripting.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><code className="text-xs bg-secondary px-1.5 py-0.5 rounded">BINBOI_AUTH_TOKEN</code></td>
                      <td className="px-4 py-3 text-muted-foreground">If no flag is provided</td>
                      <td className="px-4 py-3 text-muted-foreground">Useful in CI or non-interactive shell environments.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><code className="text-xs bg-secondary px-1.5 py-0.5 rounded">~/.binboi/config.json</code></td>
                      <td className="px-4 py-3 text-muted-foreground">Fallback</td>
                      <td className="px-4 py-3 text-muted-foreground">Best for day-to-day local development after one successful login.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Token Storage */}
        <ScrollReveal delay={0.2}>
          <section id="token-storage" className="scroll-mt-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Validation</p>
              <h2 className="text-2xl font-semibold text-foreground">How tokens are stored and validated</h2>
              <p className="text-muted-foreground">
                Binboi treats access tokens as secrets, not as a normal user-facing string to keep around forever.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/50 p-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>The database stores a token prefix and a secure hash, not the raw token.</p>
              <p>The CLI stores the raw token locally in <code className="text-xs bg-secondary px-1 rounded">~/.binboi/config.json</code> so it can authenticate later without asking you to paste the token every time.</p>
              <p>The backend compares the presented token against the stored hash after narrowing the search by prefix.</p>
            </div>
          </section>
        </ScrollReveal>

        {/* Security Notes */}
        <ScrollReveal delay={0.25}>
          <section id="security-notes" className="scroll-mt-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Security</p>
              <h2 className="text-2xl font-semibold text-foreground">Security notes worth keeping in mind</h2>
              <p className="text-muted-foreground">
                Token safety is mostly about disciplined handling rather than fancy ceremony.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/50 p-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>Use one token per machine or workflow so revocation stays precise.</p>
              <p>Do not paste full tokens into screenshots, team chats, or shell history you do not control.</p>
              <p>If a token leaks, revoke it in the dashboard immediately and create a new one.</p>
              <p>Use <code className="text-xs bg-secondary px-1 rounded">binboi whoami</code> before debugging tunnel failures so you can rule out auth drift early.</p>
            </div>
          </section>
        </ScrollReveal>

        {/* Navigation */}
        <ScrollReveal delay={0.3}>
          <div className="flex items-center justify-between pt-8 border-t border-border">
            <Link
              href="/docs/quick-start"
              className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Quick Start
            </Link>
            <Link
              href="/docs/cli"
              className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              CLI Reference
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>
      </article>

      {/* TOC Sidebar */}
      <DocsToc items={tocItems} />
    </div>
  );
}
