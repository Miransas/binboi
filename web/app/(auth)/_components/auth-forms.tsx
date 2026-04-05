"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  buildForgotPasswordHref,
  buildLoginHref,
  buildRegisterHref,
  sanitizeRedirectTarget,
} from "@/lib/auth-routing";
import { cn } from "@/lib/utils";

import {
  AuthCard,
  AuthFeatureStrip,
  AuthField,
  AuthFooterLink,
  AuthHeader,
  AuthStatus,
  authInlinePrimaryButtonClass,
  authInlineSecondaryButtonClass,
  authInputClass,
  authMutedTextClass,
  authPrimaryButtonClass,
  authSecondaryButtonClass,
} from "./auth-primitives";

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

function AuthTopLinks() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to home
    </Link>
  );
}

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

function PasswordChecklist({
  password,
  confirmPassword,
}: {
  password: string;
  confirmPassword?: string;
}) {
  const checks = [
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

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {checks.map((check) => (
        <div
          key={check.label}
          className={cn(
            "rounded-[1.2rem] border px-3 py-2 text-xs leading-6 transition",
            check.passed
              ? "border-emerald-400/18 bg-emerald-400/8 text-emerald-100"
              : "border-white/10 bg-white/[0.03] text-zinc-500",
          )}
        >
          <span className="font-medium">{check.label}</span>
        </div>
      ))}
    </div>
  );
}

function AuthPreviewLinkCard({
  previewUrl,
  copied,
  onCopy,
}: {
  previewUrl: string;
  copied: boolean;
  onCopy: () => Promise<void> | void;
}) {
  return (
    <AuthStatus tone="success">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium text-white">Preview link</p>
            <p className="mt-1 break-all text-sm text-emerald-100">{previewUrl}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void onCopy()}
            className={authInlineSecondaryButtonClass}
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied" : "Copy link"}
          </button>
          <Link href={previewUrl} className={authInlinePrimaryButtonClass}>
            <ExternalLink className="h-4 w-4" />
            Open link
          </Link>
        </div>
      </div>
    </AuthStatus>
  );
}

