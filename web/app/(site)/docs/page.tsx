const sections = [
  {
    title: "What Binboi is",
    body: "Binboi is a self-hosted tunneling control plane with a Go relay, a CLI agent, and a Next.js dashboard. The current MVP focuses on stable HTTP tunnels over a single yamux connection.",
  },
  {
    title: "How the MVP works",
    body: "Reserve a subdomain in the dashboard, save the instance token with the CLI, then start a tunnel for your local port. The relay marks the tunnel active when the agent connects successfully.",
  },
  {
    title: "What is intentionally out of scope",
    body: "Raw TCP exposure, in-core TLS certificate management, AI inspection, and per-user machine identities are not yet finished product features.",
  },
];

export default function DocsPage() {
  return (
    <main className="mx-auto min-h-[70vh] max-w-5xl px-6 pb-20 pt-32 text-white">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-miransas-cyan">Docs</p>
      <h1 className="mt-4 text-5xl font-black tracking-tight">Product documentation</h1>
      <div className="mt-12 grid gap-6">
        {sections.map((section) => (
          <section key={section.title} className="rounded-3xl border border-white/10 bg-[#080808] p-6">
            <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-400">{section.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
