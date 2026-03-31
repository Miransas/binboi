import { LoginForm } from "../_components/auth-forms";
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
    <LoginForm
      authConfigured={authDatabaseEnabled}
      githubEnabled={githubAuthEnabled}
    />
  );
}
