"use client";
import { motion } from "framer-motion";

interface NeuralButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function NeuralButton({ children, onClick, className }: NeuralButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative px-8 py-3 bg-transparent border border-miransas-cyan/30 text-miransas-cyan font-black italic text-xs uppercase rounded-xl overflow-hidden group transition-all hover:border-miransas-cyan hover:shadow-[0_0_20px_rgba(0,255,209,0.3)] ${className}`}
    >
      {/* Pulse Efekti Layer */}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 2, opacity: 0.1 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 bg-miransas-cyan rounded-full pointer-events-none"
      />
      
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}