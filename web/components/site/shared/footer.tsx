import Link from "next/link";
import { ArrowUpRight, BookOpen, Sparkles } from "lucide-react";

import { FOOTER_LINKS } from "@/constants";

export function Footer() {
  const sections = [
    { title: "Product", links: FOOTER_LINKS.product },
    { title: "Resources", links: FOOTER_LINKS.resources },
    { title: "Company", links: FOOTER_LINKS.company },
    { title: "Legal", links: FOOTER_LINKS.legal },
  ];

  return (
    <footer className="border-t  bg-[#050506] text-white">
      <div className="mx-auto max-w-[1440px] px-6 pb-8 pt-14 lg:px-8">
        <div className="grid gap-8  bg-[#070709]/88 p-8 shadow-[0_40px_140px_rgba(0,0,0,0.35)] lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-miransas-cyan/15 bg-miransas-cyan/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-miransas-cyan">
              <Sparkles className="h-3.5 w-3.5" />
              Developer tunnels
            </div>
            <h2 className="mt-5 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
              Public URLs, request visibility, and webhook debugging that still feels calm under pressure.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
              Binboi combines a Go relay, CLI authentication, and a product-led dashboard so teams can expose localhost, inspect deliveries, and understand failures without guessing.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white transition hover:border-white/20 hover:bg-white/[0.08]"
              >
                <BookOpen className="h-4 w-4 text-miransas-cyan" />
                Read the docs
              </Link>
              <Link
                href="/dashboard/ai"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white transition hover:border-white/20 hover:bg-white/[0.08]"
              >
                Open assistant
                <ArrowUpRight className="h-4 w-4 text-zinc-500" />
              </Link>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.26em] text-zinc-500">
                  {section.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {section.links.map((link) => {
                    const isExternal = link.href.startsWith("http");
                    const className =
                      "inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white";

                    return (
                      <li key={link.href}>
                        {isExternal ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            className={className}
                          >
                            {link.label}
                            <ArrowUpRight className="h-3.5 w-3.5 text-zinc-600" />
                          </a>
                        ) : (
                          <Link href={link.href} className={className}>
                            {link.label}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 px-2 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Binboi. Early-stage developer infrastructure by Miransas.</p>
          <div className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.45)]" />
            <span>Control plane surfaces are live where available and clearly labeled when still MVP.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
