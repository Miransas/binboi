import { DashboardPageShell } from "@/components/dashboard/shared/page-shell";
import { dashboardPageContent } from "@/lib/dashboard-content";

export default function TcpPage() {
  const content = dashboardPageContent.tcp;
  return <DashboardPageShell {...content} />;
}
