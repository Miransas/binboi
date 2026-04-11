function safePath(value: string | null | undefined, fallback = "/dashboard") {
  if (!value) return fallback;
  return value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export function buildLoginHref(callbackUrl?: string | null) {
  if (!callbackUrl) return "/login";
  return `/login?callbackUrl=${encodeURIComponent(safePath(callbackUrl))}`;
}

export function buildRegisterHref(callbackUrl?: string | null) {
  if (!callbackUrl) return "/register";
  return `/register?callbackUrl=${encodeURIComponent(safePath(callbackUrl))}`;
}

export function sanitizeRedirectTarget(value: string | null | undefined, fallback = "/dashboard") {
  return safePath(value, fallback);
}
