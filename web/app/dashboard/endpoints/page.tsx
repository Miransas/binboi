import { WebhookDebugWorkbench } from "@/components/dashboard/webhooks/webhook-debug-workbench";
import { DashboardRouteFrame } from "../_components/dashboard-route-frame";

export default function EndpointsPage() {
  return (
    <DashboardRouteFrame variant="workbench">
      <WebhookDebugWorkbench />
    </DashboardRouteFrame>
  );
}
