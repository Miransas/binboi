import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { buildApiUrl } from "@/lib/binboi";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function bearerHeaders(contentType?: string): Promise<Headers> {
  const jar = await cookies();
  const token = jar.get("binboi_token")?.value;
  const h = new Headers();
  if (contentType) h.set("content-type", contentType);
  if (token) h.set("authorization", `Bearer ${token}`);
  return h;
}

export async function GET() {
  let upstream: Response;
  try {
    upstream = await fetch(buildApiUrl("/api/v1/tokens"), {
      headers: await bearerHeaders(),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Could not reach the Binboi control plane." }, { status: 502 });
  }

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}

export async function POST(req: Request) {
  const body = await req.text();

  let upstream: Response;
  try {
    upstream = await fetch(buildApiUrl("/api/v1/tokens"), {
      method: "POST",
      headers: await bearerHeaders("application/json"),
      body: body || undefined,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Could not reach the Binboi control plane." }, { status: 502 });
  }

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
