import { Suspense } from "react";

import { RegisterForm } from "../_components/auth-forms";
import { AuthLoadingCard } from "../_components/auth-primitives";
import { redirectAuthenticatedUser } from "@/lib/auth-session";
import { sanitizeRedirectTarget } from "@/lib/auth-routing";
import { authDatabaseEnabled } from "@/lib/auth-system";

export default async function RegisterPage({
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
          title="Preparing registration"
          description="Loading the registration form and callback target."
        />
      }
    >
      <RegisterForm authConfigured={authDatabaseEnabled} />
    </Suspense>
  );
}
