import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Accent = "neutral" | "cyan" | "amber" | "violet" | "emerald" | "rose";

const accentClasses: Record<
  Accent,
  {
    ring: string;
    dot: string;
    icon: string;
    surface: string;
  }
> = {
  neutral: {
    ring: "border-white/10",
    dot: "bg-zinc-500",
    icon: "text-zinc-100",
    surface: "border-white/8 bg-[#101113]",
  },
  cyan: {
    ring: "border-white/10",
    dot: "bg-[#b7c4d9]",
    icon: "text-zinc-100",
    surface: "border-white/8 bg-[#101113]",
  },
  amber: {
    ring: "border-white/10",
    dot: "bg-[#ccb79d]",
    icon: "text-zinc-100",
    surface: "border-white/8 bg-[#101113]",
  },
  violet: {
    ring: "border-white/10",
    dot: "bg-[#c5bfd4]",
    icon: "text-zinc-100",
    surface: "border-white/8 bg-[#101113]",
  },
  emerald: {
    ring: "border-white/10",
    dot: "bg-[#b7cdbf]",
    icon: "text-zinc-100",
    surface: "border-white/8 bg-[#101113]",
  },
  rose: {
    ring: "border-white/10",
    dot: "bg-[#d2b6bb]",
    icon: "text-zinc-100",
    surface: "border-white/8 bg-[#101113]",
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
    <div
      className={cn(
        "rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
        tones.surface,
        padded && "p-6",
        className,
      )}
    >
      <div className="h-full">{children}</div>
    </div>
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
              "inline-flex h-10 w-10 items-center justify-center rounded-lg border bg-white/[0.03]",
              tones.ring,
            )}
          >
            <Icon className={cn("h-[18px] w-[18px]", tones.icon)} />
          </div>
        ) : null}
      </div>
      <p className="mt-6 text-4xl font-semibold tracking-tight text-white">{value}</p>
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
        "rounded-lg border bg-white/[0.03] px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
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
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">{eyebrow}</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white lg:text-4xl">{title}</h1>
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
        ring: "border-white/10 bg-white/[0.03] text-zinc-200",
      };
    case "error":
      return {
        dot: accentClasses.rose.dot,
        ring: "border-white/10 bg-white/[0.03] text-zinc-200",
      };
    case "active":
      return {
        dot: accentClasses.cyan.dot,
        ring: "border-white/10 bg-white/[0.03] text-zinc-200",
      };
    default:
      return {
        dot: "bg-zinc-500",
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
        <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Live flow
        </span>
      </div>

      <div className="relative mt-6 space-y-5">
        <div className="pointer-events-none absolute bottom-4 left-[1.05rem] top-4 w-px bg-white/10" />
        {items.map((item) => {
          const tones = timelineTone(item.status);

          return (
            <div key={`${item.label}-${item.title}`} className="relative flex gap-4">
              <div className="relative z-10 flex w-8 shrink-0 justify-center">
                <span className={cn("mt-1.5 h-3.5 w-3.5 rounded-full", tones.dot)} />
              </div>
              <div className="min-w-0 flex-1 rounded-xl border border-white/8 bg-[#0d0f12] px-4 py-4">
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
