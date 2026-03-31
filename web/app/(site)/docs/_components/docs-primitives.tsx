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

function toneClasses(tone: Tone) {
  switch (tone) {
    case "cyan":
      return "border-miransas-cyan/20 bg-miransas-cyan/6";
    case "emerald":
      return "border-emerald-400/20 bg-emerald-400/6";
    case "amber":
      return "border-amber-400/20 bg-amber-400/6";
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
    <div className="space-y-10">
      <header className="relative overflow-hidden rounded-[2.25rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(8,13,23,0.94),rgba(5,9,18,0.985))] shadow-[0_38px_120px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(134,169,255,0.16),transparent_34%),radial-gradient(circle_at_86%_8%,rgba(255,255,255,0.05),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_20%,transparent_100%)]" />
        <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />

        <div className="relative border-b border-white/10 px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className={cn("grid gap-6", toc && toc.length > 0 && "xl:grid-cols-[minmax(0,1fr)_15rem] xl:items-end")}>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#dfe7ff]">
                {eyebrow}
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.6rem]">
                {title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-[rgba(194,203,219,0.8)]">
                {description}
              </p>
            </div>

            {toc && toc.length > 0 ? (
              <div className="hidden xl:grid gap-3">
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
                    Use the left guide rail for navigation and the right rail to stay anchored while reading.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {toc && toc.length > 0 && (
          <div className="relative overflow-x-auto px-4 py-4 lg:hidden">
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
        )}
      </header>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start 2xl:gap-10">
        <div className="min-w-0 space-y-8">{children}</div>

        {toc && toc.length > 0 && (
          <aside className="hidden xl:block xl:sticky xl:top-28 xl:self-start">
            <DocsTimeline toc={toc} />
          </aside>
        )}
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
    <section
      id={id}
      className="relative scroll-mt-32 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(8,13,23,0.92),rgba(5,9,18,0.98))] p-6 shadow-[0_34px_110px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl sm:p-8 lg:p-9"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_24%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="relative z-10">
        {eyebrow && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#dfe7ff]">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-3 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-4 max-w-4xl text-base leading-8 text-[rgba(194,203,219,0.8)]">
            {description}
          </p>
        )}
        <div className="mt-6 space-y-6">{children}</div>
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
    <div
      className={cn(
        "grid gap-5",
        columns === 3 ? "xl:grid-cols-3" : "lg:grid-cols-2",
      )}
    >
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
    <article className={cn("rounded-3xl border p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]", toneClasses(tone))}>
      <div className="flex flex-wrap items-center gap-2">
        {eyebrow && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            {eyebrow}
          </span>
        )}
        {badge && (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
            {badge}
          </span>
        )}
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
    <div className={cn("rounded-3xl border p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]", toneClasses(tone))}>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
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
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-400">
            {title}
          </h3>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-600">
            {language}
          </p>
        </div>
      </div>
      <pre className="overflow-x-auto px-5 py-5 text-sm leading-7 text-miransas-cyan">
        <code>{code}</code>
      </pre>
      {note && (
        <div className="border-t border-white/10 px-5 py-4 text-sm leading-7 text-zinc-400">
          {note}
        </div>
      )}
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
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
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
      className="group rounded-3xl border border-white/10 bg-black/25 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition hover:border-miransas-cyan/20 hover:bg-miransas-cyan/6"
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <ArrowRight className="h-4 w-4 text-zinc-500 transition group-hover:text-miransas-cyan" />
      </div>
      <p className="mt-3 text-sm leading-7 text-zinc-400">{description}</p>
    </Link>
  );
}
