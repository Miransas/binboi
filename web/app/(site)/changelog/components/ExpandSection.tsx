"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  title: string;
  items: string[];
}

export function ExpandSection({ title, items }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-white/[0.07]">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3 text-[11px] font-mono uppercase tracking-[0.07em] text-white/40 hover:text-white/70 transition-colors"
      >
        <span>{title}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          width="14" height="14" viewBox="0 0 14 14" fill="none"
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 font-mono text-[12px] text-white/40 leading-[1.9] space-y-0.5">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-white/20 shrink-0">—</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
