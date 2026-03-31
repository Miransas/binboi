import { CheckEmailView } from "../_components/auth-forms";
import { authDatabaseEnabled } from "@/lib/auth-system";

export default function CheckEmailPage() {
  return <CheckEmailView authConfigured={authDatabaseEnabled} />;
}
