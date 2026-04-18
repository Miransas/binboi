"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ExternalLink,
  Globe,
  KeyRound,
  RefreshCcw,
  ShieldCheck,
  Users,
  Wifi,
} from "lucide-react";

import { fetchControlPlane, type ControlPlaneInstance } from "@/lib/controlplane";
import { useSession } from "@/components/provider/session-provider";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.35 } },
};

export default function UserManagementPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [instance, setInstance] = useState<ControlPlaneInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchControlPlane<ControlPlaneInstance>("/api/v1/instance");
      setInstance(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load instance info.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const plan = (user?.plan ?? "FREE") as string;

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={container}
      className="relative min-h-screen bg-[#050506] px-4 py-12 text-zinc-300 sm:px-6 lg:px-12"
    >
      {/* ambient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/3 h-[500px] w-[500px] rounded-full bg-violet-500/[0.04] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-5xl">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <motion.div variants={item} className="mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1">
            <Users className="h-3 w-3 text-violet-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
              Account
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            User Management
          </h1>
          <p className="mt-3 max-w-xl text-base text-zinc-500">
            Account overview, instance details, and quick links to manage your credentials.
          </p>
        </motion.div>

        {/* ── Current user card ──────────────────────────────────────────── */}
        <motion.div variants={item} className="mb-8 rounded-2xl border border-white/[0.06] bg-zinc-900/20 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl font-bold text-white">
              {(user?.name || user?.email || "?")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0].toUpperCase())
                .join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-white">{user?.name || "—"}</p>
              <p className="truncate text-sm text-zinc-500">{user?.email || "—"}</p>
            </div>
            <span className="shrink-0 rounded-full border border-miransas-cyan/25 bg-miransas-cyan/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-miransas-cyan">
              {plan}
            </span>
          </div>
        </motion.div>

        {/* ── Instance info ──────────────────────────────────────────────── */}
        <motion.div variants={item} className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Relay instance
            </h2>
            <button
              onClick={() => void load()}
              className="rounded-lg p-1.5 text-zinc-600 transition hover:bg-white/[0.04] hover:text-zinc-400"
            >
              <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-400">
              {error}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  label: "Instance",
                  value: loading ? "…" : (instance?.instance_name ?? "—"),
                  icon: Globe,
                  color: "text-miransas-cyan",
                },
                {
                  label: "Auth mode",
                  value: loading ? "…" : (instance?.auth_mode ?? "—"),
                  icon: ShieldCheck,
                  color: "text-violet-400",
                },
                {
                  label: "Active tunnels",
                  value: loading ? "…" : String(instance?.active_tunnels ?? 0),
                  icon: Wifi,
                  color: "text-emerald-400",
                },
                {
                  label: "Reserved tunnels",
                  value: loading ? "…" : String(instance?.reserved_tunnels ?? 0),
                  icon: Activity,
                  color: "text-zinc-400",
                },
                {
                  label: "Managed domain",
                  value: loading ? "…" : (instance?.managed_domain ?? "—"),
                  icon: Globe,
                  color: "text-zinc-400",
                },
                {
                  label: "Database",
                  value: loading ? "…" : (instance?.database ?? "—"),
                  icon: ShieldCheck,
                  color: "text-zinc-400",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-white/[0.06] bg-zinc-900/20 px-6 py-5"
                >
                  <div className="mb-2 flex items-center gap-2 text-zinc-600">
                    <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{s.label}</span>
                  </div>
                  <p className="font-mono text-sm font-semibold text-zinc-300">{s.value}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Quick links ────────────────────────────────────────────────── */}
        <motion.div variants={item}>
          <h2 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Quick links
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Profile settings",
                description: "Update name, password, and account info.",
                href: "/dashboard/profile",
                icon: Users,
              },
              {
                label: "Access tokens",
                description: "Create and revoke CLI authentication tokens.",
                href: "/dashboard/access-tokens",
                icon: KeyRound,
              },
              {
                label: "Billing & plans",
                description: "Manage your subscription and usage limits.",
                href: "/dashboard/billing",
                icon: Activity,
              },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-zinc-900/20 p-5 transition hover:border-white/[0.12] hover:bg-zinc-900/40"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03]">
                  <link.icon className="h-4 w-4 text-zinc-500 transition group-hover:text-zinc-300" />
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-zinc-300 transition group-hover:text-white">
                    {link.label}
                    <ExternalLink className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-600">{link.description}</p>
                </div>
              </a>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.main>
  );
}
