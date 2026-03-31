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
      <div className="relative flex h-screen overflow-hidden bg-[#0b1320] font-sans text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(86,220,208,0.06),transparent_24%),linear-gradient(180deg,#0b1320_0%,#0c1523_48%,#0a121d_100%)]" />
          <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:8rem_8rem]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
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

        <main className="relative flex min-w-0 min-h-screen flex-1 flex-col overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[8%] top-[-9rem] h-72 w-72 rounded-full bg-miransas-cyan/6 blur-[170px]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,18,0.16),transparent_22%,transparent_82%,rgba(7,10,16,0.18))]" />
          </div>
          <DashboardHeader />
          <div id="dashboard-scroll-root" className="relative z-10 min-h-0 flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </AssistantContextProvider>
  );
}
