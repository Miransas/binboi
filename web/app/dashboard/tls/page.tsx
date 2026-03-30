import { DashboardPageShell } from "@/components/dashboard/shared/page-shell";
import { dashboardPageContent } from "@/lib/dashboard-content";

export default function TlsPage() {
  const content = dashboardPageContent.tls;
  return <DashboardPageShell {...content} />;
}
