"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  Globe,
  HelpCircle,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  MapPin,
  Monitor,
  Package,
  Server,
  Terminal,
  Webhook,
  Zap,
} from "lucide-react";

import { docsNavGroups } from "./docs-navigation";

type DocsSidebarProps = {
  collapsed: boolean;
  onNavigate?: (href: string) => void;
};

const itemIconMap = {
  "/docs": BookOpen,
  "/docs/quick-start": Zap,
  "/docs/authentication": KeyRound,
  "/docs/installation": LifeBuoy,
  "/docs/installation/macos": Monitor,
  "/docs/installation/linux": Terminal,
  "/docs/installation/windows": Monitor,
  "/docs/installation/package-managers": Package,
  "/docs/cli": Terminal,
  "/docs/http-tunnels": Globe,
  "/docs/requests": Activity,
  "/docs/webhooks": Webhook,
  "/docs/api-gateway": Server,
  "/docs/api-keys": KeyRound,
  "/docs/logs": Activity,
  "/docs/regions": MapPin,
  "/docs/troubleshooting": HelpCircle,
} as const;

export function DocsSidebar({ collapsed, onNavigate }: DocsSidebarProps) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Foundation: true,
    Installation: true,
    "Core Workflows": true,
    "Diagnostics & Ops": true,
  });

  const activeGroups = useMemo(() => {
    return Object.fromEntries(
      docsNavGroups.map((group) => [
        group.title,
        group.items.some((item) => pathname === item.href),
      ]),
    ) as Record<string, boolean>;
  }, [pathname]);

  const handleClick = (href: string, event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!onNavigate) {
      return;
    }

    event.preventDefault();
    onNavigate(href);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 296 }}
      className="relative z-20 flex h-full flex-col overflow-hidden border-r border-white/5 bg-zinc-950"
    >
      <div className="flex h-16 items-center border-b border-white/5 px-5 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 to-cyan-500/0 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <BookOpen className="h-4 w-4 text-cyan-400" />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
                className="whitespace-nowrap text-lg font-bold tracking-tight text-white"
              >
                Docs
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-5 pb-2 pt-6"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Documentation
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="custom-scrollbar flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-5">
          {docsNavGroups.map((group) => {
            const expanded = expandedGroups[group.title] ?? true;
            const groupActive = activeGroups[group.title];

            return (
              <section key={group.title} className="space-y-1">
                {!collapsed ? (
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedGroups((current) => ({
                        ...current,
                        [group.title]: !expanded,
                      }))
                    }
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                      groupActive
                        ? "text-cyan-400"
                        : "text-zinc-500 hover:text-zinc-300",
                    )}
                  >
                    <span>{group.title}</span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200",
                        !expanded && "-rotate-90",
                      )}
                    />
                  </button>
                ) : null}

                <div className={cn("space-y-1", !collapsed && !expanded && "hidden")}>
                  {group.items.map((item) => {
                    const Icon = itemIconMap[item.href as keyof typeof itemIconMap] ?? BookOpen;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={(event) => handleClick(item.href, event)}
                        className={cn(
                          "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                          collapsed ? "justify-center" : "",
                          isActive
                            ? "text-cyan-400"
                            : "text-zinc-400 hover:text-zinc-200",
                        )}
                        title={collapsed ? item.title : undefined}
                      >
                        {isActive ? (
                          <motion.div
                            layoutId="docs-sidebar-active"
                            className="absolute inset-0 rounded-xl border border-cyan-500/20 bg-cyan-500/10"
                            initial={false}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        ) : null}

                        <Icon
                          className={cn(
                            "relative z-10 h-[18px] w-[18px] shrink-0",
                            isActive ? "text-cyan-400" : "text-zinc-500",
                          )}
                        />

                        <AnimatePresence initial={false}>
                          {!collapsed && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              className="relative z-10 truncate"
                            >
                              {item.title}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto border-t border-white/5 p-3">
        <Link
          href="/dashboard"
          className={cn(
            "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 transition-all duration-200 hover:bg-white/[0.03] hover:text-zinc-200",
            collapsed ? "justify-center" : "",
          )}
        >
          <LayoutDashboard className="h-[18px] w-[18px] shrink-0 transition-all duration-300 group-hover:text-cyan-400" />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="truncate"
              >
                Back to Dashboard
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>
    </motion.aside>
  );
}

export function DocsSidebarToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      onClick={onToggle}
      animate={{ left: collapsed ? 56 : 280 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className={cn(
        "fixed top-[72px] z-50 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-900 text-zinc-400 shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-colors duration-300 hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-white focus:outline-none",
      )}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <ChevronLeft
        className={cn(
          "h-4 w-4 transition-transform duration-300",
          collapsed && "rotate-180",
        )}
      />
    </motion.button>
  );
}
