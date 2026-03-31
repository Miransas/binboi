import { BinboiAssistant } from "@/components/shared/binboi-assistant";
import { dashboardPageContent } from "@/lib/dashboard-content";
import { PremiumDashboardShell } from "../_components/premium-dashboard-shell";
import { dashboardPanelClass } from "../_components/dashboard-ui";

export default function AiGatewaysPage() {
  const content = dashboardPageContent.ai;

  return (
    <PremiumDashboardShell {...content}>
      <div className="dashboard-route-frame dashboard-route-frame--ai">
        <section className={dashboardPanelClass("blue", "overflow-hidden p-1")}>
          <BinboiAssistant
            variant="dashboard"
            className="h-[46rem] max-h-[calc(100dvh-12rem)] border-0 bg-transparent shadow-none"
            storageKey="dashboard-ai-page"
            title="Ask Binboi about requests, webhooks, logs, and setup"
            description="This assistant is designed for read-only product search and troubleshooting. It uses server-side runtime context when available and stays useful even when AI credentials are not configured."
          />
        </section>
      </div>
    </PremiumDashboardShell>
  );
}
