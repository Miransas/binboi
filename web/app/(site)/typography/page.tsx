const samples = [
  {
    title: "Product headings",
    description: "Use clear, high-contrast headings with compact tracking for product surfaces and dashboard sections.",
  },
  {
    title: "Operational copy",
    description: "Keep operational text plain and direct. Users should understand whether something works, is pending, or is intentionally out of scope.",
  },
  {
    title: "Terminal snippets",
    description: "Reserve monospace styling for commands, URLs, IDs, and event output so the product reads like a real tool instead of a concept page.",
  },
];

export default function TypographyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 pb-20 pt-32 text-white">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-miransas-cyan">Typography</p>
      <h1 className="mt-4 text-5xl font-black tracking-tight">A calmer visual language for the MVP</h1>
      <p className="mt-5 max-w-3xl text-sm leading-7 text-zinc-400">
        The product no longer leans on neon slogans to explain itself. The new rule is simple: operational clarity first, style second.
      </p>

      <div className="mt-12 grid gap-6">
        {samples.map((sample) => (
          <section key={sample.title} className="rounded-3xl border border-white/10 bg-[#080808] p-6">
            <h2 className="text-2xl font-semibold text-white">{sample.title}</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-400">{sample.description}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
