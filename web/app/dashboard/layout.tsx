import { auth } from "@/auth";
import { AssistantContextProvider } from "@/components/shared/assistant-context";
import DashboardSidebar from "../../components/dashboard/shared/dashboard-sidebar";
import DashboardHeader from "../../components/dashboard/shared/dashboard-header";
import "./dashboard-theme.css";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let session = null;

  try {
    session = await auth();
  } catch {
  }

  return (
    <AssistantContextProvider>
      <div className="dashboard-theme relative flex h-screen overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10%] top-[-14%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(126,162,255,0.16),transparent_68%)] blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-8%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(20,44,88,0.32),transparent_70%)] blur-3xl" />
        </div>

        <div className="dashboard-theme__sidebar">
          <DashboardSidebar
            user={
              session?.user ?? {
                name: "Guest Mode",
                email: "preview@binboi.local",
                image: "https://github.com/ghost.png",
              }
            }
          />
        </div>

        <main className="dashboard-theme__main relative flex min-w-0 min-h-screen flex-1 flex-col overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.015),transparent_16%,transparent_86%,rgba(255,255,255,0.008))]" />
          </div>
          <div className="dashboard-theme__header">
            <DashboardHeader />
          </div>
          <div
            id="dashboard-scroll-root"
            className="dashboard-theme__content relative z-10 min-h-0 flex-1 overflow-y-auto"
          >
            {children}
          </div>
        </main>
      </div>
    </AssistantContextProvider>
  );
}
