export const BINBOI_API_BASE =
  process.env.BINBOI_GO_API_URL ??
  process.env.BINBOI_API_BASE ??
  process.env.NEXT_PUBLIC_BINBOI_API_BASE ??
  "http://localhost:8080";

export const BINBOI_WS_BASE =
  process.env.BINBOI_WS_BASE ??
  process.env.NEXT_PUBLIC_BINBOI_WS_BASE ??
  BINBOI_API_BASE.replace(/^https?/, "ws");

export function buildApiUrl(path: string) {
  return `${BINBOI_API_BASE}${path}`;
}

export function buildWsUrl(path: string) {
  return `${BINBOI_WS_BASE}${path}`;
}
