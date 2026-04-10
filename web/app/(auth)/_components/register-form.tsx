"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Globe,
  Loader2,
  Lock,
  Server,
  Shield,
  Terminal,
  Zap,
} from "lucide-react";

import {
  buildForgotPasswordHref,
  buildLoginHref,
  sanitizeRedirectTarget,
} from "@/lib/auth-routing";
import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/ui/border-beam";
import {
  AuthCard,
  AuthField,
  AuthStatus,
  authInputClass,
  authPrimaryButtonClass,
  authInlinePrimaryButtonClass,
  authInlineSecondaryButtonClass,
} from "./auth-primitives";

// ── helpers ───────────────────────────────────────────────────────────────────

type JsonResponse = {
  ok?: boolean;
  error?: string;
  code?: string;
  message?: string;
  redirectTo?: string;
};

class AuthApiError extends Error {
  code?: string;
  status: number;
  payload: JsonResponse;
  constructor(message: string, status: number, payload: JsonResponse) {
    super(message);
    this.code = payload.code;
    this.status = status;
    this.payload = payload;
  }
}

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await res.json().catch(() => ({}))) as JsonResponse;
  if (!res.ok) {
    throw new AuthApiError(payload.error ?? "Something went wrong.", res.status, payload);
  }
  return payload;
}

function unavailableMsg(previewEnabled: boolean, cap: string) {
  return previewEnabled
    ? `Database auth is not configured. ${cap} is unavailable until DATABASE_URL is set.`
    : `Database auth is not configured for this deployment, so ${cap} is unavailable.`;
}

function passwordChecks(password: string, confirmPassword: string) {
  return [
    { label: "8+ chars", passed: password.length >= 8 },
    { label: "Letters + numbers", passed: /[a-z]/i.test(password) && /\d/.test(password) },
    { label: "Passwords match", passed: confirmPassword.length > 0 && password === confirmPassword },
  ];
}

// ── left panel sub-components ─────────────────────────────────────────────────

const FEATURES = [
  { icon: Zap, label: "Instant tunnels", desc: "One command to expose any local port" },
  { icon: Globe, label: "Custom subdomains", desc: "Your own .miransas.com address" },
  { icon: Lock, label: "TLS everywhere", desc: "HTTPS enforced, certificates automatic" },
  { icon: Server, label: "Self-hosted", desc: "Your infra, full control, no lock-in" },
];

function TunnelNode({
  icon: Icon,
  label,
  sublabel,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  sublabel: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors",
        accent
          ? "border-[#00ffd1]/20 bg-[#00ffd1]/[0.06]"
          : "border-white/[0.07] bg-white/[0.025]",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
          accent
            ? "border-[#00ffd1]/25 bg-[#00ffd1]/10 text-[#00ffd1]"
            : "border-white/[0.08] bg-white/[0.04] text-zinc-400",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className={cn("truncate font-mono text-xs font-medium", accent ? "text-[#00ffd1]" : "text-zinc-300")}>
          {label}
        </p>
        <p className="text-[11px] text-zinc-600">{sublabel}</p>
      </div>
    </div>
  );
}

