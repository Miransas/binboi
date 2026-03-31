import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function DashboardRouteFrame({
  children,
  className,
  variant = "shell",
}: {
  children: ReactNode;
  className?: string;
  variant?: "shell" | "overview" | "workbench" | "ai";
}) {
  return (
    <div
      className={cn(
        "dashboard-route-frame flex min-h-full flex-col",
        `dashboard-route-frame--${variant}`,
        className,
      )}
    >
      {children}
    </div>
  );
}
