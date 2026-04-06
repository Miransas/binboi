import { NextResponse } from "next/server";

import { buildPathWithQuery, sanitizeRedirectTarget } from "@/lib/auth-routing";
import { AuthRouteError, verifyEmailToken } from "@/lib/auth-system";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// verify-email/route.ts (Eğer doğrudan yönlendirme istiyorsan)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const callbackUrlParam = searchParams.get("callbackUrl");

  try {
    const result = await verifyEmailToken(String(token ?? ""));
    const callbackUrl = sanitizeRedirectTarget(callbackUrlParam, "/dashboard");

    // JSON dönmek yerine direkt kullanıcıyı uçuruyoruz:
    const targetUrl = new URL(buildPathWithQuery("/login", {
      verified: "success",
      callbackUrl,
    }), request.url);

    return NextResponse.redirect(targetUrl);
    
  } catch (error) {
    // Hata durumunda hata sayfasına yönlendir veya JSON dön
    return NextResponse.redirect(new URL("/login?error=invalid-token", request.url));
  }
}
