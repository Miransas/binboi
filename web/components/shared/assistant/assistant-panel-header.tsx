import { Sparkles, Trash2 } from "lucide-react";

type AssistantPanelHeaderProps = {
  title: string;
  description: string;
  onClear: () => void;
};

export function AssistantPanelHeader({
  title,
  description,
  onClear,
}: AssistantPanelHeaderProps) {
  return (
    <div className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(10,10,12,0.98),rgba(10,10,12,0.86))] px-4 py-4 backdrop-blur sm:px-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-miransas-cyan/15 bg-miransas-cyan/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-miransas-cyan">
            <Sparkles className="h-3.5 w-3.5" />
            Binboi Assistant
          </div>
          <h2 className="mt-4 text-xl font-black tracking-tight text-white sm:text-2xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="grid grid-cols-2 gap-3 sm:w-[18rem]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Scope
              </p>
              <p className="mt-2 text-sm font-medium text-white">Docs + runtime</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Security
              </p>
              <p className="mt-2 text-sm font-medium text-white">Server-side only</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
