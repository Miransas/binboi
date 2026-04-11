import { UserManagementClient } from "./user-management-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function UserManagementPage() {
  return (
    <UserManagementClient
      initialSettings={{
        authenticated: false,
        mode: "unavailable" as const,
        credentialsEnabled: false,
        githubEnabled: false,
        previewEnabled: false,
        user: null,
      }}
      initialBilling={null}
      initialBillingError="User management requires database-backed auth."
    />
  );
}
