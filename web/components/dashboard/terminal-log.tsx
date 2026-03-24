"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TerminalIcon, ChevronUpIcon, ChevronDownIcon, ZapIcon } from "lucide-react";

export default function TerminalLog({ logs }: { logs: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Yeni log geldiğinde otomatik aşağı kaydır
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-4 pointer-events-none">
      <div className="max-w-7xl mx-auto pointer-events-auto">
        <AnimatePresence>
          {/* Terminal Başlığı / Toggle Butonu */}
          <motion.div 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between bg-[#0a0a0a] border border-white/10 border-b-0 rounded-t-xl px-4 py-2 cursor-pointer hover:bg-white/5 transition-all group"
          >
            <div className="flex items-center gap-2">
              <TerminalIcon size={14} className="text-miransas-cyan" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase group-hover:text-white transition-colors">
                Neural_Link_Logs
              </span>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-miransas-cyan rounded-full animate-ping" />
                  <span className="text-[9px] text-miransas-cyan/60 font-mono italic">Listening...</span>
               </div>
               {isOpen ? <ChevronDownIcon size={14} /> : <ChevronUpIcon size={14} />}
            </div>
          </motion.div>

          {/* Kayan Log Alanı */}
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 250, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="relative bg-black border border-white/10 border-t-0 rounded-b-xl overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
            >
              {/* Border Beam Etkisi (Sadece Terminal Açıkken) */}
              <div className="absolute inset-0 p-[1px] rounded-b-xl overflow-hidden pointer-events-none">
                <div className="absolute inset-[-1000%] animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#00ffd1_0%,transparent_20%,transparent_80%,#00ffd1_100%)] opacity-30" />
              </div>

              <div 
                ref={scrollRef}
                className="relative h-full overflow-y-auto p-4 font-mono text-[11px] space-y-1.5 scrollbar-hide bg-[#050505]"
              >
                {logs.length === 0 ? (
                  <div className="text-gray-700 italic">Waiting for incoming signals...</div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="flex gap-3 border-l border-white/5 pl-2 hover:bg-white/[0.02] transition-colors">
                      <span className="text-miransas-cyan/40 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                      <span className="text-gray-300 leading-relaxed tracking-tight break-all">
                        <span className="text-miransas-cyan mr-1">❯</span> {log}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}