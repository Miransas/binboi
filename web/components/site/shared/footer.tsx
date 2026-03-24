    
import {  ExternalLink } from "lucide-react"
import Link from "next/link"
import { FOOTER_LINKS } from "../../../constants"
import { BsGithub } from "react-icons/bs"

export function Footer() {
  const sections = [
    { title: "Product", links: FOOTER_LINKS.product },
    { title: "Company", links: FOOTER_LINKS.company },
    { title: "Legal", links: FOOTER_LINKS.legal },
  ]

  return (
    <footer className="w-full bg-[#07070b] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top section */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10">
          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0  transition-colors">
                  <img src="./logo.png" alt="" />
                </div>
                <div className="absolute inset-0 rounded-lg bg-violet-500/10 blur-md" />
              </div>
              <span className="font-bold text-foreground font-mono tracking-tight">binboi</span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              Zero-config instant tunneling. Put your local app on a public URL in seconds.
            </p>
            <p className="text-xs text-zinc-600 font-mono">
              Engineered by{" "}
              <a
                href="https://miransas.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 transition-colors"
              >
                Miransas Neural Node
              </a>
              {" "}· 
            </p>
          </div>

          {/* Link sections */}
          {sections.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => {
                  const isExternal = link.href.startsWith("http")
                  return (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        className="group flex items-center gap-1.5 text-sm text-zinc-500 hover:text-foreground transition-colors"
                      >
                        {link.label === "GitHub" && (
                          <BsGithub className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                        )}
                        {link.label}
                        {isExternal && link.label !== "GitHub" && (
                          <ExternalLink className="w-3 h-3 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                        )}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-600 font-mono">
            © {new Date().getFullYear()} Miransas. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-600 font-mono">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
