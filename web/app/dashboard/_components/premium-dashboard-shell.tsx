import type { ReactNode } from "react";

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

const highlightTones: DashboardTone[] = ["neutral", "neutral", "neutral"];
const panelTones: DashboardTone[] = ["neutral", "neutral"];

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
      <div className="flex min-h-full flex-col px-4 pb-8 pt-5 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-full w-full max-w-7xl flex-1 flex-col gap-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(17rem,0.9fr)] xl:items-start">
            <div className="max-w-4xl">
              <span className={dashboardBadgeClass("neutral")}>{eyebrow}</span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
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
                    className={dashboardPanelClass(panel.tone ?? panelTones[index % panelTones.length], "p-5")}
                  >
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
                    className={dashboardPanelClass(tone, "min-h-[10rem] p-5")}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-4 text-3xl font-semibold tracking-tight text-white lg:text-[2.2rem]">
                      {item.value}
                    </p>
                    <p className="mt-2.5 text-sm leading-6 text-[rgba(194,203,219,0.74)]">
                      {item.note}
                    </p>
                  </section>
                );
              })}
            </div>
          ) : null}

          {children ? <div className="flex-1">{children}</div> : null}
        </div>
      </div>
    </DashboardRouteFrame>
  );
}
