import Link from "next/link";
import { redirect } from "next/navigation";

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
    <section className="space-y-5">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-zinc-500 transition hover:text-white"
      >
        Back to home
      </Link>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-sm sm:px-7 sm:py-7">
        <div className="space-y-6">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
              Invite
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white">
                Open the full invite link
              </h1>
              <p className="text-sm leading-7 text-zinc-400">
                Invite acceptance is token-based. Use the invite URL that includes the token so the page can validate the invited email before registration.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Token", value: "Required in the invite URL" },
              { label: "Validation", value: "Email checked before signup" },
              { label: "Outcome", value: "Dashboard access after acceptance" },
            ].map((item) => (
              <div key={item.label} className="rounded-[18px] border border-white/10 bg-white/[0.02] px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{item.label}</p>
                <p className="mt-2 text-sm text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[18px] border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            This route needs an invite token in the URL. Open the invite link you received, or use `/invite/&lt;token&gt;` directly.
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={buildLoginHref("/dashboard")}
              className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Sign in
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.06]"
            >
              Back to home
            </Link>
          </div>

          <p className="border-t border-white/10 pt-2 text-sm text-zinc-400">
            Already have a dashboard account?{" "}
            <Link
              href={buildLoginHref("/dashboard")}
              className="text-white underline underline-offset-4 decoration-white/20 transition hover:decoration-white/50"
            >
              Return to sign in
            </Link>
          </p>
        </div>
      </section>
    </section>
  );
}
