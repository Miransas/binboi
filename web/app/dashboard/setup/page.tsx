// components/dashboard/SetupInstallation.tsx
"use client";
import { Copy, Download, Terminal, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    title: "Download Neural Binary",
    description: "İşletim sistemine uygun Binboi CLI paketini indir ve sistem yoluna (PATH) ekle.",
    cmd: "curl -sL https://binboi.link/install.sh | bash",
    icon: <Download size={20} />
  },
  {
    title: "Authenticate Session",
    description: "Dashboard'dan aldığın 'Neural Access Token' ile terminalini mühürle.",
    cmd: "binboi auth binboi_live_xxxxxxxxxxxx",
    icon: <ShieldCheck size={20} />
  },
  {
    title: "Initiate Neural Link",
    description: "Yerel portunu dış dünyaya güvenli bir tünelle bağla.",
    cmd: "binboi start 3000",
    icon: <Terminal size={20} />
  }
];

export default function SetupInstallation() {
  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div className="max-w-5xl mx-10 space-y-6">
      <h2 className="text-3xl font-black italic text-white mb-8 tracking-tighter">
        SYSTEM_INIT<span className="text-miransas-cyan">_</span>SEQUENCE
      </h2>
      
      {steps.map((step, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="relative bg-[#080808] border border-white/5 p-8 rounded-3xl group hover:border-miransas-cyan/20 transition-all"
        >
          <div className="flex items-start gap-6">
            <div className="p-4 bg-miransas-cyan/5 rounded-2xl text-miransas-cyan border border-miransas-cyan/10">
              {step.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-black text-miransas-cyan bg-miransas-cyan/10 px-2 py-0.5 rounded">STEP_0{i+1}</span>
                <h3 className="text-xl font-bold text-white italic">{step.title}</h3>
              </div>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">{step.description}</p>
              
              <div className="bg-black/50 border border-white/5 p-4 rounded-xl flex justify-between items-center group/code hover:bg-black transition-colors">
                <code className="text-miransas-cyan font-mono text-sm">$ {step.cmd}</code>
                <button 
                  onClick={() => copyToClipboard(step.cmd)}
                  className="p-2 text-gray-600 hover:text-white transition-colors"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}