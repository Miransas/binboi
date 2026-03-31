import { VerifyEmailForm } from "../_components/auth-forms";
import { authDatabaseEnabled } from "@/lib/auth-system";

export default function VerifyEmailPage() {
  return <VerifyEmailForm authConfigured={authDatabaseEnabled} />;
}
