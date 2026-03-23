"use client";
import { motion } from "framer-motion";
import { ArrowLeft, Terminal } from "lucide-react";
import { signIn } from "next-auth/react";

import Link from "next/link";
import { BsGithub } from "react-icons/bs";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#060606] text-white font-sans overflow-hidden selection:bg-miransas-cyan/30">
      
      {/* 🌌 Arka Plan Glow Efektleri */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full overflow-hidden -z-10 pointer-events-none">
        <motion.div 
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-miransas-cyan/10 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] bg-[#a855f7]/10 blur-[150px] rounded-full"
        />
      </div>

      {/* 🔙 Ana Sayfaya Dönüş */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      {/* 📦 LOGIN KARTININ İSKELETİ */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md p-8 sm:p-12"
      >
        {/* Logo ve Başlık */}
        <div className="flex flex-col items-center text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-[#111] border border-white/10 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,255,209,0.15)] mb-6"
          >
            <span className="text-4xl font-black italic text-white">B</span>
          </motion.div>
          
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            Welcome to <span className="italic">BINBOI</span>
          </h1>
          <p className="text-sm text-gray-400">
            Log in to manage your introspection tunnels and API gateways.
          </p>
        </div>

        {/* 🚀 GITHUB LOGIN BUTONU */}
        <div className="flex flex-col gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="relative group w-full flex items-center justify-center gap-3 bg-white text-black px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] overflow-hidden"
          >
            {/* Buton içi parlama efekti */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            
            <BsGithub className="w-5 h-5" />
            Continue with GitHub
          </motion.button>

          {/* CLI ile kullanım ipucu */}
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col items-center gap-3">
            <span className="text-xs text-gray-600 font-mono uppercase tracking-widest">Developers First</span>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-white/5 rounded-lg text-xs text-gray-400 font-mono">
              <Terminal className="w-3.5 h-3.5 text-miransas-cyan" />
              npm install -g binboi
            </div>
          </div>
        </div>

        {/* Footer Linkleri */}
        <div className="mt-10 text-center text-[11px] text-gray-500">
          By connecting, you agree to our{" "}
          <Link href="/terms" className="text-gray-400 hover:text-white underline underline-offset-2 decoration-white/20 transition-colors">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-gray-400 hover:text-white underline underline-offset-2 decoration-white/20 transition-colors">Privacy Policy</Link>.
        </div>

      </motion.div>
    </div>
  );
}