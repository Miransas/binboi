import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { authDatabaseEnabled, ensureAuthDatabaseReady } from "@/lib/auth-system";

export function sanitizeRedirectTarget(value: string | null | undefined, fallback = "/dashboard") {
  if (!value) {
    return fallback;
  }

  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return fallback;
}

export function buildLoginRedirect(callbackUrl?: string | null) {
  const safeTarget = sanitizeRedirectTarget(callbackUrl);
  return `/login?callbackUrl=${encodeURIComponent(safeTarget)}`;
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
