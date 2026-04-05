"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Zap, Terminal } from "lucide-react";
import { DocsToc } from "../_components/docs-toc";
import { ScrollReveal } from "../_components/scroll-reaval";


const tocItems = [
  { id: "http-model", title: "HTTP model" },
  { id: "public-url-mapping", title: "Public URL mapping" },
  { id: "forwarding-behavior", title: "Forwarding behavior" },
  { id: "common-examples", title: "Common examples" },
  { id: "mvp-limits", title: "MVP limits" },
];

export default function HttpTunnelsPage() {
  return (
    <div className="flex gap-10 px-6 py-10 md:px-10 lg:px-16 max-w-7xl mx-auto">
      {/* Main content */}
      <article className="flex-1 min-w-0 space-y-16">
        {/* Header */}
        <ScrollReveal>
          <header className="space-y-4">
            <p className="text-sm font-medium text-primary tracking-wide uppercase">HTTP Tunnels</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight text-balance">
              How Binboi exposes localhost over HTTP.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              HTTP tunnels are the clearest and strongest current Binboi surface. The relay maps a public host to a connected agent, forwards incoming HTTP traffic to your local target, and keeps enough tunnel context for the dashboard and logs to explain what happened.
            </p>
          </header>
        </ScrollReveal>

        {/* HTTP Model */}
        <ScrollReveal delay={0.05}>
          <section id="http-model" className="scroll-mt-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Model</p>
              <h2 className="text-2xl font-semibold text-foreground">How the HTTP tunnel model works</h2>
              <p className="text-muted-foreground">
                A tunnel is a route plus an active agent connection. When both exist, a public URL can behave like a front door to your local service.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/50 p-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>The public relay receives an inbound request and identifies the target tunnel by host.</p>
              <p>If the tunnel is active, the relay opens a stream over the existing agent session.</p>
              <p>The CLI forwards the request to your local target port and returns the upstream response to the client.</p>
            </div>

            <div className="rounded-xl border border-border bg-secondary/30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/50">
                <span className="text-xs font-medium text-muted-foreground">Basic HTTP tunnel</span>
                <Terminal className="w-4 h-4 text-muted-foreground/60" />
              </div>
              <pre className="p-4 text-sm overflow-x-auto">
                <code className="text-foreground/90">{`binboi start 3000 marketing-site

# Product-facing alias planned
binboi http 3000`}</code>
              </pre>
            </div>
          </section>
        </ScrollReveal>

        {/* Public URL Mapping */}
        <ScrollReveal delay={0.1}>
          <section id="public-url-mapping" className="scroll-mt-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Routing</p>
              <h2 className="text-2xl font-semibold text-foreground">How public URL mapping works</h2>
              <p className="text-muted-foreground">
                Binboi primarily routes HTTP traffic by host and subdomain.
              </p>
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border bg-secondary/50">
                <span className="text-xs font-medium text-muted-foreground">Routing concepts</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="px-4 py-3 text-left font-medium text-foreground">Concept</th>
                      <th className="px-4 py-3 text-left font-medium text-foreground">Meaning</th>
                      <th className="px-4 py-3 text-left font-medium text-foreground">Example</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground">Managed domain</td>
                      <td className="px-4 py-3 text-muted-foreground">The base domain used by the relay to generate public URLs.</td>
                      <td className="px-4 py-3"><code className="text-xs bg-secondary px-1.5 py-0.5 rounded">binboi.link</code></td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground">Subdomain</td>
                      <td className="px-4 py-3 text-muted-foreground">The tunnel-specific label mapped to your service.</td>
                      <td className="px-4 py-3"><code className="text-xs bg-secondary px-1.5 py-0.5 rounded">marketing-site</code></td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground">Public URL</td>
                      <td className="px-4 py-3 text-muted-foreground">The external URL clients can reach.</td>
                      <td className="px-4 py-3"><code className="text-xs bg-secondary px-1.5 py-0.5 rounded">https://marketing-site.binboi.link</code></td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground">Target</td>
                      <td className="px-4 py-3 text-muted-foreground">The local HTTP service the CLI forwards traffic to.</td>
                      <td className="px-4 py-3"><code className="text-xs bg-secondary px-1.5 py-0.5 rounded">http://127.0.0.1:3000</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Forwarding Behavior */}
        <ScrollReveal delay={0.15}>
          <section id="forwarding-behavior" className="scroll-mt-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Behavior</p>
              <h2 className="text-2xl font-semibold text-foreground">What forwarding looks like in practice</h2>
              <p className="text-muted-foreground">
                Once the relay has matched a public URL to an active tunnel, the forwarding behavior should feel simple and predictable.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/50 p-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>The relay preserves the original host and adds forwarding headers for upstream context.</p>
              <p>The tunnel is considered active only while a live agent session is attached.</p>
              <p>If the agent disconnects, the route may remain reserved but traffic will fail until the session returns.</p>
              <p>Request counts and transferred bytes can be aggregated at the tunnel level for dashboard reporting.</p>
            </div>
          </section>
        </ScrollReveal>

        {/* Common Examples */}
        <ScrollReveal delay={0.2}>
          <section id="common-examples" className="scroll-mt-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">Examples</p>
              <h2 className="text-2xl font-semibold text-foreground">Common HTTP tunnel examples</h2>
              <p className="text-muted-foreground">
                The best early use cases are the ones where deployment would be overkill but public reachability still matters.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-secondary/30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/50">
                <span className="text-xs font-medium text-muted-foreground">Examples</span>
                <Terminal className="w-4 h-4 text-muted-foreground/60" />
              </div>
              <pre className="p-4 text-sm overflow-x-auto">
                <code className="text-foreground/90">{`# Local admin tool
binboi start 3000 admin-tool

# Express API
binboi start 8080 internal-api

# Webhook receiver
binboi start 3000 stripe-events`}</code>
              </pre>
            </div>

            <div className="flex gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-emerald-400">Good first wins</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Webhook receivers, staging admin tools, browser-accessible QA previews, OAuth callback routes, and mobile-app callback testing are the best fits for Binboi&apos;s current HTTP tunnel model.
                </p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* MVP Limits */}
        <ScrollReveal delay={0.25}>
          <section id="mvp-limits" className="scroll-mt-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary/80 uppercase tracking-wider">MVP limits</p>
              <h2 className="text-2xl font-semibold text-foreground">Current HTTP tunnel limitations</h2>
              <p className="text-muted-foreground">
                The docs should describe the working path clearly without pretending the product is broader than it currently is.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/50 p-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>HTTP is the strongest runtime path in the repository today.</p>
              <p>Path-based routing across multiple local targets is not yet a polished first-class feature.</p>
              <p>Raw TCP is still planned and should not be treated as equally mature.</p>
              <p>Structured request inspection is evolving from relay events and tunnel metadata rather than a fully finished replay interface.</p>
            </div>
          </section>
        </ScrollReveal>

        {/* Navigation */}
        <ScrollReveal delay={0.3}>
          <div className="flex items-center justify-between pt-8 border-t border-border">
            <Link
              href="/docs/cli"
              className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              CLI Reference
            </Link>
            <Link
              href="/docs/webhooks"
              className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Webhooks
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
