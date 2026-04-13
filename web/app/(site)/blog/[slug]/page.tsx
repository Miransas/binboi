import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, GitBranch, Tag } from "lucide-react";

import { Footer } from "@/components/site/shared/footer";

// ── types ─────────────────────────────────────────────────────────────────────

type TocItem = { id: string; title: string; level: number };

type PostMeta = {
  title: string;
  date: string;
  category: string;
  readTime: string;
  excerpt: string;
};

type PostModule = {
  default: React.ComponentType;
  metadata: PostMeta;
  toc: TocItem[];
};

// ── known slugs ───────────────────────────────────────────────────────────────

const SLUGS = ["tunnel-setup", "webhook-debugging", "self-hosting-guide"] as const;

const RELATED: Record<string, { slug: string; title: string; category: string }[]> = {
  "tunnel-setup": [
    { slug: "self-hosting-guide", title: "Self-Hosting Binboi on a €5/month VPS", category: "Guide" },
    { slug: "webhook-debugging", title: "Debugging Webhooks from Stripe, Clerk, and Supabase", category: "Debugging" },
  ],
  "webhook-debugging": [
    { slug: "tunnel-setup", title: "Setting Up Your First Binboi Tunnel", category: "Guide" },
    { slug: "self-hosting-guide", title: "Self-Hosting Binboi on a €5/month VPS", category: "Guide" },
  ],
  "self-hosting-guide": [
    { slug: "tunnel-setup", title: "Setting Up Your First Binboi Tunnel", category: "Guide" },
    { slug: "webhook-debugging", title: "Debugging Webhooks from Stripe, Clerk, and Supabase", category: "Debugging" },
  ],
};

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

// ── static params ─────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

// ── metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(SLUGS as readonly string[]).includes(slug)) return {};
  const { metadata } = (await import(`@/content/blog/${slug}.mdx`)) as PostModule;
  return {
    title: `${metadata.title} | Binboi Blog`,
    description: metadata.excerpt,
  };
}

// ── page ──────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!(SLUGS as readonly string[]).includes(slug)) notFound();

  const { default: Post, metadata, toc } = (await import(
    `@/content/blog/${slug}.mdx`
  )) as PostModule;

  const style = categoryStyle(metadata.category);
  const related = RELATED[slug] ?? [];
  const editUrl = `https://github.com/miransas/binboi/edit/main/web/content/blog/${slug}.mdx`;

  return (
    <div className="min-h-screen bg-[#000000] text-white">

      {/* ── Hero banner ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/[0.06]">
        {/* grid bg */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* gradient orb */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-miransas-cyan/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-10 lg:px-8 lg:pb-20 lg:pt-14">
          {/* back link */}
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-300"
          >
            <ArrowLeft className="h-4 w-4" />
            All posts
          </Link>

          {/* category */}
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${style.text} ${style.bg} ${style.border}`}
            >
              <Tag className="h-2.5 w-2.5" />
              {metadata.category}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
              <Clock className="h-3 w-3" />
              {metadata.readTime}
            </span>
          </div>

          {/* title */}
          <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
            {metadata.title}
          </h1>

          {/* date + github edit */}
          <div className="mt-5 flex flex-wrap items-center gap-5">
            <span className="flex items-center gap-1.5 text-sm text-zinc-500">
              <Calendar className="h-3.5 w-3.5" />
              {metadata.date}
            </span>
            <a
              href={editUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-zinc-500 transition hover:text-zinc-300"
            >
              <GitBranch className="h-3.5 w-3.5" />
              Edit on GitHub
            </a>
          </div>

          {/* excerpt */}
          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400">
            {metadata.excerpt}
          </p>
        </div>
      </div>

      {/* ── Content area ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-20">
        <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-16 xl:gap-20">

          {/* ── Main content ───────────────────────────────────────────── */}
          <article className="min-w-0">
            <Post />
          </article>

          {/* ── Table of Contents (sticky) ─────────────────────────────── */}
          {toc && toc.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  On this page
                </p>
                <nav className="space-y-1">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={[
                        "block rounded-md py-1 text-sm leading-6 text-zinc-500 transition hover:text-zinc-200",
                        item.level === 2 ? "px-3" : "pl-6 pr-3 text-[13px]",
                      ].join(" ")}
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>

                {/* GitHub edit link in sidebar */}
                <a
                  href={editUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-zinc-500 transition hover:border-white/[0.14] hover:text-zinc-300"
                >
                  <GitBranch className="h-3.5 w-3.5 shrink-0" />
                  Edit this page
                </a>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* ── Related posts ────────────────────────────────────────────────── */}
      {related.length > 0 && (
        <div className="border-t border-white/[0.06]">
          <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-16">
            <p className="mb-8 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Related posts
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((rel) => {
                const rs = categoryStyle(rel.category);
                return (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="group flex items-start gap-4 rounded-xl border border-white/[0.08] bg-[#07080c] p-5 transition hover:border-white/[0.16] hover:bg-[#0c0d12]"
                  >
                    <span
                      className={`mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] ${rs.text} ${rs.bg} ${rs.border}`}
                    >
                      {rel.category}
                    </span>
                    <span className="text-sm font-medium leading-6 text-zinc-300 transition group-hover:text-white">
                      {rel.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