export function LoginForm({
  authConfigured,
  githubEnabled,
  previewEnabled,
}: {
  authConfigured: boolean;
  githubEnabled: boolean;
  previewEnabled: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeRedirectTarget(
    searchParams.get("callbackUrl"),
    "/dashboard",
  );
  const verified = searchParams.get("verified");
  const reset = searchParams.get("reset");
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
        callbackUrl,
      });
      router.push(payload.redirectTo || callbackUrl);
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
        callbackUrl,
      });
      router.push(
        payload.redirectTo ||
          buildLoginHref(callbackUrl),
      );
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
    <div className="space-y-6">
      <AuthTopLinks />
      <AuthCard>
        <AuthHeader
          eyebrow="Sign in"
          title="Access the Binboi control plane"
          description="Use your email and password, or continue with GitHub when OAuth is configured for this deployment."
        />

        <AuthFeatureStrip
          items={[
            { label: "Session", value: "Protected dashboard access" },
            { label: "Identity", value: "Email verification enforced" },
            { label: "Fallback", value: authFallbackLabel(authConfigured, previewEnabled) },
          ]}
        />

        <div className="mt-8 space-y-4">
          {notice ? <AuthStatus tone="success">{notice}</AuthStatus> : null}
          {!authConfigured ? (
            <AuthStatus tone="warning">
              {authUnavailableMessage(previewEnabled, "sign-in")}
            </AuthStatus>
          ) : null}
          {error ? <AuthStatus tone="error">{error}</AuthStatus> : null}
          {errorCode === "EMAIL_NOT_VERIFIED" ? (
            <AuthStatus tone="warning">
              Your account exists, but email verification has not been completed yet.
            </AuthStatus>
          ) : null}
        </div>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <AuthField label="Email" description="Use the address tied to your dashboard identity.">
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={authInputClass}
              placeholder="you@company.com"
            />
          </AuthField>

          <AuthField label="Password">
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={authInputClass}
              placeholder="Enter your password"
            />
          </AuthField>

          <button
            type="submit"
            disabled={loading || oauthLoading || !authConfigured}
            className={authPrimaryButtonClass}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </button>
        </form>

        {errorCode === "EMAIL_NOT_VERIFIED" ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => void resendVerification()}
              disabled={resending}
              className={authSecondaryButtonClass}
            >
              {resending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Resend verification email
            </button>
          </div>
        ) : null}

        <div className="mt-4 space-y-3">
          {githubEnabled ? (
            <button
              type="button"
              onClick={() => {
                setOauthLoading(true);
                void signIn("github", { callbackUrl });
              }}
              disabled={loading || oauthLoading}
              className={authSecondaryButtonClass}
            >
              {oauthLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Continue with GitHub
            </button>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <AuthFooterLink
            prompt="Need an account?"
            href={buildRegisterHref(callbackUrl)}
            label="Create one"
          />
          <Link
            className="text-sm text-zinc-400 transition hover:text-white"
            href={buildForgotPasswordHref(callbackUrl)}
          >
            Forgot password
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}

export function RegisterForm({
  authConfigured,
  previewEnabled,
}: {
  authConfigured: boolean;
  previewEnabled: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeRedirectTarget(
    searchParams.get("callbackUrl"),
    "/dashboard",
  );
  const inviteToken = searchParams.get("invite");
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
        callbackUrl,
      });
      router.push(payload.redirectTo || buildLoginHref(callbackUrl));
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

  return (
    <div className="space-y-6">
      <AuthTopLinks />
      <AuthCard>
        <AuthHeader
          eyebrow={inviteToken ? "Accept invite" : "Create account"}
          title={inviteToken ? "Create the account behind this invite" : "Set up your Binboi identity"}
          description="Register with email and password, verify the address, then use dashboard-issued access tokens for machine auth."
        />

        <AuthFeatureStrip
          items={[
            { label: "Identity", value: "Name, email, password" },
            { label: "Verification", value: "Email activation before sign-in" },
            { label: "Invite", value: inviteToken ? "Invite context attached" : "Open registration" },
          ]}
        />

        <div className="mt-8 space-y-4">
          {!authConfigured ? (
            <AuthStatus tone="warning">
              {authUnavailableMessage(previewEnabled, "registration")}
            </AuthStatus>
          ) : null}
          {inviteToken ? (
            <AuthStatus tone="neutral">
              You are registering from an invite link. Use the invited email address so the invite
              can be accepted automatically.
            </AuthStatus>
          ) : null}
          {error ? <AuthStatus tone="error">{error}</AuthStatus> : null}
        </div>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <AuthField label="Full name">
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={authInputClass}
              placeholder="Binboi Operator"
            />
          </AuthField>

          <AuthField label="Email">
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={authInputClass}
              placeholder="you@company.com"
            />
          </AuthField>

          <AuthField
            label="Password"
            description="Use at least 8 characters, including letters and numbers."
          >
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={authInputClass}
              placeholder="Create a password"
            />
          </AuthField>

          <AuthField label="Confirm password">
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={authInputClass}
              placeholder="Repeat your password"
            />
          </AuthField>

          <PasswordChecklist password={password} confirmPassword={confirmPassword} />

          <button
            type="submit"
            disabled={loading || !authConfigured}
            className={authPrimaryButtonClass}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <AuthFooterLink
            prompt="Already have an account?"
            href={buildLoginHref(callbackUrl)}
            label="Sign in"
          />
          {errorCode === "ACCOUNT_EXISTS" ? (
            <Link
              href={buildLoginHref(callbackUrl)}
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              Continue to sign in
            </Link>
          ) : null}
        </div>
      </AuthCard>
    </div>
  );
}

export function ForgotPasswordForm({
  authConfigured,
  previewEnabled,
}: {
  authConfigured: boolean;
  previewEnabled: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = sanitizeRedirectTarget(
    searchParams.get("callbackUrl"),
    "/dashboard",
  );
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
        callbackUrl,
      });
      router.push(payload.redirectTo || buildLoginHref(callbackUrl));
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
    <div className="space-y-6">
      <AuthTopLinks />
      <AuthCard>
        <AuthHeader
          eyebrow="Password reset"
          title="Prepare a reset link for this account"
          description="We will generate the next step for password recovery. In preview mode, the link is surfaced in-app instead of being emailed."
        />

        <AuthFeatureStrip
          items={[
            { label: "Input", value: "Account email" },
            { label: "Output", value: "Reset link or inbox delivery" },
            { label: "Return", value: "Back to sign-in after reset" },
          ]}
        />

        <div className="mt-8 space-y-4">
          {!authConfigured ? (
            <AuthStatus tone="warning">
              {authUnavailableMessage(previewEnabled, "password reset")}
            </AuthStatus>
          ) : null}
          {error ? <AuthStatus tone="error">{error}</AuthStatus> : null}
        </div>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <AuthField label="Email">
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={authInputClass}
              placeholder="you@company.com"
            />
          </AuthField>

          <button
            type="submit"
            disabled={loading || !authConfigured}
            className={authPrimaryButtonClass}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
          </button>
        </form>

        <div className="mt-6">
          <AuthFooterLink
            prompt="Remembered it?"
            href={buildLoginHref(callbackUrl)}
            label="Back to sign in"
          />
        </div>
      </AuthCard>
    </div>
  );
}

