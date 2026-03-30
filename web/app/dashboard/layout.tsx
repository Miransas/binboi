import { auth } from "@/auth";
import { AssistantContextProvider } from "@/components/shared/assistant-context";
import DashboardSidebar from "../../components/dashboard/shared/dashboard-sidebar";
import DashboardHeader from "../../components/dashboard/shared/dashboard-header";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let session = null;

  try {
    session = await auth();
  } catch {
  }

  return (
    <AssistantContextProvider>
      <div className="relative flex h-screen overflow-hidden bg-[#05070c] font-sans text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,209,0.08),transparent_26%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.08),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_30%)]" />
          <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:7rem_7rem]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </div>

        <DashboardSidebar
          user={
            session?.user ?? {
              name: "Guest Mode",
              email: "preview@binboi.local",
              image: "https://github.com/ghost.png",
            }
          }
        />

        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[10%] top-[-8rem] h-72 w-72 rounded-full bg-miransas-cyan/10 blur-[140px]" />
            <div className="absolute bottom-[-8rem] right-[12%] h-72 w-72 rounded-full bg-violet-500/10 blur-[140px]" />
            <div className="absolute left-1/2 top-48 h-80 w-80 -translate-x-1/2 rounded-full bg-sky-500/5 blur-[180px]" />
          </div>
          <DashboardHeader />
          <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </AssistantContextProvider>
  );
}
