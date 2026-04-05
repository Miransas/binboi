import { Suspense } from "react";

import { ForgotPasswordForm } from "../_components/auth-forms";
import { AuthLoadingCard } from "../_components/auth-primitives";
import { redirectAuthenticatedUser } from "@/lib/auth-session";
import { sanitizeRedirectTarget } from "@/lib/auth-routing";
import { authDatabaseEnabled, previewAuthEnabled } from "@/lib/auth-system";

export default async function ForgotPasswordPage({
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
          title="Preparing password recovery"
          description="Loading the reset request form and callback target."
        />
      }
    >
      <ForgotPasswordForm authConfigured={authDatabaseEnabled} previewEnabled={previewAuthEnabled} />
    </Suspense>
  );
}
