"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft, CheckCircle2, Copy, Mail, RefreshCcw } from "lucide-react";
import { signIn } from "next-auth/react";

import {
  AuthCard,
  AuthField,
  AuthFooterLink,
  AuthHeader,
  AuthStatus,
  authInputClass,
  authMutedTextClass,
  authPrimaryButtonClass,
  authSecondaryButtonClass,
} from "./auth-primitives";

type JsonResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
  redirectTo?: string;
  delivery?: {
    mode: "preview";
    previewUrl: string;
  } | null;
  alreadyVerified?: boolean;
};

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
    throw new Error(payload.error || "Something went wrong.");
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

export function LoginForm({
  authConfigured,
  githubEnabled,
}: {
  authConfigured: boolean;
  githubEnabled: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const verified = searchParams.get("verified");
  const reset = searchParams.get("reset");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!authConfigured) {
      setError("Database-backed auth is not configured for this deployment.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = await postJson("/api/auth/login", {
        email,
        password,
        callbackUrl,
      });
      router.push(payload.redirectTo || callbackUrl);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Could not sign in right now.",
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
          eyebrow="Authentication"
          title="Sign in to the Binboi control plane"
          description="Use your email and password, or continue with GitHub when OAuth is configured for this deployment."
        />

        <div className="mt-8 space-y-4">
          {notice ? <AuthStatus tone="success">{notice}</AuthStatus> : null}
          {!authConfigured ? (
            <AuthStatus tone="warning">
              This deployment is running without a configured auth database. Local preview mode is
              still available from the dashboard entry.
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
            disabled={loading || !authConfigured}
            className={authPrimaryButtonClass}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </button>
        </form>

        <div className="mt-4 space-y-3">
          {githubEnabled ? (
            <button
              type="button"
              onClick={() => void signIn("github", { callbackUrl })}
              className={authSecondaryButtonClass}
            >
              Continue with GitHub
            </button>
          ) : null}

          <Link href="/dashboard" className={authSecondaryButtonClass}>
            Continue in local preview mode
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <AuthFooterLink prompt="Need an account?" href="/register" label="Create one" />
          <Link className="text-sm text-zinc-400 transition hover:text-white" href="/forgot-password">
            Forgot password
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}

export function RegisterForm({ authConfigured }: { authConfigured: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const inviteToken = searchParams.get("invite");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!authConfigured) {
      setError("Database-backed auth is not configured for this deployment.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = await postJson("/api/auth/register", {
        name,
        email,
        password,
        confirmPassword,
        inviteToken,
        callbackUrl,
      });
      router.push(payload.redirectTo || "/check-email");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not create your account.",
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
          eyebrow="Create account"
          title="Set up your Binboi identity"
          description="Register with email and password, verify the address, then use dashboard-issued access tokens for machine auth."
        />

        <div className="mt-8 space-y-4">
          {!authConfigured ? (
            <AuthStatus tone="warning">
              Database-backed auth is not configured for this deployment yet, so registration is
              unavailable until `DATABASE_URL` is set.
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

          <AuthField label="Password" description="Use at least 8 characters with letters and numbers.">
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

          <button
            type="submit"
            disabled={loading || !authConfigured}
            className={authPrimaryButtonClass}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
          </button>
        </form>

        <div className="mt-6">
          <AuthFooterLink prompt="Already have an account?" href="/login" label="Sign in" />
        </div>
      </AuthCard>
    </div>
  );
}

export function ForgotPasswordForm({ authConfigured }: { authConfigured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!authConfigured) {
      setError("Database-backed auth is not configured for this deployment.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = await postJson("/api/auth/forgot-password", {
        email,
      });
      router.push(payload.redirectTo || "/check-email");
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
          title="Request a new sign-in link"
          description="We will prepare a password reset link for this account. In preview mode, the link is surfaced directly instead of being emailed."
        />

        <div className="mt-8 space-y-4">
          {!authConfigured ? (
            <AuthStatus tone="warning">
              Database-backed auth is not configured for this deployment, so password reset is not
              available yet.
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
          <AuthFooterLink prompt="Remembered it?" href="/login" label="Back to sign in" />
        </div>
      </AuthCard>
    </div>
  );
}

export function ResetPasswordForm({ authConfigured }: { authConfigured: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setError("This reset link is missing its token.");
      return;
    }

    if (!authConfigured) {
      setError("Database-backed auth is not configured for this deployment.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = await postJson("/api/auth/reset-password", {
        token,
        password,
        confirmPassword,
      });
      setSuccess(payload.message || "Password updated successfully.");
      window.setTimeout(() => {
        router.push(payload.redirectTo || "/login?reset=success");
      }, 900);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Could not reset your password.",
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
          eyebrow="Choose a new password"
          title="Finish the password reset flow"
          description="Use a fresh password, then sign back in to the dashboard with the updated credentials."
        />

        <div className="mt-8 space-y-4">
          {!token ? <AuthStatus tone="error">This reset link is missing its token.</AuthStatus> : null}
          {success ? <AuthStatus tone="success">{success}</AuthStatus> : null}
          {error ? <AuthStatus tone="error">{error}</AuthStatus> : null}
        </div>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <AuthField label="New password">
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

          <button
            type="submit"
            disabled={loading || !authConfigured || !token}
            className={authPrimaryButtonClass}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
          </button>
        </form>
      </AuthCard>
    </div>
  );
}

export function VerifyEmailForm({ authConfigured }: { authConfigured: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("Preparing your verification link...");

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
        setMessage("Database-backed auth is not configured for this deployment.");
        return;
      }

      setStatus("loading");
      setMessage("Verifying your email now...");

      try {
        const payload = await postJson("/api/auth/verify-email", { token });
        if (cancelled) {
          return;
        }
        setStatus("success");
        setMessage(payload.message || "Email verified successfully.");
        window.setTimeout(() => {
          router.push(payload.redirectTo || "/login?verified=success");
        }, 900);
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
  }, [authConfigured, router, token]);

  return (
    <div className="space-y-6">
      <AuthTopLinks />
      <AuthCard>
        <AuthHeader
          eyebrow="Verify email"
          title="Confirm your email address"
          description="Verification unlocks password-based sign-in and keeps the dashboard tied to a trusted human identity."
        />

        <div className="mt-8">
          <AuthStatus tone={status === "success" ? "success" : status === "error" ? "error" : "neutral"}>
            <div className="flex items-center gap-3">
              {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {status === "success" ? <CheckCircle2 className="h-4 w-4" /> : null}
              <span>{message}</span>
            </div>
          </AuthStatus>
        </div>

        <div className="mt-6">
          <AuthFooterLink prompt="Want to return?" href="/login" label="Back to sign in" />
        </div>
      </AuthCard>
    </div>
  );
}

export function CheckEmailView({ authConfigured }: { authConfigured: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your inbox";
  const flow = searchParams.get("flow") || "verify-email";
  const previewUrl = searchParams.get("previewUrl");
  const [copyState, setCopyState] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const copyPreviewUrl = async () => {
    if (!previewUrl) {
      return;
    }

    await navigator.clipboard.writeText(previewUrl);
    setCopyState(true);
    window.setTimeout(() => setCopyState(false), 1200);
  };

  const resend = async () => {
    if (!authConfigured) {
      setError("Database-backed auth is not configured for this deployment.");
      return;
    }

    setResending(true);
    setMessage(null);
    setError(null);

    try {
      const payload = await postJson("/api/auth/resend-verification", { email });
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
          title="Check the next step in your auth flow"
          description="This deployment currently surfaces auth links in-app when email delivery is not configured, so the flow still stays testable end to end."
        />

        <div className="mt-8 space-y-4">
          <AuthStatus tone="neutral">
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium text-white">{email}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  {flow === "reset-password"
                    ? "Use the reset link below to choose a new password."
                    : "Use the verification link below to activate password-based sign-in."}
                </p>
              </div>
            </div>
          </AuthStatus>

          {previewUrl ? (
            <AuthStatus tone="success">
              <div className="space-y-3">
                <p className="font-medium text-white">Preview link</p>
                <p className="break-all text-sm text-emerald-100">{previewUrl}</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void copyPreviewUrl()}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copyState ? "Copied" : "Copy link"}
                  </button>
                  <Link
                    href={previewUrl}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                  >
                    Open link
                  </Link>
                </div>
              </div>
            </AuthStatus>
          ) : (
            <AuthStatus tone="neutral">
              Email delivery is not wired yet in this repository, so once a provider is added this
              screen should switch from preview links to real inbox delivery.
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
              className={authSecondaryButtonClass}
            >
              {resending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4" />
              )}
              Resend verification
            </button>
          ) : null}
          <Link href="/login" className={authPrimaryButtonClass}>
            Return to sign in
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}

export function AcceptInviteForm({
  authConfigured,
  token,
  invitedEmail,
  invalidMessage,
}: {
  authConfigured: boolean;
  token: string;
  invitedEmail?: string;
  invalidMessage?: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(invitedEmail || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(invalidMessage || null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!authConfigured) {
      setError("Database-backed auth is not configured for this deployment.");
      return;
    }

    setLoading(true);
    setError(null);

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
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not accept this invite.",
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
          eyebrow="Invite"
          title="Accept your Binboi invite"
          description="Complete account setup with the invited email, create a password, and land directly in the dashboard once the invite is consumed."
        />

        <div className="mt-8 space-y-4">
          {!authConfigured ? (
            <AuthStatus tone="warning">
              Database-backed auth is not configured for this deployment yet, so invite acceptance
              is unavailable.
            </AuthStatus>
          ) : null}
          {invalidMessage ? <AuthStatus tone="error">{invalidMessage}</AuthStatus> : null}
          {!invalidMessage && invitedEmail ? (
            <AuthStatus tone="neutral">
              This invite is reserved for <span className="font-medium text-white">{invitedEmail}</span>.
            </AuthStatus>
          ) : null}
          {error && error !== invalidMessage ? <AuthStatus tone="error">{error}</AuthStatus> : null}
        </div>

        {!invalidMessage ? (
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

            <AuthField label="Password">
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

            <button
              type="submit"
              disabled={loading || !authConfigured}
              className={authPrimaryButtonClass}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept invite"}
            </button>
          </form>
        ) : null}

        <div className="mt-6">
          <p className={authMutedTextClass}>
            Already have access? <Link className="text-white underline underline-offset-4 decoration-white/20" href="/login">Sign in</Link>
          </p>
        </div>
      </AuthCard>
    </div>
  );
}
