"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Zap,
  KeyRound,
  Terminal,
  Globe,
  Webhook,
  LifeBuoy,
  ChevronLeft,
  LayoutDashboard,
  Server,
  Activity,
  MapPin,
} from "lucide-react";

export const DOCS_LINKS = [
  { label: "Introduction",     href: "/docs",                icon: BookOpen },
  { label: "Quick Start",      href: "/docs/quick-start",    icon: Zap },
  { label: "Installation",     href: "/docs/installation",   icon: LifeBuoy },
  { label: "Authentication",   href: "/docs/authentication", icon: KeyRound },
  { label: "HTTP Tunnels",     href: "/docs/http-tunnels",   icon: Globe },
  { label: "Webhooks",         href: "/docs/webhooks",       icon: Webhook },
  { label: "API Reference",    href: "/docs/api-gateway",    icon: Server },
  { label: "CLI Reference",    href: "/docs/cli",            icon: Terminal },
  { label: "Logs",             href: "/docs/logs",           icon: Activity },
  { label: "Regions",          href: "/docs/regions",        icon: MapPin },
];

interface DocsSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: (href: string) => void;
}

export function DocsSidebar({ collapsed, onNavigate }: DocsSidebarProps) {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);

  const handleClick = (href: string, e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(href);
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 280 }}
      className="relative flex flex-col h-full bg-zinc-950 border-r border-white/5 overflow-hidden z-20"
    >
      {/* Logo Area */}
      <div className="flex items-center h-16 px-5 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/0 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
                className="font-bold text-white text-lg tracking-tight whitespace-nowrap"
              >
                Docs
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Section Label */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-5 pt-6 pb-2"
          >
            <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
              Documentation
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1 custom-scrollbar">
        {DOCS_LINKS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isHov = hovered === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleClick(item.href, e)}
              onMouseEnter={() => setHovered(item.href)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                collapsed ? "justify-center" : "",
                isActive ? "text-cyan-400" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {/* Active Background Animation */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/20 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}

              {/* Hover Background Animation (Only if not active) */}
              {isHov && !isActive && (
                <motion.div
                  layoutId="sidebar-hover-bg"
                  className="absolute inset-0 bg-white/[0.03] rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}

              <Icon
                className={cn(
                  "w-[18px] h-[18px] shrink-0 relative z-10 transition-transform duration-300",
                  isActive ? "text-cyan-400" : "text-zinc-500",
                  isHov && !isActive && "scale-110 text-zinc-300"
                )}
              />
              
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="truncate relative z-10"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Dashboard Link */}
      <div className="mt-auto border-t border-white/5 p-3">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03] transition-all duration-200 group relative",
            collapsed ? "justify-center" : ""
          )}
        >
          <LayoutDashboard className="w-[18px] h-[18px] shrink-0 group-hover:scale-110 group-hover:text-cyan-400 transition-all duration-300" />
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

// --- Toggle Button ---

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
      animate={{ left: collapsed ? 56 : 264 }} // Matches the width calculations
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className={cn(
        "fixed z-50 top-[72px]", // Adjusted slightly down for better vertical rhythm
        "w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700/50",
        "flex items-center justify-center",
        "text-zinc-400 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/10",
        "transition-colors duration-300 shadow-[0_0_10px_rgba(0,0,0,0.5)] focus:outline-none"
      )}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <ChevronLeft
        className={cn(
          "w-4 h-4 transition-transform duration-300",
          collapsed && "rotate-180"
        )}
      />
    </motion.button>
  );
}