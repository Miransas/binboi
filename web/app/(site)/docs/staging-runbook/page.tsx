"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const toc = [
  { id: "topology", title: "Topology" },
  { id: "env", title: "Required env" },
  { id: "order", title: "Order" },
  { id: "verification", title: "Verification" },
  { id: "go-no-go", title: "Go / no-go" },
];

export default function StagingRunbookPage() {
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
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-500">Deployment</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Bring staging up in a strict, repeatable order.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              The staging runbook is the shortest serious path from empty infra
              to a real token, real tunnel, real public request, and visible
              request or audit history.
            </p>
          </motion.div>

          <section id="topology" className="mb-24 scroll-mt-20">
            <div className="mb-8 border-l border-zinc-800 pl-6">
              <h2 className="text-2xl font-semibold text-white">Minimum staging topology</h2>
              <p className="mt-2 text-zinc-400">Keep the moving parts explicit.</p>
            </div>
            <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>One Go control plane service</p>
              <p>One Next.js web app service</p>
              <p>One Postgres database</p>
              <p>One public base domain and one ingress or load balancer</p>
            </div>
          </section>

          <section id="env" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Required environment</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                <div className="text-sm font-medium text-white">Go control plane</div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  <code className="text-cyan-400">BINBOI_AUTH_DATABASE_URL</code>,
                  <code className="ml-1 text-cyan-400">BINBOI_BASE_DOMAIN</code>,
                  <code className="ml-1 text-cyan-400">BINBOI_PUBLIC_SCHEME=https</code>,
                  and preview mode disabled.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                <div className="text-sm font-medium text-white">Web app</div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  <code className="text-cyan-400">DATABASE_URL</code>,
                  <code className="ml-1 text-cyan-400">AUTH_SECRET</code>,
                  and
                  <code className="ml-1 text-cyan-400">BINBOI_API_BASE</code>.
                </p>
              </div>
            </div>
          </section>

          <section id="order" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Order of operations</h2>
            <div className="mt-6 space-y-4">
              {[
                "Start Postgres.",
                "Start the Go control plane.",
                "Start the Next.js app.",
                "Verify /api/v1/health and /api/v1/instance.",
                "Verify login and dashboard access.",
                "Create one access token.",
                "Run CLI whoami.",
                "Open one tunnel.",
                "Hit the public URL.",
                "Confirm request and event visibility.",
              ].map((line, index) => (
                <div key={line} className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/25 p-5">
                  <div className="mt-0.5 text-xs font-medium text-cyan-500">{String(index + 1).padStart(2, "0")}</div>
                  <p className="text-sm leading-6 text-zinc-300">{line}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="verification" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Verification commands</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-black/35">
              <div className="border-b border-zinc-800 px-4 py-3 text-[11px] uppercase tracking-[0.24em] text-zinc-500">Staging checks</div>
              <pre className="overflow-x-auto px-4 py-5 text-sm leading-7 text-zinc-300">
                <code>{`curl -s https://api.binboi.example.com/api/v1/health
curl -s https://api.binboi.example.com/api/v1/instance

BINBOI_API_URL=https://api.binboi.example.com \\
  binboi whoami --token <token>

BINBOI_AUTH_TOKEN=<token> \\
BINBOI_API_URL=https://api.binboi.example.com \\
BINBOI_SERVER_ADDR=binboi.example.com:8081 \\
  binboi http 3000 demo`}</code>
              </pre>
            </div>
          </section>

          <section id="go-no-go" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Go / no-go rules</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                <div className="text-sm font-medium text-white">Go</div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Auth works, token creation works, whoami works, tunnel opens,
                  public forwarding works, and requests or events persist.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
                <div className="text-sm font-medium text-white">No-go</div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Preview mode is still required, public forwarding fails, feeds
                  stay empty, or custom domains never leave pending.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-24">
            <h2 className="text-2xl font-semibold text-white">Related guides</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["/docs/environments", "Environments", "Confirm you are really in staging and not drifting into preview assumptions."],
                ["/docs/deploy-readiness", "Deploy Readiness", "Use the broader launch checklist once the runbook is green."],
                ["/docs/smoke-testing", "Smoke Testing", "Reuse the fast validation loop during and after staging bring-up."],
                ["/docs/production-domains", "Production Domains", "Add real-host rollout checks when staging includes custom domains."],
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
                    {activeId === item.id ? <motion.div layoutId="staging-runbook-active" className="absolute left-0 top-0 h-full w-0.5 bg-cyan-500" /> : null}
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
