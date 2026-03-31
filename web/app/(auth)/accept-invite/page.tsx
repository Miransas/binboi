import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthCard, AuthHeader, AuthStatus } from "../_components/auth-primitives";

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams.token;

  if (token) {
    redirect(`/invite/${encodeURIComponent(token)}`);
  }

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-zinc-500 transition hover:text-white">
        Back to home
      </Link>
      <AuthCard>
        <AuthHeader
          eyebrow="Invite"
          title="Open the full invite link"
          description="Invite acceptance is token-based. Use the invite URL that includes the token so the page can validate the invited email before registration."
        />

        <div className="mt-8">
          <AuthStatus tone="warning">
            This route needs an invite token in the URL. Open the invite link you received, or use
            `/invite/&lt;token&gt;` directly.
          </AuthStatus>
        </div>
      </AuthCard>
    </div>
  );
}
