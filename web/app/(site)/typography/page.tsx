import {
  SitePageShell,
  SitePanel,
  SiteSectionHeader,
} from "@/components/site/shared/site-primitives";

const typeScale = [
  { label: "Display", sample: "Tunnel localhost with confidence", className: "text-5xl font-black tracking-tight sm:text-6xl" },
  { label: "Section", sample: "Request inspection that explains the failure", className: "text-3xl font-black tracking-tight sm:text-4xl" },
  { label: "Card title", sample: "Webhook delivery details", className: "text-xl font-semibold" },
  { label: "Body", sample: "Binboi favors clear operational language over abstract marketing language.", className: "text-base leading-8 text-zinc-300" },
  { label: "Microcopy", sample: "Status, metadata, and compact helper text stay readable without stealing focus.", className: "text-sm leading-7 text-zinc-400" },
];

const principles = [
  {
    title: "Operational clarity first",
    description:
      "The interface should tell the truth about what works, what is planned, and what still depends on the backend. Style supports that clarity instead of hiding it.",
  },
  {
    title: "Contrast without chaos",
    description:
      "Binboi uses deep neutral surfaces, disciplined cyan accents, and generous spacing so logs, commands, and status labels can stand out without the UI feeling noisy.",
  },
  {
    title: "Monospace with intent",
    description:
      "Monospace text is reserved for commands, hostnames, event output, and identifiers. It signals tool behavior, not decoration.",
  },
];

export default function TypographyPage() {
  return (
    <SitePageShell
      eyebrow="Typography"
      title="The Binboi visual language"
      description="Typography is part of the product contract. The Binboi system balances premium presentation with the legibility required for tunnels, tokens, logs, request states, and operator guidance."
    >
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SitePanel>
          <SiteSectionHeader
            eyebrow="Type scale"
            title="A hierarchy built for infrastructure product surfaces"
            description="The scale has to work across marketing pages, docs, dashboards, and request detail panels without feeling like separate brands."
          />
          <div className="mt-6 space-y-4">
            {typeScale.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  {item.label}
                </p>
                <div className={`mt-3 text-white ${item.className}`}>{item.sample}</div>
              </div>
            ))}
          </div>
        </SitePanel>

        <SitePanel>
          <SiteSectionHeader
            eyebrow="Voice"
            title="The copy system for Binboi"
            description="Every label should help developers understand system behavior faster. The voice is calm, technical, and explicit about MVP boundaries."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {principles.map((principle) => (
              <article
                key={principle.title}
                className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5"
              >
                <h3 className="text-lg font-semibold text-white">{principle.title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  {principle.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-black/50 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Terminal style
            </p>
            <pre className="mt-4 overflow-x-auto rounded-[1.25rem] border border-white/10 bg-[#030304] p-4 text-sm leading-7 text-miransas-cyan">
              <code>{`$ binboi whoami
User: preview@binboi.local
Plan: FREE
API: http://localhost:8080
Status: authenticated`}</code>
            </pre>
          </div>
        </SitePanel>
      </section>

      <SitePanel>
        <SiteSectionHeader
          eyebrow="UI patterns"
          title="Surfaces that make the product feel like one system"
          description="Cards, documentation panels, dashboard modules, and legal pages all reuse the same visual contract: deep surfaces, soft borders, tight headings, and concise explanatory copy."
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Status label
            </p>
            <div className="mt-4 inline-flex rounded-full border border-miransas-cyan/20 bg-miransas-cyan/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-miransas-cyan">
              ACTIVE
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Helper copy
            </p>
            <p className="mt-4 text-sm leading-7 text-zinc-400">
              Use this token with{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-200">
                binboi login --token &lt;token&gt;
              </code>{" "}
              and store it only on machines that should open tunnels.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Metric card
            </p>
            <p className="mt-4 text-3xl font-black tracking-tight text-white">128 requests</p>
            <p className="mt-2 text-sm leading-7 text-zinc-400">
              Useful metrics should be obvious, not over-decorated.
            </p>
          </div>
        </div>
      </SitePanel>
    </SitePageShell>
  );
}
