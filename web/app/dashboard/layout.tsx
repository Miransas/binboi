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
      <div className="relative flex h-screen overflow-hidden bg-[#071019] font-sans text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(86,220,208,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(164,139,250,0.06),transparent_26%)]" />
          <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:7rem_7rem]" />
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

        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden min-h-screen">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[10%] top-[-8rem] h-72 w-72 rounded-full bg-miransas-cyan/8 blur-[150px]" />
            <div className="absolute bottom-[-8rem] right-[14%] h-72 w-72 rounded-full bg-violet-400/8 blur-[160px]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,18,0.16),transparent_24%,transparent_78%,rgba(8,12,18,0.14))]" />
          </div>
          <DashboardHeader />
          <div className="relative z-10 min-h- flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </AssistantContextProvider>
  );
}
