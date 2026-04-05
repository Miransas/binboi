"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SidebarDocs, SidebarToggle } from "../../components/dashboard/shared/dashboard-sidebar";
import { AssistantContextProvider } from "../../components/shared/assistant-context";



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
    <AssistantContextProvider>
      <SidebarToggle collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="flex h-screen bg-background overflow-hidden">
        <SidebarDocs
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          onNavigate={handleNavigate}
        />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <main
            ref={contentRef}
            className="flex-1 overflow-y-auto scroll-smooth page-enter"
          >
            {children}
          </main>
        </div>
      </div>
    </AssistantContextProvider>
  );
}
