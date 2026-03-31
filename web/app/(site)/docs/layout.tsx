import type { ReactNode } from "react";
import Link from "next/link";

import { DocsSidebar } from "./_components/docs-sidebar";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#040404] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,255,209,0.1),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.05),_transparent_28%)]" />

      <div className="relative mx-auto max-w-[1580px] px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        
        <div className="flex flex-col gap-8 lg:flex-row">
          <DocsSidebar />
          <div className="min-w-0 flex-1 mt-20">{children}</div>
        </div>
      </div>
    </div>
  );
}
