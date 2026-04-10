"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import {
  ArrowLeft,
  Globe,
  Loader2,
  Lock,
  RefreshCcw,
  Server,
  Shield,
  Terminal,
  Zap,
} from "lucide-react";

import {
  buildForgotPasswordHref,
  buildLoginHref,
  buildRegisterHref,
  sanitizeRedirectTarget,
} from "@/lib/auth-routing";
import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/ui/border-beam";
import {
  AuthField,
  AuthStatus,
  authInputClass,
  authPrimaryButtonClass,
  authSecondaryButtonClass,
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
    ? `Database auth is not configured. ${cap} is unavailable until DATABASE_URL is set, but preview mode can still be used.`
    : `Database auth is not configured for this deployment, so ${cap} is unavailable.`;
}

// ── left panel ────────────────────────────────────────────────────────────────

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
          ? "border-[#86a9ff]/20 bg-[#86a9ff]/[0.06]"
          : "border-white/[0.07] bg-white/[0.025]",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
          accent
            ? "border-[#86a9ff]/25 bg-[#86a9ff]/10 text-[#86a9ff]"
            : "border-white/[0.08] bg-white/[0.04] text-zinc-400",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className={cn("truncate font-mono text-xs font-medium", accent ? "text-[#86a9ff]" : "text-zinc-300")}>
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
      <motion.div
        className="relative z-10 h-1.5 w-1.5 rounded-full bg-[#86a9ff]/60"
        animate={{ y: ["-6px", "6px"] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />
    </div>
  );
}

function AnimatedTunnelCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#060a10] p-5">
      <BorderBeam colorFrom="#86a9ff" colorTo="#00ffd1" duration={5} size={110} borderWidth={1.2} />

      <div className="mb-4 flex items-center gap-1.5">
        <div className="h-2 w-2 rounded-full bg-rose-500/70" />
        <div className="h-2 w-2 rounded-full bg-amber-400/70" />
        <div className="h-2 w-2 rounded-full bg-emerald-500/70" />
        <span className="ml-2 font-mono text-[11px] text-zinc-600">binboi connect 3000</span>
      </div>

      <div className="flex flex-col gap-1">
        <TunnelNode icon={Terminal} label="localhost:3000" sublabel="Your application" />
        <FlowConnector />
        <TunnelNode icon={Shield} label="Binboi gateway" sublabel="Miransas Software" accent />
        <FlowConnector />
        <TunnelNode icon={Globe} label="slug.binboi.miransas.com" sublabel="Public HTTPS endpoint" />
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#86a9ff]/15 bg-[#86a9ff]/[0.07] px-3 py-2">
        <motion.div
          className="h-1.5 w-1.5 rounded-full bg-[#86a9ff]"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="font-mono text-[11px] text-[#c2cbdb]/70">
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
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#86a9ff]/20 bg-[#86a9ff]/[0.07]">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="text-[#86a9ff]/80">
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
          Welcome back.
          <br />
          <span className="bg-gradient-to-r from-[#86a9ff] to-[#c2cbdb] bg-clip-text text-transparent">
            Your tunnels await.
          </span>
        </h2>
        <p className="mt-4 max-w-xs text-sm leading-7 text-zinc-500">
          Sign in to your control plane and manage tunnels across all your environments.
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

// ── LoginForm ─────────────────────────────────────────────────────────────────

