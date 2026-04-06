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



const inlinePrimaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60";

const inlineSecondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60";


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

export function VerifyEmailForm({
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
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("Preparing your verification link...");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!resolvedToken) {
        setStatus("error");
        setMessage("This verification link is missing its token.");
        return;
      }

      if (!authConfigured) {
        setStatus("error");
        setMessage(authUnavailableMessage(previewEnabled, "email verification"));
        return;
      }

      setStatus("loading");
      setMessage("Verifying your email now...");

      try {
        const payload = await postJson("/api/auth/verify-email", {
          token: resolvedToken,
          callbackUrl: redirectTo,
        });
        if (cancelled) {
          return;
        }
        setStatus("success");
        setMessage(payload.message || "Email verified successfully.");
        window.setTimeout(() => {
          router.push(payload.redirectTo || buildLoginHref(redirectTo));
        }, 1000);
      } catch (submitError) {
        if (cancelled) {
          return;
        }
        setStatus("error");
        setMessage(
          submitError instanceof Error
            ? submitError.message
            : "Could not verify this email address.",
        );
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [authConfigured, previewEnabled, redirectTo, resolvedToken, router]);

  const resendVerification = async () => {
    if (!resolvedEmail.trim()) {
      setMessage("This verification link is no longer valid. Sign in or register again.");
      return;
    }

    setResending(true);

    try {
      const payload = await postJson("/api/auth/resend-verification", {
        email: resolvedEmail,
        callbackUrl: redirectTo,
      });
      router.push(payload.redirectTo || buildLoginHref(redirectTo));
    } catch (submitError) {
      setStatus("error");
      setMessage(
        submitError instanceof Error
          ? submitError.message
          : "Could not resend the verification link.",
      );
    } finally {
      setResending(false);
    }
  };

  const tone = status === "success" ? "success" : status === "error" ? "error" : "neutral";

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
            <span className={pillClass}>Verify email</span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">
                Confirm the address behind this account
              </h1>
              <p className="text-sm leading-7 text-zinc-400">
                Verification unlocks password-based sign-in and keeps the dashboard tied to a trusted human identity.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Status",
                value:
                  status === "success"
                    ? "Verified"
                    : status === "error"
                      ? "Action required"
                      : "In progress",
              },
              { label: "Email", value: resolvedEmail || "Token-managed" },
              { label: "Next", value: "Return to sign-in" },
            ].map((item) => (
              <div key={item.label} className="rounded-[18px] border border-white/10 bg-white/[0.02] px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{item.label}</p>
                <p className="mt-2 text-sm text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className={cn("rounded-[18px] border px-4 py-3 text-sm", statusClass(tone))}>
            <div className="flex items-center gap-3">
              {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {status === "success" ? <CheckCircle2 className="h-4 w-4" /> : null}
              {status === "error" ? <AlertTriangle className="h-4 w-4" /> : null}
              <span>{message}</span>
            </div>
          </div>

          {status === "error" ? (
            <div className="flex flex-wrap gap-3">
              {resolvedEmail ? (
                <button
                  type="button"
                  onClick={() => void resendVerification()}
                  disabled={resending || !authConfigured}
                  className={inlineSecondaryButtonClass}
                >
                  {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                  Resend verification
                </button>
              ) : null}
              <Link href={buildLoginHref(redirectTo)} className={inlinePrimaryButtonClass}>
                Back to sign in
              </Link>
            </div>
          ) : null}
        </div>
      </motion.section>
    </motion.section>
  );
}