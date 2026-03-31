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
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#0b1320_0%,#0c1421_52%,#0b111b_100%)]" />
          <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] [background-size:8rem_8rem]" />
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
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,19,0.1),transparent_18%,transparent_84%,rgba(8,11,18,0.14))]" />
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
