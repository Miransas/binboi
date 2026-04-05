import { cn } from "@/lib/utils";

export type DashboardTone = "neutral" | "blue" | "orange" | "green" | "danger";

const panelToneClasses: Record<DashboardTone, string> = {
  neutral: "border-white/[0.08] bg-[#101319]",
  blue: "border-white/[0.08] bg-[#101319]",
  orange: "border-white/[0.08] bg-[#101319]",
  green: "border-white/[0.08] bg-[#101319]",
  danger: "border-[#5e3b42]/30 bg-[#101319]",
};

const insetToneClasses: Record<DashboardTone, string> = {
  neutral: "border-white/[0.08] bg-white/[0.03]",
  blue: "border-white/[0.08] bg-white/[0.03]",
  orange: "border-white/[0.08] bg-white/[0.03]",
  green: "border-white/[0.08] bg-white/[0.03]",
  danger: "border-[#5e3b42]/30 bg-[#171214]",
};

const badgeToneClasses: Record<DashboardTone, string> = {
  neutral: "border-white/[0.08] bg-white/[0.04] text-slate-300",
  blue: "border-white/[0.08] bg-white/[0.04] text-[#dfe7ff]",
  orange: "border-white/[0.08] bg-white/[0.04] text-[#dbcbb8]",
  green: "border-white/[0.08] bg-white/[0.04] text-[#c8d7cc]",
  danger: "border-[#5e3b42]/30 bg-[#1a1416] text-[#e5c7cb]",
};

const iconToneClasses: Record<DashboardTone, string> = {
  neutral: "border-white/[0.08] bg-white/[0.04] text-slate-200",
  blue: "border-white/[0.08] bg-white/[0.04] text-slate-200",
  orange: "border-white/[0.08] bg-white/[0.04] text-slate-200",
  green: "border-white/[0.08] bg-white/[0.04] text-slate-200",
  danger: "border-[#5e3b42]/30 bg-[#1a1416] text-[#e5c7cb]",
};

export function dashboardPanelClass(tone: DashboardTone = "neutral", className?: string) {
  return cn(
    "rounded-xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
    panelToneClasses[tone],
    className,
  );
}

export function dashboardInsetPanelClass(tone: DashboardTone = "neutral", className?: string) {
  return cn(
    "rounded-lg border px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
    insetToneClasses[tone],
    className,
  );
}

export function dashboardBadgeClass(tone: DashboardTone = "neutral", className?: string) {
  return cn(
    "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em]",
    badgeToneClasses[tone],
    className,
  );
}

export function dashboardIconTileClass(tone: DashboardTone = "blue", className?: string) {
  return cn(
    "inline-flex h-10 w-10 items-center justify-center rounded-lg border shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
    iconToneClasses[tone],
    className,
  );
}

export const dashboardInputClass =
  "w-full rounded-xl border border-white/[0.08] bg-[#0d0f12] px-4 py-3 text-sm text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] outline-none transition duration-200 placeholder:text-slate-500 focus:border-white/[0.16] focus:bg-[#111318] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.04)] disabled:cursor-not-allowed disabled:opacity-45 disabled:text-slate-500";

export const dashboardSelectClass = cn(
  dashboardInputClass,
  "appearance-none bg-[#0d0f12] pr-10",
);

export const dashboardFieldLabelClass =
  "block text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500";

export const dashboardMutedTextClass =
  "text-sm leading-7 text-[rgba(194,203,219,0.74)]";

export const dashboardPrimaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-950 transition duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50";

export const dashboardSecondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition duration-200 hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-50";

export const dashboardGhostButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-[rgba(255,255,255,0.025)] px-3.5 py-2.5 text-sm text-slate-300 transition duration-200 hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50";

export const dashboardDangerButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-[#5e3b42]/30 bg-[#171214] px-3.5 py-2.5 text-sm font-semibold text-[#e5c7cb] transition duration-200 hover:border-[#705059] hover:bg-[#1d1719] disabled:cursor-not-allowed disabled:opacity-40";

export const dashboardMiniStatClass =
  "rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]";

export const dashboardCodeBlockClass =
  "flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0d0f12] px-4 py-4 font-mono text-sm text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]";

export const dashboardTableShellClass =
  "overflow-hidden rounded-xl border border-white/[0.08] bg-[rgba(255,255,255,0.02)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]";

export const dashboardTableHeaderClass =
  "bg-[rgba(255,255,255,0.03)] text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500";

export const dashboardTableRowClass =
  "border-t border-white/[0.06] bg-[rgba(10,12,15,0.56)] transition duration-200 hover:bg-[rgba(255,255,255,0.03)]";

export const dashboardTableCellClass = "px-4 py-4 text-sm text-slate-200";
export const dashboardTableMutedCellClass = "px-4 py-4 text-sm text-[rgba(194,203,219,0.7)]";
