import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Accent = "cyan" | "amber" | "violet" | "emerald" | "rose";

const accentClasses: Record<
  Accent,
  {
    glow: string;
    beam: string;
    ring: string;
    dot: string;
    icon: string;
  }
> = {
  cyan: {
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(0,255,209,0.16),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(91,173,255,0.12),transparent_34%)]",
    beam: "from-transparent via-miransas-cyan/45 to-transparent",
    ring: "border-miransas-cyan/25",
    dot: "bg-miransas-cyan shadow-[0_0_18px_rgba(0,255,209,0.55)]",
    icon: "text-miransas-cyan",
  },
  amber: {
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,153,0,0.12),transparent_34%)]",
    beam: "from-transparent via-amber-300/40 to-transparent",
    ring: "border-amber-300/25",
    dot: "bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.42)]",
    icon: "text-amber-200",
  },
  violet: {
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(192,132,252,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.12),transparent_34%)]",
    beam: "from-transparent via-violet-300/40 to-transparent",
    ring: "border-violet-300/25",
    dot: "bg-violet-300 shadow-[0_0_18px_rgba(192,132,252,0.42)]",
    icon: "text-violet-200",
  },
  emerald: {
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(52,211,153,0.1),transparent_34%)]",
    beam: "from-transparent via-emerald-300/40 to-transparent",
    ring: "border-emerald-300/25",
    dot: "bg-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.45)]",
    icon: "text-emerald-200",
  },
  rose: {
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(225,29,72,0.12),transparent_34%)]",
    beam: "from-transparent via-rose-300/40 to-transparent",
    ring: "border-rose-300/25",
    dot: "bg-rose-300 shadow-[0_0_18px_rgba(251,113,133,0.45)]",
    icon: "text-rose-200",
  },
};

export function DashboardSurface({
  children,
  className,
  accent = "cyan",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  accent?: Accent;
  padded?: boolean;
}) {
  const tones = accentClasses[accent];

  return (
    <section
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(19,22,31,0.92),rgba(7,9,14,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl",
        padded && "p-6",
        className,
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0 opacity-90", tones.glow)} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_22%,transparent_78%,rgba(255,255,255,0.02))]" />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r",
          tones.beam,
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-16 top-8 h-32 w-32 rounded-full blur-3xl opacity-35",
          tones.dot,
        )}
      />
      <div className="relative z-10 h-full">{children}</div>
    </section>
  );
}

export function DashboardStatCard({
  label,
  value,
  note,
  accent = "cyan",
  icon: Icon,
}: {
  label: string;
  value: string;
  note: string;
  accent?: Accent;
  icon?: ElementType;
}) {
  const tones = accentClasses[accent];

  return (
    <DashboardSurface accent={accent} className="min-h-[12rem]">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">{label}</p>
        {Icon ? (
          <div
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-2xl border bg-white/[0.04]",
              tones.ring,
            )}
          >
            <Icon className={cn("h-[18px] w-[18px]", tones.icon)} />
          </div>
        ) : null}
      </div>
      <p className="mt-7 text-4xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{note}</p>
    </DashboardSurface>
  );
}

export function DashboardMiniPill({
  label,
  value,
  accent = "cyan",
}: {
  label: string;
  value: string;
  accent?: Accent;
}) {
  const tones = accentClasses[accent];

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white/[0.03] px-4 py-3 backdrop-blur-sm",
        tones.ring,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

export function DashboardSectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <p className="inline-flex items-center rounded-full border border-miransas-cyan/20 bg-miransas-cyan/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-miransas-cyan">
        {eyebrow}
      </p>
      <h1 className="mt-5 text-4xl font-black tracking-tight text-white lg:text-6xl">{title}</h1>
      <p className="mt-4 text-sm leading-7 text-zinc-400 lg:text-base">{description}</p>
    </div>
  );
}

export type DashboardTimelineItem = {
  label: string;
  title: string;
  description: string;
  status?: "complete" | "active" | "waiting" | "error";
  meta?: string;
};

function timelineTone(status: DashboardTimelineItem["status"]) {
  switch (status) {
    case "complete":
      return {
        dot: accentClasses.emerald.dot,
        ring: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
      };
    case "error":
      return {
        dot: accentClasses.rose.dot,
        ring: "border-rose-300/20 bg-rose-400/10 text-rose-100",
      };
    case "active":
      return {
        dot: accentClasses.cyan.dot,
        ring: "border-miransas-cyan/20 bg-miransas-cyan/10 text-miransas-cyan",
      };
    default:
      return {
        dot: "bg-zinc-500/80 shadow-[0_0_14px_rgba(113,113,122,0.22)]",
        ring: "border-white/10 bg-white/[0.03] text-zinc-300",
      };
  }
}

export function DashboardTimeline({
  eyebrow,
  title,
  items,
  className,
}: {
  eyebrow: string;
  title: string;
  items: ReadonlyArray<DashboardTimelineItem>;
  className?: string;
}) {
  return (
    <DashboardSurface className={className}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">{eyebrow}</p>
          <h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Live flow
        </span>
      </div>

      <div className="relative mt-6 space-y-5">
        <div className="pointer-events-none absolute bottom-4 left-[1.05rem] top-4 w-px bg-gradient-to-b from-white/20 via-white/8 to-transparent" />
        {items.map((item) => {
          const tones = timelineTone(item.status);

          return (
            <div key={`${item.label}-${item.title}`} className="relative flex gap-4">
              <div className="relative z-10 flex w-8 shrink-0 justify-center">
                <span className={cn("mt-1.5 h-3.5 w-3.5 rounded-full", tones.dot)} />
              </div>
              <div className="min-w-0 flex-1 rounded-[1.5rem] border border-white/10 bg-black/25 px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                    {item.label}
                  </span>
                  {item.meta ? (
                    <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]", tones.ring)}>
                      {item.meta}
                    </span>
                  ) : null}
                </div>
                <h4 className="mt-2 text-sm font-semibold text-white">{item.title}</h4>
                <p className="mt-2 text-sm leading-7 text-zinc-400">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardSurface>
  );
}
