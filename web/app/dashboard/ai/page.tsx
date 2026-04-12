"use client";

import { useRef, useState } from "react";
import { Loader2, Search, Sparkles, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

import { DashboardRouteFrame } from "@/app/dashboard/_components/dashboard-route-frame";
import { assistantPromptSuggestions } from "@/content/site-content";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ModelOption = "gpt-4o-mini" | "gpt-4o" | "claude-sonnet" | "gemini-flash";

const MODEL_OPTIONS: { value: ModelOption; label: string }[] = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "claude-sonnet", label: "Claude Sonnet" },
  { value: "gemini-flash", label: "Gemini Flash" },
];

export default function AiPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<ModelOption>("gpt-4o-mini");
  const endRef = useRef<HTMLDivElement>(null);
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() ?? "";
  const isGreeting =
  lastMessage.includes("selam") ||
  lastMessage.includes("merhaba") ||
  lastMessage.includes("hi") ||
  lastMessage.includes("hello");

  const submit = async (nextValue?: string) => {
    const value = (nextValue ?? query).trim();
    if (!value || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: value,
    };

    const nextMessages = [...messages, userMsg];

    setMessages(nextMessages);
    setQuery("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const payload = (await res.json()) as { content?: string; error?: string };

      if (!res.ok || payload.error) {
        throw new Error(payload.error ?? "Unknown error");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: payload.content ?? "",
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setLoading(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  function clearHistory() {
    setMessages([]);
    setError(null);
    setQuery("");
  }

  return (
    <DashboardRouteFrame variant="workbench">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
              AI Assistant
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-white">Ask Binboi</h1>
                <p className="mt-1.5 text-sm text-zinc-400">
                  Ask about tunnel auth, webhook signatures, or debugging tips.
                </p>
              </div>

              <div className="w-full sm:w-[220px]">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as ModelOption)}
                  disabled={loading}
                  className="w-full rounded-xl border border-white/10 bg-[#09090b] px-3 py-2 text-sm text-white outline-none transition focus:border-miransas-cyan"
                >
                  {MODEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-black text-white">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="min-h-[400px] space-y-4">
            {messages.length === 0 && (
              <div className="grid grid-cols-2 gap-3">
                {assistantPromptSuggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => void submit(s)}
                    className="rounded-2xl border border-white/5 bg-zinc-900/20 p-4 text-left text-xs font-medium text-zinc-400 transition hover:border-white/10 hover:text-zinc-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "rounded-2xl border p-5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "ml-12 border-white/10 bg-white/[0.03] text-white"
                    : "mr-12 border-white/5 bg-zinc-900/40 text-zinc-300"
                )}
              >
                <p
                  className={cn(
                    "mb-2 text-[9px] font-black uppercase tracking-widest",
                    m.role === "user" ? "text-cyan-400" : "text-miransas-cyan"
                  )}
                >
                  {m.role === "user" ? "You" : "Binboi"}
                </p>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </motion.div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs italic text-zinc-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking with {MODEL_OPTIONS.find((m) => m.value === model)?.label}...
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/8 px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            )}

            <div ref={endRef} />
          </div>

          <div className="sticky bottom-6 rounded-2xl border border-white/10 bg-[#09090b]/90 p-2 backdrop-blur-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
              className="flex items-center gap-3 px-4 py-2"
            >
              <Search className="h-4 w-4 shrink-0 text-zinc-600" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about tunnels, webhooks, auth..."
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="flex items-center gap-2 rounded-xl bg-miransas-cyan px-4 py-2 text-xs font-bold text-black transition hover:brightness-110 disabled:opacity-40"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Ask
              </button>
            </form>

            <div className="mt-2 flex items-center justify-between border-t border-white/5 px-6 py-2">
              <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
                Current: {MODEL_OPTIONS.find((m) => m.value === model)?.label}
              </p>

              <button
                onClick={clearHistory}
                className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-700 transition hover:text-rose-400"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardRouteFrame>
  );
}