"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import DashboardHeader from "../../components/dashboard/shared/dashboard-header";
import { SidebarDocs } from "../../components/dashboard/shared/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = useCallback(
    (href: string) => {
      if (href === pathname) return;

      const content = contentRef.current;
      if (content) {
        content.classList.remove("page-enter");
        content.classList.add("page-exit");
      }

      setTimeout(() => {
        router.push(href);
      }, 250);
    },
    [pathname, router]
  );

  useEffect(() => {
    const content = contentRef.current;
    if (content) {
      content.classList.remove("page-exit");
      content.classList.add("page-enter");
    }
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#09090b] text-zinc-100">
      <SidebarDocs
        collapsed={collapsed}
        onNavigate={handleNavigate}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scroll-smooth">
          <DashboardHeader
            collapsed={collapsed}
            onToggle={() => setCollapsed((value) => !value)}
            onNavigate={handleNavigate}
          />
          <main ref={contentRef} className="min-h-full page-enter">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
