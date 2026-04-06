
import { authDatabaseEnabled, previewAuthEnabled } from "@/lib/auth-system";
import { VerifyEmailForm } from "../_components/verify-email-form";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string; callbackUrl?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <VerifyEmailForm
      authConfigured={authDatabaseEnabled}
      previewEnabled={previewAuthEnabled}
      token={resolvedSearchParams.token}
      email={resolvedSearchParams.email}
      callbackUrl={resolvedSearchParams.callbackUrl}
    />
  );
}
