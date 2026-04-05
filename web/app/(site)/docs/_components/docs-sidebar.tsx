"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

import { docsNavGroups } from "./docs-navigation";

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-8">
      {docsNavGroups.map((group) => (
        <section key={group.title} className="space-y-3">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            {group.title}
          </p>

          <div className="space-y-1">
            {group.items.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "block rounded-2xl px-4 py-3 transition",
                    active
                      ? "bg-white/[0.06] text-white ring-1 ring-white/12"
                      : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-100",
                  )}
                >
                  <div className="text-sm font-medium">{item.title}</div>
                  <p
                    className={cn(
                      "mt-1 text-xs leading-6",
                      active ? "text-zinc-300" : "text-zinc-500",
                    )}
                  >
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}

export function DocsSidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <>
      <aside className="hidden lg:block lg:w-72 lg:flex-none xl:w-80">
        <div className="sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto pr-6 xl:pr-8">
          <div className="rounded-3xl border border-white/[0.08] bg-[#101114] px-5 py-5">
            <div className="border-b border-white/[0.08] pb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Binboi Docs
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Product guides, CLI flows, requests, and operational notes.
              </p>
            </div>

            <div className="mt-5">
              <SidebarNav />
            </div>
          </div>
        </div>
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[22rem] max-w-[calc(100vw-2rem)] border-r border-white/[0.08] bg-[#0a0b0e] px-5 py-5 transition-transform duration-200 ease-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Binboi Docs
            </p>
            <p className="mt-2 text-sm text-zinc-400">Documentation navigation</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-300"
            aria-label="Close docs navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 h-[calc(100vh-7rem)] overflow-y-auto pr-1">
          <SidebarNav onNavigate={onClose} />
        </div>
      </aside>
    </>
  );
}
