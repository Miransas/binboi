"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, Loader2 } from "lucide-react";

import { NAV_LINKS } from "@/constants";
import { buildLoginHref, buildRegisterHref } from "@/lib/auth-routing";

import { AssistantLauncher } from "./assistant-launcher";

const primaryNav = NAV_LINKS.slice(0, 5);

function getUserBadge(name?: string | null, email?: string | null) {
  const base = (name || email || "User").trim();
  const words = base.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "BU";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const callbackUrl = pathname && pathname !== "/" ? pathname : null;
  const signedInLabel = session?.user?.name || session?.user?.email || "Binboi account";
  const badge = getUserBadge(session?.user?.name, session?.user?.email);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#050506]/78 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_0_30px_rgba(0,255,209,0.08)]">
              <Image
                src="/logo.png"
                alt="Binboi logo"
                fill
                sizes="40px"
                className="object-contain p-1.5 transition duration-300 group-hover:scale-105"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-[20px] font-semibold uppercase tracking-[0.26em] text-zinc-500">
                Binboi
              </h1>
              {/* <p className="text-base font-black tracking-tight text-white">
                Tunnel visibility for developers
              </p> */}
            </div>
          </Link>

          <nav className="hidden items-center gap-6 xl:flex">
            {primaryNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-zinc-400 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block md:w-[18rem] xl:w-[22rem]">
            <AssistantLauncher variant="site" storageKey="site-global" />
          </div>

          {status === "loading" ? (
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
              <Loader2 className="h-4 w-4 animate-spin text-miransas-cyan" />
            </div>
          ) : session ? (
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 sm:flex">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-xs font-semibold uppercase tracking-[0.18em] text-white">
                  {badge}
                </span>
                <div className="hidden min-w-0 lg:block">
                  <p className="truncate text-sm font-medium text-white">{signedInLabel}</p>
                  <p className="truncate text-xs text-zinc-500">{session.user?.email}</p>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.08]"
              >
                <LayoutDashboard className="h-4 w-4 text-miransas-cyan" />
                Dashboard
              </Link>
            </div>
          ) : (
            <>
              <Link
                href={buildLoginHref(callbackUrl)}
                className="hidden rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href={buildRegisterHref(callbackUrl)}
                className="inline-flex items-center rounded-full bg-miransas-cyan px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
