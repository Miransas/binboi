import { DashboardPageShell } from "@/components/dashboard/shared/page-shell";
import { dashboardPageContent } from "@/lib/dashboard-content";

export default function IpPoliciesPage() {
  const content = dashboardPageContent.ip;
  return <DashboardPageShell {...content} />;
}
