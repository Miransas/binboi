import { dashboardPageContent } from "@/lib/dashboard-content";
import { PremiumDashboardShell } from "../_components/premium-dashboard-shell";

export default function KubernetesPage() {
  const content = dashboardPageContent.k8s;
  return <PremiumDashboardShell {...content} />;
}
