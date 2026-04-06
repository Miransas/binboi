"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Bot,
  Copy,
  ExternalLink,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Waypoints,
} from "lucide-react";

import { usePricingPlan } from "@/components/provider/pricing-plan-provider";
import {
  useAssistantContext,
  useRegisterAssistantContext,
} from "@/components/shared/assistant-context";
import { assistantPromptSuggestions } from "@/content/site-content";
import { dashboardPageContent } from "@/lib/dashboard-content";
import type {
  AssistantConversationMessage,
  AssistantResponsePayload,
} from "@/lib/assistant-types";

import { PremiumDashboardShell } from "../_components/premium-dashboard-shell";
import {
  dashboardBadgeClass,
  dashboardGhostButtonClass,
  dashboardInputClass,
  dashboardInsetPanelClass,
  dashboardMiniStatClass,
  dashboardMutedTextClass,
  dashboardPanelClass,
  dashboardPrimaryButtonClass,
  dashboardSecondaryButtonClass,
} from "../_components/dashboard-ui";
import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";

type StoredAssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  response?: AssistantResponsePayload;
};

const STORAGE_KEY = "binboi-assistant:dashboard-ai";

function createMessage(
  role: "user" | "assistant",
  content: string,
  response?: AssistantResponsePayload,
): StoredAssistantMessage {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${role}-${Date.now()}`;

  return {
    id,
    role,
    content,
    createdAt: Date.now(),
    response,
  };
}

function toConversationMessages(
  messages: StoredAssistantMessage[],
): AssistantConversationMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

async function parseJson<T>(response: Response) {
  return (await response.json().catch(() => ({}))) as T;
}
export default function AiGatewaysPage() {
  const content = dashboardPageContent.ai;
  const { context } = useAssistantContext();
  const { planConfig, aiExplainsRemaining, aiExplainsUsedToday, consumeAiExplain } = usePricingPlan();
  
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // LATEST RESPONSE DATA (Shell'in sağ tarafına basacağız)
  const latestAssistantMessage = useMemo(
    () => [...messages].reverse().find((m) => m.role === "assistant"),
    [messages]
  );
  const latestResponse = latestAssistantMessage?.response ?? null;

  // SHELL İÇİN SOL TARAF (Highlights)
  const highlights = [
    { label: "Status", value: loading ? "Searching..." : "Read only", note: "System status" },
    { label: "Fallback", value: "Docs first", note: "Primary logic path" },
    { label: "Security", value: "Server-side", note: "Encrypted context" },
  ];

  // SHELL İÇİN SAĞ TARAF (Panels)
  const panels = [
    {
      title: "What works today",
      description: "The assistant can search product docs, tunnels, and recent events.",
      bullets: [
        "Live control-plane instance context when reachable.",
        "Docs search across installation, auth, and webhooks."
      ]
    },
    {
      title: "What remains out of scope",
      description: "Binboi still avoids risky autonomous behavior.",
      bullets: [
        "No traffic rewriting or blocking.",
        "No secret handling in the client."
      ]
    }
  ];

  const submit = async (nextValue?: string) => {
    const value = (nextValue ?? query).trim();
    if (!value || loading) return;
    if (!consumeAiExplain()) { setError("Limit Reached"); return; }

    const userMsg = { id: Date.now().toString(), role: "user", content: value };
    setMessages(prev => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: value, messages: messages, context }),
      });
      const payload = await response.json();
      setMessages(prev => [...prev, { id: "ai-"+Date.now(), role: "assistant", content: payload.message, response: payload }]);
    } catch (e) {
      setError("Binboi offline.");
    } finally {
      setLoading(false);
    }
  };

  function clearHistory() {
    setMessages([]);
    setError(null);
    setQuery("");
  }

  return (
    <PremiumDashboardShell
      eyebrow="AI Assistant"
      title="Ask Binboi"
      description="Search docs, request context, and live runtime hints from one place. This stays read-only and server-side."
      highlights={highlights}
      panels={panels}
    >
      {/* CHAT AREA (Sadece merkez kolon) */}
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Messages List */}
        <div className="space-y-6 min-h-[400px]">
          {messages.length === 0 && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {assistantPromptSuggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="p-6 rounded-[2rem] bg-zinc-900/20 border border-white/5 text-left text-xs font-medium text-zinc-400 hover:border-[#9eff00]/30 hover:bg-[#9eff00]/5 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((m) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={m.id}
              className={cn(
                "p-6 rounded-[2.5rem] border leading-relaxed text-sm",
                m.role === "user" 
                  ? "bg-white/[0.03] border-white/10 ml-12 text-white" 
                  : "bg-zinc-900/40 border-white/5 mr-12 text-zinc-300"
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                  m.role === "user" ? "bg-cyan-500/20 text-cyan-400" : "bg-[#9eff00]/20 text-[#9eff00]"
                )}>
                  {m.role === "user" ? "Operator" : "Binboi"}
                </span>
              </div>
              {m.content}
            </motion.div>
          ))}
          
          {loading && (
            <div className="flex items-center gap-3 text-xs text-zinc-500 italic animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" /> Binboi is thinking...
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Floating Input Area */}
        <div className="sticky bottom-8 p-2 rounded-[2.5rem] bg-zinc-950/80 border border-white/5 backdrop-blur-2xl shadow-2xl">
          <form 
            onSubmit={(e) => { e.preventDefault(); submit(); }}
            className="flex items-center gap-3 px-4 py-2"
          >
            <Search className="h-4 w-4 text-zinc-600" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about tunnel auth, signatures..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-zinc-700"
            />
            <button
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#9eff00] text-black text-xs font-black hover:scale-105 transition-transform"
            >
              <Sparkles className="h-3.5 w-3.5" /> ASK BINBOI
            </button>
          </form>
          <div className="px-6 py-2 flex justify-between items-center border-t border-white/5 mt-2">
            <p className="text-[10px] text-zinc-600 font-medium">
              Free includes 5 assistant answers per day. {aiExplainsUsedToday} used.
            </p>
            <button onClick={clearHistory} className="text-[10px] text-zinc-700 hover:text-rose-500 transition-colors uppercase font-bold tracking-widest">
              Clear History
            </button>
          </div>
        </div>
      </div>
    </PremiumDashboardShell>
  );
}
