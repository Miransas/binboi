export function sanitizeRedirectTarget(
  value: string | null | undefined,
  fallback = "/dashboard",
) {
  if (!value) {
    return fallback;
  }

  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return fallback;
}

export function buildPathWithQuery(
  path: string,
  params: Record<string, string | null | undefined>,
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value.length > 0) {
      search.set(key, value);
    }
  }

  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export function buildLoginHref(callbackUrl?: string | null) {
  return buildPathWithQuery("/login", {
    callbackUrl: callbackUrl ? sanitizeRedirectTarget(callbackUrl) : null,
  });
}

export function buildRegisterHref(callbackUrl?: string | null) {
  return buildPathWithQuery("/register", {
    callbackUrl: callbackUrl ? sanitizeRedirectTarget(callbackUrl) : null,
  });
}

export function buildForgotPasswordHref(callbackUrl?: string | null) {
  return buildPathWithQuery("/forgot-password", {
    callbackUrl: callbackUrl ? sanitizeRedirectTarget(callbackUrl) : null,
  });
}
