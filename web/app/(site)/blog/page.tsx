import { ArrowRight } from "lucide-react";

import {
  SitePageShell,
  SitePanel,
  SiteRail,
  SiteSectionHeader,
} from "@/components/site/shared/site-primitives";
import { Footer } from "@/components/site/shared/footer";
import { blogPosts } from "@/content/site-content";

export default function BlogPage() {
  const [featured, ...rest] = blogPosts;
  const categoryCount = new Set(blogPosts.map((post) => post.category)).size;

  return (
    <>
      <SitePageShell
        eyebrow="Blog"
        title="Shipping notes from the tunnel control plane"
        description="The Binboi blog follows product decisions, security tradeoffs, and the operational realities of building a developer tunnel and webhook debugging platform that stays honest about its MVP boundaries."
      >
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.14fr)_18.5rem] 2xl:grid-cols-[minmax(0,1.18fr)_19.5rem]">
          <SitePanel className="overflow-hidden">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#dfe7ff]">
              Featured note
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
              {featured.title}
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-zinc-500">
              <span>{featured.category}</span>
              <span>{featured.publishedAt}</span>
              <span>{featured.readTime}</span>
            </div>
            <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-400">{featured.excerpt}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {featured.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-[1.5rem] border border-white/10 bg-black/35 p-4 text-sm leading-7 text-zinc-300"
                >
                  {highlight}
                </div>
              ))}
            </div>
          </SitePanel>

          <SiteRail>
            <SitePanel>
              <SiteSectionHeader
                eyebrow="Why this exists"
                title="A product log, not content filler"
                description="Every post should help developers and operators understand the product better: what changed, why it changed, and what that means for using Binboi in practice."
              />
              <div className="mt-6 space-y-4 text-sm leading-7 text-zinc-400">
                <p>Binboi is still early, which makes product writing more important, not less.</p>
                <p>These notes explain the security model, the UX decisions around honesty and fallback states, and the practical workflow around tunnels, tokens, and request debugging.</p>
                <p>As the project matures, the blog becomes the narrative layer between changelog entries and full documentation guides.</p>
              </div>
            </SitePanel>

            <SitePanel>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#dfe7ff]">
                Coverage snapshot
              </p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/25 px-4 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                    Published notes
                  </p>
                  <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
                    {String(blogPosts.length).padStart(2, "0")}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-black/25 px-4 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                    Topics covered
                  </p>
                  <p className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
                    {String(categoryCount).padStart(2, "0")}
                  </p>
                </div>
              </div>
            </SitePanel>
          </SiteRail>
        </section>

        <section className="grid gap-6 2xl:grid-cols-2">
          {rest.map((post) => (
            <SitePanel key={post.slug} className="h-full">
              <div className="flex h-full flex-col">
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-zinc-500">
                  <span>{post.category}</span>
                  <span>{post.publishedAt}</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-white">{post.title}</h2>
                <p className="mt-4 text-sm leading-7 text-zinc-400">{post.excerpt}</p>

                <div className="mt-5 flex-1 space-y-3">
                  {post.highlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="rounded-[1.25rem] border border-white/10 bg-black/35 px-4 py-3 text-sm leading-7 text-zinc-300"
                    >
                      {highlight}
                    </div>
                  ))}
                </div>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-miransas-cyan">
                  Product note
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </SitePanel>
          ))}
        </section>
      </SitePageShell>
      <Footer />
    </>
  );
}
