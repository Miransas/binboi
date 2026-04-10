"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { ArrowLeft, Loader2, RefreshCcw } from "lucide-react";

import {
  buildForgotPasswordHref,
  buildLoginHref,
  buildRegisterHref,
  sanitizeRedirectTarget,
} from "@/lib/auth-routing";
import { cn } from "@/lib/utils";
import {
  AuthCard,
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

// ── component ─────────────────────────────────────────────────────────────────

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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Home
      </Link>

      <AuthCard>
        {/* Logo mark */}
        <div className="mb-7 flex justify-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.05]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-white/75">
              <path
                d="M2 9h14M9 2l7 7-7 7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-6 text-center">
          <h1 className="text-[1.65rem] font-semibold tracking-[-0.03em] text-white">
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
        <p className="mt-6 text-center text-sm text-zinc-500">
          Need an account?{" "}
          <Link
            href={buildRegisterHref(redirectTo)}
            className="font-medium text-white underline underline-offset-4 decoration-white/20 transition hover:decoration-white/50"
          >
            Create one
          </Link>
        </p>
      </AuthCard>
    </motion.div>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" className="text-white/70">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
