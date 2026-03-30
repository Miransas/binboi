import { BorderBeam } from "@/components/ui/border-beam";

export function LandingSectionDivider({
  label,
}: {
  label: string;
}) {
  return (
    <div className="pointer-events-none relative mx-auto my-6 flex max-w-[1440px] items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent sm:inset-x-6 lg:inset-x-8" />
      <div className="relative overflow-hidden rounded-full border border-white/10 bg-[#070709]/88 px-4 py-2 backdrop-blur">
        <BorderBeam
          size={120}
          duration={8}
          className="from-transparent via-miransas-cyan to-transparent"
        />
        <span className="relative z-10 text-[10px] font-semibold uppercase tracking-[0.26em] text-zinc-400">
          {label}
        </span>
      </div>
    </div>
  );
}
