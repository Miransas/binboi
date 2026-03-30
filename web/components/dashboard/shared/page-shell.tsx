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

const highlightAccents = ["cyan", "violet", "amber"] as const;

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
    <div className="relative px-4 pb-12 pt-6 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(0,255,209,0.08),transparent_58%)]" />

      <div className="relative mx-auto max-w-7xl">
        <DashboardSurface accent="cyan" className="px-6 py-7 sm:px-8 lg:px-10">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] xl:items-end">
            <DashboardSectionHeading eyebrow={eyebrow} title={title} description={description} />

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <DashboardSurface accent="violet" className="p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                  Product posture
                </p>
                <p className="mt-3 text-sm leading-7 text-zinc-300">
                  The dashboard favors operator clarity, live tunnel context, and honest MVP
                  boundaries over decorative placeholders.
                </p>
              </DashboardSurface>
              <DashboardSurface accent="amber" className="p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                  What to expect
                </p>
                <p className="mt-3 text-sm leading-7 text-zinc-300">
                  Every page is designed to surface the next useful action, whether that means setup,
                  inspection, or moving from fallback mode into a real tunnel workflow.
                </p>
              </DashboardSurface>
            </div>
          </div>
        </DashboardSurface>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
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

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {panels.map((panel, index) => (
            <DashboardSurface
              key={panel.title}
              accent={index % 2 === 0 ? "violet" : "cyan"}
              className="p-6"
            >
              <h2 className="text-xl font-semibold text-white">{panel.title}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{panel.description}</p>
              {panel.bullets && panel.bullets.length > 0 ? (
                <ul className="mt-5 space-y-3 text-sm leading-7 text-zinc-300">
                  {panel.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3"
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
    </div>
  );
}
