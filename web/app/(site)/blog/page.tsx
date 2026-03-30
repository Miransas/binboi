const posts = [
  {
    title: "Turning Binboi into a real MVP",
    date: "March 30, 2026",
    summary:
      "We removed blank pages, clarified the backend data model, and narrowed the product to reliable HTTP tunneling instead of a grab bag of unfinished experiments.",
  },
  {
    title: "Why Binboi now uses personal access tokens",
    date: "March 24, 2026",
    summary:
      "Users now create account-backed access tokens in the dashboard while the relay still keeps the runtime control plane intentionally small.",
  },
];

export default function BlogPage() {
  return (
    <main className="mx-auto min-h-[70vh] max-w-5xl px-6 pb-20 pt-32 text-white">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-miransas-cyan">Blog</p>
      <h1 className="mt-4 text-5xl font-black tracking-tight">Build notes from the control plane</h1>
      <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400">
        The blog tracks product decisions, tradeoffs, and rollout notes for the Binboi tunneling stack.
      </p>

      <div className="mt-12 grid gap-6">
        {posts.map((post) => (
          <article key={post.title} className="rounded-3xl border border-white/10 bg-[#080808] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{post.date}</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{post.title}</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-400">{post.summary}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
