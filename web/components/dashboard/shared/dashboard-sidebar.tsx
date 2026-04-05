"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Settings,
  Key,
  CreditCard,
  SlidersHorizontal,
  Activity,
  Globe,
  Sparkles,
  Link2,
  ChevronLeft,
  ChevronDown,
  Zap,
  Search,
  HelpCircle,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { div } from "three/src/nodes/math/OperatorNode.js";

const navSections = [
  {
    title: "Getting Started",
    items: [
      { label: "Welcome", href: "/dashboard", icon: Home },
      { label: "Setup & Installation", href: "/dashboard/setup", icon: Settings },
      { label: "Access Tokens", href: "/dashboard/access-tokens", icon: Key },
      { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
      { label: "Tunnel", href: "/dashboard/tunnel", icon: SlidersHorizontal },
    ],
  },
  {
    title: "Universal Gateway",
    items: [
      { label: "Requests", href: "/dashboard/requests", icon: Activity },
      { label: "Webhooks", href: "/dashboard/webhooks", icon: Globe },
      { label: "AI Assistant", href: "/dashboard/ai", icon: Sparkles, badge: "New" },
      { label: "Domains", href: "/dashboard/domains", icon: Link2 },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: (href: string) => void;
}

export function SidebarDocs({ collapsed, onToggle, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Getting Started": true,
    "Universal Gateway": true,
  });
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(href);
    }
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-[#000000] border-r border-sidebar-border sidebar-transition overflow-hidden",
        collapsed ? "w-[64px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          
          <span
           
          >
            <img src={"/logo.png"} alt="" className="w-14"/>
          </span>
        </div>
      </div>

      {/* Search */}
      <div className={cn("px-3 py-3", collapsed && "px-2")}>
        {collapsed ? (
          <button
            data-hover
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 group"
          >
            <Search className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
          </button>
        ) : (
          <div></div>
        )}
      </div>

      {/* Nav Sections */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1 scrollbar-thin">
        {navSections.map((section) => {
          const isExpanded = expandedSections[section.title];
          return (
            <div key={section.title} className="mb-1">
              {/* Section Header */}
              {!collapsed && (
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase hover:text-muted-foreground transition-colors duration-200 group"
                  data-hover
                >
                  <span>{section.title}</span>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 transition-transform duration-300",
                      !isExpanded && "-rotate-90"
                    )}
                  />
                </button>
              )}

              {/* Section Items */}
              <div
                className={cn(
                  "space-y-0.5 overflow-hidden transition-all duration-300",
                  !collapsed && !isExpanded && "max-h-0 opacity-0",
                  (!collapsed && isExpanded) && "max-h-[500px] opacity-100"
                )}
              >
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const isHovered = hoveredItem === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleNavClick(item.href, e)}
                      onMouseEnter={() => setHoveredItem(item.href)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-lg px-2.5 py-2 text-md font-bold transition-all duration-200 group relative overflow-hidden",
                        isActive
                          ? "inset-0 bg-[#9eff00] text-black"
                          : "text-white hover:bg-secondary hover:text-sidebar-foreground"
                      )}
                      data-hover
                    >
                      {/* Active indicator */}
                      <span
                        className={cn(
                          "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full transition-all duration-300",
                          isActive ? "opacity-100 " : "opacity-0"
                        )}
                      />
                      <Icon
                        className={cn(
                          "w-[18px] h-[18px] shrink-0 transition-all duration-200",
                          isActive ? "text-black" : "",
                          isHovered && !isActive ? "scale-110" : ""
                        )}
                      />
                      {!collapsed && (
                        <>
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-sidebar-border px-2 py-3 space-y-0.5">
       <Link href={"/docs"}>
        <button  
          data-hover
          className="w-full flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-sidebar-foreground/60 hover:bg-secondary hover:text-sidebar-foreground transition-all duration-200 group"
        >
          <HelpCircle className="w-[18px] h-[18px] shrink-0 group-hover:scale-110 transition-transform duration-200" />
          {!collapsed && <span className="truncate">Help & Docs</span>}
          {!collapsed && <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-50" />}
        </button>
       </Link>
        <button
          data-hover
          className="w-full flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-sidebar-foreground/60 hover:bg-secondary hover:text-sidebar-foreground transition-all duration-200 group"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0 group-hover:scale-110 transition-transform duration-200" />
          {!collapsed && <span className="truncate">Sign out</span>}
        </button>

        {/* User */}
        {!collapsed && (
          <div className="flex items-center gap-3 mt-3 px-2 py-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors duration-200 cursor-pointer" data-hover>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">john@nexus.io</p>
            </div>
          </div>
        )}
      </div>

    </aside>
  );
}

export function SidebarToggle({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      data-hover
      className={cn(
        "fixed z-50",
        collapsed ? "left-[52px]" : "left-[248px]",
        "top-[64px]",
        "w-7 h-7 rounded-full bg-card border border-border",
        "flex items-center justify-center",
        "text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/10",
        "transition-all duration-300 shadow-lg hover:shadow-primary/20"
      )}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <ChevronLeft
        className={cn(
          "w-4 h-4 transition-transform duration-300",
          collapsed && "rotate-180"
        )}
      />
    </button>
  );
}
