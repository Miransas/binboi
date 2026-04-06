"use client";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-0 pt-20 pb-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center gap-2 border border-white/10 bg-[#111] rounded-full px-3 py-1 text-[11px] font-mono text-white/40 mb-8"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#b8ff57] animate-pulse" />
        Latest: v2.1 — June 2025
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="text-[clamp(2.8rem,7vw,5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-white"
      >
        What&apos;s{" "}
        <em className="not-italic text-[#b8ff57]">new</em>
        <br />
        in Kimi AI
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.16 }}
        className="mt-4 text-[14px] font-mono text-white/35 tracking-[0.01em]"
      >
       
      </motion.p>
    </div>
  );
}
