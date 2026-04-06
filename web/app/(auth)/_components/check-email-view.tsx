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



export function CheckEmailView({
  authConfigured,
  previewEnabled,
  email,
  flow,
  previewUrl,
  callbackUrl,
}: {
  authConfigured: boolean;
  previewEnabled: boolean;
  email?: string | null;
  flow?: string | null;
  previewUrl?: string | null;
  callbackUrl?: string | null;
}) {
  const router = useRouter();
  const resolvedEmail = email || "your inbox";
  const resolvedFlow = flow || "verify-email";
  const resolvedPreviewUrl = previewUrl || "";
  const redirectTo = sanitizeRedirectTarget(callbackUrl, "/dashboard");
  const [copyState, setCopyState] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const flowTitle =
    resolvedFlow === "reset-password" ? "Check the password reset step" : "Check the verification step";
  const flowDescription =
    resolvedFlow === "reset-password"
      ? "If email delivery is not configured, the reset link is surfaced right here so the flow stays testable end to end."
      : "If email delivery is not configured, the verification link is surfaced right here so account activation stays testable end to end.";

  const copyPreviewUrl = async () => {
    if (!resolvedPreviewUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(resolvedPreviewUrl);
      setCopyState(true);
      window.setTimeout(() => setCopyState(false), 1200);
    } catch {
      setError("Could not copy the preview link.");
    }
  };

  const resend = async () => {
    if (!authConfigured) {
      setError(authUnavailableMessage(previewEnabled, "email verification"));
      return;
    }

    setResending(true);
    setMessage(null);
    setError(null);

    try {
      const payload = await postJson("/api/auth/resend-verification", {
        email: resolvedEmail,
        callbackUrl: redirectTo,
      });
      setMessage(payload.message || "A fresh verification link is ready.");
      if (payload.redirectTo) {
        router.push(payload.redirectTo);
      }
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
            <span className={pillClass}>{resolvedFlow === "reset-password" ? "Reset email" : "Verification email"}</span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">{flowTitle}</h1>
              <p className="text-sm leading-7 text-zinc-400">{flowDescription}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Flow",
                value: resolvedFlow === "reset-password" ? "Password recovery" : "Email verification",
              },
              { label: "Destination", value: resolvedEmail },
              { label: "Mode", value: resolvedPreviewUrl ? "In-app preview link" : "Inbox delivery" },
            ].map((item) => (
              <div key={item.label} className="rounded-[18px] border border-white/10 bg-white/[0.02] px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{item.label}</p>
                <p className="mt-2 text-sm text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className={cn("rounded-[18px] border px-4 py-3", statusClass("neutral"))}>
            <div className="flex items-start gap-3 text-sm">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium text-white">{resolvedEmail}</p>
                <p className="mt-1 text-zinc-400">
                  {resolvedFlow === "reset-password"
                    ? "Use the reset link to choose a new password, then return to sign in."
                    : "Use the verification link to activate password-based sign-in for this account."}
                </p>
              </div>
            </div>
          </div>

          {resolvedPreviewUrl ? (
            <div className={cn("space-y-4 rounded-[18px] border px-4 py-4", statusClass("success"))}>
              <div className="space-y-2">
                <p className="text-sm font-medium text-white">Preview link</p>
                <p className="break-all text-sm">{resolvedPreviewUrl}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => void copyPreviewUrl()} className={inlineSecondaryButtonClass}>
                  <Copy className="h-4 w-4" />
                  {copyState ? "Copied" : "Copy link"}
                </button>
                <Link href={resolvedPreviewUrl} className={inlinePrimaryButtonClass}>
                  <ExternalLink className="h-4 w-4" />
                  Open link
                </Link>
              </div>
            </div>
          ) : (
            <div className={cn("rounded-[18px] border px-4 py-3 text-sm", statusClass("neutral"))}>
              Once a delivery provider is added, this screen will point people to their inbox instead of exposing preview links directly in the app.
            </div>
          )}

          {message ? (
            <div className={cn("rounded-[18px] border px-4 py-3 text-sm", statusClass("success"))}>
              {message}
            </div>
          ) : null}
          {error ? (
            <div className={cn("rounded-[18px] border px-4 py-3 text-sm", statusClass("error"))}>
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {resolvedFlow === "verify-email" ? (
              <button
                type="button"
                onClick={() => void resend()}
                disabled={resending}
                className={inlineSecondaryButtonClass}
              >
                {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                Resend verification
              </button>
            ) : (
              <Link href={buildForgotPasswordHref(redirectTo)} className={inlineSecondaryButtonClass}>
                Request another reset email
              </Link>
            )}
            <Link href={buildLoginHref(redirectTo)} className={inlinePrimaryButtonClass}>
              Return to sign in
            </Link>
          </div>
        </div>
      </motion.section>
    </motion.section>
  );
}