function FlowConnector() {
  return (
    <div className="relative flex w-full items-center justify-center py-0.5">
      <div className="absolute left-1/2 h-full w-px -translate-x-1/2 bg-white/[0.06]" />
      {/* animated dot */}
      <motion.div
        className="relative z-10 h-1.5 w-1.5 rounded-full bg-[#00ffd1]/60"
        animate={{ y: ["-6px", "6px"] }}
        transition={{ duration: 1.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />
    </div>
  );
}

function AnimatedTunnelCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#060a10] p-5">
      <BorderBeam colorFrom="#00ffd1" colorTo="#9945ff" duration={5} size={110} borderWidth={1.2} />

      {/* Terminal titlebar */}
      <div className="mb-4 flex items-center gap-1.5">
        <div className="h-2 w-2 rounded-full bg-rose-500/70" />
        <div className="h-2 w-2 rounded-full bg-amber-400/70" />
        <div className="h-2 w-2 rounded-full bg-emerald-500/70" />
        <span className="ml-2 font-mono text-[11px] text-zinc-600">binboi connect 3000</span>
      </div>

      {/* Flow diagram */}
      <div className="flex flex-col gap-1">
        <TunnelNode icon={Terminal} label="localhost:3000" sublabel="Your application" />
        <FlowConnector />
        <TunnelNode icon={Shield} label="Binboi gateway" sublabel="Miransas Software" accent />
        <FlowConnector />
        <TunnelNode icon={Globe} label="slug.binboi.miransas.com" sublabel="Public HTTPS endpoint" />
      </div>

      {/* Status bar */}
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-2">
        <motion.div
          className="h-1.5 w-1.5 rounded-full bg-emerald-400"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="font-mono text-[11px] text-emerald-300/80">
          Tunnel active · TLS secured · 0ms latency
        </span>
      </div>
    </div>
  );
}

