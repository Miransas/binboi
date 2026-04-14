import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CLIENT_ID = process.env.AUTH_GITHUB_ID ?? "";
const CLIENT_SECRET = process.env.AUTH_GITHUB_SECRET ?? "";
const GO_API = process.env.BINBOI_GO_API_URL ?? "https://api.binboi.com";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;

  function err(msg: string) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(msg)}`, origin),
    );
  }

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  const jar = await cookies();
  const storedState = jar.get("github_oauth_state")?.value;
  const callbackUrl = jar.get("github_oauth_cb")?.value ?? "/dashboard";
  jar.delete("github_oauth_state");
  jar.delete("github_oauth_cb");

  if (!code || !state || state !== storedState) {
    return err("OAuth state mismatch. Please try again.");
  }

  // Exchange code for GitHub access token.
  let accessToken: string;
  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
    });
    const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
    if (!tokenData.access_token) {
      return err("Failed to obtain GitHub access token.");
    }
    accessToken = tokenData.access_token;
  } catch {
    return err("Could not reach GitHub. Please try again.");
  }

  // Fetch GitHub user profile.
  type GithubUser = { id: number; login: string; name: string | null; email: string | null; avatar_url: string };
  let ghUser: GithubUser;
  try {
    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": "binboi" },
    });
    ghUser = (await userRes.json()) as GithubUser;
  } catch {
    return err("Could not fetch GitHub profile. Please try again.");
  }

  // GitHub may omit the email if it's private — fall back to /user/emails.
  let email = ghUser.email ?? "";
  if (!email) {
    try {
      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${accessToken}`, "User-Agent": "binboi" },
      });
      const emails = (await emailsRes.json()) as Array<{ email: string; primary: boolean; verified: boolean }>;
      email = emails.find((e) => e.primary && e.verified)?.email ?? emails[0]?.email ?? "";
    } catch { /* proceed with empty email */ }
  }

  // Hand off to Go backend.
  let goRes: Response;
  try {
    goRes = await fetch(`${GO_API}/api/auth/github`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        github_id: String(ghUser.id),
        login: ghUser.login,
        email,
        name: ghUser.name ?? ghUser.login,
        avatar_url: ghUser.avatar_url,
      }),
    });
  } catch {
    return err("Auth service unavailable. Please try again.");
  }

  const data = (await goRes.json().catch(() => ({}))) as { token?: string; error?: string };
  if (!goRes.ok || !data.token) {
    return err(data.error ?? "Sign-in failed. Please try again.");
  }

  jar.set("binboi_token", data.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  const redirectTo =
    callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/dashboard";
  return NextResponse.redirect(new URL(redirectTo, origin));
}
