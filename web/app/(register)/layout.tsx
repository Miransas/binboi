import type { ReactNode } from "react";

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070b] text-white">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_-10%_50%,rgba(0,255,209,0.055),transparent),radial-gradient(ellipse_50%_70%_at_110%_50%,rgba(153,69,255,0.045),transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ffd1]/20 to-transparent" />
      {children}
    </div>
  );
}
