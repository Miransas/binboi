import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SitePageShell({
  eyebrow,
  title,
  description,
  children,
  className,
  contentClassName,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <main
      className={cn(
        "relative min-h-screen overflow-hidden bg-[#03060d] px-4 pb-24 pt-28 text-white sm:px-6 lg:px-8",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(134,169,255,0.18),transparent_26%),radial-gradient(circle_at_84%_12%,rgba(255,255,255,0.04),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_16%,transparent_86%,rgba(255,255,255,0.01))]" />
        <div className="absolute left-[-6%] top-16 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(64,102,214,0.16),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[-8%] right-[-4%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(15,40,84,0.28),transparent_72%)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1520px]">
        <section className="relative overflow-hidden rounded-[2.75rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(8,13,23,0.92),rgba(5,9,18,0.98))] px-6 py-10 shadow-[0_48px_150px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl sm:px-8 lg:px-10 lg:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(134,169,255,0.16),transparent_34%),radial-gradient(circle_at_88%_8%,rgba(255,255,255,0.05),transparent_18%)]" />
          <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />
          <div className="relative max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#dfe7ff]">
              {eyebrow}
            </p>
            <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-[4rem]">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[rgba(194,203,219,0.76)]">
              {description}
            </p>
          </div>
        </section>

        <div className={cn("mt-10 space-y-10", contentClassName)}>{children}</div>
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
        "relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(8,13,23,0.92),rgba(5,9,18,0.98))] p-6 shadow-[0_34px_110px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl sm:p-7",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_24%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative z-10">{children}</div>
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
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#dfe7ff]">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-sm leading-7 text-[rgba(194,203,219,0.74)] sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

export function SiteRail({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside className={cn("space-y-4 xl:sticky xl:top-28 xl:self-start", className)}>
      {children}
    </aside>
  );
}