function BrandingPanel() {
  return (
    <div className="flex h-full flex-col px-12 py-10">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#00ffd1]/20 bg-[#00ffd1]/[0.07]">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="text-[#00ffd1]/80">
            <path
              d="M2 9h14M9 2l7 7-7 7"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p className="text-[13px] font-semibold tracking-wide text-white/90">Miransas Software</p>
          <p className="text-[10px] text-zinc-600">Binboi tunnel platform</p>
        </div>
      </div>

      {/* Headline */}
      <div className="mt-12">
        <h2 className="text-[2.2rem] font-bold leading-[1.08] tracking-[-0.04em] text-white">
          Connect anything,
          <br />
          <span className="bg-gradient-to-r from-[#00ffd1] to-[#7aefdc] bg-clip-text text-transparent">
            from anywhere.
          </span>
        </h2>
        <p className="mt-4 max-w-xs text-sm leading-7 text-zinc-500">
          Expose your local services to the internet in seconds. Self-hosted, TLS-secured,
          and built for developers.
        </p>
      </div>

      {/* Animated card */}
      <div className="mt-10 max-w-sm">
        <AnimatedTunnelCard />
      </div>

      {/* Feature list */}
      <div className="mt-10 grid gap-3.5">
        {FEATURES.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/[0.07] bg-white/[0.03]">
              <Icon className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <div>
              <span className="text-sm font-medium text-zinc-300">{label}</span>
              <span className="text-sm text-zinc-600"> — {desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-12">
        <p className="text-xs text-zinc-700">© 2025 Miransas Software. All rights reserved.</p>
      </div>
    </div>
  );
}

// ── RegisterForm ──────────────────────────────────────────────────────────────

export function RegisterForm({
  authConfigured,
  previewEnabled,
  callbackUrl,
  inviteToken,
}: {
  authConfigured: boolean;
  previewEnabled: boolean;
  callbackUrl?: string | null;
  inviteToken?: string | null;
}) {
  const router = useRouter();
  const redirectTo = sanitizeRedirectTarget(callbackUrl, "/dashboard");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) { setError("Enter your full name."); setErrorCode(null); return; }
    if (!email.trim()) { setError("Enter your email address."); setErrorCode(null); return; }
    if (!password) { setError("Create a password."); setErrorCode(null); return; }
    if (password !== confirmPassword) {
      setError("Password confirmation does not match.");
      setErrorCode("PASSWORD_MISMATCH");
      return;
    }
    if (!authConfigured) {
      setError(unavailableMsg(previewEnabled, "registration"));
      setErrorCode(previewEnabled ? "AUTH_PREVIEW_ONLY" : "AUTH_UNAVAILABLE");
      return;
    }
    setLoading(true); setError(null); setErrorCode(null);
    try {
      const payload = await postJson("/api/auth/register", {
        name, email, password, confirmPassword, inviteToken, callbackUrl: redirectTo,
      });
      router.push(payload.redirectTo ?? buildLoginHref(redirectTo));
      router.refresh();
    } catch (err) {
      if (err instanceof AuthApiError) { setError(err.message); setErrorCode(err.code ?? null); }
      else { setError("Could not create your account."); setErrorCode(null); }
    } finally {
      setLoading(false);
    }
  };

  const checks = passwordChecks(password, confirmPassword);
  const anyPasswordTyped = password.length > 0;

  return (
    <div className="flex min-h-screen">
      {/* ── Left: Branding ── */}
      <div className="relative hidden w-[52%] shrink-0 border-r border-white/[0.06] lg:block">
        <BrandingPanel />
      </div>

      {/* ── Right: Form ── */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 pt-8">
          {/* Mobile logo (lg:hidden) */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#00ffd1]/20 bg-[#00ffd1]/[0.06]">
              <svg width="12" height="12" viewBox="0 0 18 18" fill="none" className="text-[#00ffd1]/80">
                <path d="M2 9h14M9 2l7 7-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white/80">Miransas</span>
          </div>
          <div className="hidden lg:block" />

          <Link
            href="/login"
            className="text-sm text-zinc-500 transition hover:text-white"
          >
            Sign in instead
          </Link>
        </div>

        {/* Form content */}
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm"
          >
            {/* Back link */}
            <Link
              href="/"
              className="mb-7 inline-flex items-center gap-1.5 text-sm text-zinc-600 transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to home
            </Link>

            {/* Heading */}
            <div className="mb-7">
              <h1 className="text-[1.75rem] font-bold tracking-[-0.03em] text-white">
                {inviteToken ? "Accept your invite" : "Create your account"}
              </h1>
              <p className="mt-1.5 text-sm text-zinc-500">
                {inviteToken
                  ? "Use the invited email address to link this invite."
                  : "Free to start. Your tunnels, your infrastructure."}
              </p>
            </div>

            {/* Status banners */}
            {(!authConfigured || inviteToken || error) ? (
              <div className="mb-5 space-y-2.5">
                {!authConfigured && (
                  <AuthStatus tone="warning">{unavailableMsg(previewEnabled, "registration")}</AuthStatus>
                )}
                {inviteToken && (
                  <AuthStatus tone="neutral">
                    Registering from an invite link. Use the invited email address.
                  </AuthStatus>
                )}
                {error && <AuthStatus tone="error">{error}</AuthStatus>}
              </div>
            ) : null}

            {/* Form */}
            <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
              <AuthField label="Full name">
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={authInputClass}
                  placeholder="Sardor Azimov"
                />
              </AuthField>

              <AuthField label="Email">
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={authInputClass}
                  placeholder="you@company.com"
                />
              </AuthField>

              <AuthField label="Password">
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={authInputClass}
                  placeholder="Create a password"
                />
              </AuthField>

              <AuthField label="Confirm password">
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={authInputClass}
                  placeholder="Repeat your password"
                />
              </AuthField>

              {/* Password strength chips */}
              {anyPasswordTyped && (
                <div className="flex gap-1.5">
                  {checks.map((check) => (
                    <div
                      key={check.label}
                      className={cn(
                        "flex-1 rounded-lg border px-2 py-1.5 text-center text-[10px] font-medium transition-colors",
                        check.passed
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                          : "border-white/[0.07] bg-white/[0.02] text-zinc-600",
                      )}
                    >
                      {check.label}
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !authConfigured}
                className={authPrimaryButtonClass}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-zinc-600">
              Already have an account?{" "}
              <Link
                href={buildLoginHref(redirectTo)}
                className="font-medium text-zinc-300 underline underline-offset-4 decoration-white/20 transition hover:text-white hover:decoration-white/50"
              >
                Sign in
              </Link>
            </p>

            {errorCode === "ACCOUNT_EXISTS" && (
              <p className="mt-2 text-center text-sm">
                <Link
                  href={buildLoginHref(redirectTo)}
                  className="text-zinc-500 transition hover:text-white"
                >
                  Continue to sign in →
                </Link>
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ── ResetPasswordForm ─────────────────────────────────────────────────────────

export function ResetPasswordForm({
  authConfigured,
  previewEnabled,
  token,
  email,
  callbackUrl,
}: {
  authConfigured: boolean;
  previewEnabled: boolean;
  token?: string | null;
  email?: string | null;
  callbackUrl?: string | null;
}) {
  const router = useRouter();
  const resolvedToken = token ?? "";
  const redirectTo = sanitizeRedirectTarget(callbackUrl, "/dashboard");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resolvedToken) { setError("This reset link is missing its token."); setErrorCode("TOKEN_REQUIRED"); return; }
    if (!password) { setError("Enter a new password."); setErrorCode(null); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); setErrorCode("PASSWORD_MISMATCH"); return; }
    if (!authConfigured) {
      setError(unavailableMsg(previewEnabled, "password reset"));
      setErrorCode(previewEnabled ? "AUTH_PREVIEW_ONLY" : "AUTH_UNAVAILABLE");
      return;
    }
    setLoading(true); setError(null); setErrorCode(null); setSuccess(null);
    try {
      const payload = await postJson("/api/auth/reset-password", {
        token: resolvedToken, password, confirmPassword, callbackUrl: redirectTo,
      });
      setSuccess(payload.message ?? "Password updated successfully.");
      window.setTimeout(() => {
        router.push(payload.redirectTo ?? buildLoginHref(redirectTo));
      }, 1000);
    } catch (err) {
      if (err instanceof AuthApiError) { setError(err.message); setErrorCode(err.code ?? null); }
      else { setError("Could not reset your password."); setErrorCode(null); }
    } finally {
      setLoading(false);
    }
  };

  const tokenProblem = !resolvedToken || errorCode === "TOKEN_INVALID" || errorCode === "TOKEN_EXPIRED";
  const checks = passwordChecks(password, confirmPassword);
  const anyPasswordTyped = password.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-white">
        <ArrowLeft className="h-3.5 w-3.5" />
        Home
      </Link>

      <AuthCard>
        <div className="mb-7 flex justify-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.05]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-white/75">
              <path d="M2 9h14M9 2l7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-[1.65rem] font-semibold tracking-[-0.03em] text-white">Reset your password</h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            {email ? `Resetting for ${email}` : "Set a new password for your account."}
          </p>
        </div>

        {(!resolvedToken || success || error) ? (
          <div className="mb-5 space-y-2.5">
            {!resolvedToken && <AuthStatus tone="error">This reset link is missing its token.</AuthStatus>}
            {success && <AuthStatus tone="success">{success}</AuthStatus>}
            {error && <AuthStatus tone="error">{error}</AuthStatus>}
          </div>
        ) : null}

        {!tokenProblem ? (
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
            <AuthField label="New password">
              <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={authInputClass} placeholder="New password" />
            </AuthField>
            <AuthField label="Confirm password">
              <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={authInputClass} placeholder="Repeat your new password" />
            </AuthField>

            {anyPasswordTyped && (
              <div className="flex gap-1.5">
                {checks.map((check) => (
                  <div key={check.label} className={cn("flex-1 rounded-lg border px-2 py-1.5 text-center text-[10px] font-medium transition-colors", check.passed ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-white/[0.07] bg-white/[0.02] text-zinc-600")}>
                    {check.label}
                  </div>
                ))}
              </div>
            )}

            <button type="submit" disabled={loading || !authConfigured} className={authPrimaryButtonClass}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <AuthStatus tone="warning">Request a fresh reset link. Old or broken links cannot be reused.</AuthStatus>
            <div className="flex flex-wrap gap-3">
              <Link href={buildForgotPasswordHref(redirectTo)} className={authInlinePrimaryButtonClass}>Request a new link</Link>
              <Link href={buildLoginHref(redirectTo)} className={authInlineSecondaryButtonClass}>Back to sign in</Link>
            </div>
          </div>
        )}
      </AuthCard>
    </motion.div>
  );
}
