"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Apple, 
  Clipboard, 
  Check, 
  Monitor, 
  Box, 
  PlayCircle 
} from "lucide-react";

const OS_OPTIONS = [
  { id: "macos", label: "macOS", icon: <Apple className="w-5 h-5" /> },
  { id: "windows", label: "Windows", icon: <Monitor className="w-5 h-5" /> },
  { id: "linux", label: "Linux", icon: <Box className="w-5 h-5" /> },
];

export default function SetupInstallation({ authToken }: { authToken: string }) {
  const [selectedOS, setSelectedOS] = useState("macos");
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = {
    macos: [
      { title: "Install via Homebrew", cmd: "brew install binboi/tap/binboi", desc: "Run this command to install the Binboi agent on your Mac." },
      { title: "Log in with an access token", cmd: `binboi login --token ${authToken}`, desc: "Connect the agent to your Binboi account." },
      { title: "Start your first tunnel", cmd: "binboi start 3000", desc: "Expose your local port 3000 to the world." }
    ],
    windows: [
      { title: "Install via Scoop", cmd: "scoop install binboi", desc: "Install the Binboi binary using Scoop package manager." },
      { title: "Log in with an access token", cmd: `binboi login --token ${authToken}`, desc: "Save your token to the local config file." },
      { title: "Start your first tunnel", cmd: "binboi start 80", desc: "Expose your local web server." }
    ],
    linux: [
      { title: "Install via Snap", cmd: "sudo snap install binboi", desc: "Universal Linux installation via Snapcraft." },
      { title: "Log in with an access token", cmd: `binboi login --token ${authToken}`, desc: "Configure your CLI for the Binboi relay." },
      { title: "Start your first tunnel", cmd: "binboi start 8080", desc: "Launch your HTTP tunnel." }
    ]
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-20">
      
      {/* 🏁 Karşılama Bölümü */}
      <section className="space-y-4">
        <h1 className="text-5xl font-black italic tracking-tighter text-white">Setup & Installation</h1>
        <p className="text-gray-500 text-lg max-w-2xl leading-relaxed">
          Binboi is your app’s front door: a tunnel relay, dashboard, and CLI flow that stays simple enough to self-host without losing product polish.
        </p>
      </section>

      {/* 💻 OS Seçim Menüsü */}
      <div className="flex flex-wrap gap-4 border-b border-white/5 pb-6">
        {OS_OPTIONS.map((os) => (
          <button
            key={os.id}
            onClick={() => setSelectedOS(os.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all ${
              selectedOS === os.id 
              ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
              : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {os.icon}
            {os.label}
          </button>
        ))}
      </div>

      {/* 🚀 Kurulum Adımları */}
      <div className="space-y-8 relative">
        <div className="absolute left-[27px] top-4 bottom-4 w-px bg-white/10 -z-10" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedOS}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-10"
          >
            {steps[selectedOS as keyof typeof steps].map((step, idx) => (
              <div key={idx} className="flex gap-8 group">
                {/* Adım Numarası */}
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#0d0d0d] border border-white/10 flex items-center justify-center text-lg font-black italic text-white group-hover:border-miransas-cyan transition-colors">
                  {idx + 1}
                </div>
                
                {/* Adım İçeriği */}
                <div className="flex-1 space-y-4 pt-2">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {idx === 2 && <PlayCircle className="w-5 h-5 text-miransas-cyan" />}
                      {step.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">{step.desc}</p>
                  </div>

                  <div className="relative group/cmd">
                    <div className="bg-black border border-white/5 rounded-xl p-4 font-mono text-sm text-miransas-cyan overflow-x-auto whitespace-nowrap scrollbar-hide">
                      <span className="text-gray-600 mr-3 select-none">$</span>
                      {step.cmd}
                    </div>
                    <button 
                      onClick={() => copyToClipboard(step.cmd, idx)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all opacity-0 group-hover/cmd:opacity-100"
                    >
                      {copiedStep === idx ? <Check className="w-4 h-4 text-green-500" /> : <Clipboard className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
