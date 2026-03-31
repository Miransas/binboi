"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ChevronDown, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Layers, 
  BookText,
  Hash
} from "lucide-react";
import { cn } from "@/lib/utils";
import { docsNavGroups } from "./docs-navigation";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

export function DocsSidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-white/5 bg-[#080d17] transition-all duration-300 ease-in-out shadow-2xl",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Esnek yapı: Header, Nav(Scrollable), Footer */}
      <div className="flex h-full flex-col">
        
        {/* LOGO BÖLÜMÜ */}
        <div className="flex shrink-0 items-center gap-3 p-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-miransas-cyan/10 border border-miransas-cyan/20">
            <Layers className="h-5 w-5 text-miransas-cyan" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight text-white truncate">Binboi Docs</span>
          )}
        </div>

        {/* NAVİGASYON (SCROLL BURADA) */}
        {/* 'min-h-0' ve 'flex-1' scroll'un doğru çalışmasını sağlar */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-2 custom-scrollbar">
          <nav className="space-y-8">
            {docsNavGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-2">
                {!isCollapsed && (
                  <p className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    {group.title}
                  </p>
                )}
                
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={isCollapsed ? item.title : ""}
                        className={cn(
                          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                          isActive 
                            ? "bg-miransas-cyan/10 text-miransas-cyan shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" 
                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                        )}
                      >
                        <Hash className={cn("h-4 w-4 shrink-0 opacity-40", isActive && "opacity-100")} />
                        {!isCollapsed && <span className="truncate">{item.title}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          {/* Scroll bittiğinde alttaki butonla arasında boşluk kalsın diye */}
          <div className="h-10" />
        </div>

        {/* ALT KISIM (KAPATMA BUTONU) */}
        <div className="shrink-0 border-t border-white/5 p-4 bg-[#080d17]">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/5 py-3 text-zinc-400 hover:bg-white/10 hover:text-white transition-all"
          >
            {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            {!isCollapsed && <span className="text-sm font-medium">Menüyü Daralt</span>}
          </button>
        </div>

      </div>
    </aside>
  );
}