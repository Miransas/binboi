import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { buildApiUrl } from "@/lib/binboi";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function forwardRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;

  if (!Array.isArray(path) || path.length === 0) {
    return NextResponse.json({ error: "Missing control plane path." }, { status: 400 });
  }

  const targetUrl = new URL(buildApiUrl(`/${path.join("/")}`));
  targetUrl.search = request.nextUrl.search;

  const h = new Headers();

  // Content-Type passthrough
  const ct = request.headers.get("content-type");
  if (ct) h.set("content-type", ct);

  // Auth: explicit header from caller wins; otherwise inject binboi_token cookie
  const explicitAuth = request.headers.get("authorization");
  const explicitToken = request.headers.get("x-binboi-token");
  if (explicitAuth) {
    h.set("authorization", explicitAuth);
  } else if (explicitToken) {
    h.set("x-binboi-token", explicitToken);
  } else {
    const jar = await cookies();
    const sessionToken = jar.get("binboi_token")?.value;
    if (sessionToken) h.set("authorization", `Bearer ${sessionToken}`);
  }

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, {
      method: request.method,
      headers: h,
      body: body && body.length > 0 ? body : undefined,
      cache: "no-store",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not reach the Binboi control plane." },
      { status: 502 },
    );
  }

  const resHeaders = new Headers();
  const resContentType = upstream.headers.get("content-type");
  if (resContentType) resHeaders.set("content-type", resContentType);

  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: resHeaders,
  });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return forwardRequest(req, ctx);
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return forwardRequest(req, ctx);
}
export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return forwardRequest(req, ctx);
}
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return forwardRequest(req, ctx);
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return forwardRequest(req, ctx);
}
