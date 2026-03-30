"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, TerminalSquare, Waypoints } from "lucide-react";
import { fetchControlPlane, type ControlPlaneInstance, type ControlPlaneTokenState } from "@/lib/controlplane";
import { DashboardPageShell } from "@/components/dashboard/shared/page-shell";

type SetupState = {
  instance: ControlPlaneInstance | null;
  token: ControlPlaneTokenState | null;
  error: string | null;
};

export default function SetupPage() {
  const [state, setState] = useState<SetupState>({
    instance: null,
    token: null,
    error: null,
  });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [instance, token] = await Promise.all([
          fetchControlPlane<ControlPlaneInstance>("/api/instance"),
          fetchControlPlane<ControlPlaneTokenState>("/api/tokens/current"),
        ]);

        if (!cancelled) {
          setState({ instance, token, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            instance: null,
            token: null,
            error: error instanceof Error ? error.message : "Could not load setup data.",
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const steps = useMemo(() => {
    const tokenValue = state.token?.token || "binboi_live_replace_me";
    const publicUrl = state.instance?.public_url_example || "http://my-app.binboi.localhost:8000";

    return [
      {
        title: "Install the CLI",
        description: "Build the local CLI or distribute your own binary package.",
        command: "go build -o binboi ./cmd/binboi-client",
        icon: Download,
      },
      {
        title: "Authenticate the agent",
        description: "Save the instance token once on each machine that should open tunnels.",
        command: `binboi auth ${tokenValue}`,
        icon: TerminalSquare,
      },
      {
        title: "Start a tunnel",
        description: `Expose your local app and receive a public URL like ${publicUrl}.`,
        command: "binboi start 3000 my-app",
        icon: Waypoints,
      },
    ];
  }, [state.instance, state.token]);

  const copyCommand = async (command: string, index: number) => {
    await navigator.clipboard.writeText(command);
    setCopiedIndex(index);
    window.setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <DashboardPageShell
      eyebrow="Onboarding"
      title="Set up the relay and your first agent"
      description="This page now reflects the actual MVP flow: build the CLI, save the instance token, and start an HTTP tunnel against the self-hosted relay."
      highlights={[
        {
          label: "Managed domain",
          value: state.instance?.managed_domain || "Waiting for API",
          note: "This is the base domain used to build public URLs for reserved tunnels.",
        },
        {
          label: "Auth mode",
          value: state.instance?.auth_mode || "instance-token",
          note: "The first release keeps authentication intentionally simple and instance-scoped.",
        },
        {
          label: "Relay state",
          value: state.error ? "Offline" : "Ready",
          note: state.error || "If the control plane is online, the commands below are ready to use.",
        },
      ]}
      panels={[
        {
          title: "How the setup flow works",
          description: "Reserve a subdomain in the dashboard if you want a predictable URL, then connect the CLI with the instance token. The relay marks the tunnel active when the agent attaches successfully.",
        },
        {
          title: "Environment variables worth knowing",
          description: "The CLI reads BINBOI_SERVER_ADDR for the tunnel listener address. The relay uses BINBOI_API_ADDR, BINBOI_TUNNEL_ADDR, BINBOI_PROXY_ADDR, BINBOI_BASE_DOMAIN, and BINBOI_DATABASE_PATH.",
        },
      ]}
    >
      <section className="grid gap-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <article
              key={step.title}
              className="rounded-3xl border border-white/10 bg-[#080808] p-6"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-2xl border border-miransas-cyan/20 bg-miransas-cyan/10 p-3 text-miransas-cyan">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-400">
                      Step {index + 1}
                    </span>
                    <h2 className="text-xl font-semibold text-white">{step.title}</h2>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">{step.description}</p>
                  <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/8 bg-black/30 p-4 font-mono text-sm text-miransas-cyan">
                    <span className="text-zinc-600">$</span>
                    <code className="flex-1 overflow-x-auto whitespace-nowrap">{step.command}</code>
                    <button
                      onClick={() => copyCommand(step.command, index)}
                      className="rounded-xl border border-white/8 bg-white/5 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                    >
                      {copiedIndex === index ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </DashboardPageShell>
  );
}
