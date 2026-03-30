"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChevronRight, Rocket } from "lucide-react";

import { cn } from "@/lib/utils";

import { docsNavGroups } from "./docs-navigation";

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block lg:w-80 lg:shrink-0">
      <div className="sticky top-24 overflow-hidden rounded-[2rem] border border-white/10 bg-[#070707]/95 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur">
        <Link href="/docs" className="block border-b border-white/10 pb-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
            <BookOpen className="h-3.5 w-3.5 text-miransas-cyan" />
            Binboi docs
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-white">
            Documentation center
          </h2>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            Product docs for tunnels, tokens, webhooks, logs, and the self-hosted control plane.
          </p>
        </Link>

        <div className="mt-5 space-y-6">
          {docsNavGroups.map((group) => (
            <div key={group.title}>
              <p className="px-3 text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">
                {group.title}
              </p>
              <div className="mt-2 space-y-1.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border px-3 py-3 text-sm transition",
                        isActive
                          ? "border-miransas-cyan/20 bg-miransas-cyan/10 text-white"
                          : "border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <span className="max-w-[12rem]">{item.title}</span>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4",
                          isActive ? "text-miransas-cyan" : "text-zinc-600",
                        )}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-miransas-cyan" />
            <p className="text-sm font-semibold text-white">Quick path</p>
          </div>
          <p className="mt-3 text-sm leading-7 text-zinc-400">
            Install the CLI, create a dashboard token, and open a public URL for `localhost` in minutes.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/50 p-4 text-xs leading-6 text-miransas-cyan">
            <code>{`binboi login --token <token>
binboi start 3000 my-app`}</code>
          </pre>
        </div>
      </div>
    </aside>
  );
}
