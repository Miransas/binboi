import Link from "next/link";
import { ArrowRight, Clock, Tag } from "lucide-react";

import { Footer } from "@/components/site/shared/footer";

import { metadata as tunnelMeta } from "@/content/blog/tunnel-setup.mdx";
import { metadata as webhookMeta } from "@/content/blog/webhook-debugging.mdx";
import { metadata as selfHostingMeta } from "@/content/blog/self-hosting-guide.mdx";

// ── types ─────────────────────────────────────────────────────────────────────

type PostMeta = {
  title: string;
  date: string;
  category: string;
  readTime: string;
  excerpt: string;
};

type Post = PostMeta & { slug: string };

// ── data ──────────────────────────────────────────────────────────────────────

const posts: Post[] = [
  { slug: "tunnel-setup",        ...tunnelMeta },
  { slug: "self-hosting-guide",  ...selfHostingMeta },
  { slug: "webhook-debugging",   ...webhookMeta },
];

// ── styles ────────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Tips:      { text: "text-miransas-cyan",  bg: "bg-miransas-cyan/10",  border: "border-miransas-cyan/20" },
  Guide:     { text: "text-[#86a9ff]",      bg: "bg-[#86a9ff]/10",      border: "border-[#86a9ff]/20" },
  Debugging: { text: "text-[#ff00ff]",      bg: "bg-[#ff00ff]/10",      border: "border-[#ff00ff]/20" },
  Security:  { text: "text-amber-400",      bg: "bg-amber-400/10",      border: "border-amber-400/20" },
  Product:   { text: "text-emerald-400",    bg: "bg-emerald-400/10",    border: "border-emerald-400/20" },
  Design:    { text: "text-rose-400",       bg: "bg-rose-400/10",       border: "border-rose-400/20" },
};

function categoryStyle(category: string) {
  return CATEGORY_COLORS[category] ?? { text: "text-zinc-400", bg: "bg-zinc-400/10", border: "border-zinc-400/20" };
}

// ── page metadata ─────────────────────────────────────────────────────────────

export const metadata = {
  title: "Blog | Binboi",
  description:
    "Tunnel tips, self-hosting guides, and webhook debugging deep dives from the Binboi team.",
};

// ── component ─────────────────────────────────────────────────────────────────

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/[0.06]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="inline-flex items-center gap-2 rounded-full border border-miransas-cyan/20 bg-miransas-cyan/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-miransas-cyan">
            <Tag className="h-3 w-3" />
            Blog
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
            Tunnel tips, guides,
            <br />
            <span className="bg-gradient-to-r from-miransas-cyan to-[#86a9ff] bg-clip-text text-transparent">
              and debugging notes.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-zinc-400">
            Practical writing on self-hosting Binboi, getting the most out of
            tunnels, and diagnosing webhook failures before they reach production.
          </p>
        </div>
      </div>

      {/* ── Post Grid ────────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const style = categoryStyle(post.category);
            return (
              <article
                key={post.slug}
                className="group flex flex-col rounded-2xl border border-white/[0.08] bg-[#07080c] transition-all duration-200 hover:border-white/[0.16] hover:bg-[#0c0d12]"
              >
                {/* top accent line */}
                <div className={`h-px w-full rounded-t-2xl ${style.bg}`} />

                <div className="flex flex-1 flex-col p-6">
                  {/* category + read time */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${style.text} ${style.bg} ${style.border}`}
                    >
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>

                  {/* title */}
                  <h2 className="mt-4 text-lg font-bold leading-snug tracking-tight text-white transition-colors group-hover:text-miransas-cyan">
                    {post.title}
                  </h2>

                  {/* date */}
                  <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-zinc-600">
                    {post.date}
                  </p>

                  {/* excerpt */}
                  <p className="mt-4 flex-1 text-sm leading-7 text-zinc-400 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* read more */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-miransas-cyan opacity-70 transition-all group-hover:gap-2.5 group-hover:opacity-100"
                  >
                    Read more
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* bottom note */}
        <p className="mt-16 text-center text-sm text-zinc-600">
          More posts coming soon — follow{" "}
          <a
            href="https://github.com/miransas/binboi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 underline underline-offset-4 transition hover:text-white"
          >
            the repo
          </a>{" "}
          for updates.
        </p>
      </main>

      <Footer />
    </div>
  );
}
