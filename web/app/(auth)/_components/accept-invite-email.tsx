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


export function AcceptInviteForm({
  authConfigured,
  previewEnabled,
  token,
  invitedEmail,
  invalidMessage,
}: {
  authConfigured: boolean;
  previewEnabled: boolean;
  token: string;
  invitedEmail?: string;
  invalidMessage?: string | null;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(invitedEmail || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(invalidMessage || null);
  const [errorCode, setErrorCode] = useState<string | null>(invalidMessage ? "INVITE_INVALID" : null);

  const alreadySignedIn = Boolean(session?.user?.id);
  const checks = passwordChecks(password, confirmPassword);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Enter your full name.");
      setErrorCode(null);
      return;
    }
    if (!email.trim()) {
      setError("Enter the invited email address.");
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
      setError(authUnavailableMessage(previewEnabled, "invite acceptance"));
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
        inviteToken: token,
        callbackUrl: "/dashboard",
      });
      router.push(payload.redirectTo || "/dashboard");
      router.refresh();
    } catch (submitError) {
      if (submitError instanceof AuthApiError) {
        setError(submitError.message);
        setErrorCode(submitError.code || null);
      } else {
        setError("Could not accept this invite.");
        setErrorCode(null);
      }
    } finally {
      setLoading(false);
    }
  };

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
            <span className={pillClass}>Invite</span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">
                Accept your Binboi invite
              </h1>
              <p className="text-sm leading-7 text-zinc-400">
                Complete account setup with the invited email, create a password, and land directly in the dashboard once the invite is consumed.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Invite", value: invalidMessage ? "Needs attention" : "Ready to accept" },
              { label: "Email", value: invitedEmail || email || "Provided in link" },
              { label: "Destination", value: "Dashboard after completion" },
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
                {authUnavailableMessage(previewEnabled, "invite acceptance")}
              </div>
            ) : null}
            {alreadySignedIn ? (
              <div className={cn("rounded-[18px] border px-4 py-3 text-sm", statusClass("warning"))}>
                You are already signed in as <span className="font-medium text-white">{session?.user?.email}</span>. Sign out before accepting an invite for a different identity.
              </div>
            ) : null}
            {invalidMessage ? (
              <div className={cn("rounded-[18px] border px-4 py-3 text-sm", statusClass("error"))}>
                {invalidMessage}
              </div>
            ) : null}
            {!invalidMessage && invitedEmail ? (
              <div className={cn("rounded-[18px] border px-4 py-3 text-sm", statusClass("neutral"))}>
                This invite is reserved for <span className="font-medium text-white">{invitedEmail}</span>.
              </div>
            ) : null}
            {error && error !== invalidMessage ? (
              <div className={cn("rounded-[18px] border px-4 py-3 text-sm", statusClass("error"))}>
                {error}
              </div>
            ) : null}
          </div>

          {alreadySignedIn ? (
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className={inlinePrimaryButtonClass}>
                Go to dashboard
              </Link>
              <button
                type="button"
                onClick={() => void signOut({ callbackUrl: buildLoginHref("/dashboard") })}
                className={inlineSecondaryButtonClass}
              >
                <LogOut className="h-4 w-4" />
                Sign out first
              </button>
            </div>
          ) : !invalidMessage ? (
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
                <label className={labelClass}>Invited email</label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={inputClass}
                  readOnly={Boolean(invitedEmail)}
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
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept invite"}
              </button>
            </motion.form>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Link href={buildLoginHref("/dashboard")} className={inlinePrimaryButtonClass}>
                Sign in
              </Link>
              <Link href="/" className={inlineSecondaryButtonClass}>
                Back to home
              </Link>
            </div>
          )}

          <div className="border-t border-white/10 pt-2 text-sm text-zinc-400">
            Already have access?{" "}
            <Link
              className="text-white underline underline-offset-4 decoration-white/20 transition hover:decoration-white/50"
              href={buildLoginHref("/dashboard")}
            >
              Sign in
            </Link>
            {errorCode === "ACCOUNT_EXISTS" ? (
              <p className="mt-2 text-zinc-500">
                This email already has an account. Sign in instead of registering again.
              </p>
            ) : null}
          </div>
        </div>
      </motion.section>
    </motion.section>
  );
}
