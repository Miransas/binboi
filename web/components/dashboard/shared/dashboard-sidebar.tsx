/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, LogOut, Sparkles } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

import { usePricingPlan } from "@/components/provider/pricing-plan-provider";
import { DASHBOARD_LINKS } from "@/constants";
import { getPricingPlan } from "@/lib/pricing";
import { cn } from "@/lib/utils";

function SidebarSectionLabel({
  isCollapsed,
  label,
}: {
  isCollapsed: boolean;
  label: string;
}) {
  if (isCollapsed) {
    return <div className="px-2 py-1" />;
  }

  return (
    <div className="mb-2 flex items-center gap-2 px-3">
      <span className="h-1.5 w-1.5 rounded-full bg-miransas-cyan/70 shadow-[0_0_10px_rgba(0,255,209,0.55)]" />
      <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
        {label}
      </span>
    </div>
  );
}

export default function DashboardSidebar({ user }: { user: any }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const isGuest = user?.email === "preview@binboi.local";
  const { plan, nextPlan } = usePricingPlan();
  const activePlan = getPricingPlan(plan);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 88 : 280 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-40 flex h-screen shrink-0 flex-col border-r border-white/8 bg-[linear-gradient(180deg,rgba(12,18,28,0.99),rgba(10,15,24,0.995))] shadow-[16px_0_40px_rgba(2,6,23,0.12)]"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(86,220,208,0.045),transparent_22%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.016),transparent_16%,transparent_84%,rgba(255,255,255,0.008))]" />
        <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      </div>

      <button
        type="button"
        onClick={() => setIsCollapsed((value) => !value)}
        className="absolute -right-3 top-6 z-50 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#101722] text-zinc-400 shadow-[0_8px_20px_rgba(0,0,0,0.18)] transition hover:border-miransas-cyan/18 hover:text-white"
      >
        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      <div className="relative z-10 flex h-[4.5rem] items-center border-b border-white/8 px-5">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
            <img src="/logo.png" alt="Binboi logo" className="h-9 w-9 object-contain" />
          </div>

          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="min-w-0"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                  Binboi
                </p>
                <p className="mt-1 truncate text-[15px] font-black tracking-tight text-white">
                  Control plane
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-4 rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
          <div className={cn("flex items-start gap-3", isCollapsed && "justify-center")}>
            <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-miransas-cyan/14 bg-miransas-cyan/7 text-miransas-cyan">
              <Sparkles className="h-4 w-4" />
            </div>
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="min-w-0"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                    Operator surface
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-300">
                    Tunnels, webhooks, logs, and AI guidance from one place.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/[0.02] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                      {activePlan.name}
                    </span>
                    {nextPlan ? (
                      <Link
                        href="/dashboard/billing"
                        className="rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-300 transition hover:border-miransas-cyan/16 hover:text-white"
                      >
                        {nextPlan === "PRO" ? "Upgrade" : "Scale"}
                      </Link>
                    ) : null}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav className="space-y-5">
          {DASHBOARD_LINKS.map((section) => (
            <div key={section.title}>
              <SidebarSectionLabel isCollapsed={isCollapsed} label={section.title} />

              <div className="space-y-1">
                {section.items.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;

                  return (
                    <Link
                      key={`${section.title}-${link.href}`}
                      href={link.href}
                      title={isCollapsed ? link.label : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-2.5 transition-all duration-200",
                        isCollapsed ? "justify-center" : "justify-start",
                        isActive ? "text-white" : "text-zinc-400 hover:text-white",
                      )}
                    >
                      {isActive ? (
                        <motion.span
                          layoutId="dashboard-sidebar-active"
                          className="absolute inset-0 rounded-2xl border border-miransas-cyan/12 bg-[linear-gradient(180deg,rgba(18,26,36,0.985),rgba(12,18,27,0.985))] shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_10px_22px_rgba(2,6,23,0.12)]"
                        />
                      ) : null}
                      <span
                        className={cn(
                          "absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100",
                          isActive ? "via-miransas-cyan/24 opacity-100" : "via-white/12",
                        )}
                      />
                      <div className="relative z-10 flex min-w-0 items-center gap-3">
                        <span
                          className={cn(
                            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors",
                            isActive
                              ? "border-miransas-cyan/16 bg-miransas-cyan/7 text-miransas-cyan"
                              : "border-white/10 bg-white/[0.02] text-zinc-500 group-hover:text-zinc-200",
                          )}
                        >
                          {Icon ? <Icon size={18} /> : null}
                        </span>

                        <AnimatePresence initial={false}>
                          {!isCollapsed && (
                            <motion.div
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -8 }}
                              className="flex min-w-0 flex-1 items-center justify-between gap-3"
                            >
                              <span className="truncate text-sm font-medium">{link.label}</span>
                              {link.badge ? (
                                <span className="rounded-full border border-miransas-cyan/14 bg-miransas-cyan/7 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8aefe7]">
                                  {link.badge}
                                </span>
                              ) : null}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="relative z-10 border-t border-white/8 p-4">
        <div
          className={cn(
            "rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
            isCollapsed && "px-2",
          )}
        >
          <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <img
              src={user?.image || "https://github.com/ghost.png"}
              alt="User Avatar"
              className="h-9 w-9 shrink-0 rounded-full border border-white/10 object-cover"
            />

            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
                  <p className="mt-1 truncate text-xs text-zinc-500">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!isGuest) {
                signOut({ callbackUrl: "/" });
              }
            }}
            className={cn(
              "mt-3 inline-flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-sm text-zinc-400 transition hover:border-red-400/14 hover:bg-red-500/7 hover:text-red-200",
              isCollapsed && "justify-center px-0",
            )}
            title={isCollapsed ? (isGuest ? "Local Preview" : "Sign Out") : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {isGuest ? "Local preview" : "Sign out"}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
