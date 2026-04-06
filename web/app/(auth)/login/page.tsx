
import { redirectAuthenticatedUser } from "@/lib/auth-session";
import { sanitizeRedirectTarget } from "@/lib/auth-routing";
import { authDatabaseEnabled, githubAuthEnabled, previewAuthEnabled } from "@/lib/auth-system";
import { LoginForm } from "../_components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; verified?: string; reset?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const callbackUrl = sanitizeRedirectTarget(resolvedSearchParams.callbackUrl, "/dashboard");
  await redirectAuthenticatedUser(
    callbackUrl,
  );

  return (
    <LoginForm
      authConfigured={authDatabaseEnabled}
      githubEnabled={githubAuthEnabled}
      previewEnabled={previewAuthEnabled}
      callbackUrl={callbackUrl}
      verified={Boolean(resolvedSearchParams.verified)}
      reset={Boolean(resolvedSearchParams.reset)}
    />
  );
}
