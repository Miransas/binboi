
import { auth } from "@/auth"; // NextAuth v5 importu
import { redirect } from "next/navigation";
import DashboardSidebar from "../../components/dashboard/dashboard-sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Kullanıcı giriş yapmamışsa middleware yakalar ama çift güvenlik iyidir.
  const session = await auth();
  
  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-[#060606] text-white font-sans overflow-hidden">
      
      {/* 📱 Ayrı Component Olarak Gelen Collapsible Sidebar */}
      <DashboardSidebar user={session.user} />

      {/* 💻 ANA İÇERİK ALANI */}
      <main className="flex-1 overflow-y-auto relative">
        {/* İçeriğin arkasına hafif bir glow efekti (Miransas tarzı) */}
        <div className="absolute top-0 left-0 w-full h-96 bg-miransas-cyan/5 blur-[150px] -z-10 pointer-events-none" />
        
        {children}
      </main>

    </div>
  );
}