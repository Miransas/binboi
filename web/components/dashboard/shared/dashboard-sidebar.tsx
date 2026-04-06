"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import type { ComponentType, MouseEvent as ReactMouseEvent } from "react";
import { BookOpen, LogOut } from "lucide-react";

import { DASHBOARD_LINKS } from "@/constants";
import { cn } from "@/lib/utils";

type DashboardIcon = ComponentType<{ className?: string }>;

type SidebarProps = {
  collapsed: boolean;
  onNavigate?: (href: string) => void;
};

function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarDocs({ collapsed, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const accountName = session?.user?.name?.trim() || "Workspace";
  const accountEmail = session?.user?.email?.trim() || "Manage your account";
  const initials = accountName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const handleNavClick = (
    href: string,
    event: ReactMouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => {
    if (!onNavigate) {
      return;
    }

    event.preventDefault();
    onNavigate(href);
  };

  return (
    <aside
      className={cn(
        "block shrink-0 border-r border-white/10 bg-[#09090b]",
        "transition-[width] duration-200 ease-out",
        collapsed ? "w-[88px]" : "w-[272px]",
      )}
    >
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b border-white/10 px-4 py-5">
          <Link
            href="/dashboard"
            onClick={(event) => handleNavClick("/dashboard", event)}
            className={cn(
              "flex items-center gap-3 rounded-xl",
              collapsed ? "justify-center px-0" : "px-1",
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-base font-semibold tracking-tight text-white">
              B
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">Binboi</div>
                <div className="truncate text-xs text-zinc-500">Dashboard</div>
              </div>
            ) : null}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-6">
            {DASHBOARD_LINKS.map((section) => (
              <section key={section.title} className="space-y-2">
                {!collapsed ? (
                  <div className="px-3 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-600">
                    {section.title}
                  </div>
                ) : null}

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon as DashboardIcon;
                    const active = isActiveRoute(pathname, item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={(event) => handleNavClick(item.href, event)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition",
                          collapsed ? "justify-center px-2" : "",
                          active
                            ? "border-white/15 bg-white/[0.07] text-white"
                            : "border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-zinc-100",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!collapsed ? (
                          <>
                            <span className="truncate">{item.label}</span>
                            {item.badge ? (
                              <span className="ml-auto rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                                {item.badge}
                              </span>
                            ) : null}
                          </>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="space-y-2">
            <Link
              href="/docs"
              className={cn(
                "flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm text-zinc-400 transition hover:border-white/10 hover:bg-white/[0.04] hover:text-zinc-100",
                collapsed ? "justify-center px-2" : "",
              )}
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>Documentation</span> : null}
            </Link>

            <button
              type="button"
              onClick={() => signOut()}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm text-zinc-400 transition hover:border-white/10 hover:bg-white/[0.04] hover:text-zinc-100",
                collapsed ? "justify-center px-2" : "",
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>Sign out</span> : null}
            </button>
          </div>

          <Link
            href="/dashboard/user-management"
            onClick={(event) => handleNavClick("/dashboard/user-management", event)}
            className={cn(
              "mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 transition hover:border-white/15 hover:bg-white/[0.05]",
              collapsed ? "justify-center px-2" : "",
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-sm font-semibold text-white">
              {initials || "BA"}
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-zinc-100">
                  {accountName}
                </div>
                <div className="truncate text-xs text-zinc-500">
                  {accountEmail}
                </div>
              </div>
            ) : null}
          </Link>
        </div>
      </div>
    </aside>
  );
}
