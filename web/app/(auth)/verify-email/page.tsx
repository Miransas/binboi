import { Suspense } from "react";

import { VerifyEmailForm } from "../_components/auth-forms";
import { AuthLoadingCard } from "../_components/auth-primitives";
import { authDatabaseEnabled, previewAuthEnabled } from "@/lib/auth-system";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthLoadingCard
          title="Preparing verification"
          description="Loading the verification token and account state."
        />
      }
    >
      <VerifyEmailForm authConfigured={authDatabaseEnabled} previewEnabled={previewAuthEnabled} />
    </Suspense>
  );
}
