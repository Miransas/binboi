import { dashboardPageContent } from "@/lib/dashboard-content";
import { PremiumDashboardShell } from "../_components/premium-dashboard-shell";

export default function IpPoliciesPage() {
  const content = dashboardPageContent.ip;
  return <PremiumDashboardShell {...content} />;
}
