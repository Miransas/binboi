"use client";
import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

import { ChangelogCard } from "./ChangelogCard";
import { entries, Tag } from "../data/changelog";


const ALL_TAGS: { id: Tag | "all"; label: string }[] = [
  { id: "all",  label: "All" },
  { id: "ai",   label: "AI" },
  { id: "perf", label: "Performance" },
  { id: "ui",   label: "Interface" },
  { id: "fix",  label: "Bug Fixes" },
];

function groupByYear(items: typeof entries) {
  const map = new Map<number, typeof entries>();
  for (const e of items) {
    const y = new Date(e.isoDate).getFullYear();
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push(e);
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0]);
}

export function Timeline() {
  const [activeTag, setActiveTag] = useState<Tag | "all">("all");
  const timelineRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start start", "end end"],
  });

  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  const filtered = activeTag === "all"
    ? entries
    : entries.filter(e => e.tags.includes(activeTag as Tag));

  const grouped = groupByYear(filtered);

  // Active year based on scroll
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const yearRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          const topmost = visible.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          )[0];
          const year = parseInt(topmost.target.getAttribute("data-year") || "0");
          if (year) setActiveYear(year);
        }
      },
      { threshold: 0.1, rootMargin: "-20% 0px -60% 0px" }
    );

    yearRefs.current.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [grouped]);

  return (
    <div className="flex gap-0 max-w-[900px] mx-auto">
      {/* Sidebar: sticky year + progress line */}
      <div className="hidden md:flex flex-col items-end w-[140px] shrink-0 sticky top-[56px] h-[calc(100vh-56px)] pt-10 pb-10 pr-4 select-none pointer-events-none">
        <div className="flex flex-col items-end gap-3">
          {grouped.map(([year]) => (
            <motion.div
              key={year}
              className="font-mono text-[11px] uppercase tracking-[0.12em]"
              animate={{
                color: activeYear === year ? "#b8ff57" : "rgba(255,255,255,0.2)",
                x: activeYear === year ? 0 : 4,
              }}
              transition={{ duration: 0.3 }}
            >
              {year}
            </motion.div>
          ))}
        </div>

        {/* Mini scroll progress bar */}
        <div className="mt-auto flex flex-col items-end gap-1">
          <span className="font-mono text-[9px] text-white/20 uppercase tracking-[0.12em]">scroll</span>
          <div className="w-px h-20 bg-white/[0.07] relative overflow-hidden rounded-full">
            <motion.div
              className="absolute top-0 left-0 w-full bg-[#b8ff57] rounded-full"
              style={{ scaleY, transformOrigin: "top", height: "100%" }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div ref={timelineRef} className="flex-1 min-w-0 px-4 md:px-0 pb-24">
        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap mb-8 pt-1">
          {ALL_TAGS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTag(t.id)}
              className={`px-3.5 py-1 rounded-full border text-[11px] font-mono uppercase tracking-[0.06em] transition-all duration-150 ${
                activeTag === t.id
                  ? "border-[#b8ff57] text-[#b8ff57] bg-[rgba(184,255,87,0.06)]"
                  : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {grouped.length === 0 && (
          <p className="font-mono text-[13px] text-white/30 py-10 text-center">No entries for this filter.</p>
        )}

        {grouped.map(([year, yearEntries]) => (
          <div
            key={year}
            data-year={year}
            ref={el => { if (el) yearRefs.current.set(year, el); else yearRefs.current.delete(year); }}
          >
            {/* Year divider */}
            <div className="flex items-center gap-3 mb-4 mt-8 first:mt-0">
              <span className="font-mono text-[11px] text-white/30 uppercase tracking-[0.12em]">{year}</span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </div>

            {/* Entries */}
            <div className="space-y-0">
              {yearEntries.map((entry, i) => (
                <ChangelogCard key={entry.id} entry={entry} index={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
