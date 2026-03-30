"use client";

import { motion } from "framer-motion";
import { Type, Info, Code2, Terminal } from "lucide-react";
import { BorderBeam } from "../../../components/ui/border-beam";

export default function TypographyShowcase() {
  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-20 px-6 font-mono">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="mb-20 border-b border-white/5 pb-10">
          <h1 className="text-7xl font-black italic tracking-tighter uppercase mb-4">
            Type<span className="text-miransas-cyan">_</span>Specimen
          </h1>
          <p className="text-gray-500 text-xs tracking-[0.4em] uppercase">The Neural Visual Language of Binboi Core</p>
        </header>

        {/* 1. Font Families */}
        <section className="mb-24">
          <h2 className="text-[10px] font-black text-miransas-cyan uppercase tracking-[0.5em] mb-10 flex items-center gap-2">
            <Type size={14} /> 01. Font_Families
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
           
              <p className="text-[10px] text-gray-600 mb-4 font-bold uppercase tracking-widest">Primary: Geist / Inter</p>
              <p className="text-4xl font-sans leading-tight">The quick brown fox jumps over the lazy dog.</p>
              <code className="block mt-6 text-[10px] text-miransas-cyan">font-sans</code>
            </div>
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
              <p className="text-[10px] text-gray-600 mb-4 font-bold uppercase tracking-widest">Secondary: JetBrains Mono</p>
              <p className="text-3xl font-mono leading-tight">The quick brown fox jumps over the lazy dog.</p>
              <code className="block mt-6 text-[10px] text-miransas-cyan">font-mono</code>
            </div>
          </div>
        </section>

        {/* 2. Heading Scale */}
        <section className="mb-24">
          <h2 className="text-[10px] font-black text-miransas-cyan uppercase tracking-[0.5em] mb-10 flex items-center gap-2">
            <Info size={14} /> 02. Heading_Scale
          </h2>
          <div className="space-y-12">
            <div className="group">
              <p className="text-[9px] text-gray-700 mb-2 font-mono">H1 / HERO_TITLE</p>
              <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] group-hover:text-miransas-cyan transition-colors">Neural_Network</h1>
              <p className="mt-2 text-[10px] text-gray-500 italic">.text-7xl .font-black .italic .tracking-tighter</p>
            </div>
            <div className="group">
              <p className="text-[9px] text-gray-700 mb-2 font-mono">H2 / SECTION_TITLE</p>
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tight uppercase group-hover:text-miransas-cyan transition-colors">Command_Control</h2>
              <p className="mt-2 text-[10px] text-gray-500 italic">.text-4xl .font-black .italic .tracking-tight</p>
            </div>
            <div className="group">
              <p className="text-[9px] text-gray-700 mb-2 font-mono">H3 / CARD_TITLE</p>
              <h3 className="text-2xl font-black italic tracking-normal uppercase group-hover:text-miransas-cyan transition-colors">Local_Introspection</h3>
              <p className="mt-2 text-[10px] text-gray-500 italic">.text-2xl .font-black .italic</p>
            </div>
          </div>
        </section>

        {/* 3. Specialized Accents */}
        <section className="mb-24">
          <h2 className="text-[10px] font-black text-miransas-cyan uppercase tracking-[0.5em] mb-10 flex items-center gap-2">
            <Terminal size={14} /> 03. Specialized_Accents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <p className="text-[9px] text-gray-700 mb-4 font-mono">NEURAL_LABEL</p>
                <span className="font-mono text-[10px] font-bold tracking-[0.4em] uppercase text-miransas-cyan px-3 py-1 bg-miransas-cyan/10 border border-miransas-cyan/20 rounded">
                  Status: Operational
                </span>
              </div>
              <div>
                <p className="text-[9px] text-gray-700 mb-4 font-mono">PATH_LINK</p>
                <p className="font-mono text-xs text-gray-500 italic hover:text-white transition-colors cursor-pointer">
                  https://tunnel.binboi.link/v1/relay/asardor_node
                </p>
              </div>
            </div>
            <div className="p-8 bg-miransas-cyan/5 border border-miransas-cyan/10 rounded-3xl">
              <p className="text-[9px] text-miransas-cyan font-black uppercase mb-4 italic tracking-widest">Designer_Note</p>
              <p className="text-[13px] text-gray-400 leading-relaxed italic">
                Ustam, tipografideki ana kuralımız zıtlıktır. Başlıklar ne kadar <span className="text-white font-bold">sıkışık ve agresif</span> ise, teknik veriler o kadar <span className="text-white font-bold tracking-widest">ferah ve geniş</span> olmalıdır. Bu denge, Binboi&#39;nin siberpunk estetiğini korur.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Practical Example */}
        <section className="p-12 bg-white/[0.02] border border-white/10 rounded-[40px]">
          <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] mb-12 text-center">Live_Composition</h2>
          <div className="max-w-2xl mx-auto space-y-6 text-center">
            <span className="font-mono text-[10px] font-bold tracking-[0.5em] uppercase text-miransas-cyan">
              Initiating_Handshake
            </span>
            <h3 className="text-5xl font-black italic tracking-tighter uppercase">
              Secure_Your_Neural<br />Link_Today.
            </h3>
            <p className="text-sm text-gray-500 font-mono italic max-w-md mx-auto">
              The Binboi agent multiplexes your local traffic through encrypted Yamux streams.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}