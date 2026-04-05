import { Suspense } from "react";

import { LoginForm } from "../_components/auth-forms";
import { AuthLoadingCard } from "../_components/auth-primitives";
import { redirectAuthenticatedUser } from "@/lib/auth-session";
import { sanitizeRedirectTarget } from "@/lib/auth-routing";
import { authDatabaseEnabled, githubAuthEnabled } from "@/lib/auth-system";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  await redirectAuthenticatedUser(
    sanitizeRedirectTarget(resolvedSearchParams.callbackUrl, "/dashboard"),
  );

  return (
    <Suspense
      fallback={
        <AuthLoadingCard
          title="Preparing sign in"
          description="Loading your sign-in options and redirect target."
        />
      }
    >
      <LoginForm
        authConfigured={authDatabaseEnabled}
        githubEnabled={githubAuthEnabled}
      />
    </Suspense>
  );
}
