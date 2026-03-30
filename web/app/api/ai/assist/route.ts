import { NextResponse } from "next/server";

import { runAssistantAssist } from "@/lib/assistant";
import type { AssistantRequestPayload } from "@/lib/assistant-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as AssistantRequestPayload;
  const query = body.query?.trim() || "";

  if (!query) {
    return NextResponse.json(
      { error: "Enter a question to search Binboi." },
      { status: 400 },
    );
  }

  const payload = await runAssistantAssist(body);
  return NextResponse.json(payload);
}
