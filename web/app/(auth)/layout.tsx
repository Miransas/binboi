import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03060d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_4%,rgba(134,169,255,0.16),transparent_28%),radial-gradient(circle_at_86%_10%,rgba(255,255,255,0.04),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_22%,transparent_82%,rgba(255,255,255,0.015))]" />
        <div className="absolute left-[-10%] top-0 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(56,93,200,0.2),transparent_72%)] blur-3xl" />
        <div className="absolute bottom-[-16%] right-[-8%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(18,44,96,0.34),transparent_72%)] blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-[34rem]">{children}</div>
      </div>
    </div>
  );
}
