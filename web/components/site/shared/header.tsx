/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { NAV_LINKS } from "@/constants";
import { useSession, signIn, signOut } from "next-auth/react";
import { LogOut, LayoutDashboard, Loader2,  } from "lucide-react";
import { BsGithub } from "react-icons/bs";
import { div } from "three/src/nodes/math/OperatorNode.js";

export default function Header() {
  // NextAuth
  const { data: session, status } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#060606]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Sol: Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <img 
            src="/logo.png" 
            alt="Binboi Logo"  
            className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
          />
          <span className="text-white font-black italic text-2xl tracking-tighter">
            BIN<span className="text-miransas-cyan">BOI</span>
          </span>
        </Link>

        {/* Orta: Navigation (Sadece masaüstünde) */}
        <nav className="hidden md:flex items-center space-x-8">
          {NAV_LINKS.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="text-sm font-medium text-gray-400 hover:text-miransas-cyan transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Sağ: Auth Actions */}
        <div className="flex items-center space-x-4">
          {status === "loading" ? (
            // Yükleniyor durumu (Skeleton / Spinner)
            <div className="flex items-center justify-center w-20">
              <Loader2 className="w-5 h-5 text-miransas-cyan animate-spin" />
            </div>
          ) : session ? (
            // Kullanıcı giriş yapmışsa
            <div className="flex items-center gap-4">
             

              {/* Dashboard Butonu */}
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              {/* Çıkış Yap Butonu */}
              {/* <button 
                onClick={() => signOut()} 
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button> */}
            </div>
          ) : (
            // Kullanıcı giriş yapmamışsa
            <div className="flex items-center gap-4">
              <button 
                onClick={() => signIn("github")} 
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Log in
              </button>
              <button 
                onClick={() => signIn("github")} 
                className="flex items-center gap-2 text-sm font-bold bg-miransas-cyan text-[#060606] px-5 py-2 rounded-lg hover:bg-[#00ffd1]/90 hover:shadow-[0_0_15px_rgba(0,255,209,0.4)] transition-all"
              >
                <BsGithub className="w-4 h-4" />
                Get Started
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}