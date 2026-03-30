import { DashboardPageShell } from "@/components/dashboard/shared/page-shell";
import { dashboardPageContent } from "@/lib/dashboard-content";

export default function IdentitiesPage() {
  const content = dashboardPageContent.identities;
  return <DashboardPageShell {...content} />;
}
