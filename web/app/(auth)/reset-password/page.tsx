
import { authDatabaseEnabled, previewAuthEnabled } from "@/lib/auth-system";
import { ResetPasswordForm } from "../_components/register-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string; callbackUrl?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <ResetPasswordForm
      authConfigured={authDatabaseEnabled}
      previewEnabled={previewAuthEnabled}
      token={resolvedSearchParams.token}
      email={resolvedSearchParams.email}
      callbackUrl={resolvedSearchParams.callbackUrl}
    />
  );
}
