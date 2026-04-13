'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'

const NAV_LINKS = [
  { label: "Docs", link: "https://docs.binboi.com/docs" }, // dosc düzeltildi
  { label: "Pricing", link: "/pricing" },
  { label: "Blog", link: "/blog" },
  { label: "Changelog", link: "/changelog" },
  { label: "Showcase", link: "/showcase" }, // Yazım hatası düzeltildi
  { label: "Privacy", link: "/privacy" }, 
];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)

  // TODO: Burayı gerçek Auth state'in ile değiştireceksin (örn: const { user } = useAuth())
  const isAuthenticated = false; 

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(navRef.current, { y: -60, opacity: 0, duration: 0.8, ease: 'power2.out' })
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-6 md:px-10 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/40 backdrop-blur-md border-b border-zinc-800/50' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      {/* ── Logo ── */}
      <Link href="/" className="flex items-center gap-2.5 select-none shrink-0 group">
        <div className="flex flex-col gap-[3px] transition-transform duration-300 group-hover:scale-110">
         <img src="/logo.png" alt="" className='w-10' />
        </div>
        <span className="font-bold text-base text-white tracking-tight transition-colors group-hover:text-[#9eff00]">
          Binboi
        </span>
      </Link>

      {/* ── Nav links ── */}
      <ul className="hidden md:flex items-center gap-8 m-0 p-0 list-none">
        {NAV_LINKS.map((item) => (
          <li key={item.label}>
            <Link
              href={item.link}
              className="relative group flex items-center gap-1.5 font-mono text-xs tracking-widest text-zinc-400 uppercase transition-colors hover:text-[#9eff00]"
            >
              {item.label}
              
              {/* Sadece Changelog veya yeni bir özellikte yeşil nokta çıksın */}
              {item.label === 'Changelog' && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#9eff00] shrink-0 animate-pulse shadow-[0_0_8px_rgba(158,255,0,0.8)]" />
              )}
              
              {/* Hover underline (Neon Yeşil) */}
              <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-[#9eff00] scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100 shadow-[0_0_5px_rgba(158,255,0,0.5)]" />
            </Link>
          </li>
        ))}
      </ul>

      {/* ── Auth / CTA ── */}
      <div className="hidden md:flex items-center gap-4 shrink-0 font-mono text-xs uppercase tracking-widest">
        {isAuthenticated ? (
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-white transition-all hover:border-[#9eff00]/50 hover:text-[#9eff00]"
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="text-zinc-400 transition-colors hover:text-white"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-full bg-[#9eff00] text-black font-bold transition-all duration-300 hover:bg-[#b0ff33] hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(158,255,0,0.15)] hover:shadow-[0_0_25px_rgba(158,255,0,0.4)]"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}