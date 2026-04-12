import { NextRequest, NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type RequestBody = {
  model: "gpt-4o-mini" | "gpt-4o" | "claude-sonnet" | "gemini-flash";
  messages: ChatMessage[];
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as RequestBody | null;

    if (!body?.model || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { model, messages } = body;

    console.log("[/api/chat] requested model:", model);

    // OpenAI
    if (model === "gpt-4o-mini" || model === "gpt-4o") {
      const key = process.env.OPENAI_API_KEY;

      if (!key) {
        return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 503 });
      }

      const modelId = model === "gpt-4o" ? "gpt-4o" : "gpt-4o-mini";

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: modelId,
          messages,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        choices?: { message?: { content?: string } }[];
        error?: { message?: string };
      };

      if (!res.ok) {
        console.error("[OpenAI Error]", data);
        return NextResponse.json(
          { error: data.error?.message ?? "OpenAI request failed" },
          { status: 502 }
        );
      }

      const content = data.choices?.[0]?.message?.content ?? "";
      return NextResponse.json({ content });
    }

    // Anthropic
    if (model === "claude-sonnet") {
      const key = process.env.ANTHROPIC_API_KEY;

      if (!key) {
        return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
      }

      const modelId = process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest";

      const anthropicMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: modelId,
          max_tokens: 1024,
          messages: anthropicMessages,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        content?: { type?: string; text?: string }[];
        error?: { message?: string };
      };

      if (!res.ok) {
        console.error("[Anthropic Error]", data);
        return NextResponse.json(
          { error: data.error?.message ?? "Anthropic request failed" },
          { status: 502 }
        );
      }

      const content = data.content?.find((item) => item.type === "text")?.text ?? "";
      return NextResponse.json({ content });
    }

    // Gemini
    if (model === "gemini-flash") {
      return NextResponse.json({ error: "Gemini not implemented yet" }, { status: 501 });
    }

    return NextResponse.json({ error: "Unknown model" }, { status: 400 });
  } catch (error) {
    console.error("[/api/chat] unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}