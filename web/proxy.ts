import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge-compatible JWT expiry check (no Node.js crypto needed).
// We only verify the expiry from the payload — signature is enforced
// by the Go backend on every authenticated API call.
function isJWTExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const json = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as { exp?: number };
    if (typeof payload.exp !== "number") return false;
    return Date.now() / 1000 > payload.exp;
  } catch {
    return true;
  }
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("binboi_token")?.value;
  const authenticated = Boolean(token) && !isJWTExpired(token!);

  if (!authenticated && request.nextUrl.pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/dashboard/:path*"],
};
