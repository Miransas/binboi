"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const toc = [
  { id: "domain-flow", title: "Domain flow" },
  { id: "verification", title: "Verification" },
  { id: "tls-modes", title: "TLS modes" },
  { id: "rollout", title: "Rollout checks" },
];

export default function DomainsAndTLSPage() {
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
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-500">
              Operations
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Bring custom domains online without guessing where TLS lives.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Binboi supports managed base-domain routing, custom domain
              verification, and optional ACME termination. The main operator
              mistake is mixing up domain verification with TLS mode selection.
            </p>
          </motion.div>

          <section id="domain-flow" className="mb-24 scroll-mt-20">
            <div className="mb-8 border-l border-zinc-800 pl-6">
              <h2 className="text-2xl font-semibold text-white">The domain flow</h2>
              <p className="mt-2 text-zinc-400">
                Verification and TLS are related, but they are not the same step.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Create the custom domain record in Binboi.",
                "Publish the TXT value returned in expected_txt.",
                "Wait for the background domain verifier or trigger manual verify.",
                "Confirm the domain becomes VERIFIED in the API.",
                "Then confirm TLS mode and HTTPS behavior for the host.",
              ].map((line, index) => (
                <div key={line} className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/25 p-5">
                  <div className="mt-0.5 text-xs font-medium text-cyan-500">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <p className="text-sm leading-6 text-zinc-300">{line}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="verification" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Verification fields to watch</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["status", "Look for VERIFIED once TXT validation succeeds."],
                ["expected_txt", "The TXT value that must exist before validation can succeed."],
                ["last_verification_check_at", "Useful for deciding whether the worker is actually running."],
                ["last_verification_error", "The fastest explanation when the domain is still pending."],
                ["tls_ready", "Whether the host is ready for the selected TLS path."],
                ["tls_mode", "acme when Binboi terminates TLS, external-edge otherwise."],
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                  <div className="text-sm font-medium text-white">{title}</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-black/35">
              <div className="border-b border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Useful checks
              </div>
              <pre className="overflow-x-auto px-4 py-5 text-sm leading-7 text-zinc-300">
                <code>{`GET /api/v1/domains
GET /api/v1/events?action=domain.verify&limit=20`}</code>
              </pre>
            </div>
          </section>

          <section id="tls-modes" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Choose one TLS owner</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-black/30">
              <div className="grid gap-px bg-zinc-800 sm:grid-cols-2">
                <div className="bg-zinc-950 p-5">
                  <div className="text-sm font-medium text-white">external-edge</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Use this when your ingress, load balancer, or edge proxy
                    terminates HTTPS before traffic reaches Binboi.
                  </p>
                </div>
                <div className="bg-zinc-950 p-5">
                  <div className="text-sm font-medium text-white">acme</div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Use this when Binboi itself owns certificate issuance through
                    <code className="mx-1 text-cyan-400">BINBOI_PROXY_TLS_ADDR</code>.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>
                If ACME is enabled, the host policy accepts the base domain,
                subdomains under the managed base domain, and verified custom
                domains.
              </p>
              <p>
                If ACME is not enabled, the readiness check reports TLS as
                external and Binboi expects HTTPS to terminate before the proxy.
              </p>
            </div>
          </section>

          <section id="rollout" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Rollout checks before public traffic</h2>
            <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>Verify every real domain individually. Do not rely on one successful host.</p>
              <p>
                For each domain, confirm:
                <code className="mx-1 text-cyan-400">status=VERIFIED</code>,
                <code className="mx-1 text-cyan-400">tls_ready=true</code>,
                and the correct
                <code className="mx-1 text-cyan-400">tls_mode</code>.
              </p>
              <p>
                If ACME is enabled, hit the host over HTTPS and confirm the
                certificate actually issues. If you terminate TLS externally,
                validate the external edge separately.
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-black/35">
              <div className="border-b border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                Production check
              </div>
              <pre className="overflow-x-auto px-4 py-5 text-sm leading-7 text-zinc-300">
                <code>{`curl -s -H 'Authorization: Bearer <token>' \\
  http://127.0.0.1:9080/api/v1/domains

curl -s -H 'Authorization: Bearer <token>' \\
  'http://127.0.0.1:9080/api/v1/events?action=domain.verify&limit=20'`}</code>
              </pre>
            </div>
          </section>

          <section className="mb-24">
            <h2 className="text-2xl font-semibold text-white">Related guides</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["/docs/production-domains", "Production Domains", "Use the per-host launch sheet once DNS and TLS work look real."],
                ["/docs/readiness", "Readiness", "See how the domain verifier affects deploy safety."],
                ["/docs/deploy-readiness", "Deploy Readiness", "Fit domains and TLS into the broader launch checklist."],
                ["/docs/operator-snapshot", "Operator Snapshot", "Check recent domain.verify failures and tunnel state together."],
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
            <div className="mb-6 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-500">
              On this page
            </div>
            <nav className="relative">
              <div className="absolute left-0 top-0 h-full w-px bg-zinc-800" />
              <ul className="space-y-4">
                {toc.map((item) => (
                  <li key={item.id} className="relative pl-6">
                    {activeId === item.id ? (
                      <motion.div
                        layoutId="domains-tls-active"
                        className="absolute left-0 top-0 h-full w-0.5 bg-cyan-500"
                      />
                    ) : null}
                    <button
                      onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
                      className={
                        activeId === item.id
                          ? "text-left text-sm font-medium text-cyan-400"
                          : "text-left text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                      }
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
