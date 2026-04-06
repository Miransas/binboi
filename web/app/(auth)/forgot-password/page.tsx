
import { redirectAuthenticatedUser } from "@/lib/auth-session";
import { sanitizeRedirectTarget } from "@/lib/auth-routing";
import { authDatabaseEnabled, previewAuthEnabled } from "@/lib/auth-system";
import { ForgotPasswordForm } from "../_components/forgot-password-form";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const callbackUrl = sanitizeRedirectTarget(resolvedSearchParams.callbackUrl, "/dashboard");
  await redirectAuthenticatedUser(
    callbackUrl,
  );

  return (
    <ForgotPasswordForm
      authConfigured={authDatabaseEnabled}
      previewEnabled={previewAuthEnabled}
      callbackUrl={callbackUrl}
    />
  );
}
