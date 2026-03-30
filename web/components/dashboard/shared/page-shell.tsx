"use client";

import type { ReactNode } from "react";

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
    <div className="min-h-screen bg-black px-6 py-8 text-white lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-miransas-cyan">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white lg:text-6xl">
            {title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400 lg:text-base">{description}</p>
        </header>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <section
              key={item.label}
              className="rounded-3xl border border-white/10 bg-[#080808] p-6"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">
                {item.label}
              </p>
              <p className="mt-5 text-3xl font-black tracking-tight text-white">{item.value}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-500">{item.note}</p>
            </section>
          ))}
        </div>

        {children && <div className="mt-10">{children}</div>}

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {panels.map((panel) => (
            <section
              key={panel.title}
              className="rounded-3xl border border-white/10 bg-[#080808] p-6"
            >
              <h2 className="text-xl font-semibold text-white">{panel.title}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{panel.description}</p>
              {panel.bullets && panel.bullets.length > 0 && (
                <ul className="mt-5 space-y-3 text-sm leading-7 text-zinc-300">
                  {panel.bullets.map((bullet) => (
                    <li key={bullet} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
