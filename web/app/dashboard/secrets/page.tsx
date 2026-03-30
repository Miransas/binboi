import { DashboardPageShell } from "@/components/dashboard/shared/page-shell";
import { dashboardPageContent } from "@/lib/dashboard-content";

export default function SecretsPage() {
  const content = dashboardPageContent.secrets;
  return <DashboardPageShell {...content} />;
}
