import { dashboardPageContent } from "@/lib/dashboard-content";
import { PremiumDashboardShell } from "../_components/premium-dashboard-shell";

export default function TcpPage() {
  const content = dashboardPageContent.tcp;
  return <PremiumDashboardShell {...content} />;
}
