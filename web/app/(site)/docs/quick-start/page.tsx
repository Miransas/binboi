"use client"
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// --- Types ---
interface TocItem {
  id: string;
  title: string;
}

const toc: TocItem[] = [
  { id: "before-you-start", title: "Before you start" },
  { id: "install-and-login", title: "Install and login" },
  { id: "first-http-tunnel", title: "First tunnel" },
  { id: "first-request-flow", title: "First request flow" },
  { id: "what-to-check-next", title: "What to check next" },
];

export default function QuickStartPage() {
  const [activeId, setActiveId] = useState("");

  // ScrollSpy: Tracks which section is currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0% -35% 0%", threshold: 0.5 }
    );

    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:flex lg:gap-x-12">
        
        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 lg:max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <span className="text-sm font-medium tracking-widest text-cyan-500 uppercase font-mono">Guide</span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Quick Start
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              Install Binboi, log in, and expose your first local service. This is the shortest path 
              from a fresh machine to a working public URL.
            </p>
          </motion.div>

          {/* Section: Before you start */}
          <section id="before-you-start" className="mb-24 scroll-mt-20">
            <div className="border-l-2 border-zinc-800 pl-6 mb-8">
              <h2 className="text-2xl font-semibold text-white">Before you start</h2>
              <p className="mt-2 text-zinc-400">Preparation is key for a smooth tunnel setup.</p>
            </div>
            
            <InfoBox>
              <p>
                Make sure your local app is already reachable on{" "}
                <code className="text-cyan-400 bg-cyan-400/10 px-1 rounded">localhost:{"<port>"}</code>
                {" "}before you introduce Binboi into the loop.
              </p>
              <p className="mt-3 opacity-70 italic">If the app itself is not healthy, a tunnel will only make that failure public faster.</p>
            </InfoBox>

            <Callout 
              title="Typical starting point" 
              text="A Next.js app on port 3000 or an Express API on 8080 are the most common first-use cases."
              tone="cyan"
            />
          </section>

          {/* Section: Step 1 */}
          <section id="install-and-login" className="mb-24 scroll-mt-20">
            <header className="mb-6">
              <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest">Step 01</span>
              <h2 className="text-2xl font-bold text-white mt-1">Install and authenticate</h2>
            </header>

            <CodeBlock 
              command={`brew install binboi/tap/binboi\nbinboi login --token <dashboard-token>\nbinboi whoami`} 
              title="Installation Flow"
            />

            <ul className="mt-8 space-y-4">
              <StepItem number="1" text="Install Binboi using your preferred package manager." />
              <StepItem number="2" text="Create an Access Token in your Binboi Dashboard." />
              <StepItem number="3" text="Run login command to write credentials to ~/.binboi/config.json." />
            </ul>
          </section>

          {/* Section: Step 2 */}
          <section id="first-http-tunnel" className="mb-24 scroll-mt-20">
            <header className="mb-6">
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Step 02</span>
              <h2 className="text-2xl font-bold text-white mt-1">Start your first HTTP tunnel</h2>
            </header>

            <CodeBlock 
              command="binboi http 3000 my-app" 
              note="Alias: binboi start 3000 my-app"
            />

            <InfoBox className="mt-6">
              <p>When the agent connects, Binboi prints a public URL. That URL now behaves like a public front door for your local process.</p>
              <p className="mt-3 opacity-80">If you are self-hosting, the public hostname depends on your configured base domain and proxy address rather than a managed shared domain.</p>
            </InfoBox>
          </section>

          {/* Section: Step 3 */}
          <section id="first-request-flow" className="mb-24 scroll-mt-20">
            <header className="mb-6">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Step 03</span>
              <h2 className="text-2xl font-bold text-white mt-1">Verify the request flow</h2>
            </header>

            <CodeBlock 
              command={`curl https://my-app.binboi.link/health\ncurl http://127.0.0.1:3000/health`} 
              title="End-to-end verification"
            />

            <div className="mt-8 bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6">
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-tighter">What&lsquo;s happening?</h4>
              <div className="space-y-3 text-sm text-zinc-400">
                <p>• Client hits the <span className="text-cyan-400">public URL</span>.</p>
                <p>• The proxy matches the host to your <span className="text-zinc-200">active tunnel</span>.</p>
                <p>• CLI forwards the request to your <span className="text-emerald-400">localhost:3000</span>.</p>
                <p>• Request metadata, logs, and replay become available for follow-up debugging.</p>
              </div>
            </div>

            <Callout 
              title="Troubleshooting" 
              text="If the public URL fails but localhost works, check your auth or relay connectivity."
              tone="amber"
            />
          </section>

          {/* Section: Step 4 */}
          <section id="what-to-check-next" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-6">What to check next</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NextCard href="/docs/http-tunnels" title="HTTP Tunnels" desc="See the routing model behind the public URL you just created." />
              <NextCard href="/docs/authentication" title="Authentication" desc="Understand tokens, whoami checks, and saved CLI auth state." />
              <NextCard href="/docs/request-replay" title="Request Replay" desc="Inspect archived traffic and resend failing requests safely." />
              <NextCard href="/docs/smoke-testing" title="Smoke Testing" desc="Run a fast health, metrics, and forwarding pass before launch." />
            </div>
          </section>
        </main>

        {/* --- RIGHT SIDEBAR: NAV --- */}
        <aside className="hidden lg:block lg:w-64">
          <div className="sticky top-16">
            <h4 className="text-xs font-bold text-white mb-6 uppercase tracking-widest opacity-40 font-mono">On this guide</h4>
            <nav className="relative">
              <div className="absolute left-0 top-0 h-full w-px bg-zinc-800" />
              <ul className="space-y-4">
                {toc.map((item) => (
                  <li key={item.id} className="relative pl-6">
                    {activeId === item.id && (
                      <motion.div 
                        layoutId="active-indicator-qs"
                        className="absolute left-0 top-0 h-full w-0.5 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                      />
                    )}
                    <button
                      onClick={() => scrollTo(item.id)}
                      className={`text-sm text-left transition-colors duration-200 ${
                        activeId === item.id ? "text-cyan-400 font-medium" : "text-zinc-500 hover:text-zinc-300"
                      }`}
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

// --- Internal Helper Components ---

function InfoBox({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-sm leading-7 text-zinc-400 ${className}`}>
      {children}
    </div>
  );
}

function StepItem({ number, text }: { number: string, text: string }) {
  return (
    <li className="flex gap-4 items-start group">
      <span className="flex-none w-6 h-6 rounded-full bg-zinc-800 text-zinc-500 text-[10px] flex items-center justify-center font-bold group-hover:bg-cyan-500 group-hover:text-white transition-colors">
        {number}
      </span>
      <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">{text}</span>
    </li>
  );
}

function NextCard({ href, title, desc }: { href: string, title: string, desc: string }) {
  return (
    <Link href={href} className="block p-5 rounded-xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-all">
      <h4 className="text-white font-semibold text-sm mb-1">{title}</h4>
      <p className="text-xs text-zinc-500">{desc}</p>
    </Link>
  );
}

function CodeBlock({ command, title, note }: { command: string, title?: string, note?: string }) {
  return (
    <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
      <div className="px-4 py-2 bg-zinc-900/50 border-b border-zinc-800 flex justify-between items-center">
        <span className="text-[10px] text-zinc-500 font-mono uppercase">{title || "Terminal"}</span>
        <span className="text-[10px] text-zinc-600 font-mono italic">{note}</span>
      </div>
      <pre className="p-5 overflow-x-auto text-sm font-mono leading-relaxed">
        <code className="text-cyan-400 block whitespace-pre-wrap">
          {command.split('\n').map((line, i) => (
            <div key={i} className="flex">
              <span className="text-zinc-700 mr-4 select-none">$</span>
              <span>{line}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

function Callout({ title, text, tone = "cyan" }: { title: string, text: string, tone?: "cyan" | "amber" }) {
  const isAmber = tone === "amber";
  return (
    <div className={`my-8 flex gap-4 p-5 rounded-xl border ${isAmber ? 'bg-amber-500/5 border-amber-500/20' : 'bg-cyan-500/5 border-cyan-500/20'}`}>
      <div className={`mt-1 ${isAmber ? 'text-amber-500' : 'text-cyan-500'}`}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="text-sm">
        <strong className={`block font-semibold mb-1 ${isAmber ? 'text-amber-500' : 'text-cyan-500'}`}>{title}</strong>
        <p className="text-zinc-400 leading-6">{text}</p>
      </div>
    </div>
  );
}
