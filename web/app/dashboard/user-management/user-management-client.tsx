"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Loader2,
  Mail,
  RefreshCcw,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { BillingCancelButton } from "@/components/pricing/billing-cancel-button";
import { BillingChangePlanButton } from "@/components/pricing/billing-change-plan-button";
import { BillingCheckoutButton } from "@/components/pricing/billing-checkout-button";
import { usePricingPlan } from "@/components/provider/pricing-plan-provider";
import { useRegisterAssistantContext } from "@/components/shared/assistant-context";
import { buildLoginHref } from "@/lib/auth-routing";
import { getNextPlan, getPricingPlan, type BillingPlan } from "@/lib/pricing";

import { PremiumDashboardShell } from "../_components/premium-dashboard-shell";
import {
  dashboardBadgeClass,
  dashboardFieldLabelClass,
  dashboardGhostButtonClass,
  dashboardIconTileClass,
  dashboardInputClass,
  dashboardInsetPanelClass,
  dashboardMiniStatClass,
  dashboardMutedTextClass,
  dashboardPanelClass,
  dashboardPrimaryButtonClass,
  dashboardSecondaryButtonClass,
} from "../_components/dashboard-ui";

type SettingsState = {
  authenticated: boolean;
  mode: "database" | "preview" | "unavailable";
  credentialsEnabled: boolean;
  githubEnabled: boolean;
  previewEnabled: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    emailVerified: string | null;
  } | null;
};

type BillingState = {
  mode: "account" | "preview";
  configured: boolean;
  checkout_enabled: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    plan: BillingPlan;
  };
  subscription: {
    plan: BillingPlan;
    status: string;
    renewalDate: string | null;
    cancelAtPeriodEnd: boolean;
    paddleCustomerId: string | null;
    paddleSubscriptionId: string | null;
  };
};

type JsonResponse = {
  error?: string;
  code?: string;
  message?: string;
  authenticated?: boolean;
  mode?: SettingsState["mode"];
  credentialsEnabled?: boolean;
  githubEnabled?: boolean;
  previewEnabled?: boolean;
  emailChanged?: boolean;
  user?: SettingsState["user"];
  delivery?: {
    mode: "preview";
    previewUrl: string;
  } | null;
};

type Props = {
  initialSettings: SettingsState;
  initialBilling: BillingState | null;
  initialBillingError: string | null;
};

