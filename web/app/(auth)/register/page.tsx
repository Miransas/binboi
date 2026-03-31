import { RegisterForm } from "../_components/auth-forms";
import { redirectAuthenticatedUser } from "@/lib/auth-session";
import { authDatabaseEnabled } from "@/lib/auth-system";

export default async function RegisterPage() {
  await redirectAuthenticatedUser("/dashboard");

  return <RegisterForm authConfigured={authDatabaseEnabled} />;
}
