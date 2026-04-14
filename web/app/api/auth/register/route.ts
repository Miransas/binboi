import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GO_API = process.env.BINBOI_GO_API_URL ?? "https://api.binboi.com";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  let res: Response;
  try {
    res = await fetch(`${GO_API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ error: "Auth sunucusuna ulaşılamıyor." }, { status: 503 });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
