"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type TocItem = {
  id: string;
  title: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function DocsTimeline({ toc }: { toc: TocItem[] }) {
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

    const updateTimeline = () => {
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
      const ratio = clamp(
        (scrollPosition - start) / Math.max(end - start, 1),
        0,
        1,
      );

      setActiveId(nextActiveId);
      setProgress(ratio);
    };

    updateTimeline();

    const observer = new IntersectionObserver(updateTimeline, {
      rootMargin: "-18% 0px -55% 0px",
      threshold: [0, 0.2, 0.4, 0.7, 1],
    });

    for (const section of sections) {
      observer.observe(section);
    }

    let frameId = 0;
    const onScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateTimeline);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      observer.disconnect();
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
    <div className="sticky top-24 overflow-hidden rounded-[2rem] border border-white/10 bg-[#070707]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(0,255,209,0.14),_transparent_62%)] opacity-80" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Reading timeline
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Scroll-aware section progress for the current guide.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-300">
            {String(activeIndex + 1).padStart(2, "0")} / {String(toc.length).padStart(2, "0")}
          </div>
        </div>

        <nav className="relative mt-6">
          <div className="absolute left-[11px] top-3 bottom-3 w-px rounded-full bg-white/10" />
          <div className="absolute left-[11px] top-3 bottom-3 w-px overflow-hidden rounded-full">
            <div
              className="h-full w-full origin-top rounded-full bg-gradient-to-b from-miransas-cyan via-cyan-300/90 to-miransas-cyan/15 shadow-[0_0_18px_rgba(0,255,209,0.35)] transition-transform duration-300 ease-out"
              style={{ transform: `scaleY(${Math.max(progress, 0.06)})` }}
            />
          </div>

          <div className="space-y-4">
            {toc.map((item, index) => {
              const isActive = item.id === activeId;
              const isComplete = index < activeIndex;

              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className="group grid grid-cols-[24px_minmax(0,1fr)] items-start gap-3"
                >
                  <span className="relative mt-1 flex h-6 items-center justify-center">
                    <span
                      className={cn(
                        "absolute h-6 w-6 rounded-full transition duration-300",
                        isActive
                          ? "bg-miransas-cyan/16 shadow-[0_0_24px_rgba(0,255,209,0.18)]"
                          : isComplete
                            ? "bg-miransas-cyan/10"
                            : "bg-transparent",
                      )}
                    />
                    <span
                      className={cn(
                        "relative h-2.5 w-2.5 rounded-full border transition duration-300",
                        isActive
                          ? "border-miransas-cyan bg-miransas-cyan shadow-[0_0_0_4px_rgba(0,255,209,0.12)]"
                          : isComplete
                            ? "border-miransas-cyan/80 bg-miransas-cyan/70"
                            : "border-white/20 bg-[#070707] group-hover:border-white/35",
                      )}
                    />
                  </span>

                  <span className="block min-w-0 rounded-2xl border border-transparent px-3 py-2 transition duration-300 group-hover:border-white/10 group-hover:bg-white/[0.03]">
                    <span
                      className={cn(
                        "block text-[10px] font-semibold uppercase tracking-[0.22em] transition duration-300",
                        isActive
                          ? "text-miransas-cyan"
                          : isComplete
                            ? "text-zinc-400"
                            : "text-zinc-600 group-hover:text-zinc-500",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "mt-1 block text-sm leading-6 transition duration-300",
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
          </div>
        </nav>
      </div>
    </div>
  );
}
