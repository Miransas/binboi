"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Check, ChevronDown, Copy, Loader2, MessageSquare, Send, Trash2, X } from "lucide-react";

type Model = "gpt-4o-mini" | "gpt-4o" | "claude-sonnet" | "gemini-flash";

const MODELS: { id: Model; label: string }[] = [
  { id: "gpt-4o-mini", label: "GPT-4o Mini" },
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "claude-sonnet", label: "Claude Sonnet" },
  { id: "gemini-flash", label: "Gemini Flash" },
];

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

// ── Inline markdown renderer ────────────────────────────────────────────────

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-white/10 bg-black/40">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="text-[10px] font-mono text-zinc-500">{lang || "code"}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-[10px] text-zinc-500 transition hover:text-zinc-200"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-zinc-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    const fenceMatch = line.match(/^```(\w*)$/);
    if (fenceMatch) {
      const lang = fenceMatch[1];
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(<CodeBlock key={i} code={codeLines.join("\n")} lang={lang} />);
      i++;
      continue;
    }

    // Heading
    const h3 = line.match(/^### (.+)/);
    if (h3) { elements.push(<p key={i} className="mt-3 font-semibold text-white">{h3[1]}</p>); i++; continue; }
    const h2 = line.match(/^## (.+)/);
    if (h2) { elements.push(<p key={i} className="mt-3 text-base font-bold text-white">{h2[1]}</p>); i++; continue; }
    const h1 = line.match(/^# (.+)/);
    if (h1) { elements.push(<p key={i} className="mt-3 text-lg font-bold text-white">{h1[1]}</p>); i++; continue; }

    // Bullet
    const bullet = line.match(/^[-*] (.+)/);
    if (bullet) {
      elements.push(<li key={i} className="ml-4 list-disc text-zinc-300">{renderInline(bullet[1])}</li>);
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") { elements.push(<br key={i} />); i++; continue; }

    // Normal paragraph
    elements.push(<p key={i} className="text-zinc-300">{renderInline(line)}</p>);
    i++;
  }

  return <div className="space-y-1 text-sm leading-6">{elements}</div>;
}

function renderInline(text: string): React.ReactNode {
  // URL detection
  const urlRegex = /https?:\/\/[^\s)>]+/g;
  // Bold
  const boldRegex = /\*\*(.+?)\*\*/g;
  // Inline code
  const codeRegex = /`([^`]+)`/g;

  // Split by patterns
  const parts: React.ReactNode[] = [];
  let last = 0;
  const combined = /(`[^`]+`|\*\*[^*]+\*\*|https?:\/\/[^\s)>]+)/g;
  let m: RegExpExecArray | null;

  while ((m = combined.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("`")) {
      parts.push(<code key={m.index} className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] font-mono text-miransas-cyan">{tok.slice(1, -1)}</code>);
    } else if (tok.startsWith("**")) {
      parts.push(<strong key={m.index} className="font-semibold text-white">{tok.slice(2, -2)}</strong>);
    } else {
      parts.push(<a key={m.index} href={tok} target="_blank" rel="noreferrer" className="text-[#86a9ff] underline underline-offset-2 hover:text-white transition-colors">{tok}</a>);
    }
    last = m.index + tok.length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : <>{parts}</>;
}

// ── Widget ──────────────────────────────────────────────────────────────────

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState<Model>("claude-sonnet");
  const [modelOpen, setModelOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = (await res.json()) as { content?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Request failed");
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: data.content ?? "" },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const currentModel = MODELS.find((m) => m.id === model)!;

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-[#111114] shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition hover:border-white/25 hover:bg-[#1a1a1f]"
            aria-label="Open AI chat"
          >
            <MessageSquare className="h-5 w-5 text-miransas-cyan" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Side panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            />

            {/* Panel */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col border-l border-white/10 bg-[#09090b] shadow-[-20px_0_80px_rgba(0,0,0,0.5)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-miransas-cyan/20 bg-miransas-cyan/10">
                    <Bot className="h-4 w-4 text-miransas-cyan" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">AI Assistant</p>
                    <p className="text-[10px] text-zinc-500">Powered by {currentModel.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {messages.length > 0 && (
                    <button
                      onClick={() => { setMessages([]); setError(null); }}
                      className="rounded-lg border border-white/10 p-1.5 text-zinc-500 transition hover:border-white/20 hover:text-rose-400"
                      title="Clear conversation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-white/10 p-1.5 text-zinc-500 transition hover:border-white/20 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Model selector */}
              <div className="relative border-b border-white/10 px-5 py-3">
                <button
                  onClick={() => setModelOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-200 transition hover:border-white/20"
                >
                  <span>{currentModel.label}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform ${modelOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {modelOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute left-5 right-5 top-[calc(100%-4px)] z-10 overflow-hidden rounded-xl border border-white/10 bg-[#111114] shadow-xl"
                    >
                      {MODELS.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => { setModel(m.id); setModelOpen(false); }}
                          className={`flex w-full items-center justify-between px-4 py-3 text-sm transition hover:bg-white/[0.04] ${m.id === model ? "text-white" : "text-zinc-400"}`}
                        >
                          {m.label}
                          {m.id === model && <Check className="h-3.5 w-3.5 text-miransas-cyan" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Messages */}
              <div className="custom-scrollbar flex-1 overflow-y-auto px-5 py-5">
                {messages.length === 0 && !loading && (
                  <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                      <Bot className="h-5 w-5 text-zinc-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-400">Ask me anything</p>
                      <p className="mt-1 text-xs text-zinc-600">Tunnel auth, webhooks, debugging tips…</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                          msg.role === "user"
                            ? "rounded-br-sm bg-miransas-cyan/15 text-white"
                            : "rounded-bl-sm border border-white/10 bg-white/[0.03] text-zinc-300"
                        }`}
                      >
                        {msg.role === "assistant"
                          ? renderMarkdown(msg.content)
                          : <p className="text-sm leading-6">{msg.content}</p>}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-zinc-500">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-miransas-cyan" />
                        Thinking…
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/8 px-4 py-3 text-xs text-rose-300">
                      {error}
                    </div>
                  )}

                  <div ref={endRef} />
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-white/10 px-5 py-4">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition focus-within:border-white/20">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
                    placeholder="Ask something…"
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
                  />
                  <button
                    onClick={() => void send()}
                    disabled={loading || !input.trim()}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-miransas-cyan text-black transition hover:brightness-110 disabled:opacity-30"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
