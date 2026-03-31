import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { DocsTimeline } from "./docs-timeline";

export type TocItem = {
  id: string;
  title: string;
};

type Tone = "cyan" | "emerald" | "amber" | "zinc";

const shellSurface =
  "relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(8,13,23,0.94),rgba(5,9,18,0.985))] shadow-[0_34px_110px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl";

function toneClasses(tone: Tone) {
  switch (tone) {
    case "cyan":
      return "border-[#86a9ff]/20 bg-[#86a9ff]/8";
    case "emerald":
      return "border-emerald-400/20 bg-emerald-400/7";
    case "amber":
      return "border-amber-400/20 bg-amber-400/8";
    default:
      return "border-white/10 bg-black/25";
  }
}

export function DocsPageShell({
  eyebrow,
  title,
  description,
  toc,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  toc?: TocItem[];
  children: ReactNode;
}) {
  return (
    <div className="space-y-8 lg:space-y-10">
      <header className={shellSurface}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(134,169,255,0.18),transparent_32%),radial-gradient(circle_at_88%_10%,rgba(255,255,255,0.05),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_24%,transparent_100%)]" />
        <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />

        <div className="relative px-6 py-7 sm:px-8 lg:px-10 lg:py-10">
          <div className={cn("grid gap-6", toc?.length ? "xl:grid-cols-[minmax(0,1fr)_16rem] xl:items-end" : "")}>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#86a9ff]/16 bg-[#86a9ff]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#dfe7ff]">
                  {eyebrow}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
                  Docs experience
                </span>
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl lg:text-[3.45rem] lg:leading-[1.02]">
                {title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[rgba(194,203,219,0.84)]">
                {description}
              </p>
            </div>

            {toc?.length ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/25 px-4 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                    Guide sections
                  </p>
                  <p className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">
                    {String(toc.length).padStart(2, "0")}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-black/25 px-4 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                    Reading flow
                  </p>
                  <p className="mt-3 text-sm leading-7 text-zinc-300">
                    Left rail for guide navigation, center column for the guide, right rail for
                    in-page context.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {toc?.length ? (
          <div className="relative overflow-x-auto border-t border-white/10 px-4 py-4 xl:hidden">
            <div className="flex min-w-max gap-2 px-2">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white"
                >
                  {item.title}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <div className={cn("grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start 2xl:gap-10", !toc?.length && "xl:grid-cols-1")}>
        <div className="min-w-0 space-y-8 lg:space-y-10">{children}</div>

        {toc?.length ? (
          <aside className="hidden xl:block xl:self-start">
            <DocsTimeline eyebrow={eyebrow} title={title} toc={toc} />
          </aside>
        ) : null}
      </div>
    </div>
  );
}

export function DocsSection({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn(shellSurface, "scroll-mt-28 px-6 py-6 sm:px-8 sm:py-8 lg:px-9 lg:py-9")}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_24%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative">
        {eyebrow ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#dfe7ff]">
            {eyebrow}
          </p>
        ) : null}

        <h2 className="mt-3 text-[1.8rem] font-black tracking-[-0.04em] text-white sm:text-[2.15rem]">
          {title}
        </h2>

        {description ? (
          <p className="mt-4 max-w-4xl text-base leading-8 text-[rgba(194,203,219,0.82)]">
            {description}
          </p>
        ) : null}

        <div className="mt-7 space-y-6 text-[15px] leading-8 text-zinc-300 [&_code]:rounded-md [&_code]:border [&_code]:border-white/10 [&_code]:bg-white/[0.05] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_code]:text-[#dfe7ff]">
          {children}
        </div>
      </div>
    </section>
  );
}

export function DocsCardGrid({
  columns = 2,
  children,
}: {
  columns?: 2 | 3;
  children: ReactNode;
}) {
  return (
    <div className={cn("grid gap-4 lg:gap-5", columns === 3 ? "xl:grid-cols-3" : "lg:grid-cols-2")}>
      {children}
    </div>
  );
}

export function DocsCard({
  title,
  description,
  eyebrow,
  badge,
  tone = "zinc",
  children,
}: {
  title: string;
  description: string;
  eyebrow?: string;
  badge?: string;
  tone?: Tone;
  children?: ReactNode;
}) {
  return (
    <article className={cn("h-full rounded-[1.65rem] border p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]", toneClasses(tone))}>
      <div className="flex flex-wrap items-center gap-2">
        {eyebrow ? (
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            {eyebrow}
          </span>
        ) : null}
        {badge ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
            {badge}
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-zinc-300">{description}</p>
      {children}
    </article>
  );
}

export function DocsCallout({
  title,
  children,
  tone = "cyan",
}: {
  title: string;
  children: ReactNode;
  tone?: Exclude<Tone, "zinc">;
}) {
  return (
    <div className={cn("rounded-[1.65rem] border p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]", toneClasses(tone))}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
        Highlight
      </p>
      <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
      <div className="mt-3 text-sm leading-7 text-zinc-200">{children}</div>
    </div>
  );
}

export function DocsCodeBlock({
  title,
  language,
  code,
  note,
}: {
  title: string;
  language: string;
  code: string;
  note?: string;
}) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#04070d] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-400">
            {title}
          </h3>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-600">
            {language}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/12" />
          <span className="h-2 w-2 rounded-full bg-[#86a9ff]/70" />
        </div>
      </div>

      <pre className="overflow-x-auto px-5 py-5 text-sm leading-7 text-[#b7ceff]">
        <code>{code}</code>
      </pre>

      {note ? (
        <div className="border-t border-white/10 px-5 py-4 text-sm leading-7 text-zinc-400">
          {note}
        </div>
      ) : null}
    </div>
  );
}

export function DocsTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <div className="border-b border-white/10 px-5 py-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-white/[0.03]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {rows.map((row) => (
              <tr key={row.join("-")} className="align-top">
                {row.map((cell) => (
                  <td key={cell} className="px-5 py-4 text-sm leading-7 text-zinc-300">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DocsLinkCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition hover:border-[#86a9ff]/18 hover:bg-[#86a9ff]/8"
    >
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-zinc-400">{description}</p>
      </div>

      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-zinc-500 transition group-hover:text-[#d9e5ff]" />
    </Link>
  );
}
