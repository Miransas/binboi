import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03060d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(134,169,255,0.18),transparent_28%),radial-gradient(circle_at_82%_10%,rgba(255,255,255,0.04),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_16%,transparent_86%,rgba(255,255,255,0.01))]" />
        <div className="absolute left-[-8%] top-8 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(56,93,200,0.2),transparent_72%)] blur-3xl" />
        <div className="absolute bottom-[-14%] right-[-6%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(18,44,96,0.34),transparent_72%)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,0.8fr)] lg:items-center">
          <section className="hidden lg:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#dfe7ff]">
              Binboi auth system
            </p>
            <h1 className="mt-5 max-w-xl text-5xl font-black tracking-[-0.05em] text-white">
              Human sign-in stays separate from machine tokens.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[rgba(194,203,219,0.76)]">
              Website auth establishes the operator identity. The dashboard then issues revocable
              access tokens for `binboi login`, so local agents never reuse browser credentials.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Flow 1
                </p>
                <p className="mt-3 text-lg font-semibold text-white">Create or verify your account</p>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Credentials auth, optional GitHub OAuth, email verification, and route guards all
                  point to one shared auth contract now.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Flow 2
                </p>
                <p className="mt-3 text-lg font-semibold text-white">Mint CLI access tokens later</p>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Once the human session is established, the dashboard is responsible for machine
                  auth, token rotation, and per-machine revocation.
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
