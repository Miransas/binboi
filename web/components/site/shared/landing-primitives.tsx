import type { ReactNode } from "react";

import { BorderBeam } from "@/components/ui/border-beam";
import { cn } from "@/lib/utils";

export type Accent = "cyan" | "magenta" | "violet" | "amber" | "emerald" | "blue";

const accentStyles: Record<
  Accent,
  {
    badge: string;
    border: string;
    glow: string;
    hoverGlow: string;
    beam: string;
  }
> = {
  cyan: {
    badge: "border-miransas-cyan/18 bg-miransas-cyan/8 text-miransas-cyan",
    border: "border-miransas-cyan/14",
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(0,255,209,0.16),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_34%)]",
    hoverGlow: "bg-miransas-cyan/18",
    beam: "from-transparent via-miransas-cyan to-transparent",
  },
  magenta: {
    badge: "border-miransas-magenta/18 bg-miransas-magenta/8 text-miransas-magenta",
    border: "border-miransas-magenta/14",
    glow:
      "bg-[radial-gradient(circle_at_top_right,rgba(255,0,255,0.16),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_32%)]",
    hoverGlow: "bg-miransas-magenta/18",
    beam: "from-transparent via-miransas-magenta to-transparent",
  },
  violet: {
    badge: "border-violet-400/18 bg-violet-400/8 text-violet-300",
    border: "border-violet-400/14",
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_34%)]",
    hoverGlow: "bg-violet-400/18",
    beam: "from-transparent via-violet-300 to-transparent",
  },
  amber: {
    badge: "border-amber-300/20 bg-amber-300/8 text-amber-200",
    border: "border-amber-300/16",
    glow:
      "bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_34%)]",
    hoverGlow: "bg-amber-300/18",
    beam: "from-transparent via-amber-200 to-transparent",
  },
  emerald: {
    badge: "border-emerald-300/18 bg-emerald-300/8 text-emerald-200",
    border: "border-emerald-300/14",
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.18),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_34%)]",
    hoverGlow: "bg-emerald-300/18",
    beam: "from-transparent via-emerald-200 to-transparent",
  },
  blue: {
    badge: "border-sky-300/18 bg-sky-300/8 text-sky-200",
    border: "border-sky-300/14",
    glow:
      "bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_34%)]",
    hoverGlow: "bg-sky-300/18",
    beam: "from-transparent via-sky-200 to-transparent",
  },
};

export function AccentBadge({
  accent = "cyan",
  children,
  className,
}: {
  accent?: Accent;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]",
        accentStyles[accent].badge,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  accent = "cyan",
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  accent?: Accent;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <AccentBadge accent={accent}>{eyebrow}</AccentBadge>
      <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">
        {description}
      </p>
    </div>
  );
}

export function PremiumSurface({
  children,
  className,
  contentClassName,
  accent = "cyan",
  beamSize = 220,
  beamDuration = 8,
  beamDelay = 0,
  beamReverse = false,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  accent?: Accent;
  beamSize?: number;
  beamDuration?: number;
  beamDelay?: number;
  beamReverse?: boolean;
}) {
  const palette = accentStyles[accent];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border bg-[#060608]/84 shadow-[0_34px_110px_rgba(0,0,0,0.44)] backdrop-blur-xl",
        palette.border,
        className,
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0 opacity-90", palette.glow)} />
      <div className="pointer-events-none absolute inset-[1px] rounded-[calc(2rem-1px)] bg-[linear-gradient(180deg,rgba(10,10,12,0.96),rgba(4,4,5,0.92))]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),transparent_24%,transparent_72%,rgba(255,255,255,0.02))]" />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="pointer-events-none absolute inset-x-16 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="pointer-events-none absolute left-[-12%] top-[-18%] h-36 w-36 rounded-full bg-white/[0.05] blur-3xl" />
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 blur-2xl transition duration-700 group-hover:opacity-100",
          palette.hoverGlow,
        )}
      />
      <BorderBeam
        size={beamSize}
        duration={beamDuration}
        delay={beamDelay}
        reverse={beamReverse}
        borderWidth={1}
        className={palette.beam}
      />
      <div className={cn("relative z-10 p-6 sm:p-8", contentClassName)}>{children}</div>
    </div>
  );
}
