"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { NAV_LINKS } from "@/constants";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Header() {


  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-miransas-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 bg-miransas-cyan rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,255,209,0.4)] group-hover:rotate-12 transition-transform">
            <span className="text-black font-black text-xl">B</span>
          </div>
          <span className="text-white font-black italic text-2xl tracking-tighter">
            BIN<span className="text-miransas-cyan">BOI</span>
          </span>
        </Link>

        {/* Navigation */}
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

        {/* Auth Actions */}
        <div className="flex items-center space-x-4">
       
        </div>
      </div>
    </header>
  );
}