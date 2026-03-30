import { DashboardPageShell } from "@/components/dashboard/shared/page-shell";
import { BinboiAssistant } from "@/components/shared/binboi-assistant";
import { dashboardPageContent } from "@/lib/dashboard-content";

export default function AiGatewaysPage() {
  const content = dashboardPageContent.ai;
  return (
    <DashboardPageShell {...content}>
      <BinboiAssistant
        variant="dashboard"
        storageKey="dashboard-ai-page"
        title="Ask Binboi about requests, webhooks, logs, and setup"
        description="This assistant is designed for read-only product search and troubleshooting. It uses server-side runtime context when available and stays useful even when AI credentials are not configured."
      />
    </DashboardPageShell>
  );
}
