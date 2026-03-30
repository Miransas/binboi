/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { DASHBOARD_LINKS } from "../../../constants";


// İkon eşleştirme (Constants'tan gelen stringleri icon'a çeviriyoruz)


// Senin constants/index.ts dosyan (Örnek)


export default function DashboardSidebar({ user }: { user: any }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ width: 256 }}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative h-screen bg-[#0a0a0a] border-r border-white/5 flex flex-col z-50 shrink-0"
    >
      {/* 🚀 Collapse/Expand Butonu */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-[#1a1a1a] border border-white/10 rounded-full p-1.5 text-gray-400 hover:text-white hover:border-miransas-cyan transition-colors z-50"
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* 🟢 Logo Alanı */}
      <div className="h-16 flex items-center px-6 border-b border-white/5 overflow-hidden">
        <Link href="/" className="flex items-center gap-3 group whitespace-nowrap">
          <div className="">
           <img src="/logo.png" alt="Binboi logo" className="w-18" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-black italic text-xl tracking-tighter text-white"
              >
                BIN<span className="text-miransas-cyan">BOI</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* 🧭 Navigasyon Menüsü */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden no-scrollbar">
        {DASHBOARD_LINKS.map((section) => (
          <div key={section.title} className="space-y-2">

            {/* SECTION TITLE */}
            {!isCollapsed && (
              <div className="text-[10px] uppercase text-gray-500 px-3 mb-1">
                {section.title}
              </div>
            )}

            {/* ITEMS */}
            {section.items.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap
          ${isActive
                      ? 'bg-miransas-cyan/10 text-miransas-cyan border border-miransas-cyan/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  title={isCollapsed ? link.label : ""}
                >
                  <div className={isActive ? "text-miransas-cyan" : "text-gray-500"}>
                    {Icon && <Icon size={18} />}
                  </div>

                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="overflow-hidden flex-1"
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* BADGE */}
                  {!isCollapsed && link.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* 👤 Kullanıcı Profil Alanı (En Alt) */}
      <div className="p-4 border-t border-white/5 overflow-hidden whitespace-nowrap">
        <div className={`flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 transition-all ${isCollapsed ? 'p-2 justify-center' : 'p-3'}`}>
          <img
            src={user?.image || "https://github.com/ghost.png"}
            alt="User Avatar"
            className="w-8 h-8 rounded-full border border-white/10 shrink-0"
          />

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col flex-1 overflow-hidden"
              >
                <span className="text-xs font-bold text-white truncate">{user?.name}</span>
                <span className="text-[10px] text-gray-500 font-mono truncate">{user?.email}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Çıkış Butonu */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className={`mt-2 flex items-center gap-2 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors w-full
            ${isCollapsed ? 'justify-center px-0' : 'px-3 justify-start'}`}
          title={isCollapsed ? "Sign Out" : ""}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

    </motion.aside>
  );
}
