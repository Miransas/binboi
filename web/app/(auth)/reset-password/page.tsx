import { Suspense } from "react";

import { ResetPasswordForm } from "../_components/auth-forms";
import { AuthLoadingCard } from "../_components/auth-primitives";
import { authDatabaseEnabled, previewAuthEnabled } from "@/lib/auth-system";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLoadingCard
          title="Preparing reset flow"
          description="Loading the password reset token and state."
        />
      }
    >
      <ResetPasswordForm authConfigured={authDatabaseEnabled} previewEnabled={previewAuthEnabled} />
    </Suspense>
  );
}
