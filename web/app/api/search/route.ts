import { type NextRequest, NextResponse } from "next/server";

import { searchAssistantDocuments } from "@/lib/assistant-knowledge";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = searchAssistantDocuments(q);

  return NextResponse.json({
    results: results.slice(0, 6).map((r) => ({
      id: r.id,
      title: r.title,
      href: r.href,
      kind: r.kind,
      excerpt: r.excerpt,
    })),
  });
}
