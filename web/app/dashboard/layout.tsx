
import { auth } from "@/auth"; // NextAuth v5 importu
import DashboardSidebar from "../../components/dashboard/shared/dashboard-sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let session = null;

  try {
    session = await auth();
  } catch {
  }

  return (
    <div className="flex h-screen  text-white font-sans overflow-hidden ">
      
      {/* 📱 Ayrı Component Olarak Gelen Collapsible Sidebar */}
      <DashboardSidebar
        user={
          session?.user ?? {
            name: "Guest Mode",
            email: "preview@binboi.local",
            image: "https://github.com/ghost.png",
          }
        }
      />

      {/* 💻 ANA İÇERİK ALANI */}
      <main className="flex-1 overflow-y-auto relative">
        {/* İçeriğin arkasına hafif bir glow efekti (Miransas tarzı) */}
        <div className="absolute top-0 left-0 w-full h-96 bg-miransas-cyan/5 blur-[150px] -z-10 pointer-events-none" />
        
        {children}
      </main>

    </div>
  );
}
