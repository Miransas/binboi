import { dashboardPageContent } from "@/lib/dashboard-content";
import { PremiumDashboardShell } from "../_components/premium-dashboard-shell";

export default function TlsPage() {
  const content = dashboardPageContent.tls;
  return <PremiumDashboardShell {...content} />;
}
