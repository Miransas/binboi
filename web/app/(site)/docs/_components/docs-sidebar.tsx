"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* ─── Icons ─────────────────────────────────────────────────── */
const Icons = {
  Introduction: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  QuickStart: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M8 2L9.8 6.2l4.5.4-3.3 3 1 4.4L8 13.6l-4 2.4 1-4.4-3.3-3 4.5-.4L8 2z"
        stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
  Installation: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  Authentication: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="3.5" y="7" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  CLI: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 7l2 2-2 2M9 11h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  HTTPTunnels: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M2 8c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M4 8c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
      <path d="M2 8h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  Requests: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M2 5h12M2 8h8M2 11h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="13" cy="10" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M13 8v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  Webhooks: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M6 3a3 3 0 000 6h1l2 4h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 6a3 3 0 110 6H8l-2-4H3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  APIKeys: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M9.5 6.5a3 3 0 11-4.24 4.24" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M7.5 8.5L13 3M11 3h2v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Logs: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  Regions: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 2.5C8 2.5 6 5 6 8s2 5.5 2 5.5M8 2.5C8 2.5 10 5 10 8s-2 5.5-2 5.5M2.5 8h11"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  Troubleshooting: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M8 2l.9 1.8 2 .3-1.45 1.4.34 2L8 6.5l-1.79.94.34-2L5.1 4.1l2-.3L8 2z"
        stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M5 10l-2.5 4h11L11 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 9v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
};

/* ─── Nav data ───────────────────────────────────────────────── */
const NAV = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction",   href: "/docs",                icon: Icons.Introduction },
      { title: "Quick Start",    href: "/docs/quick-start",    icon: Icons.QuickStart },
      { title: "Installation",   href: "/docs/installation",   icon: Icons.Installation },
      { title: "Authentication", href: "/docs/authentication", icon: Icons.Authentication },
    ],
  },
  {
    title: "Using Binboi",
    items: [
      { title: "CLI",          href: "/docs/cli",          icon: Icons.CLI,         badge: "beta" },
      { title: "HTTP Tunnels", href: "/docs/http-tunnels", icon: Icons.HTTPTunnels },
      { title: "Requests",     href: "/docs/requests",     icon: Icons.Requests },
    ],
  },
  {
    title: "Debugging",
    items: [
      { title: "Webhooks", href: "/docs/webhooks",  icon: Icons.Webhooks },
      { title: "API Keys", href: "/docs/api-keys",  icon: Icons.APIKeys },
      { title: "Logs",     href: "/docs/logs",      icon: Icons.Logs, badge: "live" },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Regions",         href: "/docs/regions",         icon: Icons.Regions },
      { title: "Troubleshooting", href: "/docs/troubleshooting", icon: Icons.Troubleshooting },
    ],
  },
];

