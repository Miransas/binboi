
import { authDatabaseEnabled, previewAuthEnabled } from "@/lib/auth-system";
import { CheckEmailView } from "../_components/check-email-view";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{
    email?: string;
    flow?: string;
    previewUrl?: string;
    callbackUrl?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <CheckEmailView
      authConfigured={authDatabaseEnabled}
      previewEnabled={previewAuthEnabled}
      email={resolvedSearchParams.email}
      flow={resolvedSearchParams.flow}
      previewUrl={resolvedSearchParams.previewUrl}
      callbackUrl={resolvedSearchParams.callbackUrl}
    />
  );
}
