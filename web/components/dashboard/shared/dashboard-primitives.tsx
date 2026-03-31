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
      "bg-[linear-gradient(180deg,rgba(255,255,255,0.018),transparent_28%,transparent_100%)]",
    beam: "from-transparent via-white/7 to-transparent",
    ring: "border-white/12",
    dot: "bg-slate-300/18 shadow-[0_0_12px_rgba(148,163,184,0.04)]",
    icon: "text-zinc-200",
  },
  cyan: {
    glow:
      "bg-[linear-gradient(145deg,rgba(94,217,208,0.13)_0%,rgba(94,217,208,0.06)_24%,transparent_54%)]",
    beam: "from-transparent via-miransas-cyan/18 to-transparent",
    ring: "border-miransas-cyan/14",
    dot: "bg-miransas-cyan/30 shadow-[0_0_14px_rgba(0,255,209,0.06)]",
    icon: "text-[#9af4ee]",
  },
  amber: {
    glow:
      "bg-[linear-gradient(145deg,rgba(251,146,60,0.13)_0%,rgba(251,146,60,0.05)_24%,transparent_54%)]",
    beam: "from-transparent via-orange-300/18 to-transparent",
    ring: "border-amber-300/14",
    dot: "bg-orange-300/28 shadow-[0_0_14px_rgba(251,146,60,0.06)]",
    icon: "text-orange-200",
  },
  violet: {
    glow:
      "bg-[linear-gradient(145deg,rgba(167,139,250,0.13)_0%,rgba(167,139,250,0.05)_26%,transparent_56%)]",
    beam: "from-transparent via-violet-300/16 to-transparent",
    ring: "border-violet-300/14",
    dot: "bg-violet-300/26 shadow-[0_0_14px_rgba(167,139,250,0.05)]",
    icon: "text-[#d2c9ff]",
  },
  emerald: {
    glow:
      "bg-[linear-gradient(145deg,rgba(52,211,153,0.12)_0%,rgba(52,211,153,0.05)_24%,transparent_54%)]",
    beam: "from-transparent via-emerald-300/16 to-transparent",
    ring: "border-emerald-300/18",
    dot: "bg-emerald-300/32 shadow-[0_0_14px_rgba(52,211,153,0.06)]",
    icon: "text-emerald-200",
  },
  rose: {
    glow:
      "bg-[linear-gradient(145deg,rgba(251,113,133,0.13)_0%,rgba(251,113,133,0.05)_24%,transparent_54%)]",
    beam: "from-transparent via-rose-300/18 to-transparent",
    ring: "border-rose-300/18",
    dot: "bg-rose-300/34 shadow-[0_0_14px_rgba(251,113,133,0.06)]",
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
  const isNeutral = accent === "neutral";

  return (
    <section
      className={cn(
        "group relative overflow-hidden rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,rgba(20,27,39,0.99),rgba(15,21,31,0.995))] [box-shadow:inset_0_1px_0_rgba(255,255,255,0.04),0_8px_22px_rgba(2,6,23,0.12)]",
        padded && "p-6",
        className,
      )}
    >
      {!isNeutral ? (
        <div className={cn("pointer-events-none absolute inset-0 opacity-100", tones.glow)} />
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.018),transparent_24%,transparent_86%,rgba(255,255,255,0.01))]" />
      <div
        className={cn(
          "pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r opacity-90",
          isNeutral ? "from-transparent via-white/8 to-transparent" : tones.beam,
        )}
      />
      <div className="pointer-events-none absolute inset-[1px] rounded-[calc(1.75rem-1px)] border border-white/[0.03]" />
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
    <DashboardSurface accent={accent} className="min-h-[11rem]">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">{label}</p>
        {Icon ? (
          <div
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-2xl border bg-white/[0.025]",
              tones.ring,
            )}
          >
            <Icon className={cn("h-[18px] w-[18px]", tones.icon)} />
          </div>
        ) : null}
      </div>
      <div className={cn("mt-5 h-px w-14 bg-gradient-to-r", tones.beam)} />
      <p className="mt-6 text-4xl font-black tracking-tight text-white">{value}</p>
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
        "rounded-2xl border bg-white/[0.018] px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
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
      <p className="inline-flex items-center rounded-full border border-miransas-cyan/16 bg-miransas-cyan/7 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-miransas-cyan">
        {eyebrow}
      </p>
      <h1 className="mt-5 text-4xl font-black tracking-tight text-white lg:text-5xl">{title}</h1>
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
        ring: "border-emerald-300/14 bg-emerald-400/7 text-emerald-100",
      };
    case "error":
      return {
        dot: accentClasses.rose.dot,
        ring: "border-rose-300/14 bg-rose-400/7 text-rose-100",
      };
    case "active":
      return {
        dot: accentClasses.cyan.dot,
        ring: "border-miransas-cyan/14 bg-miransas-cyan/7 text-[#8aefe7]",
      };
    default:
      return {
        dot: "bg-zinc-500/80 shadow-[0_0_14px_rgba(113,113,122,0.22)]",
        ring: "border-white/10 bg-white/[0.018] text-zinc-300",
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
        <span className="rounded-full border border-white/10 bg-white/[0.018] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Live flow
        </span>
      </div>

      <div className="relative mt-6 space-y-5">
        <div className="pointer-events-none absolute bottom-4 left-[1.05rem] top-4 w-px bg-gradient-to-b from-miransas-cyan/18 via-white/8 to-transparent" />
        {items.map((item) => {
          const tones = timelineTone(item.status);

          return (
            <div key={`${item.label}-${item.title}`} className="relative flex gap-4">
              <div className="relative z-10 flex w-8 shrink-0 justify-center">
                <span className={cn("mt-1.5 h-3.5 w-3.5 rounded-full", tones.dot)} />
              </div>
              <div className="min-w-0 flex-1 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(11,16,24,0.28))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
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
