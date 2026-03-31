"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookText, Layers, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { docsNavGroups } from "./docs-navigation";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean) => void;
}

function docsItemMonogram(title: string) {
  const words = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (words.length === 0) {
    return "D";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return words.map((word) => word[0]).join("").toUpperCase();
}

export function DocsSidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, setIsMobileOpen]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed left-0 top-[4.5rem] z-40 h-[calc(100dvh-4.5rem)] border-r border-white/[0.08] bg-[linear-gradient(180deg,rgba(8,13,23,0.97),rgba(5,9,18,0.985))] shadow-[18px_0_60px_rgba(0,0,0,0.38)] transition-[width,transform] duration-300 ease-out",
          "w-80 -translate-x-full lg:w-[var(--docs-sidebar-width)] lg:translate-x-0",
          isMobileOpen && "translate-x-0",
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(134,169,255,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_18%,transparent_100%)]" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

        <div className="relative flex h-full flex-col">
          <div
            className={cn(
              "flex shrink-0 items-center border-b border-white/8 px-4 py-4",
              isCollapsed ? "justify-center lg:px-3" : "gap-3 lg:px-5",
            )}
          >
            <Link
              href="/docs"
              className={cn(
                "flex min-w-0 items-center gap-3",
                isCollapsed && "justify-center",
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-miransas-cyan/18 bg-miransas-cyan/8 text-miransas-cyan shadow-[0_0_26px_rgba(0,255,209,0.08)]">
                <Layers className="h-4.5 w-4.5" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0 lg:block">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                    Binboi
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-white">
                    Documentation
                  </p>
                </div>
              )}
            </Link>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                aria-label={isCollapsed ? "Expand docs navigation" : "Collapse docs navigation"}
                title={isCollapsed ? "Expand navigation" : "Collapse navigation"}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="h-4.5 w-4.5" />
                ) : (
                  <PanelLeftClose className="h-4.5 w-4.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white lg:hidden"
                aria-label="Close docs navigation"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          <div
            className={cn(
              "border-b border-white/8 px-4 py-4 text-sm leading-7 text-zinc-400",
              isCollapsed ? "hidden lg:block lg:px-3 lg:py-3" : "lg:px-5",
            )}
          >
            {isCollapsed ? (
              <div className="flex justify-center">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-zinc-300">
                  <BookText className="h-4.5 w-4.5" />
                </div>
              </div>
            ) : (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#dfe7ff]">
                  Quick path
                </p>
                <p className="mt-3">
                  Jump between guides without losing your reading position. Collapse the rail when
                  you want more room for the main content.
                </p>
              </>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
            <nav className="space-y-7">
              {docsNavGroups.map((group) => (
                <div key={group.title} className="space-y-2">
                  {isCollapsed ? (
                    <div className="flex justify-center py-1.5">
                      <span className="h-px w-8 rounded-full bg-white/10" />
                    </div>
                  ) : (
                    <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                      {group.title}
                    </p>
                  )}

                  <div className="space-y-1.5">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      const monogram = docsItemMonogram(item.title);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={item.title}
                          className={cn(
                            "group flex items-center rounded-2xl transition-all duration-200",
                            isCollapsed
                              ? "justify-center px-2 py-2.5"
                              : "gap-3 px-3 py-2.5",
                            isActive
                              ? "border border-miransas-cyan/16 bg-miransas-cyan/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                              : "border border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-zinc-200",
                          )}
                        >
                          <span
                            className={cn(
                              "inline-flex shrink-0 items-center justify-center rounded-xl border text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors",
                              isCollapsed ? "h-10 w-10" : "h-8 w-8",
                              isActive
                                ? "border-miransas-cyan/18 bg-miransas-cyan/10 text-miransas-cyan"
                                : "border-white/10 bg-white/[0.03] text-zinc-500 group-hover:text-zinc-300",
                            )}
                          >
                            {monogram}
                          </span>

                          {!isCollapsed && (
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-inherit">
                                {item.title}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-zinc-600 transition-colors group-hover:text-zinc-500">
                                {item.description}
                              </p>
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <div className="border-t border-white/8 p-3">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "hidden w-full items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white lg:inline-flex",
                isCollapsed ? "h-11 px-0" : "gap-3 px-4 py-3",
              )}
              aria-label={isCollapsed ? "Expand docs navigation" : "Collapse docs navigation"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-4.5 w-4.5" />
              ) : (
                <>
                  <PanelLeftClose className="h-4.5 w-4.5" />
                  <span className="text-sm font-medium">Collapse navigation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
