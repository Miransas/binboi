import { cn } from "@/lib/utils";

export type DashboardTone = "neutral" | "blue" | "orange" | "green" | "danger";

const panelToneClasses: Record<DashboardTone, string> = {
  neutral:
    "before:absolute before:inset-0 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_26%,transparent_100%)] before:content-[''] after:absolute after:inset-x-10 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent after:content-['']",
  blue:
    "before:absolute before:-right-20 before:-top-20 before:h-56 before:w-56 before:rounded-full before:bg-[radial-gradient(circle,rgba(126,162,255,0.22),transparent_72%)] before:blur-3xl before:content-[''] after:absolute after:inset-x-10 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#8aacff]/34 after:to-transparent after:content-['']",
  orange:
    "before:absolute before:-right-16 before:-top-16 before:h-44 before:w-44 before:rounded-full before:bg-[radial-gradient(circle,rgba(247,161,93,0.16),transparent_72%)] before:blur-3xl before:content-[''] after:absolute after:inset-x-10 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#f7a15d]/34 after:to-transparent after:content-['']",
  green:
    "before:absolute before:-right-16 before:-top-16 before:h-44 before:w-44 before:rounded-full before:bg-[radial-gradient(circle,rgba(84,202,146,0.15),transparent_72%)] before:blur-3xl before:content-[''] after:absolute after:inset-x-10 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#54ca92]/34 after:to-transparent after:content-['']",
  danger:
    "before:absolute before:-right-16 before:-top-16 before:h-44 before:w-44 before:rounded-full before:bg-[radial-gradient(circle,rgba(240,120,120,0.14),transparent_72%)] before:blur-3xl before:content-[''] after:absolute after:inset-x-10 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-[#f07878]/30 after:to-transparent after:content-['']",
};

const insetToneClasses: Record<DashboardTone, string> = {
  neutral:
    "border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.018))]",
  blue:
    "border-[#8aacff]/18 bg-[linear-gradient(180deg,rgba(126,162,255,0.1),rgba(126,162,255,0.04))]",
  orange:
    "border-[#f7a15d]/18 bg-[linear-gradient(180deg,rgba(247,161,93,0.1),rgba(247,161,93,0.04))]",
  green:
    "border-[#54ca92]/18 bg-[linear-gradient(180deg,rgba(84,202,146,0.1),rgba(84,202,146,0.04))]",
  danger:
    "border-[#f07878]/18 bg-[linear-gradient(180deg,rgba(240,120,120,0.1),rgba(240,120,120,0.04))]",
};

const badgeToneClasses: Record<DashboardTone, string> = {
  neutral: "border-white/[0.08] bg-white/[0.04] text-slate-300",
  blue: "border-[#8aacff]/18 bg-[#8aacff]/10 text-[#dfe7ff]",
  orange: "border-[#f7a15d]/18 bg-[#f7a15d]/12 text-[#ffd2ae]",
  green: "border-emerald-400/18 bg-emerald-400/10 text-emerald-100",
  danger: "border-rose-400/18 bg-rose-500/10 text-rose-100",
};

const iconToneClasses: Record<DashboardTone, string> = {
  neutral: "border-white/[0.08] bg-white/[0.04] text-slate-200",
  blue: "border-[#8aacff]/18 bg-[#8aacff]/10 text-[#dfe7ff]",
  orange: "border-[#f7a15d]/18 bg-[#f7a15d]/12 text-[#ffd2ae]",
  green: "border-emerald-400/18 bg-emerald-400/10 text-emerald-100",
  danger: "border-rose-400/18 bg-rose-500/10 text-rose-100",
};

export function dashboardPanelClass(tone: DashboardTone = "neutral", className?: string) {
  return cn(
    "relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(8,12,22,0.96),rgba(4,8,16,0.985))] shadow-[0_24px_72px_rgba(1,4,10,0.38),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl",
    panelToneClasses[tone],
    className,
  );
}

export function dashboardInsetPanelClass(tone: DashboardTone = "neutral", className?: string) {
  return cn(
    "rounded-[1.4rem] border px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
    insetToneClasses[tone],
    className,
  );
}

export function dashboardBadgeClass(tone: DashboardTone = "neutral", className?: string) {
  return cn(
    "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em]",
    badgeToneClasses[tone],
    className,
  );
}

export function dashboardIconTileClass(tone: DashboardTone = "blue", className?: string) {
  return cn(
    "inline-flex h-11 w-11 items-center justify-center rounded-[1.15rem] border shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]",
    iconToneClasses[tone],
    className,
  );
}

export const dashboardInputClass =
  "w-full rounded-[1.25rem] border border-white/[0.08] bg-[rgba(6,10,18,0.84)] px-4 py-3.5 text-sm text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition duration-200 placeholder:text-slate-500 focus:border-[#8aacff]/45 focus:bg-[rgba(9,14,24,0.98)] focus:shadow-[0_0_0_4px_rgba(126,162,255,0.12)] disabled:cursor-not-allowed disabled:opacity-45 disabled:text-slate-500";

export const dashboardSelectClass = cn(
  dashboardInputClass,
  "appearance-none bg-[rgba(6,10,18,0.84)] pr-10",
);

export const dashboardFieldLabelClass =
  "block text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500";

export const dashboardMutedTextClass =
  "text-sm leading-7 text-[rgba(194,203,219,0.74)]";

export const dashboardPrimaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-[1.25rem] border border-[#f7a15d]/22 bg-[linear-gradient(180deg,rgba(247,161,93,0.98),rgba(234,132,59,0.96))] px-4 py-3 text-sm font-semibold text-[#09101b] shadow-[0_16px_36px_rgba(247,161,93,0.18)] transition duration-200 hover:-translate-y-px hover:shadow-[0_20px_40px_rgba(247,161,93,0.24)] disabled:cursor-not-allowed disabled:opacity-50";

export const dashboardSecondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-[1.25rem] border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition duration-200 hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-50";

export const dashboardGhostButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-[1.1rem] border border-white/[0.08] bg-[rgba(255,255,255,0.025)] px-3.5 py-2.5 text-sm text-slate-300 transition duration-200 hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50";

export const dashboardDangerButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-[1.1rem] border border-rose-400/20 bg-rose-500/10 px-3.5 py-2.5 text-sm font-semibold text-rose-100 transition duration-200 hover:border-rose-300/28 hover:bg-rose-500/16 disabled:cursor-not-allowed disabled:opacity-40";

export const dashboardMiniStatClass =
  "rounded-[1.35rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]";

export const dashboardCodeBlockClass =
  "flex items-center gap-3 rounded-[1.25rem] border border-white/[0.08] bg-[rgba(3,7,14,0.9)] px-4 py-4 font-mono text-sm text-[#dbe5ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]";

export const dashboardTableShellClass =
  "overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[rgba(255,255,255,0.02)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]";

export const dashboardTableHeaderClass =
  "bg-[rgba(255,255,255,0.03)] text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500";

export const dashboardTableRowClass =
  "border-t border-white/[0.06] bg-[rgba(8,12,20,0.56)] transition duration-200 hover:bg-[rgba(255,255,255,0.035)]";

export const dashboardTableCellClass = "px-4 py-4 text-sm text-slate-200";
export const dashboardTableMutedCellClass = "px-4 py-4 text-sm text-[rgba(194,203,219,0.7)]";
