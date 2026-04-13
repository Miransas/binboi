import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const GO_API = process.env.BINBOI_GO_API_URL ?? "http://localhost:8080";
const MOCK = { plan: "FREE", status: "active" };

export async function GET() {
  try {
    const res = await fetch(`${GO_API}/api/v1/billing`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      // Go endpoint not implemented yet — fall through to mock
      return NextResponse.json(MOCK);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    // Backend unreachable — return mock so the UI doesn't break
    return NextResponse.json(MOCK);
  }
}
