import Link from "next/link";
import { ArrowRight, TerminalSquare, Waypoints } from "lucide-react";

import type { AssistantResponsePayload } from "@/lib/assistant-types";

type AssistantInsightsProps = {
  response: AssistantResponsePayload | null;
};

export function AssistantInsights({ response }: AssistantInsightsProps) {
  return (
    <div className="custom-scrollbar flex min-h-[16rem] flex-col gap-4 overflow-y-auto pr-1 xl:min-h-0">
      <article className="rounded-[1.75rem] border border-white/10 bg-black/35 p-5">
        <div className="flex items-center gap-2">
          <Waypoints className="h-4 w-4 text-miransas-cyan" />
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-300">
            Product sources
          </h3>
        </div>
        <div className="mt-4 space-y-3">
          {response?.sources.length ? (
            response.sources.map((source) => (
              <Link
                key={`${source.href}-${source.title}`}
                href={source.href}
                className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      {source.kind}
                    </p>
                    <h4 className="mt-2 text-sm font-semibold text-white">{source.title}</h4>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-600 transition group-hover:text-miransas-cyan" />
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{source.excerpt}</p>
              </Link>
            ))
          ) : (
            <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-zinc-400">
              Ask a question to see matching docs and product sources here.
            </p>
          )}
        </div>
      </article>

      <article className="rounded-[1.75rem] border border-white/10 bg-black/35 p-5">
        <div className="flex items-center gap-2">
          <TerminalSquare className="h-4 w-4 text-miransas-cyan" />
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-300">
            Runtime context
          </h3>
        </div>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          {response?.runtime.note ||
            "The assistant will show matched page, request, webhook, log, and control-plane context here."}
        </p>

        <div className="mt-4 space-y-3">
          {response?.runtime.hits.length ? (
            response.runtime.hits.map((hit) => (
              <div
                key={`${hit.kind}-${hit.title}-${hit.detail}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  {hit.kind}
                </p>
                <h4 className="mt-2 text-sm font-semibold text-white">{hit.title}</h4>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{hit.detail}</p>
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-zinc-400">
              No runtime context has been attached yet. The assistant can still answer from docs
              and product knowledge.
            </p>
          )}
        </div>
      </article>

      <article className="rounded-[1.75rem] border border-white/10 bg-black/35 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Suggested next moves
        </p>
        <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
          {response?.suggestions.length ? (
            response.suggestions.map((suggestion) => <p key={suggestion}>{suggestion}</p>)
          ) : (
            <p>
              Suggested debugging steps will appear here once the assistant has answered at least
              one question.
            </p>
          )}
        </div>
      </article>
    </div>
  );
}
