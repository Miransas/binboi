import type { ReactNode } from "react";

import { DocsSidebar } from "./_components/docs-sidebar";
import { Footer } from "../../../components/site/shared/footer";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#03060d] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(134,169,255,0.18),transparent_24%),radial-gradient(circle_at_88%_10%,rgba(255,255,255,0.05),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_14%,transparent_86%,rgba(255,255,255,0.01))]" />
        <div className="absolute left-[-8%] top-12 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(56,93,200,0.18),transparent_72%)] blur-3xl" />
      </div>

      <main className="relative">
        <div className="relative mx-auto max-w-[1680px] px-4 pb-20 pt-24 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:items-start xl:grid-cols-[18.5rem_minmax(0,1fr)] 2xl:gap-10">
            <DocsSidebar />
            <div className="min-w-0 pt-4 xl:pt-0">{children}</div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
