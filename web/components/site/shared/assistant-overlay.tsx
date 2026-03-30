"use client";

import {
  useLayoutEffect,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { Command, Search, X } from "lucide-react";

type AssistantOverlayProps = {
  open: boolean;
  variant: "site" | "dashboard";
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  children: ReactNode;
};

type OverlayPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

const SIDE_PADDING = 16;
const GUTTER = 12;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function AssistantOverlay({
  open,
  variant,
  anchorRef,
  onClose,
  children,
}: AssistantOverlayProps) {
  const [position, setPosition] = useState<OverlayPosition | null>(null);
  const maxWidth = variant === "dashboard" ? 1120 : 1040;

  useLayoutEffect(() => {
    if (!open || typeof window === "undefined") {
      return;
    }

    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) {
        return;
      }

      const rect = anchor.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const width = Math.min(maxWidth, viewportWidth - SIDE_PADDING * 2);
      const centerX = rect.left + rect.width / 2;
      const left = clamp(centerX - width / 2, SIDE_PADDING, viewportWidth - width - SIDE_PADDING);
      const top = Math.max(rect.bottom + GUTTER, 76);
      const maxHeight = Math.max(460, viewportHeight - top - SIDE_PADDING);

      setPosition({ top, left, width, maxHeight });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorRef, maxWidth, open]);

  if (!open || typeof document === "undefined" || !position) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[95] overflow-hidden">
      <button
        type="button"
        aria-label="Close assistant"
        className="absolute inset-0 bg-black/72 backdrop-blur-md"
        onClick={onClose}
      />

      <div
        className="absolute"
        style={{
          top: position.top,
          left: position.left,
          width: position.width,
          maxHeight: position.maxHeight,
        }}
      >
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#070709]/94 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-400 shadow-[0_18px_48px_rgba(0,0,0,0.34)]">
            {variant === "dashboard" ? (
              <Command className="h-3.5 w-3.5 text-miransas-cyan" />
            ) : (
              <Search className="h-3.5 w-3.5 text-miransas-cyan" />
            )}
            {variant === "dashboard" ? "Dashboard search" : "Header search"}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#070709]/94 px-4 py-2 text-sm text-zinc-300 shadow-[0_18px_48px_rgba(0,0,0,0.34)] transition hover:border-white/20 hover:text-white"
          >
            <X className="h-4 w-4" />
            Close
          </button>
        </div>

        <div
          className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#070709]/96 shadow-[0_40px_140px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          style={{ height: position.maxHeight - 52 }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
