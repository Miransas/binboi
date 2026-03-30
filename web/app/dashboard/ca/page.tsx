import { DashboardPageShell } from "@/components/dashboard/shared/page-shell";
import { dashboardPageContent } from "@/lib/dashboard-content";

export default function CertificateAuthorityPage() {
  const content = dashboardPageContent.ca;
  return <DashboardPageShell {...content} />;
}
