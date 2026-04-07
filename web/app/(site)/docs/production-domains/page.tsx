"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const toc = [
  { id: "preflight", title: "Preflight" },
  { id: "tls-mode", title: "TLS mode" },
  { id: "dns", title: "DNS" },
  { id: "verification", title: "Verification" },
  { id: "decision", title: "Launch rule" },
];

export default function ProductionDomainsPage() {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0% -35% 0%", threshold: 0.45 },
    );

    toc.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 selection:bg-cyan-500/20 selection:text-cyan-100">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:flex lg:gap-x-12">
        <main className="flex-1 lg:max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-500">Operations</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Roll out real domains one host at a time.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Production domain rollout is safest when DNS, TXT verification,
              TLS readiness, and public HTTPS are validated per host instead of
              assumed from one successful example.
            </p>
          </motion.div>

          <section id="preflight" className="mb-24 scroll-mt-20">
            <div className="mb-8 border-l border-zinc-800 pl-6">
              <h2 className="text-2xl font-semibold text-white">Preflight</h2>
              <p className="mt-2 text-zinc-400">Do not touch production DNS before these are true.</p>
            </div>
            <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>The Go control plane builds and starts cleanly.</p>
              <p><code className="text-cyan-400">BINBOI_BASE_DOMAIN</code> is final.</p>
              <p>The proxy address is reachable from the chosen ingress or edge.</p>
              <p>If Binboi will terminate TLS itself, ACME envs and persistent cache storage are ready.</p>
              <p>Preview mode is disabled in production-like environments.</p>
            </div>
          </section>

          <section id="tls-mode" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Pick one TLS owner</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-black/30">
              <div className="grid gap-px bg-zinc-800 sm:grid-cols-2">
                <div className="bg-zinc-950 p-5">
                  <div className="text-sm font-medium text-white">external-edge</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Use this when Caddy, Nginx, Traefik, or a cloud load balancer terminates HTTPS before Binboi.
                  </p>
                </div>
                <div className="bg-zinc-950 p-5">
                  <div className="text-sm font-medium text-white">acme</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Use this when Binboi owns certificate issuance through <code className="text-cyan-400">BINBOI_PROXY_TLS_ADDR</code>.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="dns" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">DNS expectations</h2>
            <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>Point the base domain or wildcard entry at the public Binboi proxy target.</p>
              <p>For each custom domain, point the host to the same public target and publish the exact TXT value returned by Binboi.</p>
              <p>Track each domain separately. Do not merge three domains into one mental status check.</p>
            </div>
          </section>

          <section id="verification" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Per-domain verification</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-black/35">
              <div className="border-b border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">Checks</div>
              <pre className="overflow-x-auto px-4 py-5 text-sm leading-7 text-zinc-300">
                <code>{`curl -s -H 'Authorization: Bearer <token>' \\
  http://127.0.0.1:8080/api/v1/domains

curl -s -H 'Authorization: Bearer <token>' \\
  'http://127.0.0.1:8080/api/v1/events?action=domain.verify&limit=50'

curl -I https://your-domain.example.com`}</code>
              </pre>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ["status", "Look for VERIFIED."],
                ["tls_ready", "Must be true before public trust."],
                ["last_verification_error", "Should be empty after success."],
                ["last_verification_check_at", "Should move recently if the worker is healthy."],
                ["https", "The certificate and host response should match the requested domain."],
                ["audit", "domain.verify should appear in the event feed and export."],
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                  <div className="text-sm font-medium text-white">{title}</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="decision" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Launch rule</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                <div className="text-sm font-medium text-white">Green-light</div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  All intended domains resolve correctly, verify cleanly, show the expected TLS mode, and succeed over HTTPS.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                <div className="text-sm font-medium text-white">Stop launch</div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  The base domain fails, domains stay pending, TLS mode is inconsistent, or HTTPS is broken on intended launch hosts.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-24">
            <h2 className="text-2xl font-semibold text-white">Related guides</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["/docs/domains-and-tls", "Domains & TLS", "Understand the model before applying a per-host rollout sheet."],
                ["/docs/deploy-readiness", "Deploy Readiness", "Fold domain rollout into the final go or no-go decision."],
                ["/docs/staging-runbook", "Staging Runbook", "Use the same host validation pattern earlier in staging."],
                ["/docs/smoke-testing", "Smoke Testing", "Run the short validation path after DNS and HTTPS look healthy."],
              ].map(([href, title, description]) => (
                <Link key={href} href={href} className="rounded-2xl border border-zinc-800 bg-zinc-900/25 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-900/40">
                  <div className="text-sm font-medium text-white">{title}</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <aside className="hidden lg:block lg:w-64">
          <div className="sticky top-16">
            <div className="mb-6 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500">On this page</div>
            <nav className="relative">
              <div className="absolute left-0 top-0 h-full w-px bg-zinc-800" />
              <ul className="space-y-4">
                {toc.map((item) => (
                  <li key={item.id} className="relative pl-6">
                    {activeId === item.id ? <motion.div layoutId="production-domains-active" className="absolute left-0 top-0 h-full w-0.5 bg-cyan-500" /> : null}
                    <button
                      onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
                      className={activeId === item.id ? "text-left text-sm font-medium text-cyan-400" : "text-left text-sm text-zinc-500 transition-colors hover:text-zinc-300"}
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
}