export function ResetPasswordForm({
  authConfigured,
  previewEnabled,
}: {
  authConfigured: boolean;
  previewEnabled: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const callbackUrl = sanitizeRedirectTarget(
    searchParams.get("callbackUrl"),
    "/dashboard",
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
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
        token,
        password,
        confirmPassword,
        callbackUrl,
      });
      setSuccess(payload.message || "Password updated successfully.");
      window.setTimeout(() => {
        router.push(payload.redirectTo || buildLoginHref(callbackUrl));
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
    !token || errorCode === "TOKEN_INVALID" || errorCode === "TOKEN_EXPIRED";

  return (
    <div className="space-y-6">
      <AuthTopLinks />
      <AuthCard>
        <AuthHeader
          eyebrow="Reset password"
          title="Finish the password reset flow"
          description="Set a fresh password for this account, then return to sign in with the updated credentials."
        />

        <AuthFeatureStrip
          items={[
            { label: "Token", value: token ? "Reset token detected" : "Missing token" },
            { label: "Account", value: email || "Email hidden in token" },
            { label: "Return", value: "Sign-in after success" },
          ]}
        />

        <div className="mt-8 space-y-4">
          {!token ? (
            <AuthStatus tone="error">This reset link is missing its token.</AuthStatus>
          ) : null}
          {success ? <AuthStatus tone="success">{success}</AuthStatus> : null}
          {error ? <AuthStatus tone="error">{error}</AuthStatus> : null}
        </div>

        {!tokenProblem ? (
          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            <AuthField
              label="New password"
              description="Use at least 8 characters, including letters and numbers."
            >
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={authInputClass}
                placeholder="New password"
              />
            </AuthField>

            <AuthField label="Confirm password">
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={authInputClass}
                placeholder="Repeat your new password"
              />
            </AuthField>

            <PasswordChecklist password={password} confirmPassword={confirmPassword} />

            <button
              type="submit"
              disabled={loading || !authConfigured}
              className={authPrimaryButtonClass}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
            </button>
          </form>
        ) : (
          <div className="mt-8 space-y-4">
            <AuthStatus tone="warning">
              Request a fresh reset link to continue. Old or broken links cannot be used again.
            </AuthStatus>
            <div className="flex flex-wrap gap-3">
              <Link href={buildForgotPasswordHref(callbackUrl)} className={authInlinePrimaryButtonClass}>
                Request a new reset link
              </Link>
              <Link href={buildLoginHref(callbackUrl)} className={authInlineSecondaryButtonClass}>
                Back to sign in
              </Link>
            </div>
          </div>
        )}
      </AuthCard>
    </div>
  );
}

export function VerifyEmailForm({
  authConfigured,
  previewEnabled,
}: {
  authConfigured: boolean;
  previewEnabled: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const callbackUrl = sanitizeRedirectTarget(
    searchParams.get("callbackUrl"),
    "/dashboard",
  );
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("Preparing your verification link...");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!token) {
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
        const payload = await postJson("/api/auth/verify-email", { token, callbackUrl });
        if (cancelled) {
          return;
        }
        setStatus("success");
        setMessage(payload.message || "Email verified successfully.");
        window.setTimeout(() => {
          router.push(payload.redirectTo || buildLoginHref(callbackUrl));
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
  }, [authConfigured, callbackUrl, previewEnabled, router, token]);

  const resendVerification = async () => {
    if (!email.trim()) {
      setMessage("This verification link is no longer valid. Sign in or register again.");
      return;
    }

    setResending(true);

    try {
      const payload = await postJson("/api/auth/resend-verification", {
        email,
        callbackUrl,
      });
      router.push(payload.redirectTo || buildLoginHref(callbackUrl));
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

  return (
    <div className="space-y-6">
      <AuthTopLinks />
      <AuthCard>
        <AuthHeader
          eyebrow="Verify email"
          title="Confirm the address behind this account"
          description="Verification unlocks password-based sign-in and keeps the dashboard tied to a trusted human identity."
        />

        <AuthFeatureStrip
          items={[
            { label: "Status", value: status === "success" ? "Verified" : status === "error" ? "Action required" : "In progress" },
            { label: "Email", value: email || "Token-managed" },
            { label: "Next", value: "Return to sign-in" },
          ]}
        />

        <div className="mt-8">
          <AuthStatus tone={status === "success" ? "success" : status === "error" ? "error" : "neutral"}>
            <div className="flex items-center gap-3">
              {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {status === "success" ? <CheckCircle2 className="h-4 w-4" /> : null}
              {status === "error" ? <AlertTriangle className="h-4 w-4" /> : null}
              <span>{message}</span>
            </div>
          </AuthStatus>
        </div>

        {status === "error" ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {email ? (
              <button
                type="button"
                onClick={() => void resendVerification()}
                disabled={resending || !authConfigured}
                className={authInlineSecondaryButtonClass}
              >
                {resending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                Resend verification
              </button>
            ) : null}
            <Link href={buildLoginHref(callbackUrl)} className={authInlinePrimaryButtonClass}>
              Back to sign in
            </Link>
          </div>
        ) : null}
      </AuthCard>
    </div>
  );
}

export function CheckEmailView({
  authConfigured,
  previewEnabled,
}: {
  authConfigured: boolean;
  previewEnabled: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your inbox";
  const flow = searchParams.get("flow") || "verify-email";
  const previewUrl = searchParams.get("previewUrl");
  const callbackUrl = sanitizeRedirectTarget(
    searchParams.get("callbackUrl"),
    "/dashboard",
  );
  const [copyState, setCopyState] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const flowTitle =
    flow === "reset-password" ? "Check the password reset step" : "Check the verification step";
  const flowDescription =
    flow === "reset-password"
      ? "If email delivery is not configured, the reset link is surfaced right here so the flow stays testable end to end."
      : "If email delivery is not configured, the verification link is surfaced right here so account activation stays testable end to end.";

  const copyPreviewUrl = async () => {
    if (!previewUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(previewUrl);
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
        email,
        callbackUrl,
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
    <div className="space-y-6">
      <AuthTopLinks />
      <AuthCard>
        <AuthHeader
          eyebrow={flow === "reset-password" ? "Reset email" : "Verification email"}
          title={flowTitle}
          description={flowDescription}
        />

        <AuthFeatureStrip
          items={[
            { label: "Flow", value: flow === "reset-password" ? "Password recovery" : "Email verification" },
            { label: "Destination", value: email },
            { label: "Mode", value: previewUrl ? "In-app preview link" : "Inbox delivery" },
          ]}
        />

        <div className="mt-8 space-y-4">
          <AuthStatus tone="neutral">
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium text-white">{email}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  {flow === "reset-password"
                    ? "Use the reset link to choose a new password, then return to sign in."
                    : "Use the verification link to activate password-based sign-in for this account."}
                </p>
              </div>
            </div>
          </AuthStatus>

          {previewUrl ? (
            <AuthPreviewLinkCard
              previewUrl={previewUrl}
              copied={copyState}
              onCopy={copyPreviewUrl}
            />
          ) : (
            <AuthStatus tone="neutral">
              Once a delivery provider is added, this screen will point people to their inbox
              instead of exposing preview links directly in the app.
            </AuthStatus>
          )}

          {message ? <AuthStatus tone="success">{message}</AuthStatus> : null}
          {error ? <AuthStatus tone="error">{error}</AuthStatus> : null}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {flow === "verify-email" ? (
            <button
              type="button"
              onClick={() => void resend()}
              disabled={resending}
              className={authInlineSecondaryButtonClass}
            >
              {resending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Resend verification
            </button>
          ) : (
            <Link href={buildForgotPasswordHref(callbackUrl)} className={authInlineSecondaryButtonClass}>
              Request another reset email
            </Link>
          )}
          <Link href={buildLoginHref(callbackUrl)} className={authInlinePrimaryButtonClass}>
            Return to sign in
          </Link>
        </div>
      </AuthCard>
    </div>
  );
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
  const [errorCode, setErrorCode] = useState<string | null>(
    invalidMessage ? "INVITE_INVALID" : null,
  );

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

  const alreadySignedIn = Boolean(session?.user?.id);

  return (
    <div className="space-y-6">
      <AuthTopLinks />
      <AuthCard>
        <AuthHeader
          eyebrow="Invite"
          title="Accept your Binboi invite"
          description="Complete account setup with the invited email, create a password, and land directly in the dashboard once the invite is consumed."
        />

        <AuthFeatureStrip
          items={[
            { label: "Invite", value: invalidMessage ? "Needs attention" : "Ready to accept" },
            { label: "Email", value: invitedEmail || email || "Provided in link" },
            { label: "Destination", value: "Dashboard after completion" },
          ]}
        />

        <div className="mt-8 space-y-4">
          {!authConfigured ? (
            <AuthStatus tone="warning">
              {authUnavailableMessage(previewEnabled, "invite acceptance")}
            </AuthStatus>
          ) : null}
          {alreadySignedIn ? (
            <AuthStatus tone="warning">
              You are already signed in as{" "}
              <span className="font-medium text-white">{session?.user?.email}</span>. Sign out
              before accepting an invite for a different identity.
            </AuthStatus>
          ) : null}
          {invalidMessage ? <AuthStatus tone="error">{invalidMessage}</AuthStatus> : null}
          {!invalidMessage && invitedEmail ? (
            <AuthStatus tone="neutral">
              This invite is reserved for{" "}
              <span className="font-medium text-white">{invitedEmail}</span>.
            </AuthStatus>
          ) : null}
          {error && error !== invalidMessage ? <AuthStatus tone="error">{error}</AuthStatus> : null}
        </div>

        {alreadySignedIn ? (
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className={authInlinePrimaryButtonClass}>
              Go to dashboard
            </Link>
            <button
              type="button"
              onClick={() => void signOut({ callbackUrl: buildLoginHref("/dashboard") })}
              className={authInlineSecondaryButtonClass}
            >
              <LogOut className="h-4 w-4" />
              Sign out first
            </button>
          </div>
        ) : !invalidMessage ? (
          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            <AuthField label="Full name">
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={authInputClass}
                placeholder="Binboi Operator"
              />
            </AuthField>

            <AuthField label="Invited email">
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={authInputClass}
                readOnly={Boolean(invitedEmail)}
              />
            </AuthField>

            <AuthField
              label="Password"
              description="Use at least 8 characters, including letters and numbers."
            >
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={authInputClass}
                placeholder="Create a password"
              />
            </AuthField>

            <AuthField label="Confirm password">
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={authInputClass}
                placeholder="Repeat your password"
              />
            </AuthField>

            <PasswordChecklist password={password} confirmPassword={confirmPassword} />

            <button
              type="submit"
              disabled={loading || !authConfigured}
              className={authPrimaryButtonClass}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept invite"}
            </button>
          </form>
        ) : (
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={buildLoginHref("/dashboard")} className={authInlinePrimaryButtonClass}>
              Sign in
            </Link>
            <Link href="/" className={authInlineSecondaryButtonClass}>
              Back to home
            </Link>
          </div>
        )}

        <div className="mt-6">
          <p className={authMutedTextClass}>
            Already have access?{" "}
            <Link
              className="text-white underline underline-offset-4 decoration-white/20"
              href={buildLoginHref("/dashboard")}
            >
              Sign in
            </Link>
          </p>
          {errorCode === "ACCOUNT_EXISTS" ? (
            <p className="mt-2 text-sm text-zinc-400">
              This email already has an account. Sign in instead of registering again.
            </p>
          ) : null}
        </div>
      </AuthCard>
    </div>
  );
}
