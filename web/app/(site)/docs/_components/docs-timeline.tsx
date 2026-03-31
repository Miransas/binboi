"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { getDocsNavContext } from "./docs-navigation";

type TocItem = {
  id: string;
  title: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function DocsTimeline({
  eyebrow,
  title,
  toc,
}: {
  eyebrow: string;
  title: string;
  toc: TocItem[];
}) {
  const pathname = usePathname();
  const { currentGroup, previousItem, nextItem } = useMemo(
    () => getDocsNavContext(pathname),
    [pathname],
  );
  const [activeId, setActiveId] = useState(toc[0]?.id ?? "");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!toc.length) {
      return;
    }

    const sections = toc
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) {
      return;
    }

    const updateRail = () => {
      const viewportAnchor = window.innerHeight * 0.28;
      const scrollPosition = window.scrollY + viewportAnchor;

      let nextActiveId = sections[0].id;
      for (const section of sections) {
        const absoluteTop = window.scrollY + section.getBoundingClientRect().top;
        if (absoluteTop <= scrollPosition) {
          nextActiveId = section.id;
        }
      }

      const firstRect = sections[0].getBoundingClientRect();
      const lastRect = sections[sections.length - 1].getBoundingClientRect();
      const start = window.scrollY + firstRect.top;
      const end =
        window.scrollY + lastRect.top + lastRect.height - window.innerHeight * 0.42;
      const ratio = clamp((scrollPosition - start) / Math.max(end - start, 1), 0, 1);

      setActiveId(nextActiveId);
      setProgress(ratio);
    };

    updateRail();

    let frameId = 0;
    const onScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateRail);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frameId);
    };
  }, [toc]);

  const activeIndex = Math.max(
    toc.findIndex((item) => item.id === activeId),
    0,
  );

  return (
    <div className="sticky top-24 space-y-4">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(8,13,23,0.95),rgba(5,9,18,0.985))] p-5 shadow-[0_26px_90px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(134,169,255,0.15),transparent_40%)]" />
        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            Page context
          </p>
          <h2 className="mt-3 text-lg font-semibold text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {eyebrow} guide in {currentGroup?.title ?? "Documentation"}.
          </p>

          <div className="mt-5 grid gap-3">
            <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Sections
              </p>
              <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">
                {String(toc.length).padStart(2, "0")}
              </p>
            </div>

            <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Reading progress
                </p>
                <span className="text-xs font-medium text-zinc-400">
                  {Math.round(progress * 100)}%
                </span>
              </div>

              <div className="mt-3 h-2 rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#86a9ff] via-[#9fc2ff] to-[#d5e3ff] transition-[width] duration-300"
                  style={{ width: `${Math.max(progress * 100, 6)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(8,13,23,0.93),rgba(5,9,18,0.985))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div className="flex items-center justify-between gap-3 px-1">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Section outline
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Stay anchored while you read.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-300">
            {String(activeIndex + 1).padStart(2, "0")} / {String(toc.length).padStart(2, "0")}
          </div>
        </div>

        <nav className="mt-4 space-y-2">
          {toc.map((item, index) => {
            const isActive = item.id === activeId;
            const isComplete = index < activeIndex;

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "group grid grid-cols-[26px_minmax(0,1fr)] items-start gap-3 rounded-[1.25rem] border px-3 py-3 transition",
                  isActive
                    ? "border-[#86a9ff]/20 bg-[#86a9ff]/10"
                    : "border-transparent hover:border-white/10 hover:bg-white/[0.03]",
                )}
              >
                <span className="relative mt-1 flex h-6 items-center justify-center">
                  <span
                    className={cn(
                      "absolute h-6 w-6 rounded-full transition",
                      isActive
                        ? "bg-[#86a9ff]/18 shadow-[0_0_22px_rgba(134,169,255,0.18)]"
                        : isComplete
                          ? "bg-[#86a9ff]/10"
                          : "bg-transparent",
                    )}
                  />
                  <span
                    className={cn(
                      "relative h-2.5 w-2.5 rounded-full border transition",
                      isActive
                        ? "border-[#86a9ff] bg-[#86a9ff]"
                        : isComplete
                          ? "border-[#86a9ff]/80 bg-[#86a9ff]/70"
                          : "border-white/20 bg-[#07090f] group-hover:border-white/35",
                    )}
                  />
                </span>

                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-[10px] font-semibold uppercase tracking-[0.22em]",
                      isActive
                        ? "text-[#d9e5ff]"
                        : isComplete
                          ? "text-zinc-400"
                          : "text-zinc-600 group-hover:text-zinc-500",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "mt-1 block text-sm leading-6",
                      isActive
                        ? "text-white"
                        : isComplete
                          ? "text-zinc-300"
                          : "text-zinc-400 group-hover:text-zinc-200",
                    )}
                  >
                    {item.title}
                  </span>
                </span>
              </a>
            );
          })}
        </nav>
      </div>

      {(previousItem || nextItem) && (
        <div className="rounded-[1.75rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(8,13,23,0.92),rgba(5,9,18,0.985))] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.03)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            Continue reading
          </p>

          <div className="mt-4 space-y-3">
            {previousItem && (
              <Link
                href={previousItem.href}
                className="group flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <ArrowLeft className="h-4 w-4 shrink-0 text-zinc-500 transition group-hover:text-white" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Previous guide
                  </p>
                  <p className="mt-1 truncate text-sm text-zinc-200">{previousItem.title}</p>
                </div>
              </Link>
            )}

            {nextItem && (
              <Link
                href={nextItem.href}
                className="group flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <ArrowRight className="h-4 w-4 shrink-0 text-zinc-500 transition group-hover:text-white" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Next guide
                  </p>
                  <p className="mt-1 truncate text-sm text-zinc-200">{nextItem.title}</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
