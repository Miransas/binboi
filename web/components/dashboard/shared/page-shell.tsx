"use client";

import type { ReactNode } from "react";

import {
  DashboardSectionHeading,
  DashboardStatCard,
  DashboardSurface,
} from "@/components/dashboard/shared/dashboard-primitives";

type Highlight = {
  label: string;
  value: string;
  note: string;
};

type Panel = {
  title: string;
  description: string;
  bullets?: ReadonlyArray<string>;
};

const highlightAccents = ["cyan", "neutral", "violet"] as const;

export function DashboardPageShell({
  eyebrow,
  title,
  description,
  highlights,
  panels,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  highlights: ReadonlyArray<Highlight>;
  panels: ReadonlyArray<Panel>;
  children?: ReactNode;
}) {
  return (
    <div className="relative px-4 pb-8 pt-4 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(94,217,208,0.045),transparent_64%)]" />

      <div className="relative mx-auto max-w-7xl">
        <DashboardSurface accent="neutral" className="px-6 py-6 sm:px-8 lg:px-9">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(18rem,0.88fr)] xl:items-start">
            <DashboardSectionHeading eyebrow={eyebrow} title={title} description={description} />

            <div className="grid gap-3">
              {panels.map((panel, index) => (
                <DashboardSurface
                  key={panel.title}
                  accent={index === 0 ? "neutral" : "cyan"}
                  className="p-5"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                    {index === 0 ? "Operator note" : "Expected behavior"}
                  </p>
                  <h2 className="mt-3 text-lg font-semibold text-white">{panel.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">{panel.description}</p>
                  {panel.bullets && panel.bullets.length > 0 ? (
                    <ul className="mt-4 space-y-2.5 text-sm leading-6 text-zinc-300">
                      {panel.bullets.slice(0, 3).map((bullet) => (
                        <li
                          key={bullet}
                          className="rounded-[1.25rem] border border-white/10 bg-white/[0.025] px-3.5 py-3"
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </DashboardSurface>
              ))}
            </div>
          </div>
        </DashboardSurface>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {highlights.map((item, index) => (
            <DashboardStatCard
              key={item.label}
              label={item.label}
              value={item.value}
              note={item.note}
              accent={highlightAccents[index % highlightAccents.length]}
            />
          ))}
        </div>

        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </div>
  );
}
