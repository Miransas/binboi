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
        "group relative flex h-11 w-11 items-center justify-center rounded-full border border-border/50 bg-secondary/30 transition-all duration-300 hover:border-primary/40 hover:bg-primary/10",
        isHovered && "scale-110 border-transparent text-white"
      )}
    >
      <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
      <span
        className={cn(
          "absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background opacity-0 transition-all duration-200",
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
      className="group flex items-center gap-1 text-muted-foreground transition-colors duration-200 hover:text-foreground"
    >
      <span className="relative">
        {name}
        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
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
    <footer className="relative border-t border-border/50 bg-background">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Newsletter CTA */}
      <div className="relative border-b border-border/50">
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
            <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-12 w-full rounded-lg border border-border/50 bg-secondary/30 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                className={cn(
                  "h-12 rounded-lg px-6 font-medium transition-all duration-300",
                  isSubscribed
                    ? "bg-green-500 text-white"
                    : " bg-[#9eff00] text-black hover:bg-primary/90 hover:scale-105 active:scale-95"
                )}
              >
                {isSubscribed ? "Subscribed!" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="relative mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-6">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-14 w-14 items-center justify-center ">
                <img src="./logo.png" alt="" />
              </div>
              <span className="text-xl font-bold text-foreground">Binboi</span>
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
              <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">
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
      <div className="relative border-t border-border/50">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Miransas. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
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