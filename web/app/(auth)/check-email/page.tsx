import { Suspense } from "react";

import { CheckEmailView } from "../_components/auth-forms";
import { AuthLoadingCard } from "../_components/auth-primitives";
import { authDatabaseEnabled, previewAuthEnabled } from "@/lib/auth-system";

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <AuthLoadingCard
          title="Preparing the email step"
          description="Loading the email verification details."
        />
      }
    >
      <CheckEmailView authConfigured={authDatabaseEnabled} previewEnabled={previewAuthEnabled} />
    </Suspense>
  );
}
