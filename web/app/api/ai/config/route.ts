import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ available: !!process.env.ANTHROPIC_API_KEY });
}
