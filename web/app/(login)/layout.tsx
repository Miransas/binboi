import type { ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070b] text-white">
      {/* Ambient glows — mirror left/right of register */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_-10%_50%,rgba(94,120,255,0.06),transparent),radial-gradient(ellipse_50%_70%_at_110%_50%,rgba(0,255,209,0.04),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#86a9ff]/20 to-transparent" />
      {children}
    </div>
  );
}
