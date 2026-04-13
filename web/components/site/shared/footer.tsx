/* eslint-disable @next/next/no-img-element */
"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ArrowUpRight, Mail } from "lucide-react"
import { footerLinks, footerSocialLinks } from "../../../constants"

function SocialIcon({ social }: { social: typeof footerSocialLinks[0] }) {
  const [isHovered, setIsHovered] = useState(false)
  const Icon = social.icon

  return (
    <Link
      href={social.href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative flex h-11 w-11 items-center justify-center rounded-full border border-border/50 bg-secondary/30 transition-all duration-300",
        // Glow ve renk değişimi efekti eklendi
        "hover:border-[#9eff00]/50 hover:bg-[#9eff00]/10 hover:shadow-[0_0_15px_rgba(158,255,0,0.2)]",
        isHovered && "scale-110 text-[#9eff00]"
      )}
    >
      <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
      <span
        className={cn(
          "absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-[#9eff00]/20 bg-background px-2 py-1 text-xs text-[#9eff00] opacity-0 transition-all duration-200 shadow-[0_0_10px_rgba(158,255,0,0.1)]",
          isHovered && "opacity-100 -top-10"
        )}
      >
        {social.name}
      </span>
    </Link>
  )
}

function FooterLink({ name, href }: { name: string; href: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-1 text-muted-foreground transition-colors duration-200 hover:text-[#9eff00]"
    >
      <span className="relative">
        {name}
        {/* Underline rengi neon yapıldı */}
        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#9eff00] transition-all duration-300 group-hover:w-full shadow-[0_0_5px_rgba(158,255,0,0.5)]" />
      </span>
      <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0" />
    </Link>
  )
}

export function Footer() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setTimeout(() => setIsSubscribed(false), 3000)
      setEmail("")
    }
  }

  return (
    <footer className="relative border-t border-border/50 bg-background overflow-hidden">
      {/* Arka plan grid deseni eklendi (Mühendislik/Terminal havası) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Glow gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#9eff00]/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Newsletter CTA */}
      <div className="relative border-b border-border/50 bg-black/20 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
          <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold text-foreground lg:text-3xl">
                Stay close to the Binboi rollout
              </h3>
              <p className="mt-2 text-muted-foreground">
                Product updates, docs changes, and setup guidance for teams exposing internal services.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-3 relative z-10">
              <div className="relative flex-1 group">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-[#9eff00]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  // Input focus durumunda parlayacak
                  className="h-12 w-full rounded-lg border border-border/50 bg-secondary/30 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-[#9eff00]/50 focus:outline-none focus:ring-2 focus:ring-[#9eff00]/20 transition-all duration-300 backdrop-blur-md"
                />
              </div>
              <button
                type="submit"
                className={cn(
                  "h-12 rounded-lg px-6 font-bold transition-all duration-300",
                  // Butona neon gölge efekti eklendi
                  isSubscribed
                    ? "bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                    : "bg-[#9eff00] text-black hover:bg-[#b0ff33] hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(158,255,0,0.2)] hover:shadow-[0_0_25px_rgba(158,255,0,0.5)]"
                )}
              >
                {isSubscribed ? "Subscribed!" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="relative mx-auto max-w-7xl px-6 py-12 lg:py-16 backdrop-blur-sm">
        <div className="grid gap-12 lg:grid-cols-6">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/30 border border-border/50 transition-all duration-300 group-hover:border-[#9eff00]/50 group-hover:shadow-[0_0_20px_rgba(158,255,0,0.15)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#9eff00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <img src="./logo.png" alt="Binboi Logo" className="relative z-10 scale-90 transition-transform duration-300 group-hover:scale-100" />
              </div>
              <span className="text-2xl font-bold text-foreground tracking-tight transition-colors group-hover:text-[#9eff00]">Binboi</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Tunnels, request visibility, and access hygiene for teams that need to bring local and internal services online without chaos.
            </p>
            
            {/* Social links */}
            <div className="mt-6 flex flex-wrap gap-3">
              {footerSocialLinks.map((social) => (
                <SocialIcon key={social.name} social={social} />
              ))}
            </div>
          </div>

          {/* Links sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
                {category}
              </h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <FooterLink {...link} />
                  </li>
                ))}
              </ul>
            </div>
            
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-border/50 bg-black/40">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Miransas. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 text-sm text-muted-foreground font-medium border border-border/50 rounded-full px-3 py-1 bg-secondary/20 shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9eff00] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9eff00] shadow-[0_0_8px_rgba(158,255,0,0.8)]" />
                </span>
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}