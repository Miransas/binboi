import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SitePageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#040405] px-6 pb-20 pt-28 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#070709]/88 px-6 py-10 shadow-[0_40px_140px_rgba(0,0,0,0.45)] backdrop-blur sm:px-8 lg:px-10 lg:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,255,209,0.12),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.05),_transparent_26%)]" />
          <div className="relative max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-miransas-cyan">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">{description}</p>
          </div>
        </section>

        <div className="mt-8 space-y-8">{children}</div>
      </div>
    </main>
  );
}

export function SitePanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative rounded-[2rem] border border-white/10 bg-[#070709]/88 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.28)] backdrop-blur sm:p-7",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SiteSectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-miransas-cyan">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">{description}</p>
      )}
    </div>
  );
}
