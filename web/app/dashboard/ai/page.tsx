import { DashboardPageShell } from "@/components/dashboard/shared/page-shell";
import { dashboardPageContent } from "@/lib/dashboard-content";

export default function AiGatewaysPage() {
  const content = dashboardPageContent.ai;
  return <DashboardPageShell {...content} />;
}
