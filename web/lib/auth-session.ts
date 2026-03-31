import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { buildLoginHref, sanitizeRedirectTarget } from "@/lib/auth-routing";
import { authDatabaseEnabled, ensureAuthDatabaseReady } from "@/lib/auth-system";

export function buildLoginRedirect(callbackUrl?: string | null) {
  return buildLoginHref(sanitizeRedirectTarget(callbackUrl));
}

export async function getCurrentSession() {
  if (!authDatabaseEnabled) {
    return null;
  }

  await ensureAuthDatabaseReady();

  try {
    return await auth();
  } catch {
    return null;
  }
}

export async function getRequiredDashboardSession() {
  if (!authDatabaseEnabled) {
    return null;
  }

  const session = await getCurrentSession();
  if (!session?.user?.id) {
    redirect(buildLoginRedirect("/dashboard"));
  }

  return session;
}

export async function redirectAuthenticatedUser(target = "/dashboard") {
  if (!authDatabaseEnabled) {
    return;
  }

  const session = await getCurrentSession();
  if (session?.user?.id) {
    redirect(sanitizeRedirectTarget(target));
  }
}
