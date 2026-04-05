"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DocsSidebar, DocsSidebarToggle } from "./_components/docs-sidebar";


export default function DocsLayout({
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
      setTimeout(() => router.push(href), 250);
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
    <main className="pt-14">
      <DocsSidebarToggle
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />
      <div className="flex h-screen bg-background overflow-hidden">
        <DocsSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          onNavigate={handleNavigate}
        />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          
          <main
            ref={contentRef}
            className="flex-1 pl-4 overflow-y-auto scroll-smooth page-enter"
          >
            {children}
          </main>
        </div>
      </div>
    </main>
  );
}
