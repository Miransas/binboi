import { cn } from "@/lib/utils";

import {
  dashboardBadgeClass,
  dashboardPanelClass,
  type DashboardTone,
} from "./dashboard-ui";

export type PremiumTimelineItem = {
  label: string;
  title: string;
  description: string;
  status?: "complete" | "active" | "waiting" | "error";
  meta?: string;
};

function toneForStatus(status: PremiumTimelineItem["status"]): DashboardTone {
  switch (status) {
    case "complete":
      return "green";
    case "active":
      return "blue";
    case "error":
      return "danger";
    default:
      return "neutral";
  }
}

const dotClassName: Record<DashboardTone, string> = {
  neutral: "bg-slate-500/80 shadow-[0_0_14px_rgba(100,116,139,0.25)]",
  blue: "bg-[#8aacff] shadow-[0_0_18px_rgba(134,169,255,0.34)]",
  orange: "bg-[#f7a15d] shadow-[0_0_18px_rgba(247,161,93,0.28)]",
  green: "bg-[#54ca92] shadow-[0_0_18px_rgba(84,202,146,0.28)]",
  danger: "bg-[#f07878] shadow-[0_0_18px_rgba(240,120,120,0.28)]",
};

export function PremiumDashboardTimeline({
  eyebrow,
  title,
  items,
  className,
}: {
  eyebrow: string;
  title: string;
  items: ReadonlyArray<PremiumTimelineItem>;
  className?: string;
}) {
  return (
    <section className={dashboardPanelClass("neutral", cn("p-6", className))}>
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              {eyebrow}
            </p>
            <h3 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-white">
              {title}
            </h3>
          </div>
          <span className={dashboardBadgeClass("neutral")}>Live flow</span>
        </div>

        <div className="relative mt-6 space-y-5">
          <div className="pointer-events-none absolute bottom-4 left-[1.05rem] top-4 w-px bg-gradient-to-b from-[#8aacff]/26 via-white/10 to-transparent" />

          {items.map((item) => {
            const tone = toneForStatus(item.status);

            return (
              <div key={`${item.label}-${item.title}`} className="relative flex gap-4">
                <div className="relative z-10 flex w-8 shrink-0 justify-center">
                  <span className={cn("mt-1.5 h-3.5 w-3.5 rounded-full", dotClassName[tone])} />
                </div>

                <div className="min-w-0 flex-1 rounded-[1.45rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.018))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      {item.label}
                    </span>
                    {item.meta ? <span className={dashboardBadgeClass(tone)}>{item.meta}</span> : null}
                  </div>
                  <h4 className="mt-2 text-sm font-semibold text-white">{item.title}</h4>
                  <p className="mt-2 text-sm leading-7 text-[rgba(194,203,219,0.74)]">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
