import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CLIENT_ID = process.env.AUTH_GITHUB_ID ?? "";
const CALLBACK_URL = "https://binboi.com/api/auth/github/callback";
const SCOPE = "read:user user:email";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 10, // 10 minutes
};

export async function GET(req: NextRequest) {
  const callbackUrl = req.nextUrl.searchParams.get("callbackUrl") ?? "/dashboard";
  const state = randomBytes(16).toString("hex");

  const ghUrl = new URL("https://github.com/login/oauth/authorize");
  ghUrl.searchParams.set("client_id", CLIENT_ID);
  ghUrl.searchParams.set("redirect_uri", CALLBACK_URL);
  ghUrl.searchParams.set("scope", SCOPE);
  ghUrl.searchParams.set("state", state);

  // Cookies must be set on the redirect response itself — setting them via
  // cookies() from next/headers and then returning a separate NextResponse
  // object causes them to be dropped, which breaks state verification.
  const response = NextResponse.redirect(ghUrl.toString());
  response.cookies.set("github_oauth_state", state, COOKIE_OPTS);
  response.cookies.set("github_oauth_cb", callbackUrl, COOKIE_OPTS);
  return response;
}
