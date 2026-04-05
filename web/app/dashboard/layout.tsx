import { AssistantContextProvider } from "@/components/shared/assistant-context";
import { getRequiredDashboardSession } from "@/lib/auth-session";
import { authDatabaseEnabled, previewAuthEnabled } from "@/lib/auth-system";
import DashboardSidebar from "../../components/dashboard/shared/dashboard-sidebar";
import DashboardHeader from "../../components/dashboard/shared/dashboard-header";
import "./dashboard-theme.css";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!authDatabaseEnabled && !previewAuthEnabled) {
    return (
      <div className="dashboard-theme flex min-h-screen items-center justify-center px-6 py-12 text-white">
        <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(16,22,32,0.98),rgba(10,15,24,0.99))] p-8 shadow-[0_24px_80px_rgba(2,6,23,0.32)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            Dashboard unavailable
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
            Configure database-backed auth before using the dashboard.
          </h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            Binboi no longer falls back to guest dashboard mode automatically in this deployment.
            Set <code className="rounded bg-white/[0.04] px-1.5 py-0.5 text-zinc-200">DATABASE_URL</code>,
            <code className="ml-1 rounded bg-white/[0.04] px-1.5 py-0.5 text-zinc-200">AUTH_SECRET</code>,
            and <code className="ml-1 rounded bg-white/[0.04] px-1.5 py-0.5 text-zinc-200">BINBOI_AUTH_DATABASE_URL</code>
            for the full product path, or explicitly set
            <code className="ml-1 rounded bg-white/[0.04] px-1.5 py-0.5 text-zinc-200">BINBOI_ALLOW_PREVIEW_MODE=true</code>
            if you intentionally want local preview mode.
          </p>
        </div>
      </div>
    );
  }

  const session = authDatabaseEnabled ? await getRequiredDashboardSession() : null;

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
