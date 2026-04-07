"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const toc = [
  { id: "preview", title: "Local preview" },
  { id: "full-stack", title: "Local full-stack" },
  { id: "staging", title: "Shared staging" },
  { id: "production", title: "Production-like" },
];

export default function EnvironmentsPage() {
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
              Choose the right Binboi environment before you debug the wrong thing.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Binboi behaves differently in preview, full-stack, staging, and
              production-like setups. The safest operator move is to decide
              which mode you are in before you interpret auth, tokens, domains,
              or dashboard behavior.
            </p>
          </motion.div>

          <section id="preview" className="mb-24 scroll-mt-20">
            <div className="mb-8 border-l border-zinc-800 pl-6">
              <h2 className="text-2xl font-semibold text-white">Local preview mode</h2>
              <p className="mt-2 text-zinc-400">Use this for fast tunnel-loop validation, not for production decisions.</p>
            </div>
            <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>Preview mode uses SQLite and a single instance-style token so you can test the ngrok-like flow quickly.</p>
              <p>Enable it intentionally with <code className="text-cyan-400">BINBOI_ALLOW_PREVIEW_MODE=true</code>.</p>
              <p>Do not treat preview behavior as the real auth or billing path.</p>
            </div>
          </section>

          <section id="full-stack" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Local full-stack mode</h2>
            <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>This is the closest serious local simulation of the actual product.</p>
              <p>Use Go control plane plus SQLite for relay state, Postgres for auth, the Next.js app, and the CLI together.</p>
              <p>Set <code className="text-cyan-400">BINBOI_ALLOW_PREVIEW_MODE=false</code> so local behavior matches the real product path.</p>
            </div>
          </section>

          <section id="staging" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Shared staging</h2>
            <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>Run the Go control plane and Next.js app as separate services with shared Postgres.</p>
              <p>Next.js should talk to Go over <code className="text-cyan-400">BINBOI_API_BASE</code>, while browser flows should go through the Next proxy routes.</p>
              <p>Keep preview mode disabled so staging fails like production when auth or envs are wrong.</p>
            </div>
          </section>

          <section id="production" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-semibold text-white">Production-like deployment</h2>
            <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-300">
              <p>Use real Postgres-backed auth, real public DNS, preview mode disabled, and a deliberate TLS owner.</p>
              <p>Either terminate HTTPS at an external edge or let Binboi own ACME through <code className="text-cyan-400">BINBOI_PROXY_TLS_ADDR</code>.</p>
              <p>Do not rely on preview token semantics once real public users are involved.</p>
            </div>
          </section>

          <section className="mb-24">
            <h2 className="text-2xl font-semibold text-white">Related guides</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["/docs/deploy-readiness", "Deploy Readiness", "Move from environment choice to final launch checks."],
                ["/docs/staging-runbook", "Staging Runbook", "Use the shortest serious bring-up path once envs are set."],
                ["/docs/smoke-testing", "Smoke Testing", "Run the fastest validation loop for the environment you selected."],
                ["/docs/authentication", "Authentication", "Understand how preview and database-backed auth differ across environments."],
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
                    {activeId === item.id ? <motion.div layoutId="environments-active" className="absolute left-0 top-0 h-full w-0.5 bg-cyan-500" /> : null}
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
