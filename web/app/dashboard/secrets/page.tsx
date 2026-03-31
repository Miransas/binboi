import { dashboardPageContent } from "@/lib/dashboard-content";
import { PremiumDashboardShell } from "../_components/premium-dashboard-shell";

export default function SecretsPage() {
  const content = dashboardPageContent.secrets;
  return <PremiumDashboardShell {...content} />;
}
