import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/site/shared/footer";
import { blogPosts } from "@/content/site-content";
import { cn } from "@/lib/utils";

export default function BlogPage() {
  const [featured, ...rest] = blogPosts;
  const categoryCount = new Set(blogPosts.map((post) => post.category)).size;

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#00ffd1]/30">
      <main className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        
        {/* ── Page Header ────────────────────────────────────────── */}
        <header className="mb-16 max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00ffd1]">
            Blog
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
            Shipping notes from the tunnel control plane
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-400">
            The Binboi blog follows product decisions, security tradeoffs, and the operational realities of building a developer tunnel and webhook debugging platform that stays honest about its MVP boundaries.
          </p>
        </header>

        {/* ── Top Section: Featured & Rail ───────────────────────── */}
        <section className="grid gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
          
          {/* Featured Post */}
          <article className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#060a10]/50 p-8 backdrop-blur-sm transition-colors hover:bg-white/[0.02]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#86a9ff]">
              Featured note
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
              {featured.title}
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-zinc-500">
              <span className="text-[#00ffd1]/80">{featured.category}</span>
              <span>•</span>
              <span>{featured.publishedAt}</span>
              <span>•</span>
              <span>{featured.readTime}</span>
            </div>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400">
              {featured.excerpt}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {featured.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm leading-7 text-zinc-300 transition-colors hover:bg-white/[0.04]"
                >
                  {highlight}
                </div>
              ))}
            </div>
          </article>

          {/* Right Rail (Sidebar) */}
          <aside className="flex flex-col gap-6">
            
            {/* About Box */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#060a10]/50 p-6 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00ffd1]">
                Why this exists
              </p>
              <h3 className="mt-2 text-lg font-bold tracking-tight text-white">
                A product log, not content filler
              </h3>
              <div className="mt-4 space-y-4 text-sm leading-7 text-zinc-400">
                <p>Binboi is still early, which makes product writing more important, not less.</p>
                <p>These notes explain the security model, the UX decisions around honesty and fallback states, and the practical workflow around tunnels, tokens, and request debugging.</p>
                <p>As the project matures, the blog becomes the narrative layer between changelog entries and full documentation guides.</p>
              </div>
            </div>

            {/* Stats Box */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#060a10]/50 p-6 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#86a9ff]">
                Coverage snapshot
              </p>
              <div className="mt-5 grid gap-3">
                <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">
                    Published notes
                  </p>
                  <p className="text-xl font-black text-white">
                    {String(blogPosts.length).padStart(2, "0")}
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">
                    Topics covered
                  </p>
                  <p className="text-xl font-black text-white">
                    {String(categoryCount).padStart(2, "0")}
                  </p>
                </div>
              </div>
            </div>

          </aside>
        </section>

        {/* ── Bottom Section: Rest of Posts ──────────────────────── */}
        <section className="mt-6 grid gap-6 md:grid-cols-2">
          {rest.map((post) => (
            <article 
              key={post.slug} 
              className="group flex h-full cursor-pointer flex-col rounded-2xl border border-white/[0.08] bg-[#060a10]/30 p-6 transition-all hover:bg-white/[0.03] hover:border-white/[0.15]"
            >
              <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                <span className="text-[#00ffd1]/70">{post.category}</span>
                <span>•</span>
                <span>{post.publishedAt}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
              
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-white transition-colors group-hover:text-[#00ffd1]">
                {post.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400 line-clamp-3">
                {post.excerpt}
              </p>

              <div className="mt-6 flex-1 space-y-2">
                {post.highlights.slice(0, 2).map((highlight) => (
                  <div
                    key={highlight}
                    className="rounded-lg border border-white/[0.04] bg-white/[0.01] px-3 py-2 text-xs leading-6 text-zinc-400"
                  >
                    {highlight}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-[#00ffd1] opacity-80 transition-opacity group-hover:opacity-100">
                Read note
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </article>
          ))}
        </section>

      </main>
      <Footer />
    </div>
  );
}