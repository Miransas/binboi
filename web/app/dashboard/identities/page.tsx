import { dashboardPageContent } from "@/lib/dashboard-content";
import { PremiumDashboardShell } from "../_components/premium-dashboard-shell";

export default function IdentitiesPage() {
  const content = dashboardPageContent.identities;
  return <PremiumDashboardShell {...content} />;
}
