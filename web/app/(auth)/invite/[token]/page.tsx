import { AcceptInviteForm } from "../../_components/auth-forms";
import { authDatabaseEnabled, AuthRouteError, getInviteLookup, previewAuthEnabled } from "@/lib/auth-system";

export default async function InviteTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = await params;
  let result: Awaited<ReturnType<typeof getInviteLookup>>;

  try {
    result = authDatabaseEnabled
      ? await getInviteLookup(resolvedParams.token)
      : {
          valid: false,
          message: "Database-backed auth is not configured for this deployment.",
        };
  } catch (error) {
    result =
      error instanceof AuthRouteError
        ? { valid: false, message: error.message }
        : { valid: false, message: "Could not load this invite." };
  }

  return (
    <AcceptInviteForm
      authConfigured={authDatabaseEnabled}
      previewEnabled={previewAuthEnabled}
      token={resolvedParams.token}
      invitedEmail={result.valid ? result.email : undefined}
      invalidMessage={result.valid ? null : result.message}
    />
  );
}
