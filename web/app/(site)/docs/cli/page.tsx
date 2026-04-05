"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Terminal, AlertTriangle } from "lucide-react";
import { ScrollReveal } from "../_components/scroll-reaval";
import { DocsToc } from "../_components/docs-toc";


const tocItems = [
  { id: "command-surface", title: "Command surface" },
  { id: "auth-commands", title: "Auth commands" },
  { id: "tunnel-commands", title: "Tunnel commands" },
  { id: "planned-commands", title: "Planned commands" },
  { id: "daily-workflow", title: "Daily workflow" },
];

export default function CliDocsPage() {
  return (
    <div className="flex gap-10 px-6 py-10 md:px-10 lg:px-16 max-w-7xl mx-auto">
      {/* Main content */}
      <article className="flex-1 min-w-0 space-y-16">
        {/* Header */}
        <ScrollReveal>
          <header className="space-y-4">
            <p className="text-sm font-medium text-primary tracking-wide uppercase">CLI</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight text-balance">
              The Binboi CLI, command by command.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              The CLI is intentionally compact, but the docs need to explain both the commands available today and the product-facing commands that are planned next. This guide does that without pretending unfinished commands already ship.
            </p>
          </header>
        </ScrollReveal>

        {/* Command Surface */}
        <ScrollReveal delay={0.05}>
          <section id="command-surface" className="scroll-mt-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Reference</p>
              <h2 className="text-2xl font-semibold text-foreground">Current CLI command surface</h2>
              <p className="text-muted-foreground">
                The table below distinguishes what is available in the repository today from commands that are documented as the intended product surface.
              </p>
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border bg-secondary/50">
                <span className="text-xs font-medium text-muted-foreground">CLI command overview</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-4 py-3 text-left font-medium text-foreground">Command</th>
                      <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-foreground">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-3"><code className="text-xs bg-secondary px-1.5 py-0.5 rounded">binboi login --token &lt;token&gt;</code></td>
                      <td className="px-4 py-3"><span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Available</span></td>
                      <td className="px-4 py-3 text-muted-foreground">Validate an access token and save it to local config.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><code className="text-xs bg-secondary px-1.5 py-0.5 rounded">binboi logout</code></td>
                      <td className="px-4 py-3"><span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">Planned</span></td>
                      <td className="px-4 py-3 text-muted-foreground">Will remove locally stored auth state.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><code className="text-xs bg-secondary px-1.5 py-0.5 rounded">binboi whoami</code></td>
                      <td className="px-4 py-3"><span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Available</span></td>
                      <td className="px-4 py-3 text-muted-foreground">Verify the active token and print the authenticated identity.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><code className="text-xs bg-secondary px-1.5 py-0.5 rounded">binboi http 3000</code></td>
                      <td className="px-4 py-3"><span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">Alias planned</span></td>
                      <td className="px-4 py-3 text-muted-foreground">Product-facing shorthand for HTTP tunnel. Today use <code className="text-xs bg-secondary px-1 rounded">binboi start</code>.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><code className="text-xs bg-secondary px-1.5 py-0.5 rounded">binboi tcp 5432</code></td>
                      <td className="px-4 py-3"><span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">Planned</span></td>
                      <td className="px-4 py-3 text-muted-foreground">Reserved for raw TCP exposure once production-ready.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><code className="text-xs bg-secondary px-1.5 py-0.5 rounded">binboi tunnels</code></td>
                      <td className="px-4 py-3"><span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">Planned</span></td>
                      <td className="px-4 py-3 text-muted-foreground">Will list active or reserved tunnels from the CLI.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3"><code className="text-xs bg-secondary px-1.5 py-0.5 rounded">binboi version</code></td>
                      <td className="px-4 py-3"><span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Available</span></td>
                      <td className="px-4 py-3 text-muted-foreground">Print the CLI version for support and packaging verification.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Auth Commands */}
        <ScrollReveal delay={0.1}>
          <section id="auth-commands" className="scroll-mt-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Authentication</p>
              <h2 className="text-2xl font-semibold text-foreground">Login, whoami, and local auth checks</h2>
              <p className="text-muted-foreground">
                The auth path is the most important CLI surface because every tunnel depends on it.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-secondary/30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/50">
                <span className="text-xs font-medium text-muted-foreground">Auth-focused commands</span>
                <Terminal className="w-4 h-4 text-muted-foreground/60" />
              </div>
              <pre className="p-4 text-sm overflow-x-auto">
                <code className="text-foreground/90">{`binboi login --token <dashboard-token>
binboi whoami
binboi version`}</code>
              </pre>
            </div>

            <div className="rounded-xl border border-border bg-card/50 p-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p><code className="text-xs bg-secondary px-1 rounded">binboi login</code> validates the token against the backend and writes it to local config.</p>
              <p><code className="text-xs bg-secondary px-1 rounded">binboi whoami</code> is the fastest way to prove that your saved token still works before debugging a failing tunnel.</p>
              <p><code className="text-xs bg-secondary px-1 rounded">binboi version</code> is intentionally simple because package managers and operator runbooks depend on predictable output.</p>
            </div>
          </section>
        </ScrollReveal>

        {/* Tunnel Commands */}
        <ScrollReveal delay={0.15}>
          <section id="tunnel-commands" className="scroll-mt-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Traffic</p>
              <h2 className="text-2xl font-semibold text-foreground">Running tunnels from the CLI</h2>
              <p className="text-muted-foreground">
                Today the working HTTP tunnel entrypoint is <code className="text-xs bg-secondary px-1 rounded">binboi start</code>, even though the product docs also describe the future <code className="text-xs bg-secondary px-1 rounded">binboi http</code> shape.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-secondary/30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/50">
                <span className="text-xs font-medium text-muted-foreground">Current working tunnel flow</span>
                <Terminal className="w-4 h-4 text-muted-foreground/60" />
              </div>
              <pre className="p-4 text-sm overflow-x-auto">
                <code className="text-foreground/90">{`binboi start 3000 my-app

# Intended future alias
binboi http 3000`}</code>
              </pre>
            </div>

            <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-400">Why document the alias?</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Because users naturally expect protocol-shaped commands such as <code className="text-xs bg-secondary px-1 rounded">http</code> and <code className="text-xs bg-secondary px-1 rounded">tcp</code>. The docs make that future direction visible, while still telling you exactly which command works today.
                </p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Planned Commands */}
        <ScrollReveal delay={0.2}>
          <section id="planned-commands" className="scroll-mt-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Roadmap</p>
              <h2 className="text-2xl font-semibold text-foreground">Documented commands that are still planned</h2>
              <p className="text-muted-foreground">
                Some commands matter enough to document now because they describe the intended product experience.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/50 p-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p><code className="text-xs bg-secondary px-1 rounded">binboi logout</code> should clear local credentials safely.</p>
              <p><code className="text-xs bg-secondary px-1 rounded">binboi tunnels</code> should list local and remote tunnel state without needing the dashboard.</p>
              <p><code className="text-xs bg-secondary px-1 rounded">binboi stop</code> should terminate a running tunnel in a clean, operator-friendly way.</p>
              <p><code className="text-xs bg-secondary px-1 rounded">binboi logs</code> should bridge the gap between raw relay events and request-specific visibility.</p>
              <p><code className="text-xs bg-secondary px-1 rounded">binboi regions</code> should become meaningful once the product grows beyond a single primary node.</p>
              <p><code className="text-xs bg-secondary px-1 rounded">binboi config</code> should provide a clearer interface for inspecting file-based and environment-based config.</p>
            </div>
          </section>
        </ScrollReveal>

        {/* Daily Workflow */}
        <ScrollReveal delay={0.25}>
          <section id="daily-workflow" className="scroll-mt-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Workflow</p>
              <h2 className="text-2xl font-semibold text-foreground">A realistic daily CLI workflow</h2>
              <p className="text-muted-foreground">
                Most developers do not need the whole command surface every day. They need a reliable sequence that tells them whether the environment is healthy.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-secondary/30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/50">
                <span className="text-xs font-medium text-muted-foreground">Typical daily routine</span>
                <Terminal className="w-4 h-4 text-muted-foreground/60" />
              </div>
              <pre className="p-4 text-sm overflow-x-auto">
                <code className="text-foreground/90">{`binboi whoami
binboi start 3000 local-dashboard
curl https://local-dashboard.binboi.link/health`}</code>
              </pre>
            </div>
          </section>
        </ScrollReveal>

        {/* Navigation */}
        <ScrollReveal delay={0.3}>
          <div className="flex items-center justify-between pt-8 border-t border-border">
            <Link
              href="/docs/authentication"
              className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Authentication
            </Link>
            <Link
              href="/docs/http-tunnels"
              className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              HTTP Tunnels
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
