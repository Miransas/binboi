import type { ReactNode } from "react";



export default function AuthLayout({ children }: { children: ReactNode }) {

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070b] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(94,120,255,0.07),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(94,120,255,0.07),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.08]" />
      <div className="relative z-10 flex min-h-screen">{children}</div>
    </div>

  );

}