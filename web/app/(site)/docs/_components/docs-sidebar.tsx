"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineBookOpen, HiOutlineBolt, HiOutlineArrowDownTray,
  HiOutlineKey, HiOutlineCommandLine, HiOutlineArrowsRightLeft,
  HiOutlineChatBubbleLeftRight, HiOutlineShieldCheck, HiOutlineDocumentText,
  HiOutlineGlobeAlt, HiOutlineExclamationTriangle, HiOutlineChevronLeft
} from "react-icons/hi2";

/* ─── Nav data ───────────────────────────────────────────────── */
const NAV = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs", icon: HiOutlineBookOpen },
      { title: "Quick Start", href: "/docs/quick-start", icon: HiOutlineBolt },
      { title: "Installation", href: "/docs/installation", icon: HiOutlineArrowDownTray },
      { title: "Authentication", href: "/docs/authentication", icon: HiOutlineShieldCheck },
    ],
  },
  {
    title: "Using Binboi",
    items: [
      { title: "CLI", href: "/docs/cli", icon: HiOutlineCommandLine, badge: "beta" },
      { title: "HTTP Tunnels", href: "/docs/http-tunnels", icon: HiOutlineArrowsRightLeft },
      { title: "Requests", href: "/docs/requests", icon: HiOutlineChatBubbleLeftRight },
    ],
  },
  {
    title: "Debugging",
    items: [
      { title: "API Keys", href: "/docs/api-keys", icon: HiOutlineKey },
      { title: "Logs", href: "/docs/logs", icon: HiOutlineDocumentText, badge: "live" },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Regions", href: "/docs/regions", icon: HiOutlineGlobeAlt },
      { title: "Troubleshooting", href: "/docs/troubleshooting", icon: HiOutlineExclamationTriangle },
    ],
  },
];

interface DocsSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}
// ... (İmportlar ve NAV datası aynı kalıyor)

export function DocsSidebar({ isOpen, onToggle }: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen flex flex-col mt-20
          bg-[#0b0b0d] border-r border-white/[0.05]
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-[260px]" : "w-[68px]"}
          overflow-y-scroll // Taşmaları engellemek için kritik
        `}
      >
        {/* ── Header ── */}
        <div className="relative z-10 flex h-16 shrink-0 items-center border-b border-white/[0.05] px-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400">
              <HiOutlineBolt className="text-black text-xl" />
            </div>

            <div className={`flex flex-col transition-all duration-200 ${isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"}`}>
              <span className="text-sm font-bold tracking-tight text-white/90 whitespace-nowrap">Binboi</span>
              <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">Docs v2.4</span>
            </div>
          </div>

          {/* Toggle Butonu - Artık içerde ve daha şık */}
          {/* <button
            onClick={onToggle}
            className={`
              absolute top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md 
              bg-white/[0.03] border border-white/[0.08] text-white/40 transition-all duration-300
              hover:text-emerald-400 hover:bg-white/[0.08]
              ${isOpen ? "right-3" : "right-[20px]"}
            `}
          >
        <HiOutlineChevronLeft className={`transition-transform duration-300 ${!isOpen ? "rotate-180" : ""}`} size={16} /> 
          </button> */}
        </div>

        {/* ── Navigation ── */}
        <nav className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden py-6 scrollbar-hide">
          <div className="space-y-8 px-3">
            {NAV.map((group) => (
              <div key={group.title} className="space-y-1">
                <p className={`
                  px-3 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 transition-all duration-200
                  ${isOpen ? "opacity-100 h-auto mb-2" : "opacity-0 h-0 overflow-hidden mb-0"}
                `}>
                  {group.title}
                </p>

                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`
                            group relative flex items-center h-10 rounded-lg transition-all duration-200
                            ${isOpen ? "px-3" : "justify-center"} // Kapalıyken merkezle
                            ${active 
                              ? "bg-emerald-500/10 text-emerald-400" 
                              : "text-white/40 hover:bg-white/[0.04] hover:text-white/80"
                            }
                          `}
                        >
                          <item.icon className={`text-xl shrink-0 ${active ? "text-emerald-400" : "group-hover:text-white/70"}`} />
                          
                          <span className={`
                            ml-3 text-[13px] font-medium whitespace-nowrap transition-all duration-200
                            ${isOpen ? "opacity-100 translate-x-0 w-auto" : "opacity-0 -translate-x-4 w-0 overflow-hidden invisible"}
                          `}>
                            {item.title}
                          </span>

                          {item.badge && isOpen && (
                            <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/5 text-emerald-500/60 font-mono">
                              {item.badge}
                            </span>
                          )}

                          {/* Tooltip - Kapalıyken fırlasın */}
                          {!isOpen && (
                            <div className="absolute left-14 px-3 py-1.5 rounded-md bg-[#161618] border border-white/[0.1] text-xs text-white opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none z-50 whitespace-nowrap shadow-2xl">
                              {item.title}
                            </div>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

      
      </aside>
    </>
  );
}