import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03060d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(134,169,255,0.18),transparent_28%),radial-gradient(circle_at_82%_10%,rgba(255,255,255,0.04),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_18%,transparent_84%,rgba(255,255,255,0.01))]" />
        <div className="absolute left-[-8%] top-8 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(56,93,200,0.22),transparent_72%)] blur-3xl" />
        <div className="absolute bottom-[-14%] right-[-6%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(18,44,96,0.34),transparent_72%)] blur-3xl" />
      </div>

      <div className="relative mx-auto min-h-screen max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid min-h-[calc(100vh-6rem)] gap-10 lg:grid-cols-[minmax(0,0.98fr)_minmax(0,0.82fr)] lg:items-center">
          <section className="hidden lg:block">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-lg font-black tracking-[0.22em] text-white">
                B
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                  Binboi
                </p>
                <p className="mt-1 text-sm font-semibold text-white">Control plane access</p>
              </div>
            </Link>

            <p className="mt-10 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#dfe7ff]">
              Premium auth surface
            </p>
            <h1 className="mt-5 max-w-xl text-5xl font-black tracking-[-0.06em] text-white">
              Human identity stays clean, machine identity stays revocable.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[rgba(194,203,219,0.78)]">
              Website auth establishes the operator account. The dashboard then issues revocable
              access tokens for `binboi login`, so local agents never reuse browser credentials.
            </p>

            <div className="mt-10 grid gap-4">
              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Credentials + OAuth
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  Email/password stays first-class, with GitHub when configured.
                </p>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Login, registration, password reset, invite acceptance, and verification all map
                  back to one shared session contract.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Protected product flow
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  Dashboard access, billing entry, and redirects are aligned.
                </p>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Once a person is signed in, they land where they meant to go instead of falling
                  into generic auth loops.
                </p>
              </div>
            </div>
          </section>

          <div className="w-full max-w-xl justify-self-center lg:max-w-none">{children}</div>
        </div>
      </div>
    </div>
  );
}
