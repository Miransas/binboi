"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Globe, Plus, RefreshCcw } from "lucide-react";
import { fetchControlPlane, type ControlPlaneDomain } from "@/lib/controlplane";
import { PremiumDashboardShell } from "../_components/premium-dashboard-shell";
import {
  dashboardBadgeClass,
  dashboardGhostButtonClass,
  dashboardIconTileClass,
  dashboardInputClass,
  dashboardMutedTextClass,
  dashboardPanelClass,
  dashboardPrimaryButtonClass,
} from "../_components/dashboard-ui";

export default function DomainsPage() {
  const [domains, setDomains] = useState<ControlPlaneDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const result = await fetchControlPlane<ControlPlaneDomain[]>("/api/domains");
      setDomains(result);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load domains.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addDomain = async () => {
    if (!newDomain.trim()) return;
    setCreating(true);
    try {
      await fetchControlPlane("/api/domains", {
        method: "POST",
        body: JSON.stringify({ domain: newDomain.trim() }),
      });
      setNewDomain("");
      await load();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not add domain.");
    } finally {
      setCreating(false);
    }
  };

  const verifyDomain = async (domain: string) => {
    try {
      await fetchControlPlane("/api/domains/verify", {
        method: "POST",
        body: JSON.stringify({ domain_name: domain }),
      });
      await load();
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Verification failed.");
    }
  };

  const verifiedCount = domains.filter((domain) => domain.status === "VERIFIED").length;

  return (
    <PremiumDashboardShell
      eyebrow="Domains"
      title="Managed and custom domains"
      description="The control plane now shows a real domain story for the MVP: one managed base domain plus optional custom domains that can be verified with a DNS TXT record."
      highlights={[
        {
          label: "Managed domains",
          value: String(domains.filter((domain) => domain.type === "MANAGED").length),
          note: "The managed base domain is created automatically when the relay boots.",
        },
        {
          label: "Verified domains",
          value: String(verifiedCount),
          note: "Only verified domains should be used for production traffic.",
        },
        {
          label: "Pending checks",
          value: String(domains.length - verifiedCount),
          note: error || "Pending domains stay in a safe waiting state until TXT verification succeeds.",
        },
      ]}
      panels={[
        {
          title: "How verification works",
          description: "Add the TXT record shown below, wait for DNS to propagate, then run verification again from the dashboard.",
        },
        {
          title: "TLS note",
          description: "The MVP tracks domain ownership, but certificate issuance should still be handled by your edge proxy or ingress.",
        },
      ]}
    >
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className={dashboardPanelClass("blue", "p-6")}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-white">Domain registry</h2>
            <button
              onClick={load}
              className={dashboardGhostButtonClass}
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.03] p-6 text-sm text-slate-500">
                Loading domains...
              </div>
            ) : domains.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/[0.08] bg-white/[0.03] p-6 text-sm text-slate-500">
                No domains have been registered yet.
              </div>
            ) : (
              domains.map((domain) => (
                <div
                  key={domain.name}
                  className="rounded-[1.55rem] border border-white/[0.08] bg-[rgba(255,255,255,0.03)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                      <div className={dashboardIconTileClass("blue", "h-12 w-12")}>
                        <Globe className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold tracking-[-0.02em] text-white">
                          {domain.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">{domain.type}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={dashboardBadgeClass(domain.status === "VERIFIED" ? "green" : "orange")}>
                        {domain.status === "VERIFIED" ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <Clock3 className="h-3.5 w-3.5" />
                        )}
                        {domain.status}
                      </span>
                      {domain.status !== "VERIFIED" && (
                        <button
                          onClick={() => verifyDomain(domain.name)}
                          className={dashboardGhostButtonClass}
                        >
                          Verify DNS
                        </button>
                      )}
                    </div>
                  </div>

                  {domain.expected_txt && (
                    <div className="mt-4 rounded-[1.35rem] border border-white/[0.08] bg-[rgba(3,7,14,0.88)] p-4 font-mono text-sm text-[#dfe7ff]">
                      {domain.expected_txt}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section className={dashboardPanelClass("neutral", "p-6")}>
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-white">
            Add a custom domain
          </h2>
          <p className={`mt-3 ${dashboardMutedTextClass}`}>
            Add a domain you control. The control plane will create a pending entry and generate the TXT value required for verification.
          </p>
          <div className="mt-5 flex gap-3">
            <input
              value={newDomain}
              onChange={(event) => setNewDomain(event.target.value)}
              placeholder="api.example.com"
              className={`flex-1 ${dashboardInputClass}`}
            />
            <button
              onClick={addDomain}
              disabled={creating}
              className={dashboardPrimaryButtonClass}
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </section>
      </section>
    </PremiumDashboardShell>
  );
}
