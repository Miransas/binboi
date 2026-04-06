/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  Copy, 
  Download, 
  TerminalSquare, 
  Waypoints, 
  Zap, 
  ChevronRight,
  ShieldCheck,
  Globe
} from "lucide-react";
import { fetchControlPlane, type ControlPlaneInstance } from "@/lib/controlplane";

type SetupState = {
  instance: ControlPlaneInstance | null;
  tokenCount: number;
  plan: "FREE" | "PRO" | "SCALE";
  error: string | null;
};

// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
};

export default function SetupPage() {
  const [state, setState] = useState<SetupState>({
    instance: null,
    tokenCount: 0,
    plan: "FREE",
    error: null,
  });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [instance, tokensResponse] = await Promise.all([
          fetchControlPlane<ControlPlaneInstance>("/api/v1/instance"),
          fetch("/api/v1/tokens", { cache: "no-store" }).then(async (res) => {
            if (!res.ok) throw new Error("Token state fetch failed");
            return res.json() as any;
          }),
        ]);

        if (!cancelled) {
          setState({
            instance,
            tokenCount: tokensResponse.limits?.tokens_used ?? 0,
            plan: tokensResponse.limits?.plan ?? "FREE",
            error: null,
          });
        }
      } catch (error: any) {
        if (!cancelled) {
          setState(prev => ({ ...prev, error: error.message }));
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const steps = useMemo(() => {
    const publicUrl = state.instance?.public_url_example || "dev.binboi.link";
    return [
      {
        title: "Install the CLI",
        description: "Build the local agent from source or download the binary.",
        command: "go build -o binboi ./cmd/binboi-client",
        icon: Download,
        accent: "cyan"
      },
      {
        title: "Create Access Token",
        description: "Generate a machine token in the dashboard. Copy it now; it won't be shown again.",
        command: "Open /dashboard/access-tokens",
        icon: ShieldCheck,
        accent: "violet"
      },
      {
        title: "Authenticate Agent",
        description: "Inject the token into your local environment to establish identity.",
        command: "binboi login --token <your-token>",
        icon: TerminalSquare,
        accent: "cyan"
      },
      {
        title: "Expose Traffic",
        description: `Map your local port to a public endpoint like ${publicUrl}`,
        command: "binboi start 3000 my-app",
        icon: Waypoints,
        accent: "emerald"
      },
    ];
  }, [state.instance]);

  const copyCommand = async (command: string, index: number) => {
    await navigator.clipboard.writeText(command);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <motion.main 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative min-h-screen bg-[#050506] px-4 py-12 text-zinc-300 sm:px-6 lg:px-12"
    >
      {/* Subtle Background Ambience */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Header Section */}
        <motion.section variants={itemVariants} className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 mb-6">
            <Zap className="h-3 w-3 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Onboarding Flow</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Set up the relay & your first agent
          </h1>
          <p className="mt-4 text-zinc-500 max-w-2xl text-lg leading-relaxed">
            Build the CLI, create a dashboard access token, log in once per machine, and then start an HTTP tunnel.
          </p>
        </motion.section>

        {/* Highlights Row */}
        <motion.section variants={itemVariants} className="grid gap-4 md:grid-cols-3 mb-12">
          {[
            { label: "Managed Domain", value: state.instance?.managed_domain || "...", icon: Globe },
            { label: "Auth Mode", value: state.instance?.auth_mode || "PAT", icon: ShieldCheck },
            { label: "Active Tokens", value: `${state.tokenCount} / ${state.plan}`, icon: Zap }
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-zinc-900/20 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3 text-zinc-500 mb-2">
                <item.icon className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
              </div>
              <div className="text-lg font-semibold text-white">{item.value}</div>
            </div>
          ))}
        </motion.section>

        <div className="grid gap-12 lg:grid-cols-[300px_1fr]">
          
          {/* Left: Progression Sidebar */}
          <motion.aside variants={itemVariants} className="space-y-8">
            <div className="sticky top-12">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-8">Setup Progression</h3>
              <div className="space-y-6">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="relative flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center z-10 bg-[#050506] transition-colors ${i === 0 ? 'border-cyan-400 text-cyan-400' : 'border-zinc-800 text-zinc-700'}`}>
                        <span className="text-xs font-bold">{i + 1}</span>
                      </div>
                      {i !== steps.length - 1 && <div className="absolute top-8 w-px h-full bg-zinc-800 group-hover:bg-zinc-700 transition-colors" />}
                    </div>
                    <div className="pt-1">
                      <h4 className={`text-sm font-bold transition-colors ${i === 0 ? 'text-white' : 'text-zinc-600'}`}>{step.title}</h4>
                      <p className="text-[11px] text-zinc-500 mt-1">Ready</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>

          {/* Right: Step Details */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.section 
                key={index}
                variants={itemVariants}
                whileHover={{ borderColor: "rgba(255,255,255,0.1)" }}
                className="group relative rounded-2xl border border-white/5 bg-zinc-900/20 p-8 transition-all"
              >
                <div className="flex items-start gap-6">
                  <div className={`p-4 rounded-2xl bg-zinc-950 border border-white/5 shadow-xl group-hover:scale-110 transition-transform`}>
                    <step.icon className={`h-6 w-6 ${step.accent === 'cyan' ? 'text-cyan-400' : step.accent === 'violet' ? 'text-violet-400' : 'text-emerald-400'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${step.accent === 'cyan' ? 'bg-cyan-400/10 text-cyan-400' : 'bg-violet-400/10 text-violet-400'}`}>
                        Step {index + 1}
                      </span>
                      <h2 className="text-xl font-bold text-white tracking-tight">{step.title}</h2>
                    </div>
                    <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                      {step.description}
                    </p>

                    {/* Code Block */}
                    <div className="relative group/code">
                      <div className="flex items-center gap-3 bg-black/60 border border-white/5 rounded-xl px-5 py-4 font-mono text-sm overflow-hidden">
                        <span className="text-zinc-700 select-none">$</span>
                        <code className="text-zinc-300 flex-1 truncate">{step.command}</code>
                        <button 
                          onClick={() => copyCommand(step.command, index)}
                          className="p-2 rounded-lg bg-zinc-900 border border-white/10 hover:bg-zinc-800 transition-all active:scale-95"
                        >
                          <AnimatePresence mode="wait">
                            {copiedIndex === index ? (
                              <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                <Check className="h-4 w-4 text-emerald-400" />
                              </motion.div>
                            ) : (
                              <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                <Copy className="h-4 w-4 text-zinc-500" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            ))}

            {/* Info Section (Environment Vars) */}
            <motion.section variants={itemVariants} className="mt-12 p-8 rounded-2xl border border-white/5 bg-cyan-400/[0.02]">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <TerminalSquare className="h-4 w-4 text-cyan-400" />
                Environment Variables
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-[11px] text-zinc-500 font-bold uppercase">Client Environment</p>
                  <ul className="text-xs space-y-1 font-mono text-zinc-400">
                    <li className="flex justify-between"><span>BINBOI_API_URL</span> <span className="text-zinc-600">Local Auth</span></li>
                    <li className="flex justify-between"><span>BINBOI_AUTH_TOKEN</span> <span className="text-zinc-600">Headless</span></li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] text-zinc-500 font-bold uppercase">Relay Environment</p>
                  <ul className="text-xs space-y-1 font-mono text-zinc-400">
                    <li className="flex justify-between"><span>BINBOI_TUNNEL_ADDR</span> <span className="text-zinc-600">Traffic In</span></li>
                    <li className="flex justify-between"><span>BINBOI_BASE_DOMAIN</span> <span className="text-zinc-600">Routing</span></li>
                  </ul>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </motion.main>
  );
}