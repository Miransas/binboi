export function AssistantEmptyState() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          What this MVP does well
        </p>
        <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
          <p>
            Search docs and product pages for tunnels, CLI auth, requests, logs, and webhook
            debugging.
          </p>
          <p>
            Merge page context and live control-plane data when available, then explain missing
            context honestly when it is not.
          </p>
          <p>
            Use OpenAI only on the server side, with a deterministic fallback when credentials are
            not configured.
          </p>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Good first prompts
        </p>
        <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
          <p>Why is my Stripe signature failing locally?</p>
          <p>What does `binboi whoami` verify?</p>
          <p>How do logs differ from request inspection?</p>
          <p>What should I check if the tunnel URL returns 404?</p>
        </div>
      </div>
    </div>
  );
}
