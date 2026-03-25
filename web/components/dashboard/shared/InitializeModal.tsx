/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function InitializeModal({ isOpen, onClose, onCreated }: any) {
  const [form, setForm] = useState({ subdomain: "", target: "localhost:3000" });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          className="relative w-full max-w-md bg-[#0a0a0a] border border-miransas-cyan/30 p-8 rounded-[2rem] shadow-[0_0_50px_rgba(0,255,209,0.1)]"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-black italic text-white italic tracking-tighter">NEW_NEURAL_LINK</h2>
            <p className="text-[10px] text-miransas-cyan font-mono uppercase mt-1">Configure your exit node</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[9px] text-gray-500 uppercase font-mono ml-2">Subdomain Prefix</label>
              <input 
                type="text" placeholder="sazlab"
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-miransas-cyan outline-none focus:border-miransas-cyan/50 transition-all font-mono"
                onChange={(e) => setForm({...form, subdomain: e.target.value})}
              />
            </div>
            <div>
              <label className="text-[9px] text-gray-500 uppercase font-mono ml-2">Local Target Port</label>
              <input 
                type="text" placeholder="localhost:3000"
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-white/20 transition-all font-mono"
                onChange={(e) => setForm({...form, target: e.target.value})}
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button onClick={onClose} className="flex-1 py-4 text-[10px] font-bold text-gray-500 hover:text-white transition-colors">ABORT</button>
            <button 
              onClick={() => onCreated(form)}
              className="flex-1 py-4 bg-miransas-cyan text-black font-black italic rounded-xl shadow-[0_0_20px_rgba(0,255,209,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-xs"
            >
              INITIALIZE_LINK
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}