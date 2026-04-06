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


const inlinePrimaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60";

const inlineSecondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60";

function authUnavailableCode(previewEnabled: boolean) {
  return previewEnabled ? "AUTH_PREVIEW_ONLY" : "AUTH_UNAVAILABLE";
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

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Enter your full name.");
      setErrorCode(null);
      return;
    }
    if (!email.trim()) {
      setError("Enter your email address.");
      setErrorCode(null);
      return;
    }
    if (!password) {
      setError("Create a password.");
      setErrorCode(null);
      return;
    }
    if (password !== confirmPassword) {
      setError("Password confirmation does not match.");
      setErrorCode("PASSWORD_MISMATCH");
      return;
    }
    if (!authConfigured) {
      setError(authUnavailableMessage(previewEnabled, "registration"));
      setErrorCode(authUnavailableCode(previewEnabled));
      return;
    }

    setLoading(true);
    setError(null);
    setErrorCode(null);

    try {
      const payload = await postJson("/api/auth/register", {
        name,
        email,
        password,
        confirmPassword,
        inviteToken,
        callbackUrl: redirectTo,
      });
      router.push(payload.redirectTo || buildLoginHref(redirectTo));
      router.refresh();
    } catch (submitError) {
      if (submitError instanceof AuthApiError) {
        setError(submitError.message);
        setErrorCode(submitError.code || null);
      } else {
        setError("Could not create your account.");
        setErrorCode(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const checks = passwordChecks(password, confirmPassword);

  return (
    <motion.section initial="hidden" animate="visible" variants={containerVariants} className="space-y-5">
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
            <span className={pillClass}>{inviteToken ? "Accept invite" : "Create account"}</span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">
                {inviteToken ? "Create the account behind this invite" : "Set up your Binboi identity"}
              </h1>
              <p className="text-sm leading-7 text-zinc-400">
                Register with email and password, verify the address, then use dashboard-issued access tokens for machine auth.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Identity", value: "Name, email, password" },
              { label: "Verification", value: "Email activation before sign-in" },
              { label: "Invite", value: inviteToken ? "Invite context attached" : "Open registration" },
            ].map((item) => (
              <div key={item.label} className="rounded-[18px] border border-white/10 bg-white/[0.02] px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{item.label}</p>
                <p className="mt-2 text-sm text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {!authConfigured ? (
              <div className={cn("rounded-[18px] border px-4 py-3 text-sm", statusClass("warning"))}>
                {authUnavailableMessage(previewEnabled, "registration")}
              </div>
            ) : null}
            {inviteToken ? (
              <div className={cn("rounded-[18px] border px-4 py-3 text-sm", statusClass("neutral"))}>
                You are registering from an invite link. Use the invited email address so the invite can be accepted automatically.
              </div>
            ) : null}
            {error ? (
              <div className={cn("rounded-[18px] border px-4 py-3 text-sm", statusClass("error"))}>
                {error}
              </div>
            ) : null}
          </div>

          <motion.form variants={itemVariants} onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Full name</label>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClass}
                placeholder="Binboi Operator"
              />
            </div>

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
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
                placeholder="Create a password"
              />
            </div>

            <div>
              <label className={labelClass}>Confirm password</label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={inputClass}
                placeholder="Repeat your password"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {checks.map((check) => (
                <div
                  key={check.label}
                  className={cn(
                    "rounded-[16px] border px-3 py-2 text-xs",
                    check.passed
                      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                      : "border-white/10 bg-white/[0.02] text-zinc-500",
                  )}
                >
                  {check.label}
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading || !authConfigured} className={primaryButtonClass}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
            </button>
          </motion.form>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-2">
            <p className="text-sm text-zinc-400">
              Already have an account?{" "}
              <Link
                href={buildLoginHref(redirectTo)}
                className="text-white underline underline-offset-4 decoration-white/20 transition hover:decoration-white/50"
              >
                Sign in
              </Link>
            </p>
            {errorCode === "ACCOUNT_EXISTS" ? (
              <Link href={buildLoginHref(redirectTo)} className="text-sm text-zinc-400 transition hover:text-white">
                Continue to sign in
              </Link>
            ) : null}
          </div>
        </div>
      </motion.section>
    </motion.section>
  );
}



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
  const resolvedToken = token || "";
  const resolvedEmail = email || "";
  const redirectTo = sanitizeRedirectTarget(callbackUrl, "/dashboard");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!resolvedToken) {
      setError("This reset link is missing its token.");
      setErrorCode("TOKEN_REQUIRED");
      return;
    }
    if (!password) {
      setError("Enter a new password.");
      setErrorCode(null);
      return;
    }
    if (password !== confirmPassword) {
      setError("Password confirmation does not match.");
      setErrorCode("PASSWORD_MISMATCH");
      return;
    }
    if (!authConfigured) {
      setError(authUnavailableMessage(previewEnabled, "password reset"));
      setErrorCode(authUnavailableCode(previewEnabled));
      return;
    }

    setLoading(true);
    setError(null);
    setErrorCode(null);
    setSuccess(null);

    try {
      const payload = await postJson("/api/auth/reset-password", {
        token: resolvedToken,
        password,
        confirmPassword,
        callbackUrl: redirectTo,
      });
      setSuccess(payload.message || "Password updated successfully.");
      window.setTimeout(() => {
        router.push(payload.redirectTo || buildLoginHref(redirectTo));
      }, 1000);
    } catch (submitError) {
      if (submitError instanceof AuthApiError) {
        setError(submitError.message);
        setErrorCode(submitError.code || null);
      } else {
        setError("Could not reset your password.");
        setErrorCode(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const tokenProblem =
    !resolvedToken || errorCode === "TOKEN_INVALID" || errorCode === "TOKEN_EXPIRED";
  const checks = passwordChecks(password, confirmPassword);

  return (
    <motion.section initial="hidden" animate="visible" variants={containerVariants} className="space-y-5">
      <motion.div variants={itemVariants}>
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </motion.div>

      <motion.section variants={itemVariants} className={surfaceClass}>
        <div className="space-y-6">
          <div className="space-y-3">
            <span className={pillClass}>Reset password</span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">
                Finish the password reset flow
              </h1>
              <p className="text-sm leading-7 text-zinc-400">
                Set a fresh password for this account, then return to sign in with the updated credentials.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Token", value: resolvedToken ? "Reset token detected" : "Missing token" },
              { label: "Account", value: resolvedEmail || "Email hidden in token" },
              { label: "Return", value: "Sign-in after success" },
            ].map((item) => (
              <div key={item.label} className="rounded-[18px] border border-white/10 bg-white/[0.02] px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{item.label}</p>
                <p className="mt-2 text-sm text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {!resolvedToken ? (
              <div className={cn("rounded-[18px] border px-4 py-3 text-sm", statusClass("error"))}>
                This reset link is missing its token.
              </div>
            ) : null}
            {success ? (
              <div className={cn("rounded-[18px] border px-4 py-3 text-sm", statusClass("success"))}>
                {success}
              </div>
            ) : null}
            {error ? (
              <div className={cn("rounded-[18px] border px-4 py-3 text-sm", statusClass("error"))}>
                {error}
              </div>
            ) : null}
          </div>

          {!tokenProblem ? (
            <motion.form variants={itemVariants} onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>New password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={inputClass}
                  placeholder="New password"
                />
              </div>

              <div>
                <label className={labelClass}>Confirm password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className={inputClass}
                  placeholder="Repeat your new password"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                {checks.map((check) => (
                  <div
                    key={check.label}
                    className={cn(
                      "rounded-[16px] border px-3 py-2 text-xs",
                      check.passed
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                        : "border-white/10 bg-white/[0.02] text-zinc-500",
                    )}
                  >
                    {check.label}
                  </div>
                ))}
              </div>

              <button type="submit" disabled={loading || !authConfigured} className={primaryButtonClass}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
              </button>
            </motion.form>
          ) : (
            <div className="space-y-4">
              <div className={cn("rounded-[18px] border px-4 py-3 text-sm", statusClass("warning"))}>
                Request a fresh reset link to continue. Old or broken links cannot be used again.
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={buildForgotPasswordHref(redirectTo)} className={inlinePrimaryButtonClass}>
                  Request a new reset link
                </Link>
                <Link href={buildLoginHref(redirectTo)} className={inlineSecondaryButtonClass}>
                  Back to sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </motion.section>
    </motion.section>
  );
}