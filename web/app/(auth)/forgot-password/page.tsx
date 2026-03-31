import { ForgotPasswordForm } from "../_components/auth-forms";
import { redirectAuthenticatedUser } from "@/lib/auth-session";
import { authDatabaseEnabled } from "@/lib/auth-system";

export default async function ForgotPasswordPage() {
  await redirectAuthenticatedUser("/dashboard");

  return <ForgotPasswordForm authConfigured={authDatabaseEnabled} />;
}
