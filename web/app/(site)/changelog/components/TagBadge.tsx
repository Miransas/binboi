"use client";

import { Tag } from "../data/changelog";


const config: Record<Tag, { label: string; className: string }> = {
  ai:     { label: "AI",          className: "border-[rgba(184,255,87,0.3)] text-[#b8ff57] bg-[rgba(184,255,87,0.06)]" },
  perf:   { label: "Performance", className: "border-[rgba(87,200,255,0.3)] text-[#57c8ff] bg-[rgba(87,200,255,0.06)]" },
  ui:     { label: "Interface",   className: "border-[rgba(255,107,107,0.25)] text-[#ff6b6b] bg-[rgba(255,107,107,0.06)]" },
  fix:    { label: "Bug Fix",     className: "border-white/10 text-white/50 bg-transparent" },
  hotfix: { label: "Hotfix",      className: "border-[rgba(255,170,0,0.3)] text-[#ffaa00] bg-[rgba(255,170,0,0.06)]" },
};

export function TagBadge({ tag }: { tag: Tag }) {
  const { label, className } = config[tag];
  return (
    <span className={`inline-block border text-[10px] font-mono uppercase tracking-[0.07em] px-2 py-0.5 rounded ${className}`}>
      {label}
    </span>
  );
}
