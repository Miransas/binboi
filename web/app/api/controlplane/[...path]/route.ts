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

  const requestHeaders = new Headers();
  const contentType = request.headers.get("content-type");
  const authorization = request.headers.get("authorization");
  const token = request.headers.get("x-binboi-token");

  if (contentType) {
    requestHeaders.set("content-type", contentType);
  }
  if (authorization) {
    requestHeaders.set("authorization", authorization);
  }
  if (token) {
    requestHeaders.set("x-binboi-token", token);
  }

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers: requestHeaders,
      body: body && body.length > 0 ? body : undefined,
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    const upstreamContentType = upstream.headers.get("content-type");
    if (upstreamContentType) {
      responseHeaders.set("content-type", upstreamContentType);
    }

    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not reach the Binboi control plane.",
      },
      { status: 502 },
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return forwardRequest(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return forwardRequest(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return forwardRequest(request, context);
}