function formatDate(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildInitials(name: string, email: string) {
  const source = name.trim() || email.trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "BB";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

async function parseJson<T>(response: Response) {
  return (await response.json().catch(() => ({}))) as T;
}

export function UserManagementClient({
  initialSettings,
  initialBilling,
  initialBillingError,
}: Props) {
  const router = useRouter();
  const { refreshPlan } = usePricingPlan();
  const [settings, setSettings] = useState(initialSettings);
  const [billing, setBilling] = useState(initialBilling);
  const [billingError, setBillingError] = useState(initialBillingError);
  const [name, setName] = useState(initialSettings.user?.name ?? "");
  const [email, setEmail] = useState(initialSettings.user?.email ?? "");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [resending, setResending] = useState(false);
  const [deliveryPreviewUrl, setDeliveryPreviewUrl] = useState<string | null>(null);
  const [copiedPreviewUrl, setCopiedPreviewUrl] = useState(false);

  useEffect(() => {
    setName(settings.user?.name ?? "");
    setEmail(settings.user?.email ?? "");
  }, [settings.user?.email, settings.user?.name]);

  const activePlan = getPricingPlan(billing?.subscription.plan ?? "FREE");
  const nextPlan = getNextPlan(billing?.subscription.plan ?? "FREE");
  const verificationState = settings.user
    ? settings.user.emailVerified
      ? "Verified"
      : "Pending"
    : "Unavailable";

  useRegisterAssistantContext("dashboard-user-management", {
    currentPage: {
      path: "/dashboard/user-management",
      title: "User Management",
      area: "dashboard",
      summary: settings.user
        ? `User management is open for ${settings.user.email} with ${verificationState.toLowerCase()} email status and ${billing?.subscription.plan ?? "FREE"} billing plan.`
        : "User management is showing account setup requirements because no authenticated account is available.",
    },
  });

  const highlights = useMemo(
    () => [
      {
        label: "Account email",
        value: settings.user?.email ?? "Unavailable",
        note: settings.user
          ? "Credentials login, invite acceptance, and verification flows all key off this address."
          : "Database-backed auth is required before account settings can be edited.",
      },
      {
        label: "Verification",
        value: verificationState,
        note: !settings.user
          ? "An authenticated account is required before verification state can be managed."
          : settings.user.emailVerified
          ? "This account can continue using credentials sign-in normally."
          : "If the email changes, a fresh verification link is issued automatically.",
      },
      {
        label: "Billing plan",
        value: activePlan.name,
        note: billing
          ? "Billing stays linked to the same user record, so plan changes and cancellation remain inside the account area."
          : billingError || "Billing state could not be loaded for this account.",
      },
    ],
    [activePlan.name, billing, billingError, settings.user, verificationState],
  );

  const panels = useMemo(
    () => [
      {
        title: "Profile and identity",
        description:
          "Keep the account name and primary email aligned with the person operating this workspace. Email changes trigger a new verification request automatically.",
      },
      {
        title: "Billing ownership",
        description:
          "Subscription actions stay on the same user record that owns the dashboard, so plan changes and cancellation stay account-scoped.",
      },
    ],
    [],
  );

  const loadBilling = async () => {
    const response = await fetch("/api/billing", { cache: "no-store" });
    const payload = await parseJson<BillingState & { error?: string }>(response);

    if (!response.ok) {
      throw new Error(payload.error || "Could not load billing state.");
    }

    return payload;
  };

  const refreshAll = async () => {
    setRefreshing(true);
    setSaveError(null);

    try {
      const [settingsResponse, billingResult] = await Promise.allSettled([
        fetch("/api/auth/settings", { cache: "no-store" }),
        loadBilling(),
      ]);

      if (settingsResponse.status === "fulfilled") {
        const payload = await parseJson<JsonResponse>(settingsResponse.value);

        if (settingsResponse.value.status === 401) {
          router.push(buildLoginHref("/dashboard/user-management"));
          return;
        }

        if (!settingsResponse.value.ok) {
          throw new Error(payload.error || "Could not load your account settings.");
        }

        setSettings({
          authenticated: Boolean(payload.authenticated),
          mode: payload.mode ?? "unavailable",
          credentialsEnabled: Boolean(payload.credentialsEnabled),
          githubEnabled: Boolean(payload.githubEnabled),
          previewEnabled: Boolean(payload.previewEnabled),
          user: payload.user ?? null,
        });
      } else {
        throw new Error("Could not load your account settings.");
      }

      if (billingResult.status === "fulfilled") {
        setBilling(billingResult.value);
        setBillingError(null);
      } else {
        setBillingError(
          billingResult.reason instanceof Error
            ? billingResult.reason.message
            : "Could not load billing state.",
        );
      }

      void refreshPlan();
      router.refresh();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Could not refresh your account state.",
      );
    } finally {
      setRefreshing(false);
    }
  };

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!settings.credentialsEnabled) {
      setSaveError("User management requires database-backed auth in this deployment.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    setCopiedPreviewUrl(false);

    try {
      const response = await fetch("/api/auth/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });
      const payload = await parseJson<JsonResponse>(response);

      if (response.status === 401) {
        router.push(buildLoginHref("/dashboard/user-management"));
        return;
      }

      if (!response.ok || !payload.user) {
        throw new Error(payload.error || "Could not update your account settings.");
      }

      setSettings((current) => ({
        ...current,
        user: payload.user ?? current.user,
      }));
      setSaveSuccess(payload.message || "Profile updated successfully.");
      setDeliveryPreviewUrl(payload.delivery?.previewUrl ?? null);
      void refreshPlan();
      router.refresh();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Could not update your account settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  const resendVerification = async () => {
    if (!settings.user?.email) {
      return;
    }

    setResending(true);
    setSaveError(null);
    setSaveSuccess(null);
    setCopiedPreviewUrl(false);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: settings.user.email,
          callbackUrl: "/dashboard/user-management",
        }),
      });
      const payload = await parseJson<JsonResponse>(response);

      if (!response.ok) {
        throw new Error(payload.error || "Could not resend the verification link.");
      }

      setSaveSuccess(payload.message || "A new verification link is ready.");
      setDeliveryPreviewUrl(payload.delivery?.previewUrl ?? null);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Could not resend the verification link.",
      );
    } finally {
      setResending(false);
    }
  };

  const copyPreviewUrl = async () => {
    if (!deliveryPreviewUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(deliveryPreviewUrl);
      setCopiedPreviewUrl(true);
    } catch {
      setCopiedPreviewUrl(false);
    }
  };

  const accountInitials = settings.user
    ? buildInitials(settings.user.name, settings.user.email)
    : "BB";

  return (
    <PremiumDashboardShell
      eyebrow="User Management"
      title="Manage the operator account behind this dashboard"
      description="Keep the dashboard owner profile clean, update the account name and primary email, and handle subscription changes from the same place without jumping between disconnected screens."
      highlights={highlights}
      panels={panels}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <section className={dashboardPanelClass("neutral", "p-6")}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={dashboardIconTileClass("neutral")}>
                <UserRound className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-white">
                  Profile settings
                </h2>
                <p className="mt-1 text-sm text-[rgba(194,203,219,0.7)]">
                  Edit the name and primary email used across auth, billing, and invite flows.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void refreshAll()}
              disabled={refreshing}
              className={dashboardGhostButtonClass}
            >
              <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {!settings.credentialsEnabled ? (
            <div className={dashboardInsetPanelClass("orange", "mt-6 text-sm leading-7 text-[#f8ddc3]")}>
              Database-backed auth is not configured for this deployment yet. Add
              `DATABASE_URL` and `AUTH_SECRET` before enabling user profile management.
            </div>
          ) : null}

          {!settings.user && settings.credentialsEnabled ? (
            <div className={dashboardInsetPanelClass("neutral", "mt-6 text-sm leading-7 text-[rgba(214,219,228,0.82)]")}>
              Sign in to edit this account. The rest of the dashboard can still render, but user
              management stays scoped to authenticated accounts only.
            </div>
          ) : null}

          {settings.user ? (
            <form className="mt-6 space-y-5" onSubmit={saveProfile}>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className={dashboardFieldLabelClass}>Name</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={dashboardInputClass}
                    placeholder="Binboi User"
                    autoComplete="name"
                  />
                </label>

                <label className="space-y-2">
                  <span className={dashboardFieldLabelClass}>Email</span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={dashboardInputClass}
                    placeholder="you@company.com"
                    autoComplete="email"
                    type="email"
                  />
                </label>
              </div>

              <p className={dashboardMutedTextClass}>
                Changing the primary email creates a new verification request automatically. The
                current session stays active, but the next credentials sign-in will require the new
                address to be verified first.
              </p>

              {saveError ? (
                <div className={dashboardInsetPanelClass("danger", "flex items-start gap-3 text-sm text-[#e5c7cb]")}>
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{saveError}</p>
                </div>
              ) : null}

              {saveSuccess ? (
                <div className={dashboardInsetPanelClass("green", "flex items-start gap-3 text-sm text-[#d6ebe0]")}>
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{saveSuccess}</p>
                </div>
              ) : null}

              {deliveryPreviewUrl ? (
                <div className={dashboardInsetPanelClass("neutral", "space-y-4 text-sm text-[rgba(214,219,228,0.84)]")}>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-zinc-200" />
                    <div>
                      <p className="font-medium text-white">Verification preview link</p>
                      <p className="mt-1 break-all text-[rgba(214,219,228,0.76)]">
                        {deliveryPreviewUrl}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void copyPreviewUrl()}
                      className={dashboardSecondaryButtonClass}
                    >
                      <Copy className="h-4 w-4" />
                      {copiedPreviewUrl ? "Copied" : "Copy link"}
                    </button>
                    <Link href={deliveryPreviewUrl} className={dashboardPrimaryButtonClass}>
                      <ExternalLink className="h-4 w-4" />
                      Open verification link
                    </Link>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className={dashboardPrimaryButtonClass}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save account changes
                </button>
                {!settings.user.emailVerified ? (
                  <button
                    type="button"
                    onClick={() => void resendVerification()}
                    disabled={resending}
                    className={dashboardSecondaryButtonClass}
                  >
                    {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    Resend verification link
                  </button>
                ) : null}
              </div>
            </form>
          ) : null}
        </section>

        <section className="grid gap-6">
          <section className={dashboardPanelClass("neutral", "p-6")}>
            <div className="flex items-center gap-3">
              <div className={dashboardIconTileClass("neutral")}>
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Account posture</h2>
                <p className="mt-1 text-sm text-[rgba(194,203,219,0.7)]">
                  Quick view of identity, verification, and auth mode.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <div className={dashboardMiniStatClass}>
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Owner</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-sm font-semibold text-white">
                    {accountInitials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {settings.user?.name || "Unavailable"}
                    </p>
                    <p className="text-sm text-[rgba(194,203,219,0.7)]">
                      {settings.user?.email || "No authenticated user"}
                    </p>
                  </div>
                </div>
              </div>

              <div className={dashboardMiniStatClass}>
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Verification</p>
                <div className="mt-3 flex items-center gap-3">
                  <span
                    className={dashboardBadgeClass(
                      settings.user?.emailVerified ? "green" : "orange",
                    )}
                  >
                    {verificationState}
                  </span>
                  <span className="text-sm text-[rgba(194,203,219,0.72)]">
                    {settings.user?.emailVerified
                      ? `Verified on ${formatDate(settings.user.emailVerified)}`
                      : "Pending verification for credentials sign-in."}
                  </span>
                </div>
              </div>

              <div className={dashboardMiniStatClass}>
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Auth mode</p>
                <p className="mt-3 text-sm font-semibold text-white">
                  {settings.mode === "database"
                    ? "Database-backed auth"
                    : settings.mode === "preview"
                      ? "Preview only"
                      : "Unavailable"}
                </p>
                <p className="mt-2 text-sm text-[rgba(194,203,219,0.72)]">
                  {settings.githubEnabled
                    ? "GitHub sign-in is configured alongside credentials."
                    : "Credentials auth is the primary path for this deployment."}
                </p>
              </div>
            </div>
          </section>

          <section className={dashboardPanelClass("neutral", "p-6")}>
            <div className="flex items-center gap-3">
              <div className={dashboardIconTileClass("neutral")}>
                <CreditCard className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Billing controls</h2>
                <p className="mt-1 text-sm text-[rgba(194,203,219,0.7)]">
                  Upgrade, change plan, or cancel renewal without leaving user management.
                </p>
              </div>
            </div>

            {billingError ? (
              <div className={dashboardInsetPanelClass("danger", "mt-6 text-sm text-[#e5c7cb]")}>
                {billingError}
              </div>
            ) : null}

            {billing ? (
              <div className="mt-6 space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className={dashboardMiniStatClass}>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Plan</p>
                    <p className="mt-2 text-lg font-semibold text-white">{activePlan.name}</p>
                  </div>
                  <div className={dashboardMiniStatClass}>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Status</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {billing.subscription.status}
                    </p>
                  </div>
                  <div className={dashboardMiniStatClass}>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Renewal</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {formatDate(billing.subscription.renewalDate)}
                    </p>
                  </div>
                  <div className={dashboardMiniStatClass}>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">Cancellation</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {billing.subscription.cancelAtPeriodEnd ? "Scheduled" : "Auto renew"}
                    </p>
                  </div>
                </div>

                {!billing.configured ? (
                  <div className={dashboardInsetPanelClass("orange", "text-sm leading-7 text-[#f8ddc3]")}>
                    Paddle is not configured for this deployment yet. Add the Paddle env values
                    before enabling checkout or cancellation.
                  </div>
                ) : null}

                {billing.mode === "preview" ? (
                  <div className={dashboardInsetPanelClass("neutral", "text-sm leading-7 text-[rgba(214,219,228,0.82)]")}>
                    Billing preview is visible, but real subscription changes need a signed-in
                    account and database-backed auth.
                  </div>
                ) : null}

                {billing.configured && billing.mode === "account" ? (
                  <div className="grid gap-3">
                    {billing.subscription.plan === "FREE" && billing.checkout_enabled ? (
                      <BillingCheckoutButton
                        plan="PRO"
                        label="Upgrade to Pro"
                        callbackPath="/dashboard/user-management"
                      />
                    ) : null}

                    {billing.subscription.plan !== "FREE" &&
                    (nextPlan === "PRO" || nextPlan === "SCALE") ? (
                      <BillingChangePlanButton
                        plan={nextPlan}
                        label={`Move to ${getPricingPlan(nextPlan).name}`}
                        onChanged={() => void refreshAll()}
                        callbackPath="/dashboard/user-management"
                      />
                    ) : null}

                    {billing.subscription.plan !== "FREE" ? (
                      <BillingCancelButton
                        onCanceled={() => void refreshAll()}
                        callbackPath="/dashboard/user-management"
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        </section>
      </div>
    </PremiumDashboardShell>
  );
}
