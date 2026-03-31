import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { DashboardRouteFrame } from "./dashboard-route-frame";
import {
  dashboardBadgeClass,
  dashboardInsetPanelClass,
  dashboardPanelClass,
  type DashboardTone,
} from "./dashboard-ui";

type Highlight = {
  label: string;
  value: string;
  note: string;
  tone?: DashboardTone;
};

type Panel = {
  title: string;
  description: string;
  bullets?: ReadonlyArray<string>;
  tone?: DashboardTone;
};

const highlightTones: DashboardTone[] = ["blue", "neutral", "blue"];
const panelTones: DashboardTone[] = ["blue", "neutral"];

const highlightBeamClass: Record<DashboardTone, string> = {
  neutral: "from-transparent via-white/16 to-transparent",
  blue: "from-transparent via-[#8aacff]/44 to-transparent",
  orange: "from-transparent via-[#f7a15d]/40 to-transparent",
  green: "from-transparent via-[#54ca92]/40 to-transparent",
  danger: "from-transparent via-[#f07878]/36 to-transparent",
};

export function PremiumDashboardShell({
  eyebrow,
  title,
  description,
  highlights,
  panels,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  highlights: ReadonlyArray<Highlight>;
  panels: ReadonlyArray<Panel>;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <DashboardRouteFrame variant="shell" className={className}>
      <div className="relative px-4 pb-10 pt-4 text-white sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute left-6 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(126,162,255,0.16),transparent_70%)] blur-3xl" />
        <div className="pointer-events-none absolute right-8 top-14 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(43,86,201,0.18),transparent_72%)] blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <section className={dashboardPanelClass("neutral", "px-6 py-6 sm:px-8 lg:px-10")}>
            <div className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)] xl:items-start">
              <div className="max-w-4xl">
                <span className={dashboardBadgeClass("blue")}>{eyebrow}</span>
                <h1 className="mt-6 text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.02]">
                  {title}
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[rgba(194,203,219,0.76)] sm:text-[15px]">
                  {description}
                </p>
              </div>

              <div className="grid gap-4">
                {panels.map((panel, index) => (
                  <section
                    key={panel.title}
                    className={dashboardPanelClass(panel.tone ?? panelTones[index % panelTones.length], "p-5 sm:p-6")}
                  >
                    <div className="relative z-10">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        {index === 0 ? "Operator note" : "Expected behavior"}
                      </p>
                      <h2 className="mt-3 text-lg font-semibold tracking-[-0.02em] text-white">
                        {panel.title}
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-[rgba(194,203,219,0.74)]">
                        {panel.description}
                      </p>

                      {panel.bullets && panel.bullets.length > 0 ? (
                        <ul className="mt-4 space-y-3">
                          {panel.bullets.slice(0, 3).map((bullet) => (
                            <li
                              key={bullet}
                              className={dashboardInsetPanelClass(
                                "neutral",
                                "px-4 py-3 text-sm leading-6 text-[rgba(214,219,228,0.82)]",
                              )}
                            >
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {highlights.map((item, index) => {
              const tone = item.tone ?? highlightTones[index % highlightTones.length];

              return (
                <section
                  key={item.label}
                  className={dashboardPanelClass(tone, "min-h-[12.25rem] p-6")}
                >
                  <div className="relative z-10">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      {item.label}
                    </p>
                    <div
                      className={cn(
                        "mt-4 h-px w-16 bg-gradient-to-r",
                        highlightBeamClass[tone],
                      )}
                    />
                    <p className="mt-5 text-4xl font-black tracking-[-0.055em] text-white lg:text-[2.85rem]">
                      {item.value}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[rgba(194,203,219,0.74)]">
                      {item.note}
                    </p>
                  </div>
                </section>
              );
            })}
          </div>

          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </div>
    </DashboardRouteFrame>
  );
}
