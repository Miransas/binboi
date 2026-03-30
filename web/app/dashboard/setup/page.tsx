"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, TerminalSquare, Waypoints } from "lucide-react";
import { fetchControlPlane, type ControlPlaneInstance } from "@/lib/controlplane";
import { DashboardPageShell } from "@/components/dashboard/shared/page-shell";
import {
  DashboardSurface,
  DashboardTimeline,
  type DashboardTimelineItem,
} from "@/components/dashboard/shared/dashboard-primitives";

type SetupState = {
  instance: ControlPlaneInstance | null;
  tokenCount: number;
  plan: "FREE" | "PRO";
  error: string | null;
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
          fetchControlPlane<ControlPlaneInstance>("/api/instance"),
          fetch("/api/v1/tokens", { cache: "no-store" }).then(async (response) => {
            const body = (await response.json()) as {
              limits?: { plan?: "FREE" | "PRO"; tokens_used?: number };
            };
            if (!response.ok) {
              throw new Error("Could not load token state.");
            }
            return body;
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
      } catch (error) {
        if (!cancelled) {
          setState({
            instance: null,
            tokenCount: 0,
            plan: "FREE",
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
    const publicUrl = state.instance?.public_url_example || "http://my-app.binboi.localhost:8000";

    return [
      {
        title: "Install the CLI",
        description: "Build the local CLI or distribute your own binary package.",
        command: "go build -o binboi ./cmd/binboi-client",
        icon: Download,
      },
      {
        title: "Create an access token",
        description: "Open the Access Tokens page, create a token, and copy it immediately. The full value is only shown once.",
        command: "Open /dashboard/access-tokens in your browser",
        icon: TerminalSquare,
      },
      {
        title: "Log the CLI in",
        description: "Save the token into the local CLI config and verify the account before exposing traffic.",
        command: "binboi login --token <paste-token-from-dashboard> && binboi whoami",
        icon: TerminalSquare,
      },
      {
        title: "Start a tunnel",
        description: `Expose your local app and receive a public URL like ${publicUrl}.`,
        command: "binboi start 3000 my-app",
        icon: Waypoints,
      },
    ];
  }, [state.instance]);

  const timelineItems: DashboardTimelineItem[] = steps.map((step, index) => ({
    label: `Step ${index + 1}`,
    title: step.title,
    description: step.description,
    status: index === 0 ? "active" : "waiting",
    meta: index === 0 ? "Start here" : undefined,
  }));

  const copyCommand = async (command: string, index: number) => {
    await navigator.clipboard.writeText(command);
    setCopiedIndex(index);
    window.setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <DashboardPageShell
      eyebrow="Onboarding"
      title="Set up the relay and your first agent"
      description="This page reflects the working Binboi auth flow: build the CLI, create a dashboard access token, log in once per machine, and then start an HTTP tunnel."
      highlights={[
        {
          label: "Managed domain",
          value: state.instance?.managed_domain || "Waiting for API",
          note: "This is the base domain used to build public URLs for reserved tunnels.",
        },
        {
          label: "Auth mode",
          value: state.instance?.auth_mode || "personal-access-token",
          note: "The dashboard and CLI now share the same access token model.",
        },
        {
          label: "Plan & tokens",
          value: `${state.plan} / ${state.tokenCount}`,
          note: state.error || "This combines the current plan foundation with the number of active CLI tokens.",
        },
      ]}
      panels={[
        {
          title: "How the setup flow works",
          description: "Reserve a subdomain in the dashboard if you want a predictable URL, then connect the CLI with a personal access token. The relay marks the tunnel active when the authenticated agent attaches successfully.",
        },
        {
          title: "Environment variables worth knowing",
          description: "The CLI reads BINBOI_API_URL for login and whoami, BINBOI_SERVER_ADDR for tunnel traffic, and BINBOI_AUTH_TOKEN for non-interactive environments. The relay uses BINBOI_API_ADDR, BINBOI_TUNNEL_ADDR, BINBOI_PROXY_ADDR, BINBOI_BASE_DOMAIN, and BINBOI_DATABASE_PATH.",
        },
      ]}
    >
      <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <DashboardTimeline
          eyebrow="Setup progression"
          title="Move from install to first public request"
          items={timelineItems}
          className="h-fit"
        />

        <div className="grid gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <DashboardSurface
                key={step.title}
                accent={index % 2 === 0 ? "cyan" : "violet"}
                className="p-6"
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
                    <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-sm text-miransas-cyan">
                      <span className="text-zinc-600">$</span>
                      <code className="flex-1 overflow-x-auto whitespace-nowrap">{step.command}</code>
                      <button
                        onClick={() => copyCommand(step.command, index)}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                      >
                        {copiedIndex === index ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </DashboardSurface>
            );
          })}
        </div>
      </section>
    </DashboardPageShell>
  );
}
