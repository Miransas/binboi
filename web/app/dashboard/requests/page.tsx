
import RequestDebugWorkbench from "../../../components/dashboard/requests/request-debug-workbench";
import { DashboardRouteFrame } from "../_components/dashboard-route-frame";

export default function RequestsPage() {
  return (
    <DashboardRouteFrame variant="workbench">
      <RequestDebugWorkbench />
    </DashboardRouteFrame>
  );
}
