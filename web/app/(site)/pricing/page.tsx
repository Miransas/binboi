"use client";
import { Check, Zap, Shield, Cpu } from "lucide-react";
import { NeuralButton } from "@/components/ui/neutral-button";
import { motion } from "framer-motion";

const tiers = [
  { name: "Lite_Node", price: "$0", desc: "For independent explorers", features: ["1 Active Tunnel", "Random Subdomain", "Basic Latency", "Community Support"] },
  { name: "Neural_Link", price: "$12", desc: "Professional grade tunneling", features: ["10 Active Tunnels", "Custom Subdomains", "Global Relay Nodes", "Priority Traffic"], featured: true },
  { name: "Enterprise_Core", price: "Custom", desc: "Unrestricted neural access", features: ["Unlimited Tunnels", "Wildcard Domains", "Dedicated IP", "24/7 Core Support"] },
];

export default function PricingPage() {
  return (
    <div className="pt-32 pb-20 bg-black min-h-screen text-white px-6">
      <div className="max-w-6xl mx-auto text-center mb-20">
        <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-4">Neural_Plans</h1>
        <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.4em]">Choose your access level to the Miransas network</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {tiers.map((tier, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-10 rounded-3xl border ${tier.featured ? 'border-miransas-cyan bg-miransas-cyan/5 shadow-[0_0_40px_rgba(0,255,209,0.1)]' : 'border-white/5 bg-[#080808]'} flex flex-col`}
          >
            <h3 className="text-xl font-black italic uppercase mb-2">{tier.name}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black italic">{tier.price}</span>
              {tier.price !== "Custom" && <span className="text-gray-600 text-xs uppercase font-bold">/Month</span>}
            </div>
            <p className="text-gray-500 text-xs mb-8 font-mono italic">{tier.desc}</p>
            
            <ul className="space-y-4 mb-10 flex-1">
              {tier.features.map((f, idx) => (
                <li key={idx} className="flex items-center gap-3 text-[11px] font-bold text-gray-400 uppercase">
                  <Check size={14} className="text-miransas-cyan" /> {f}
                </li>
              ))}
            </ul>

            <NeuralButton className="w-full justify-center">Initiate_Access</NeuralButton>
          </motion.div>
        ))}
      </div>
    </div>
  );
}