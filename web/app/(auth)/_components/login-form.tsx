"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  LogOut,
  Mail,
  RefreshCcw,
} from "lucide-react";

import {
  buildForgotPasswordHref,
  buildLoginHref,
  buildRegisterHref,
  sanitizeRedirectTarget,
} from "@/lib/auth-routing";
import { cn } from "@/lib/utils";

type JsonResponse = {
  ok?: boolean;
  error?: string;
  code?: string;
  message?: string;
  redirectTo?: string;
  email?: string;
  delivery?: {
    mode: "preview";
    previewUrl: string;
  } | null;
  alreadyVerified?: boolean;
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
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => ({}))) as JsonResponse;
  if (!response.ok) {
    throw new AuthApiError(
      payload.error || "Something went wrong.",
      response.status,
      payload,
    );
  }

  return payload;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.08,
      delayChildren: 0.03,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const surfaceClass =
  "rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-sm sm:px-7 sm:py-7";

const pillClass =
  "inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400";

const labelClass =
  "text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500";

const inputClass =
  "mt-2 w-full rounded-[18px] border border-white/10 bg-[#0b0e14] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-white/20 focus:bg-[#0f131c] disabled:cursor-not-allowed disabled:opacity-60";

const primaryButtonClass =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60";


function authUnavailableCode(previewEnabled: boolean) {
  return previewEnabled ? "AUTH_PREVIEW_ONLY" : "AUTH_UNAVAILABLE";
}

function authFallbackLabel(authConfigured: boolean, previewEnabled: boolean) {
  if (authConfigured) {
    return "Database auth enabled";
  }
  return previewEnabled ? "Preview only" : "Auth unavailable";
}

function authUnavailableMessage(previewEnabled: boolean, capability: string) {
  return previewEnabled
    ? `Database-backed auth is not configured for this deployment. ${capability} is disabled until DATABASE_URL is available, but local preview mode can still be used intentionally.`
    : `Database-backed auth is not configured for this deployment, so ${capability} is unavailable.`;
}

function statusClass(tone: "neutral" | "success" | "warning" | "error") {
  return tone === "success"
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
    : tone === "warning"
      ? "border-amber-300/20 bg-amber-400/10 text-amber-100"
      : tone === "error"
        ? "border-rose-400/20 bg-rose-500/10 text-rose-100"
        : "border-white/10 bg-white/[0.03] text-zinc-300";
}

function passwordChecks(password: string, confirmPassword?: string) {
  return [
    {
      label: "8+ characters",
      passed: password.length >= 8,
    },
    {
      label: "Letters + numbers",
      passed: /[a-z]/i.test(password) && /\d/.test(password),
    },
    {
      label: "Passwords match",
      passed:
        typeof confirmPassword === "string"
          ? confirmPassword.length > 0 && password === confirmPassword
          : true,
    },
  ];
}


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
    if (verified) {
      return "Your email is verified. You can sign in now.";
    }
    if (reset) {
      return "Your password was updated. Sign in with the new password.";
    }
    return null;
  }, [reset, verified]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Enter your email address.");
      setErrorCode(null);
      return;
    }

    if (!password) {
      setError("Enter your password.");
      setErrorCode(null);
      return;
    }

    if (!authConfigured) {
      setError(authUnavailableMessage(previewEnabled, "sign-in"));
      setErrorCode(authUnavailableCode(previewEnabled));
      return;
    }

    setLoading(true);
    setError(null);
    setErrorCode(null);

    try {
      const payload = await postJson("/api/auth/login", {
        email,
        password,
        callbackUrl: redirectTo,
      });
      router.push(payload.redirectTo || redirectTo);
      router.refresh();
    } catch (submitError) {
      if (submitError instanceof AuthApiError) {
        setError(submitError.message);
        setErrorCode(submitError.code || null);
      } else {
        setError("Could not sign in right now.");
        setErrorCode(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!email.trim()) {
      setError("Enter the email address that needs verification first.");
      return;
    }

    setResending(true);
    setError(null);

    try {
      const payload = await postJson("/api/auth/resend-verification", {
        email,
        callbackUrl: redirectTo,
      });
      router.push(payload.redirectTo || buildLoginHref(redirectTo));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not resend the verification link.",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-5"
    >
      <motion.div variants={itemVariants}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </motion.div>

      <motion.section variants={itemVariants} className={surfaceClass}>
        <div className="space-y-6">
          <div className="space-y-3">
            <span className={pillClass}>Sign in</span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">
                Access the Binboi control plane
              </h1>
              <p className="text-sm leading-7 text-zinc-400">
                Use your email and password, or continue with GitHub when OAuth is configured for this deployment.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Session", value: "Protected dashboard access" },
              { label: "Identity", value: "Email verification enforced" },
              { label: "Fallback", value: authFallbackLabel(authConfigured, previewEnabled) },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[18px] border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                  {item.label}
                </p>
                <p className="mt-2 text-sm text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {notice ? (
              <div className={cn("rounded-[18px] border px-4 py-3 text-sm", statusClass("success"))}>
                {notice}
              </div>
            ) : null}
            {!authConfigured ? (
              <div className={cn("rounded-[18px] border px-4 py-3 text-sm", statusClass("warning"))}>
                {authUnavailableMessage(previewEnabled, "sign-in")}
              </div>
            ) : null}
            {error ? (
              <div className={cn("rounded-[18px] border px-4 py-3 text-sm", statusClass("error"))}>
                {error}
              </div>
            ) : null}
            {errorCode === "EMAIL_NOT_VERIFIED" ? (
              <div className={cn("rounded-[18px] border px-4 py-3 text-sm", statusClass("warning"))}>
                Your account exists, but email verification has not been completed yet.
              </div>
            ) : null}
          </div>

          <motion.form variants={itemVariants} onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading || oauthLoading || !authConfigured}
              className={primaryButtonClass}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </button>
          </motion.form>

          {errorCode === "EMAIL_NOT_VERIFIED" ? (
            <button
              type="button"
              onClick={() => void resendVerification()}
              disabled={resending}
              className={secondaryButtonClass}
            >
              {resending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Resend verification email
            </button>
          ) : null}

          {githubEnabled ? (
            <button
              type="button"
              onClick={() => {
                setOauthLoading(true);
                void signIn("github", { callbackUrl: redirectTo });
              }}
              disabled={loading || oauthLoading}
              className={secondaryButtonClass}
            >
              {oauthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Continue with GitHub
            </button>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-2">
            <p className="text-sm text-zinc-400">
              Need an account?{" "}
              <Link
                href={buildRegisterHref(redirectTo)}
                className="text-white underline underline-offset-4 decoration-white/20 transition hover:decoration-white/50"
              >
                Create one
              </Link>
            </p>
            <Link
              href={buildForgotPasswordHref(redirectTo)}
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              Forgot password
            </Link>
          </div>
        </div>
      </motion.section>
    </motion.section>
  );
}