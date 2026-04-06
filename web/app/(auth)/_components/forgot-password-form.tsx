"use client";

import {  useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";


import {
  
  buildLoginHref,
  
  sanitizeRedirectTarget,
} from "@/lib/auth-routing";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2 } from "lucide-react";

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
export function ForgotPasswordForm({
  authConfigured,
  previewEnabled,
  callbackUrl,
}: {
  authConfigured: boolean;
  previewEnabled: boolean;
  callbackUrl?: string | null;
}) {
  const router = useRouter();
  const redirectTo = sanitizeRedirectTarget(callbackUrl, "/dashboard");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Enter the email address tied to this account.");
      return;
    }

    if (!authConfigured) {
      setError(authUnavailableMessage(previewEnabled, "password reset"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = await postJson("/api/auth/forgot-password", {
        email,
        callbackUrl: redirectTo,
      });
      router.push(payload.redirectTo || buildLoginHref(redirectTo));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not start the password reset flow.",
      );
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
            <span className={pillClass}>Password reset</span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">
                Prepare a reset link for this account
              </h1>
              <p className="text-sm leading-7 text-zinc-400">
                We will generate the next step for password recovery. In preview mode, the link is surfaced in-app instead of being emailed.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Input", value: "Account email" },
              { label: "Output", value: "Reset link or inbox delivery" },
              { label: "Return", value: "Back to sign-in after reset" },
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
                {authUnavailableMessage(previewEnabled, "password reset")}
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

            <button type="submit" disabled={loading || !authConfigured} className={primaryButtonClass}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
            </button>
          </motion.form>

          <p className="border-t border-white/10 pt-2 text-sm text-zinc-400">
            Remembered it?{" "}
            <Link
              href={buildLoginHref(redirectTo)}
              className="text-white underline underline-offset-4 decoration-white/20 transition hover:decoration-white/50"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </motion.section>
    </motion.section>
  );
}
