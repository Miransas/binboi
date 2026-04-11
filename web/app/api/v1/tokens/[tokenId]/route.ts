import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { buildApiUrl } from "@/lib/binboi";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ tokenId: string }> },
) {
  const { tokenId } = await params;

  const jar = await cookies();
  const token = jar.get("binboi_token")?.value;
  const h = new Headers();
  if (token) h.set("authorization", `Bearer ${token}`);

  let upstream: Response;
  try {
    upstream = await fetch(buildApiUrl(`/api/v1/tokens/${encodeURIComponent(tokenId)}`), {
      method: "DELETE",
      headers: h,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "Could not reach the Binboi control plane." }, { status: 502 });
  }

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
