export type DashboardHeaderMode = "home" | "focus" | "detail";

const focusRoutes = new Set([
  "/dashboard/requests",
  "/dashboard/webhooks",
  "/dashboard/ai",
]);

export function getDashboardHeaderConfig(pathname: string) {
  const mode: DashboardHeaderMode =
    pathname === "/dashboard"
      ? "home"
      : focusRoutes.has(pathname)
        ? "focus"
        : "detail";

  return {
    mode,
    isHome: mode === "home",
    showStatusRail: mode === "home",
    showPrimaryUpgrade: mode === "home",
    searchDensity: mode === "home" ? "default" : "compact",
    eyebrow:
      mode === "home"
        ? "Control plane"
        : mode === "focus"
          ? "Focused workflow"
          : "Page context",
  } as const;
}
