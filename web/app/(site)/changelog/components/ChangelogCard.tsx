"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { type ChangelogEntry } from "@/data/changelog";
import { TagBadge } from "./TagBadge";
import { CodeBlock } from "./CodeBlock";
import { ExpandSection } from "./ExpandSection";
import { RadialVisual, HexVisual, WaveVisual, GridVisual } from "./Visuals";

function Visual({ entry }: { entry: ChangelogEntry }) {
  if (entry.visual === "radial") return <RadialVisual version={entry.version} />;
  if (entry.visual === "hex")    return <HexVisual version={entry.version} />;
  if (entry.visual === "wave")   return <WaveVisual version={entry.version} />;
  if (entry.visual === "grid")   return <GridVisual version={entry.version} />;
  return null;
}

interface Props {
  entry: ChangelogEntry;
  index: number;
}

export function ChangelogCard({ entry, index }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      className="grid gap-0"
      style={{ gridTemplateColumns: "80px 1fr" }}
    >
      {/* Date column */}
      <div className="relative pt-[1.6rem] text-right pr-6">
        <span className="font-mono text-[11px] text-white/30 leading-[1.4] whitespace-pre-line">
          {entry.date.replace(", ", ",\n")}
        </span>
        {/* Timeline dot */}
        <span
          className={`absolute right-0 top-[calc(1.6rem+6px)] w-2.5 h-2.5 rounded-full border translate-x-1/2 ${
            entry.major
              ? "bg-[#b8ff57] border-[#b8ff57] shadow-[0_0_8px_rgba(184,255,87,0.5)]"
              : "bg-[#1e1e1e] border-white/10"
          }`}
        />
      </div>

      {/* Body column */}
      <div className="border-l border-white/[0.07] pl-6 pb-6 pt-0">
        {entry.major ? (
          <div className="bg-[#111] border border-white/[0.08] rounded-[14px] overflow-hidden hover:border-white/[0.14] hover:-translate-y-0.5 transition-all duration-200 cursor-default">
            {entry.visual !== "minimal" && <Visual entry={entry} />}

            <div className="p-5 pb-0">
              {/* Tags */}
              <div className="flex gap-1.5 flex-wrap mb-3">
                {entry.tags.map(t => <TagBadge key={t} tag={t} />)}
              </div>

              {/* Version pill */}
              <span className="inline-block font-mono text-[10px] border border-white/10 text-white/40 px-2 py-0.5 rounded mb-2">
                v{entry.version}
              </span>

              <h3 className="text-[1.1rem] font-bold leading-[1.3] mb-2 text-white">
                {entry.title}
              </h3>
              <p className="text-[13px] font-mono text-white/40 leading-[1.7] mb-4">
                {entry.description}
              </p>

              {/* Features list */}
              {entry.features.length > 0 && (
                <ul className="space-y-1.5 mb-4">
                  {entry.features.map((f, i) => (
                    <li key={i} className="flex gap-2 text-[12.5px] font-mono text-white/40">
                      <span className="text-white/20 shrink-0">—</span>
                      <span>
                        <strong className="text-white/80 font-medium">{f.label}:</strong>{" "}
                        {f.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Code block */}
              {entry.code && <CodeBlock code={entry.code} />}

              {/* Footer */}
              <div className="flex items-center justify-between py-4 border-t border-white/[0.07]">
                <a
                  href="#"
                  className="group flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-white/40 hover:text-[#b8ff57] transition-colors"
                >
                  Read release notes
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </a>
                <span className="font-mono text-[11px] text-white/25">{entry.date}</span>
              </div>
            </div>

            {/* Expandable sections */}
            {entry.expandFeatures && entry.expandFeatures.length > 0 && (
              <ExpandSection title="Features" items={entry.expandFeatures} />
            )}
            {entry.fixes && entry.fixes.length > 0 && (
              <ExpandSection title="Bug Fixes" items={entry.fixes} />
            )}
          </div>
        ) : (
          /* Minor entry */
          <div className="group border border-transparent hover:border-white/[0.08] hover:bg-[#111] rounded-[10px] px-4 py-3 transition-all duration-150 cursor-default">
            <div className="flex gap-1.5 flex-wrap mb-2">
              {entry.tags.map(t => <TagBadge key={t} tag={t} />)}
            </div>
            <span className="inline-block font-mono text-[10px] border border-white/10 text-white/30 px-2 py-0.5 rounded mb-1.5">
              v{entry.version}
            </span>
            <h3 className="text-[0.95rem] font-semibold text-white/80 mb-1">{entry.title}</h3>
            <p className="text-[12px] font-mono text-white/35 leading-[1.7]">{entry.description}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
