import { ResetPasswordForm } from "../_components/auth-forms";
import { authDatabaseEnabled } from "@/lib/auth-system";

export default function ResetPasswordPage() {
  return <ResetPasswordForm authConfigured={authDatabaseEnabled} />;
}
