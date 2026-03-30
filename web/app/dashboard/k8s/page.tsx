import { DashboardPageShell } from "@/components/dashboard/shared/page-shell";
import { dashboardPageContent } from "@/lib/dashboard-content";

export default function KubernetesPage() {
  const content = dashboardPageContent.k8s;
  return <DashboardPageShell {...content} />;
}
