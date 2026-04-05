"use client"

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// --- Types ---
interface TocItem {
  id: string;
  title: string;
}

const toc: TocItem[] = [
  { id: "edge-network", title: "Edge Network & TLS" },
  { id: "routing-logic", title: "Routing Logic" },
  { id: "traffic-policies", title: "Traffic Policies" },
  { id: "custom-domains", title: "Custom Domains" },
];

export default function ApiGatewayPage() {
  const [activeId, setActiveId] = useState("");

  // ScrollSpy to track active section in the sidebar
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
            <span className="text-sm font-medium tracking-widest text-cyan-500 uppercase font-mono">Architecture</span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              API Gateway
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              Before traffic reaches your local machine, it hits the Binboi API Gateway. 
              This layer handles TLS termination, host routing, rate limiting, and edge security policies.
            </p>
          </motion.div>

          {/* Architecture Visual (Tailwind CSS) */}
          <div className="mb-16 p-8 rounded-2xl border border-zinc-800 bg-zinc-900/20 overflow-hidden hidden sm:block">
            <div className="flex items-center justify-between text-xs font-mono font-bold tracking-wider text-zinc-500">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">🌐</div>
                <span>CLIENT</span>
              </div>
              <div className="h-px bg-zinc-800 flex-1 mx-4 relative"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border-t border-r border-zinc-600"></div></div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] text-cyan-400">GATEWAY</div>
                <span className="text-cyan-500">BINBOI EDGE</span>
              </div>
              <div className="h-px bg-zinc-800 flex-1 mx-4 relative"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border-t border-r border-zinc-600"></div></div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 text-emerald-400">CLI</div>
                <span className="text-emerald-500">AGENT</span>
              </div>
              <div className="h-px bg-zinc-800 flex-1 mx-4 relative"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border-t border-r border-zinc-600"></div></div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">💻</div>
                <span>LOCALHOST</span>
              </div>
            </div>
          </div>

          {/* Section: Edge Network & TLS */}
          <section id="edge-network" className="mb-24 scroll-mt-20">
            <div className="border-l-2 border-zinc-800 pl-6 mb-8">
              <h2 className="text-2xl font-semibold text-white">Edge Network & TLS</h2>
              <p className="mt-2 text-zinc-400">Where the public internet meets your private tunnel.</p>
            </div>
            
            <InfoBox>
              <p>
                Every inbound request to a <code className="text-cyan-400">*.binboi.link</code> address is intercepted by our globally distributed API Gateway.
              </p>
              <p className="mt-3">
                The gateway performs <strong>TLS termination</strong> at the edge. This means the heavy cryptographic handshake happens close to the client, reducing latency before the request is routed through the persistent multiplexed connection to your local CLI.
              </p>
            </InfoBox>
          </section>

          {/* Section: Routing Logic */}
          <section id="routing-logic" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-6">Routing Logic</h2>
            <p className="text-zinc-400 mb-6 leading-relaxed">
              When a request arrives, the gateway inspects the <code className="text-zinc-200">Host</code> header to determine which active CLI agent should receive the traffic.
            </p>

            <div className="grid gap-4">
              <FeatureCard 
                title="Exact Host Matching" 
                desc="Requests to my-app.binboi.link are routed strictly to the agent that reserved 'my-app'." 
              />
              <FeatureCard 
                title="Connection Pooling" 
                desc="If multiple agents authenticate with the same tunnel credentials, the gateway load-balances requests across them (Round Robin)." 
              />
              <FeatureCard 
                title="Dead-letter Handling" 
                desc="If a host matches but the agent disconnected unexpectedly, the gateway returns a standard 502 Bad Gateway immediately, without hanging." 
                isWarning
              />
            </div>
          </section>

          {/* Section: Traffic Policies */}
          <section id="traffic-policies" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-6">Traffic Policies</h2>
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-zinc-900/50 text-zinc-100 font-semibold border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Policy</th>
                    <th className="px-4 py-3">Behavior</th>
                    <th className="px-4 py-3">Configuration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  <TableRow cols={["Rate Limiting", "Prevents abuse by capping req/sec per IP.", "Dashboard UI (Pro tier)"]} />
                  <TableRow cols={["IP Allowlisting", "Drops traffic from IPs not explicitly allowed.", "binboi start --allow-ips=..."]} />
                  <TableRow cols={["Webhook Signatures", "Rejects payloads lacking valid provider signatures.", "CLI Middleware"]} />
                  <TableRow cols={["Payload Limits", "Blocks requests larger than 10MB to protect memory.", "Platform default"]} />
                </tbody>
              </table>
            </div>
          </section>

          {/* Section: Custom Domains */}
          <section id="custom-domains" className="mb-24 scroll-mt-20">
            <h2 className="text-2xl font-bold text-white mb-4">Custom Domains</h2>
            <p className="mb-6 text-zinc-400 leading-relaxed">
              You can bring your own domain (e.g., <code className="text-cyan-400">api.yourcompany.com</code>) instead of using the default Binboi subdomain.
            </p>
            
            <CodeBlock 
              title="DNS CNAME Record"
              code="Type: CNAME\nName: api\nValue: custom.binboi.link"
            />

            <Callout 
              title="Automated Certificate Provisioning" 
              text="Once your CNAME is detected, the API Gateway automatically provisions and renews a Let's Encrypt TLS certificate for your custom domain. This usually takes less than 60 seconds."
              tone="cyan"
            />
          </section>

        </main>

        {/* --- RIGHT SIDEBAR: NAV --- */}
        <aside className="hidden lg:block lg:w-64">
          <div className="sticky top-16">
            <h4 className="text-[10px] font-bold text-white mb-6 uppercase tracking-widest opacity-40 font-mono">On this page</h4>
            <nav className="relative">
              <div className="absolute left-0 top-0 h-full w-px bg-zinc-800" />
              <ul className="space-y-4">
                {toc.map((item) => (
                  <li key={item.id} className="relative pl-6">
                    {activeId === item.id && (
                      <motion.div 
                        layoutId="api-nav-indicator"
                        className="absolute left-0 top-0 h-full w-0.5 bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                      />
                    )}
                    <button
                      onClick={() => scrollTo(item.id)}
                      className={`text-sm text-left transition-all duration-300 ${
                        activeId === item.id ? "text-cyan-400 font-medium translate-x-1" : "text-zinc-500 hover:text-zinc-300"
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

// --- Internal UI Components ---

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 text-sm leading-7 text-zinc-400">
      {children}
    </div>
  );
}

function FeatureCard({ title, desc, isWarning = false }: { title: string, desc: string, isWarning?: boolean }) {
  return (
    <div className={`p-5 rounded-xl border transition-colors ${isWarning ? 'bg-amber-500/5 border-amber-500/20' : 'bg-zinc-900/10 border-zinc-800 hover:border-zinc-700'}`}>
      <h4 className={`font-semibold mb-1 ${isWarning ? 'text-amber-500' : 'text-white'}`}>{title}</h4>
      <p className="text-sm text-zinc-400 leading-6">{desc}</p>
    </div>
  );
}

function TableRow({ cols }: { cols: string[] }) {
  return (
    <tr className="hover:bg-white/[0.02] transition-colors group">
      {cols.map((col, i) => (
        <td key={i} className={`px-4 py-4 ${i === 0 ? "text-cyan-400 font-medium text-xs" : "text-zinc-400"}`}>
          {col}
        </td>
      ))}
    </tr>
  );
}

function CodeBlock({ title, code }: { title: string, code: string }) {
  return (
    <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden shadow-2xl mb-6">
      <div className="px-4 py-2 bg-zinc-900/50 border-b border-zinc-800 flex justify-between items-center">
        <span className="text-[10px] text-zinc-500 font-mono uppercase">{title}</span>
      </div>
      <pre className="p-5 overflow-x-auto text-sm font-mono leading-relaxed text-zinc-300">
        <code>
          {code.split('\n').map((line, i) => {
            const [key, ...rest] = line.split(':');
            if (rest.length > 0) {
              return (
                <div key={i} className="flex">
                  <span className="text-emerald-400 w-16">{key}:</span>
                  <span className="text-zinc-300">{rest.join(':')}</span>
                </div>
              );
            }
            return <div key={i}>{line}</div>;
          })}
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