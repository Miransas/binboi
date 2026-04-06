
import { redirectAuthenticatedUser } from "@/lib/auth-session";
import { sanitizeRedirectTarget } from "@/lib/auth-routing";
import { authDatabaseEnabled, previewAuthEnabled } from "@/lib/auth-system";
import { RegisterForm } from "../_components/register-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; invite?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const callbackUrl = sanitizeRedirectTarget(resolvedSearchParams.callbackUrl, "/dashboard");
  await redirectAuthenticatedUser(
    callbackUrl,
  );

  return (
    <RegisterForm
      authConfigured={authDatabaseEnabled}
      previewEnabled={previewAuthEnabled}
      callbackUrl={callbackUrl}
      inviteToken={resolvedSearchParams.invite}
    />
  );
}
