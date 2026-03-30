import {
  SitePageShell,
  SitePanel,
  SiteSectionHeader,
} from "@/components/site/shared/site-primitives";
import { changelogEntries } from "@/content/site-content";

export default function ChangelogPage() {
  return (
    <SitePageShell
      eyebrow="Changelog"
      title="Structured release notes for the Binboi control plane"
      description="Binboi release notes track product changes across the relay, CLI, dashboard, docs, and operator experience. Entries stay clear about what is already implemented and what still acts as a foundation for later releases."
    >
      <SitePanel>
        <SiteSectionHeader
          eyebrow="Release notes"
          title="A changelog that explains product movement, not just commit volume"
          description="Each entry groups the release into themes so operators can understand whether a change affected auth, tunnels, dashboards, docs, packaging, or the product story itself."
        />
      </SitePanel>

      <section className="space-y-6">
        {changelogEntries.map((entry) => (
          <SitePanel key={entry.version} className="relative overflow-hidden">
            <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-miransas-cyan/60 via-white/10 to-transparent" />
            <div className="pl-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-miransas-cyan/20 bg-miransas-cyan/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-miransas-cyan">
                  {entry.version}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  {entry.releasedAt}
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-black tracking-tight text-white">
                {entry.title}
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">{entry.summary}</p>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {entry.sections.map((section) => (
                  <div
                    key={section.label}
                    className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                      {section.label}
                    </p>
                    <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300">
                      {section.items.map((item) => (
                        <p key={item}>{item}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SitePanel>
        ))}
      </section>
    </SitePageShell>
  );
}
