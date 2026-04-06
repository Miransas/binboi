import { redirect } from "next/navigation";

import { buildLoginRedirect, getCurrentSession } from "@/lib/auth-session";
import {
  authDatabaseEnabled,
  authDeploymentMode,
  getUserSettings,
  githubAuthEnabled,
  previewAuthEnabled,
} from "@/lib/auth-system";
import { BillingRouteError, getBillingSummary } from "@/lib/billing";

import { UserManagementClient } from "./user-management-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function UserManagementPage() {
  if (!authDatabaseEnabled) {
    return (
      <UserManagementClient
        initialSettings={{
          authenticated: false,
          mode: authDeploymentMode,
          credentialsEnabled: authDatabaseEnabled,
          githubEnabled: githubAuthEnabled,
          previewEnabled: previewAuthEnabled,
          user: null,
        }}
        initialBilling={null}
        initialBillingError="User management needs database-backed auth. Configure DATABASE_URL to manage account data."
      />
    );
  }

  const session = await getCurrentSession();
  if (!session?.user?.id) {
    redirect(buildLoginRedirect("/dashboard/user-management"));
  }

  const [user, billingResult] = await Promise.all([
    getUserSettings(session.user.id),
    getBillingSummary()
      .then((summary) => ({ summary, error: null as string | null }))
      .catch((error: unknown) => {
        if (error instanceof BillingRouteError) {
          return { summary: null, error: error.message };
        }

        return {
          summary: null,
          error: "Could not load billing state for this account.",
        };
      }),
  ]);

  return (
    <UserManagementClient
      initialSettings={{
        authenticated: true,
        mode: authDeploymentMode,
        credentialsEnabled: authDatabaseEnabled,
        githubEnabled: githubAuthEnabled,
        previewEnabled: previewAuthEnabled,
        user: {
          ...user,
          emailVerified: user.emailVerified?.toISOString() ?? null,
        },
      }}
      initialBilling={billingResult.summary}
      initialBillingError={billingResult.error}
    />
  );
}
