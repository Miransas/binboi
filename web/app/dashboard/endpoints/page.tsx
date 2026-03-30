import { DashboardPageShell } from "@/components/dashboard/shared/page-shell";
import { dashboardPageContent } from "@/lib/dashboard-content";

export default function EndpointsPage() {
  const content = dashboardPageContent.endpoints;
  return <DashboardPageShell {...content} />;
}
