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
      {/* Mobile Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onToggle} />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen flex flex-col
          bg-[#0b0b0d] border-r border-white/[0.05]
          transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isOpen ? "w-[260px]" : "w-[68px]"}
          overflow-hidden // Dışarı taşan her şeyi anında keser
        `}
      >
        {/* ── Header ── */}
        <div className="relative flex h-16 shrink-0 items-center justify-between px-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
              <HiOutlineBolt className="text-black text-xl" />
            </div>
            
            <div className={`flex flex-col transition-all duration-300 ${isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}>
              <span className="text-sm font-bold text-white/90 whitespace-nowrap">Binboi</span>
              <span className="font-mono text-[9px] text-white/30 uppercase tracking-tighter">Docs v2.4</span>
            </div>
          </div>

          {/* Toggle Button - Artık hep içerde */}
          <button
            onClick={onToggle}
            className={`
              flex h-7 w-7 shrink-0 items-center justify-center rounded-md 
              bg-white/[0.03] border border-white/[0.08] text-white/40 
              transition-all duration-300 hover:text-emerald-400
              ${!isOpen ? "absolute left-1/2 -translate-x-1/2" : ""}
            `}
          >
            <HiOutlineChevronLeft className={`transition-transform duration-500 ${!isOpen ? "rotate-180" : ""}`} size={16} />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 no-scrollbar">
          <div className="space-y-8 px-3">
            {NAV.map((group) => (
              <div key={group.title} className="flex flex-col">
                <p className={`
                  px-3 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 transition-opacity duration-300
                  ${isOpen ? "opacity-100 mb-3" : "opacity-0 h-0 overflow-hidden"}
                `}>
                  {group.title}
                </p>

                <ul className="space-y-1.5">
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <li key={item.href} className="flex justify-center">
                        <Link
                          href={item.href}
                          className={`
                            group relative flex items-center h-10 rounded-lg transition-all duration-200
                            ${isOpen ? "w-full px-3" : "w-10 justify-center"} 
                            ${active ? "bg-emerald-500/10 text-emerald-400" : "text-white/40 hover:bg-white/[0.04] hover:text-white/80"}
                          `}
                        >
                          <item.icon className={`text-[20px] shrink-0 ${active ? "text-emerald-400" : "group-hover:text-white/70"}`} />
                          
                          <span className={`
                            ml-3 text-[13px] font-medium whitespace-nowrap transition-all duration-300
                            ${isOpen ? "opacity-100 translate-x-0 w-auto" : "opacity-0 -translate-x-10 w-0 absolute"}
                          `}>
                            {item.title}
                          </span>

                          {active && (
                            <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-emerald-400 rounded-r-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                          )}
                          
                          {!isOpen && (
                            <div className="fixed left-20 px-3 py-1.5 rounded-md bg-[#161618] border border-white/[0.1] text-xs text-white opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none z-[100] whitespace-nowrap shadow-2xl">
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

        {/* ── Footer ── */}
        <div className="border-t border-white/[0.05] p-3">
          <div className={`flex items-center transition-all duration-300 ${isOpen ? "gap-3 px-2" : "justify-center"}`}>
            <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">SA</div>
            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 absolute"}`}>
              <span className="text-[12px] font-semibold text-white/80 whitespace-nowrap">Workspace</span>
              <span className="text-[10px] text-emerald-400 font-mono">Pro Plan</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}