import { BinboiAssistant } from "@/components/shared/binboi-assistant";
import { dashboardPageContent } from "@/lib/dashboard-content";
import { PremiumDashboardShell } from "../_components/premium-dashboard-shell";
import { dashboardPanelClass } from "../_components/dashboard-ui";

export default function AiGatewaysPage() {
  const content = dashboardPageContent.ai;

  return (
    <PremiumDashboardShell {...content} className="flex min-h-full flex-col">
      <div className="dashboard-route-frame dashboard-route-frame--ai flex min-h-full flex-col">
        <section className={dashboardPanelClass("blue", "flex min-h-[32rem] flex-1 flex-col overflow-hidden p-1 lg:min-h-[40rem]")}>
          <BinboiAssistant
            variant="dashboard"
            className="h-full min-h-[32rem] max-h-none flex-1 border-0 bg-transparent shadow-none lg:min-h-[40rem]"
            storageKey="dashboard-ai-page"
            title="Ask Binboi about requests, webhooks, logs, and setup"
            description="This assistant is designed for read-only product search and troubleshooting. It uses server-side runtime context when available and stays useful even when AI credentials are not configured."
          />
        </section>
      </div>
    </PremiumDashboardShell>
  );
}
