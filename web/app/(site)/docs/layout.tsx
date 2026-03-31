"use client";

import { useState } from "react";
import { DocsSidebar } from "./_components/docs-sidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#03060d]">
      {/* SIDEBAR: Durumu ve değiştirme fonksiyonunu gönderiyoruz */}
      <DocsSidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      {/* CONTENT: Sidebar kapalıysa pl-20, açıksa pl-72 boşluk bırakıyoruz */}
      <main className={`transition-all duration-300 ease-in-out ${isCollapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        <div className="mx-auto max-w-5xl px-6 py-24 sm:px-8 lg:px-12">
          <article className="prose prose-invert max-w-none">
            {children}
          </article>
        </div>
      </main>
    </div>
  );
}