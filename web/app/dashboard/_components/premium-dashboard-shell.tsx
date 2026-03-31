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
      <div className="relative px-4 pb-6 pt-4 text-white sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute left-6 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(126,162,255,0.16),transparent_70%)] blur-3xl" />
        <div className="pointer-events-none absolute right-8 top-14 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(43,86,201,0.18),transparent_72%)] blur-3xl" />

        <div className="relative mx-auto max-w-7xl space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)] xl:items-end">
            <div className="max-w-4xl">
              <span className={dashboardBadgeClass("blue")}>{eyebrow}</span>
              <h1 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl lg:text-[2.85rem]">
                {title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-[rgba(194,203,219,0.76)] sm:text-[15px]">
                {description}
              </p>
            </div>

            {panels.length > 0 ? (
              <div className="grid gap-3">
                {panels.map((panel, index) => (
                  <section
                    key={panel.title}
                    className={dashboardPanelClass(panel.tone ?? panelTones[index % panelTones.length], "p-4 sm:p-5")}
                  >
                    <div className="relative z-10">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        {index === 0 ? "Operator note" : "Expected behavior"}
                      </p>
                      <h2 className="mt-2.5 text-base font-semibold tracking-[-0.02em] text-white">
                        {panel.title}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-[rgba(194,203,219,0.74)]">
                        {panel.description}
                      </p>

                      {panel.bullets && panel.bullets.length > 0 ? (
                        <ul className="mt-3 space-y-2.5">
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
            ) : null}
          </div>

          {highlights.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {highlights.map((item, index) => {
                const tone = item.tone ?? highlightTones[index % highlightTones.length];

                return (
                  <section
                    key={item.label}
                    className={dashboardPanelClass(tone, "min-h-[10.75rem] p-5")}
                  >
                    <div className="relative z-10">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                        {item.label}
                      </p>
                      <div
                        className={cn(
                          "mt-3 h-px w-14 bg-gradient-to-r",
                          highlightBeamClass[tone],
                        )}
                      />
                      <p className="mt-4 text-3xl font-black tracking-[-0.05em] text-white lg:text-[2.35rem]">
                        {item.value}
                      </p>
                      <p className="mt-2.5 text-sm leading-6 text-[rgba(194,203,219,0.74)]">
                        {item.note}
                      </p>
                    </div>
                  </section>
                );
              })}
            </div>
          ) : null}

          {children ? <div>{children}</div> : null}
        </div>
      </div>
    </DashboardRouteFrame>
  );
}
