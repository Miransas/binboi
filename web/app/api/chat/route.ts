import { NextRequest, NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type RequestBody = {
  model: "gpt-4o-mini" | "gpt-4o" | "claude-sonnet" | "gemini-flash";
  messages: ChatMessage[];
};

const SYSTEM_PROMPT = `
You are Binboi AI, the in-product assistant for Binboi.

Your job:
- Help users debug tunnels, requests, webhook delivery, auth, tokens, regions, logs, and API errors.
- Explain problems clearly and practically.
- Be concise, useful, and technical when needed.
- Prefer actionable steps over generic theory.
- When the user reports an error, first identify the likely cause, then suggest exact checks and fixes.
- When relevant, provide code snippets, curl examples, or configuration examples.
- If the user message is vague, ask one focused follow-up question only when necessary.
- If the user is clearly just chatting, respond naturally and briefly.

Product context:
- Binboi is a tunneling and request inspection platform, similar in spirit to ngrok.
- Users may ask about tunnels, webhooks, token auth, CLI setup, HTTP forwarding, request logs, and debugging failed requests.
- Assume the user may be working in local development environments with Next.js, Node.js, Go backends, Docker, or Postgres.

Behavior rules:
- Never invent account-specific data, logs, or tunnel state.
- Never claim a request succeeded unless the user provided evidence.
- If you are unsure, say what is likely and what to verify.
- Structure debugging help in this order:
  1. likely cause
  2. what to check
  3. exact fix
- When explaining HTTP errors:
  - 400: bad request / invalid input
  - 401: missing or invalid auth
  - 403: forbidden / allowed but blocked
  - 404: wrong route / resource missing
  - 408: timeout
  - 429: rate limit
  - 500: server crashed or internal failure
  - 502: upstream/provider failure
  - 503: service unavailable or missing configuration
  - 504: upstream timeout
- For webhook debugging, always consider:
  - wrong target URL
  - local server not running
  - invalid signing secret
  - body parser changing raw payload
  - timeout
  - HTTPS / redirect issues
- For tunnel debugging, always consider:
  - agent not connected
  - wrong local port
  - DNS/base domain mismatch
  - auth token missing
  - firewall/proxy/network block
  - tunnel created but target app unavailable

Tone:
- calm, smart, practical, premium
- do not sound robotic
- keep answers readable and direct
`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as RequestBody | null;

    if (!body?.model || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { model, messages } = body;

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
          max_tokens: 1024,
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            ...messages,
          ],
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        choices?: { message?: { content?: string } }[];
        error?: { message?: string };
      };

      if (!res.ok) {
        return NextResponse.json(
          { error: data.error?.message ?? "OpenAI request failed" },
          { status: 502 }
        );
      }

      const content = data.choices?.[0]?.message?.content ?? "";
      return NextResponse.json({ content });
    }

    if (model === "claude-sonnet") {
      const key = process.env.ANTHROPIC_API_KEY;

      if (!key) {
        return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
      }

      const modelId = process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest";

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
          system: SYSTEM_PROMPT,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        content?: { type?: string; text?: string }[];
        error?: { message?: string };
      };

      if (!res.ok) {
        return NextResponse.json(
          { error: data.error?.message ?? "Anthropic request failed" },
          { status: 502 }
        );
      }

      const content = data.content?.find((item) => item.type === "text")?.text ?? "";
      return NextResponse.json({ content });
    }

    if (model === "gemini-flash") {
      return NextResponse.json({ error: "Gemini not implemented yet" }, { status: 501 });
    }

    return NextResponse.json({ error: "Unknown model" }, { status: 400 });
  } catch (error) {
    console.error("[/api/chat] unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}