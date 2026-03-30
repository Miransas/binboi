import { NextResponse } from "next/server";

import { runAssistant } from "@/lib/assistant";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { query?: string };
  const query = body.query?.trim() || "";

  if (!query) {
    return NextResponse.json({ error: "Enter a question to search Binboi." }, { status: 400 });
  }

  const payload = await runAssistant(query);
  return NextResponse.json(payload);
}
