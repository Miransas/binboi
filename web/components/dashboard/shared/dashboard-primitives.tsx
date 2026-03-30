import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Accent = "neutral" | "cyan" | "amber" | "violet" | "emerald" | "rose";

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
  neutral: {
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.05),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(148,163,184,0.03),transparent_30%)]",
    beam: "from-transparent via-white/12 to-transparent",
    ring: "border-white/10",
    dot: "bg-slate-300/30 shadow-[0_0_16px_rgba(148,163,184,0.12)]",
    icon: "text-zinc-200",
  },
  cyan: {
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(94,217,208,0.10),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(94,217,208,0.05),transparent_24%)]",
    beam: "from-transparent via-miransas-cyan/28 to-transparent",
    ring: "border-miransas-cyan/18",
    dot: "bg-miransas-cyan/70 shadow-[0_0_18px_rgba(0,255,209,0.22)]",
    icon: "text-[#89efe8]",
  },
  amber: {
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.09),transparent_32%),radial-gradient(circle_at_88%_18%,rgba(217,119,6,0.05),transparent_24%)]",
    beam: "from-transparent via-amber-300/24 to-transparent",
    ring: "border-amber-300/16",
    dot: "bg-amber-300/70 shadow-[0_0_16px_rgba(251,191,36,0.16)]",
    icon: "text-amber-200",
  },
  violet: {
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(167,139,250,0.10),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.05),transparent_26%)]",
    beam: "from-transparent via-violet-300/22 to-transparent",
    ring: "border-violet-300/16",
    dot: "bg-violet-300/65 shadow-[0_0_18px_rgba(167,139,250,0.18)]",
    icon: "text-[#c8bbff]",
  },
  emerald: {
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.09),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.05),transparent_26%)]",
    beam: "from-transparent via-emerald-300/22 to-transparent",
    ring: "border-emerald-300/18",
    dot: "bg-emerald-300/70 shadow-[0_0_18px_rgba(52,211,153,0.18)]",
    icon: "text-emerald-200",
  },
  rose: {
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.10),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(225,29,72,0.05),transparent_26%)]",
    beam: "from-transparent via-rose-300/24 to-transparent",
    ring: "border-rose-300/18",
    dot: "bg-rose-300/70 shadow-[0_0_18px_rgba(251,113,133,0.18)]",
    icon: "text-rose-200",
  },
};

export function DashboardSurface({
  children,
  className,
  accent = "neutral",
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
        "group relative overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(20,26,36,0.96),rgba(10,14,21,0.98))] backdrop-blur-xl [box-shadow:inset_0_1px_0_rgba(255,255,255,0.04),0_20px_60px_rgba(2,6,23,0.34)]",
        padded && "p-6",
        className,
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0 opacity-75", tones.glow)} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_22%,transparent_78%,rgba(255,255,255,0.015))]" />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r",
          tones.beam,
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute right-6 top-4 h-24 w-24 rounded-full blur-3xl opacity-20",
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
    <DashboardSurface accent="neutral" className="min-h-[12rem]">
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
      <p className={cn("mt-2 text-sm font-medium", tones.icon)}>{value}</p>
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
        ring: "border-emerald-300/16 bg-emerald-400/8 text-emerald-100",
      };
    case "error":
      return {
        dot: accentClasses.rose.dot,
        ring: "border-rose-300/16 bg-rose-400/8 text-rose-100",
      };
    case "active":
      return {
        dot: accentClasses.cyan.dot,
        ring: "border-miransas-cyan/16 bg-miransas-cyan/8 text-[#8aefe7]",
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
              <div className="min-w-0 flex-1 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(5,8,12,0.28))] px-4 py-4">
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
