"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent as ReactMouseEvent } from "react";
import { Menu, Search, Sparkles } from "lucide-react";
import { useSession } from "@/components/provider/session-provider";

import { DASHBOARD_LINKS } from "@/constants";

import { cn } from "@/lib/utils";

type HeaderProps = {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: (href: string) => void;
};

type SearchResult = {
  href: string;
  label: string;
  section: string;
};

function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardHeader({
  collapsed,
  onToggle,
  onNavigate,
}: HeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const searchItems = useMemo<SearchResult[]>(
    () =>
      DASHBOARD_LINKS.flatMap((section) =>
        section.items.map((item) => ({
          href: item.href,
          label: item.label,
          section: section.title,
        })),
      ).filter((item) => item.href !== pathname),
    [pathname],
  );

  const searchResults = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) {
      return searchItems.slice(0, 6);
    }

    return searchItems
      .filter((item) => {
        const haystack = `${item.label} ${item.section} ${item.href}`.toLowerCase();
        return haystack.includes(value);
      })
      .slice(0, 6);
  }, [query, searchItems]);

  const accountName =
    session?.user?.name?.trim() || session?.user?.email?.trim() || "Account";
  const accountEmail = session?.user?.email?.trim() || "Manage your workspace";
  const initials = accountName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const summary = "Manage tunnels, traffic, auth, and billing from one stable workspace.";

  const handleNavigate = (href: string) => {
    setFocused(false);
    setQuery("");
    if (onNavigate) {
      onNavigate(href);
      return;
    }
    window.location.href = href;
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setFocused(false);
      return;
    }

    if (event.key === "Enter" && searchResults[0]) {
      event.preventDefault();
      handleNavigate(searchResults[0].href);
    }
  };

  const handleActionClick = (
    href: string,
    event: ReactMouseEvent<HTMLAnchorElement>,
  ) => {
    if (!onNavigate) {
      return;
    }

    event.preventDefault();
    handleNavigate(href);
  };

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!searchRef.current?.contains(event.target as Node)) {
        setFocused(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#09090b]/95 backdrop-blur">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <button
                type="button"
                onClick={onToggle}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-200 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Dashboard
                </p>
                <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight text-white">
                  Dashboard
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                  {summary}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div ref={searchRef} className="relative w-full min-w-0 lg:w-[360px]">
                <div className="flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-zinc-400 transition focus-within:border-white/20 focus-within:bg-white/[0.05] focus-within:text-zinc-200">
                  <Search className="h-4 w-4 shrink-0" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onFocus={() => setFocused(true)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search dashboard pages"
                    className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                  />
                </div>

                <AnimatePresence>
                  {focused && searchResults.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      className="absolute left-0 right-0 top-[calc(100%+10px)] overflow-hidden rounded-xl border border-white/10 bg-[#111114] shadow-2xl"
                    >
                      <div className="border-b border-white/6 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                        {query.trim() ? "Matching pages" : "Quick links"}
                      </div>
                      <div className="p-1.5">
                        {searchResults.map((item) => (
                          <button
                            key={item.href}
                            type="button"
                            onClick={() => handleNavigate(item.href)}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition hover:bg-white/[0.04]"
                          >
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium text-zinc-100">
                                {item.label}
                              </div>
                              <div className="truncate text-xs text-zinc-500">
                                {item.section}
                              </div>
                            </div>
                            <span className="ml-4 shrink-0 text-[11px] text-zinc-600">
                              {item.href.replace("/dashboard", "") || "/"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/ai"
                  onClick={(event) => handleActionClick("/dashboard/ai", event)}
                  className={cn(
                    "inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition",
                    isActiveRoute(pathname, "/dashboard/ai")
                      ? "border-white/20 bg-white/[0.08] text-white"
                      : "border-white/10 bg-white/[0.03] text-zinc-200 hover:border-white/15 hover:bg-white/[0.06] hover:text-white",
                  )}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Try AI
                </Link>

                <Link
                  href="/dashboard/user-management"
                  onClick={(event) => handleActionClick("/dashboard/user-management", event)}
                  className="inline-flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:border-white/15 hover:bg-white/[0.06]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-sm font-semibold text-white">
                    {initials || "BA"}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-zinc-100">
                      {accountName}
                    </div>
                    <div className="truncate text-xs text-zinc-500">
                      {accountEmail}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
