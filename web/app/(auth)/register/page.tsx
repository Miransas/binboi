import { RegisterForm } from "../_components/auth-forms";
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

  return <RegisterForm authConfigured={authDatabaseEnabled} />;
}
