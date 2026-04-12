"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  KeyRound,
  Loader2,
  Shield,
  Trash2,
  User,
  X,
  Zap,
} from "lucide-react";

import { DashboardRouteFrame } from "@/app/dashboard/_components/dashboard-route-frame";
import { useSession } from "@/components/provider/session-provider";
import { cn } from "@/lib/utils";

// ── helpers ────────────────────────────────────────────────────────────────

function formatMemberSince(id: string): string {
  // Rough estimate: if ID encodes a timestamp (common pattern), use it.
  // Fall back to "Unknown" if we can't parse.
  try {
    const ms = parseInt(id, 16);
    if (!isNaN(ms) && ms > 1_000_000_000_000) {
      return new Date(ms).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
  } catch {
    // ignore
  }
  return "—";
}

function SectionHeader({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 pb-6 border-b border-white/5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
        <Icon className="h-4 w-4 text-zinc-400" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
      </div>
    </div>
  );
}

function StatusBadge({ text, color }: { text: string; color: "cyan" | "violet" | "amber" }) {
  const styles = {
    cyan: "border-miransas-cyan/25 bg-miransas-cyan/10 text-miransas-cyan",
    violet: "border-violet-400/25 bg-violet-400/10 text-violet-400",
    amber: "border-amber-400/25 bg-amber-400/10 text-amber-400",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest", styles[color])}>
      {text}
    </span>
  );
}

// ── Delete confirmation modal ──────────────────────────────────────────────

function DeleteModal({ onConfirm, onCancel, loading }: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [typed, setTyped] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-md rounded-2xl border border-rose-500/20 bg-[#0d0d0f] p-6 shadow-2xl"
      >
        <button onClick={onCancel} className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 transition hover:text-white">
          <X className="h-4 w-4" />
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10">
          <AlertTriangle className="h-5 w-5 text-rose-400" />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-white">Delete account</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          This will permanently delete your account, all tunnels, tokens, and billing data.
          This action <span className="font-semibold text-white">cannot be undone</span>.
        </p>

        <div className="mt-5">
          <label className="text-xs font-medium text-zinc-400">
            Type <span className="font-mono text-white">delete my account</span> to confirm
          </label>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="delete my account"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-rose-500/40"
          />
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.06]"
          >
            Cancel
          </button>
          <button
            disabled={typed !== "delete my account" || loading}
            onClick={onConfirm}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-30"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Delete account
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── main page ──────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  // ── name form state ──
  const [name, setName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // ── password form state ──
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  // ── delete state ──
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sync name from session once loaded
  const initialized = useRef(false);
  useEffect(() => {
    if (user?.name && !initialized.current) {
      setName(user.name);
      initialized.current = true;
    }
  }, [user]);

  // ── handlers ──

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed === user?.name) return;

    setNameSaving(true);
    setNameError(null);
    setNameSuccess(false);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to update name.");
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 2500);
    } catch (err) {
      setNameError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setNameSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return; }
    if (newPw.length < 8) { setPwError("New password must be at least 8 characters."); return; }

    setPwSaving(true);
    setPwError(null);
    setPwSuccess(false);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to change password.");
      setPwSuccess(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setTimeout(() => setPwSuccess(false), 2500);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPwSaving(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/auth/me", { method: "DELETE" });
      if (res.ok) {
        window.location.href = "/login?deleted=1";
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Deletion failed.");
      }
    } catch {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  const plan = (user?.plan ?? "FREE") as "FREE" | "PRO" | "SCALE";
  const planColor: "cyan" | "violet" | "amber" = plan === "PRO" ? "violet" : plan === "SCALE" ? "amber" : "cyan";

  return (
    <DashboardRouteFrame variant="shell">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-8">

          {/* Page header */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">Account</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Profile</h1>
            <p className="mt-1.5 text-sm text-zinc-400">Manage your identity, credentials, and account settings.</p>
          </div>

          {/* ── Identity card ─────────────────────────────────────────── */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0d0e10] p-6">
            <SectionHeader icon={User} title="Identity" description="Your account details." />

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl font-bold text-white">
                  {(user?.name || user?.email || "?")
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0].toUpperCase())
                    .join("")}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{user?.name || "—"}</p>
                  <p className="truncate text-xs text-zinc-500">{user?.email || "—"}</p>
                </div>
                <div className="ml-auto shrink-0">
                  <StatusBadge text={plan} color={planColor} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Plan</p>
                  <p className="mt-1.5 text-sm font-semibold text-white">{plan}</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Member since</p>
                  <p className="mt-1.5 text-sm font-semibold text-white">{user?.id ? formatMemberSince(user.id) : "—"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Edit name ─────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0d0e10] p-6">
            <SectionHeader icon={User} title="Display name" description="Update the name shown across the dashboard." />

            <form onSubmit={(e) => void saveName(e)} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/25"
                />
              </div>

              {nameError && (
                <p className="text-xs text-rose-400">{nameError}</p>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={nameSaving || !name.trim() || name.trim() === user?.name}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/[0.08] disabled:opacity-40"
                >
                  {nameSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Save name
                </button>
                <AnimatePresence>
                  {nameSuccess && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-xs text-emerald-400"
                    >
                      <Check className="h-3.5 w-3.5" /> Saved
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>

          {/* ── Change password ───────────────────────────────────────── */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0d0e10] p-6">
            <SectionHeader icon={KeyRound} title="Password" description="Change your login password." />

            <form onSubmit={(e) => void changePassword(e)} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Current password</label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/25"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">New password</label>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/25"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-zinc-400">Confirm password</label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/25"
                  />
                </div>
              </div>

              {pwError && <p className="text-xs text-rose-400">{pwError}</p>}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={pwSaving || !currentPw || !newPw || !confirmPw}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/[0.08] disabled:opacity-40"
                >
                  {pwSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Change password
                </button>
                <AnimatePresence>
                  {pwSuccess && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1.5 text-xs text-emerald-400"
                    >
                      <Check className="h-3.5 w-3.5" /> Password updated
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>

          {/* ── Plan info ─────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0d0e10] p-6">
            <SectionHeader icon={Zap} title="Plan" description="Your current billing tier and limits." />

            <div className="mt-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-zinc-500">Current plan</p>
                <div className="mt-2 flex items-center gap-3">
                  <StatusBadge text={plan} color={planColor} />
                  <span className="text-sm text-zinc-400">
                    {plan === "FREE" && "1 active tunnel · random subdomains"}
                    {plan === "PRO" && "Unlimited tunnels · custom subdomains"}
                    {plan === "SCALE" && "Unlimited tunnels · custom domains · priority relay"}
                  </span>
                </div>
              </div>
              {plan === "FREE" && (
                <a
                  href="/dashboard/billing"
                  className="shrink-0 rounded-xl border border-miransas-cyan/25 bg-miransas-cyan/10 px-4 py-2 text-xs font-semibold text-miransas-cyan transition hover:bg-miransas-cyan/15"
                >
                  Upgrade
                </a>
              )}
            </div>
          </div>

          {/* ── Danger zone ───────────────────────────────────────────── */}
          <div className="rounded-2xl border border-rose-500/15 bg-rose-500/[0.04] p-6">
            <SectionHeader icon={Shield} title="Danger zone" description="Irreversible actions that affect your entire account." />

            <div className="mt-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-300">Delete account</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Permanently removes your account, tunnels, tokens, and all associated data.
                </p>
              </div>
              <button
                onClick={() => setShowDelete(true)}
                className="shrink-0 flex items-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/15"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete account
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDelete && (
          <DeleteModal
            onConfirm={() => void deleteAccount()}
            onCancel={() => setShowDelete(false)}
            loading={deleting}
          />
        )}
      </AnimatePresence>
    </DashboardRouteFrame>
  );
}