export function LoginForm({
  authConfigured,
  githubEnabled,
  previewEnabled,
  callbackUrl,
  verified,
  reset,
}: {
  authConfigured: boolean;
  githubEnabled: boolean;
  previewEnabled: boolean;
  callbackUrl?: string | null;
  verified?: boolean;
  reset?: boolean;
}) {
  const router = useRouter();
  const redirectTo = sanitizeRedirectTarget(callbackUrl, "/dashboard");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const notice = useMemo(() => {
    if (verified) return "Email verified — you can sign in now.";
    if (reset) return "Password updated — sign in with your new password.";
    return null;
  }, [verified, reset]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) { setError("Enter your email address."); setErrorCode(null); return; }
    if (!password) { setError("Enter your password."); setErrorCode(null); return; }
    if (!authConfigured) {
      setError(unavailableMsg(previewEnabled, "sign-in"));
      setErrorCode(previewEnabled ? "AUTH_PREVIEW_ONLY" : "AUTH_UNAVAILABLE");
      return;
    }
    setLoading(true); setError(null); setErrorCode(null);
    try {
      const payload = await postJson("/api/auth/login", { email, password, callbackUrl: redirectTo });
      router.push(payload.redirectTo ?? redirectTo);
      router.refresh();
    } catch (err) {
      if (err instanceof AuthApiError) { setError(err.message); setErrorCode(err.code ?? null); }
      else { setError("Could not sign in right now."); setErrorCode(null); }
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!email.trim()) { setError("Enter the email address to resend verification."); return; }
    setResending(true); setError(null);
    try {
      const payload = await postJson("/api/auth/resend-verification", { email, callbackUrl: redirectTo });
      router.push(payload.redirectTo ?? buildLoginHref(redirectTo));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend the verification link.");
    } finally {
      setResending(false);
    }
  };

  const busy = loading || oauthLoading;

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
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#86a9ff]/20 bg-[#86a9ff]/[0.06]">
              <svg width="12" height="12" viewBox="0 0 18 18" fill="none" className="text-[#86a9ff]/80">
                <path d="M2 9h14M9 2l7 7-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white/80">Miransas</span>
          </div>
          <div className="hidden lg:block" />

          <Link
            href={buildRegisterHref(redirectTo)}
            className="text-sm text-zinc-500 transition hover:text-white"
          >
            Create an account
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
                Sign in to Binboi
              </h1>
              <p className="mt-1.5 text-sm text-zinc-500">Access your tunnel control plane</p>
            </div>

            {/* Status banners */}
            {(notice || !authConfigured || error || errorCode === "EMAIL_NOT_VERIFIED") ? (
              <div className="mb-5 space-y-2.5">
                {notice && <AuthStatus tone="success">{notice}</AuthStatus>}
                {!authConfigured && (
                  <AuthStatus tone="warning">{unavailableMsg(previewEnabled, "sign-in")}</AuthStatus>
                )}
                {error && <AuthStatus tone="error">{error}</AuthStatus>}
                {errorCode === "EMAIL_NOT_VERIFIED" && (
                  <AuthStatus tone="warning">
                    Email verification pending — check your inbox or resend below.
                  </AuthStatus>
                )}
              </div>
            ) : null}

            {/* Form */}
            <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={authInputClass}
                  placeholder="••••••••"
                />
              </AuthField>

              <div className="flex justify-end -mt-1">
                <Link
                  href={buildForgotPasswordHref(redirectTo)}
                  className="text-xs text-zinc-500 transition hover:text-white"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={busy || !authConfigured}
                className={authPrimaryButtonClass}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
              </button>
            </form>

            {/* Resend verification */}
            {errorCode === "EMAIL_NOT_VERIFIED" && (
              <button
                type="button"
                onClick={() => void resendVerification()}
                disabled={resending}
                className={cn(authSecondaryButtonClass, "mt-3")}
              >
                {resending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                Resend verification email
              </button>
            )}

            {/* GitHub OAuth */}
            {githubEnabled && (
              <>
                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/[0.07]" />
                  <span className="text-xs text-zinc-600">or</span>
                  <div className="h-px flex-1 bg-white/[0.07]" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOauthLoading(true);
                    void signIn("github", { callbackUrl: redirectTo });
                  }}
                  disabled={busy}
                  className={authSecondaryButtonClass}
                >
                  {oauthLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <GitHubIcon />
                  )}
                  Continue with GitHub
                </button>
              </>
            )}

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-zinc-600">
              Need an account?{" "}
              <Link
                href={buildRegisterHref(redirectTo)}
                className="font-medium text-zinc-300 underline underline-offset-4 decoration-white/20 transition hover:text-white hover:decoration-white/50"
              >
                Create one
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" className="text-white/70">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
