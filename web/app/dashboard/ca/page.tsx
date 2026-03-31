import { dashboardPageContent } from "@/lib/dashboard-content";
import { PremiumDashboardShell } from "../_components/premium-dashboard-shell";

export default function CertificateAuthorityPage() {
  const content = dashboardPageContent.ca;
  return <PremiumDashboardShell {...content} />;
}
