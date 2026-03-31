import { LoginForm } from "../_components/auth-forms";
import { redirectAuthenticatedUser } from "@/lib/auth-session";
import { authDatabaseEnabled, githubAuthEnabled } from "@/lib/auth-system";

export default async function LoginPage() {
  await redirectAuthenticatedUser("/dashboard");

  return (
    <LoginForm
      authConfigured={authDatabaseEnabled}
      githubEnabled={githubAuthEnabled}
    />
  );
}