/* ─── Component ─────────────────────────────────────────────── */
interface DocsSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function DocsSidebar({ isOpen, onToggle }: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{ width: isOpen ? 260 : 56 }}
        className={`
          fixed top-0 left-0 z-30 h-screen flex flex-col
          bg-[#0e0e10] border-r border-white/[0.06]
          transition-[width] duration-[220ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]
          overflow-hidden
        `}
      >
        {/* scanline texture */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.012) 2px,rgba(255,255,255,0.012) 4px)",
          }}
        />

        {/* ── Header ── */}
        <div className="relative z-10 flex h-14 shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-3">
          {/* logo mark */}
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[8px]"
            style={{ background: "linear-gradient(135deg,#4ade80,#22d3ee)" }}>
            <div className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.22),transparent 60%)" }} />
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="relative z-10 text-black">
              <path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* logo text */}
          <div
            className="flex flex-col overflow-hidden transition-[opacity,width] duration-[180ms]"
            style={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
          >
            <span className="whitespace-nowrap text-[13px] font-semibold leading-tight tracking-tight text-white/90">
              Binboi
            </span>
            <span className="whitespace-nowrap font-mono text-[9.5px] tracking-[0.07em] text-white/25">
              docs v2.4
            </span>
          </div>

          {/* toggle */}
          <button
            onClick={onToggle}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="ml-auto flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md border border-white/[0.07] bg-transparent text-white/35 transition-all duration-[220ms] hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white/80"
            style={{ transform: isOpen ? "rotate(0deg)" : "rotate(180deg)" }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* ── Nav ── */}
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          {/* top fade */}
          <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-5"
            style={{ background: "linear-gradient(to bottom, #0e0e10, transparent)" }} />

          <nav
            className="flex-1 overflow-y-auto overflow-x-hidden py-3"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.08) transparent",
            }}
          >
            <div className="space-y-5 px-2">
              {NAV.map((group, gi) => (
                <div
                  key={group.title}
                  style={{ animationDelay: `${gi * 0.045}s` }}
                  className="animate-[fadeUp_0.28s_ease_both]"
                >
                  {/* group label */}
                  <p
                    className="mb-1 px-2 font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-white/22 transition-opacity duration-[180ms]"
                    style={{ opacity: isOpen ? 1 : 0 }}
                  >
                    {group.title}
                  </p>

                  <ul className="space-y-px">
                    {group.items.map((item) => {
                      const active = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            title={!isOpen ? item.title : undefined}
                            className={`
                              group relative flex items-center gap-2.5 rounded-[8px] border px-2 py-[6px]
                              transition-[background,border-color,color] duration-[140ms] overflow-hidden
                              ${active
                                ? "border-[rgba(74,222,128,0.28)] bg-[rgba(74,222,128,0.07)]"
                                : "border-transparent hover:bg-white/[0.035]"
                              }
                            `}
                          >
                            {/* active left bar */}
                            {active && (
                              <span className="absolute left-0 top-1/2 h-[55%] w-[2px] -translate-y-1/2 rounded-r-sm bg-[#4ade80]"
                                style={{ boxShadow: "0 0 6px rgba(74,222,128,0.7)" }} />
                            )}

                            {/* icon box */}
                            <span
                              className={`
                                flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px] border
                                transition-[background,border-color,color,transform] duration-[140ms]
                                group-hover:scale-[1.06]
                                ${active
                                  ? "border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.1)] text-[#4ade80]"
                                  : "border-white/[0.07] bg-white/[0.04] text-white/40 group-hover:border-white/[0.12] group-hover:bg-white/[0.07] group-hover:text-white/70"
                                }
                              `}
                            >
                              <Icon />
                            </span>

                            {/* label */}
                            <span
                              className="flex-1 overflow-hidden whitespace-nowrap transition-[opacity,transform] duration-[180ms]"
                              style={{
                                opacity: isOpen ? 1 : 0,
                                transform: isOpen ? "translateX(0)" : "translateX(-4px)",
                                pointerEvents: isOpen ? "auto" : "none",
                              }}
                            >
                              <span className={`text-[13px] font-[490] leading-tight transition-colors duration-[140ms] ${active ? "text-white" : "text-white/45 group-hover:text-white/80"}`}>
                                {item.title}
                              </span>
                            </span>

                            {/* badge */}
                            {item.badge && (
                              <span
                                className="shrink-0 rounded-[4px] border border-white/[0.07] bg-white/[0.03] px-[5px] py-px font-mono text-[9px] text-white/30 transition-opacity duration-[180ms]"
                                style={{ opacity: isOpen ? 1 : 0 }}
                              >
                                {item.badge}
                              </span>
                            )}

                            {/* collapsed tooltip */}
                            {!isOpen && (
                              <span className="pointer-events-none absolute left-14 top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-[7px] border border-white/[0.1] bg-[#1a1a1d] px-2.5 py-[5px] text-[12px] font-medium text-white/90 opacity-0 shadow-xl transition-opacity duration-[130ms] group-hover:opacity-100">
                                {item.title}
                              </span>
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

          {/* bottom fade */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-6"
            style={{ background: "linear-gradient(to top, #0e0e10, transparent)" }} />
        </div>

        {/* ── Footer ── */}
        <div className="relative z-10 shrink-0 border-t border-white/[0.06] p-2">
          <div className="group flex cursor-pointer items-center gap-2.5 rounded-[8px] px-2 py-[7px] transition-colors duration-[140ms] hover:bg-white/[0.04]">
            {/* avatar */}
            <div className="relative flex h-[30px] w-[30px] shrink-0 items-center justify-center overflow-hidden rounded-[7px]"
              style={{ background: "linear-gradient(135deg,#7c3aed,#4338ca)" }}>
              <div className="pointer-events-none absolute inset-0"
                style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.18),transparent 55%)" }} />
              <span className="relative z-10 text-[11px] font-semibold text-white">BB</span>
            </div>
            {/* info */}
            <div
              className="flex flex-col overflow-hidden transition-[opacity] duration-[180ms]"
              style={{ opacity: isOpen ? 1 : 0 }}
            >
              <span className="whitespace-nowrap text-[12px] font-medium text-white/80">workspace</span>
              <span className="whitespace-nowrap font-mono text-[10px] text-[#4ade80]">pro plan</span>
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .animate-\\[fadeUp_0\\.28s_ease_both\\] { animation: fadeUp 0.28s ease both; }
      `}</style>
    </>
  );
}