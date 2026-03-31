import Link from "next/link";
import { redirect } from "next/navigation";

import {
  AuthCard,
  AuthFeatureStrip,
  AuthFooterLink,
  AuthHeader,
  AuthStatus,
  authInlinePrimaryButtonClass,
  authInlineSecondaryButtonClass,
} from "../_components/auth-primitives";
import { buildLoginHref } from "@/lib/auth-routing";

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

        <AuthFeatureStrip
          items={[
            { label: "Token", value: "Required in the invite URL" },
            { label: "Validation", value: "Email checked before signup" },
            { label: "Outcome", value: "Dashboard access after acceptance" },
          ]}
        />

        <div className="mt-8">
          <AuthStatus tone="warning">
            This route needs an invite token in the URL. Open the invite link you received, or use
            `/invite/&lt;token&gt;` directly.
          </AuthStatus>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={buildLoginHref("/dashboard")} className={authInlinePrimaryButtonClass}>
            Sign in
          </Link>
          <Link href="/" className={authInlineSecondaryButtonClass}>
            Back to home
          </Link>
        </div>

        <div className="mt-6">
          <AuthFooterLink
            prompt="Already have a dashboard account?"
            href={buildLoginHref("/dashboard")}
            label="Return to sign in"
          />
        </div>
      </AuthCard>
    </div>
  );
}
