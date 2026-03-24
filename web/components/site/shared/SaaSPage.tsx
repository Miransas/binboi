/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants, cubicBezier } from 'framer-motion';
import { ArrowRight, Zap, Globe, ShieldCheck, Activity, Lock, TerminalSquare, Cpu } from 'lucide-react';

// ==========================================
// 1. GLOBAL ANİMASYON VARYANTLARI
// ==========================================
const transition = { duration: 0.8, ease: cubicBezier(0.16, 1, 0.3, 1) };

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition }
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

// ==========================================
// 2. KUSURSUZ MATEMATİK VE AĞ SENARYOSU ALGORİTMASI
// ==========================================
// Binboi Network Modülleri (Miransas Renk Paleti Entegreli)
const MODULES = [
    { id: 'routing', label: 'L7 Routing', color: '#00ffd1', angle: 135 }, // Miransas Cyan
    { id: 'waf', label: 'WAF Shield', color: '#ff00ff', angle: 225 },     // Miransas Magenta
    { id: 'ratelimit', label: 'Rate Limit', color: '#f59e0b', angle: 315 },
    { id: 'headers', label: 'Mod Headers', color: '#a855f7', angle: 45 },
    { id: 'tls', label: 'TLS Term', color: '#10b981', angle: 90 },
    { id: 'tcp', label: 'TCP Proxy', color: '#3b82f6', angle: 180 },
    { id: 'compression', label: 'Brotli', color: '#ec4899', angle: 270 },
];

const SLOTS = [
    { id: 'top', y: 135, portY: 180 }, 
    { id: 'mid', y: 255, portY: 300 }, 
    { id: 'bot', y: 375, portY: 420 }, 
];

const LAYOUTS = [
    [1],       
    [0, 2],    
    [0, 1, 2], 
    [0],       
    [2],       
];

const generateRandomScenario = (prevModuleId: string | null = null) => {
    const availableModules = MODULES.filter(m => m.id !== prevModuleId);
    const randomModule = availableModules[Math.floor(Math.random() * availableModules.length)];
    const layoutIndexes = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)];

    const nodes: any[] = [];
    const paths: any[] = [];

    layoutIndexes.forEach((slotIndex, i) => {
        const slot = SLOTS[slotIndex];

        nodes.push({
            id: `node-${slot.id}-${Date.now()}`,
            title: `Execute ${randomModule.label}`,
            sub: `Port ${Math.floor(Math.random() * 8000) + 1000} tunneling...`,
            x: 520,
            y: slot.y,
            delay: i * 0.1 
        });

        paths.push({
            id: `in-${slot.id}-${Date.now()}`,
            d: `M 300 280 C 410 280, 410 ${slot.portY}, 520 ${slot.portY}`,
            delay: Math.random() * 0.4 
        });

        paths.push({
            id: `out-${slot.id}-${Date.now()}`,
            d: slot.portY === 300
                ? `M 780 300 L 850 300`
                : `M 780 ${slot.portY} C 820 ${slot.portY}, 810 300, 850 300`,
            delay: Math.random() * 0.4 + 0.3 
        });
    });

    // Terminal Logları Ağa Göre Uyarlandı
    const logs = [
        `Incoming request via ${randomModule.label}...`,
        `> Authenticating tunnel identity`,
        `> Bypassing NAT and Firewalls...`,
        `Success! Tunneled ${Math.floor(Math.random() * 120) + 10}ms to localhost. ⚡`
    ];

    return {
        key: Date.now().toString(),
        module: randomModule,
        nodes,
        paths,
        logs
    };
};

// ==========================================
// 3. DONANIM BİLEŞENLERİ
// ==========================================

function GlowingWire({ path, color, delay }: { path: string, color: string, delay: number }) {
    return (
        <g>
            <path d={path} stroke="#1a1a1c" strokeWidth={16} fill="none" strokeLinecap="round" style={{ filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.8))' }} />
            <path d={path} stroke="#2c2c30" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />
            <motion.path
                d={path} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="80 500"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1], strokeDashoffset: [0, -1000] }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { delay: delay, duration: 0.3 }, strokeDashoffset: { duration: 2.5 + Math.random(), repeat: Infinity, ease: 'linear' } }}
                style={{ filter: `drop-shadow(0 0 15px ${color}) drop-shadow(0 0 30px ${color})` }}
            />
        </g>
    );
}

function ModuleBox({ id, label, angle, isActive, color }: { id: string, label: string, angle: number, isActive: boolean, color: string }) {
    const renderIcon = () => {
        if (id === 'routing') return <Globe className="w-6 h-6" />;
        if (id === 'waf') return <ShieldCheck className="w-6 h-6" />;
        if (id === 'ratelimit') return <Activity className="w-6 h-6" />;
        if (id === 'headers') return <TerminalSquare className="w-6 h-6" />;
        if (id === 'tls') return <Lock className="w-6 h-6" />;
        if (id === 'tcp') return <Cpu className="w-6 h-6" />;
        return <Zap className="w-6 h-6" />;
    };

    return (
        <div
            className="absolute top-1/2 left-1/2 transition-all duration-700 ease-in-out"
            style={{
                transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                zIndex: isActive ? 30 : 10,
                opacity: isActive ? 1 : 0.2,
                filter: isActive ? 'none' : 'grayscale(100%) brightness(30%)'
            }}
        >
            <div className="relative" style={{ transform: `translateX(${isActive ? '190px' : '170px'})` }}>
                <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 flex flex-col gap-[4px] z-0 drop-shadow-md">
                    <div className="w-5 h-[3px] bg-gradient-to-r from-gray-600 to-gray-300 rounded-sm"></div>
                    <div className="w-5 h-[3px] bg-gradient-to-r from-gray-600 to-gray-300 rounded-sm"></div>
                    <div className="w-5 h-[3px] bg-gradient-to-r from-gray-600 to-gray-300 rounded-sm"></div>
                </div>

                <div style={{ transform: `rotate(${-angle}deg)` }} className="flex flex-col items-center">
                    <div
                        className="relative w-16 h-16 bg-[#0a0a0a] border border-[#2c2c30] rounded-2xl flex items-center justify-center shadow-[0_15px_30px_rgba(0,0,0,0.9),inset_0_2px_2px_rgba(255,255,255,0.1)] z-10"
                        style={{ boxShadow: isActive ? `0 0 30px ${color}60, inset 0 2px 2px rgba(255,255,255,0.2)` : '' }}
                    >
                        <div style={{ color: isActive ? color : '#666', filter: isActive ? `drop-shadow(0 0 12px ${color})` : 'none' }}>
                            {renderIcon()}
                        </div>
                    </div>
                    <div className="mt-3 bg-[#050505] border border-white/10 px-3 py-1.5 rounded-lg shadow-xl">
                        <span className="font-mono text-[10px] text-gray-300 font-bold tracking-widest uppercase">{label}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProcessNode({ node }: { node: any }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            transition={{ duration: 0.4, delay: node.delay, type: 'spring' }}
            className="absolute w-[260px] h-[90px] bg-[#0d0d0d] border border-white/10 rounded-xl flex flex-col justify-center px-6 shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_2px_3px_rgba(255,255,255,0.05)] z-10 overflow-hidden"
            style={{ left: node.x, top: node.y }}
        >
            <div className="absolute top-0 left-0 w-full h-[18px] opacity-20 border-b border-black/50" style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '5px 5px' }}></div>
            <div className="absolute bottom-0 left-0 w-full h-[18px] opacity-20 border-t border-black/50" style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '5px 5px' }}></div>

            <div className="absolute left-[-9px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] bg-[#050505] border-2 border-gray-500 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] z-20"></div>
            <div className="absolute right-[-9px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] bg-[#050505] border-2 border-gray-500 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] z-20"></div>

            <h4 className="text-base font-bold text-white z-10 relative tracking-tight">{node.title}</h4>
            <p className="text-[10px] text-miransas-cyan font-mono mt-1 bg-black/80 p-1.5 rounded-md border border-white/5 shadow-inner truncate z-10 relative">{node.sub}</p>
        </motion.div>
    );
}

// ==========================================
// 4. ANA SAYFA & UYGULAMA
// ==========================================
export default function HeroBinboiEngine() {
    const [scenario, setScenario] = useState(generateRandomScenario());

    useEffect(() => {
        const timer = setInterval(() => {
            setScenario(prev => generateRandomScenario(prev.module.id));
        }, 4000); // 4 saniyede bir yeni tünel akışı
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#060606] text-[#ededed] selection:bg-miransas-cyan/30 font-sans overflow-x-hidden">

            {/* Arka plan ışıklandırmasına Miransas dokunuşu */}
            <section className="relative w-full min-h-screen pt-32 pb-32 flex flex-col items-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-miransas-cyan/10 via-[#060606] to-[#060606]">

                {/* --- HEADER TEXT --- */}
                <div className="text-center max-w-5xl px-6 relative z-10 mb-16">
                    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-mono tracking-widest text-gray-300 backdrop-blur-md mb-8 shadow-lg uppercase">
                        <span className="relative flex h-2 w-2">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-miransas-cyan opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-2 w-2 bg-miransas-cyan"></span>
                        </span>
                        Binboi Node v0.2.0
                    </motion.div>
                    
                    <motion.h1 variants={staggerContainer} initial="hidden" animate="visible" className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.95] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-500 mb-8">
                        EXPOSE YOUR <br /> LOCAL WORLD.
                    </motion.h1>
                    
                    <motion.p variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
                        Hyper-speed introspection tunnels for modern engineers. Securely bypass NATs, firewalls, and route traffic to your localhost instantly.
                    </motion.p>
                </div>

                {/* --- KUSURSUZ MOTOR ANİMASYONU --- */}
                <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className="relative w-full max-w-7xl h-[600px] flex items-center justify-center mt-10">
                    <div className="relative w-[1200px] h-[600px] transform md:scale-100 scale-[0.5] sm:scale-75 origin-top">

                        {/* 🟢 SVG KABLOLARI */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1200 600">
                            <AnimatePresence mode="wait">
                                <motion.g key={scenario.key}>
                                    {scenario.paths.map((pathObj) => (
                                        <GlowingWire key={pathObj.id} path={pathObj.d} color={scenario.module.color} delay={pathObj.delay} />
                                    ))}
                                </motion.g>
                            </AnimatePresence>
                        </svg>

                        {/* SOL MOTOR ÜNİTESİ (BINBOI CORE) */}
                        <div className="absolute left-[40px] top-[150px] w-[260px] h-[260px] z-10 flex items-center justify-center">
                            {/* Dinamik Renkli Arka Plan Parlaması */}
                            <div className="absolute inset-0 rounded-full transition-colors duration-1000 blur-[80px] opacity-30 z-[-1] pointer-events-none" style={{ backgroundColor: scenario.module.color }}></div>

                            <div className="absolute w-[450px] h-[450px] border border-white/[0.05] rounded-full pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
                            <div className="absolute w-[600px] h-[600px] border border-white/[0.02] rounded-full pointer-events-none"></div>

                            {/* Etrafında dönen Network Modülleri */}
                            {MODULES.map(m => (
                                <ModuleBox key={m.id} id={m.id} label={m.label} angle={m.angle} isActive={scenario.module.id === m.id} color={m.color} />
                            ))}

                            {/* Merkez "B" Logosu ve Çekirdek */}
                            <div className="relative w-[220px] h-[220px] rounded-[60px] flex items-center justify-center bg-[#0a0a0a] border border-[#2a2a2e] overflow-hidden z-20"
                                style={{ boxShadow: 'inset 2px 2px 4px rgba(255, 255, 255, 0.1), inset -4px -4px 10px rgba(0, 0, 0, 0.9), 0 30px 60px rgba(0,0,0,0.95)' }}>
                                <div className="absolute inset-0 opacity-[0.2] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

                                {/* Çekirdek Dönen Işıklar (Miransas Cyan / Magenta yapıldı) */}
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="absolute w-[160px] h-[160px] z-10">
                                    {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                                        <div key={i} className="absolute top-1/2 left-1/2 flex flex-col items-center" style={{ transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-55px)` }}>
                                            <div className="w-5 h-3 rounded-sm bg-gradient-to-b from-[#00ffd1] to-[#ff00ff] shadow-[0_0_20px_#00ffd1] z-20"></div>
                                            <div className="w-6 h-5 bg-gradient-to-b from-[#111] to-[#000] rounded-b-lg border border-[#333] border-t-0 shadow-inner mt-[-1px] z-10"></div>
                                        </div>
                                    ))}
                                </motion.div>

                                {/* Binboi "B" Harfi */}
                                <span className="absolute z-30 text-8xl font-black italic text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">B</span>
                                
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none mix-blend-overlay rounded-[60px]"></div>
                            </div>

                            <div className="absolute right-[-2px] top-1/2 transform -translate-y-1/2 flex items-center z-0 drop-shadow-xl">
                                <div className="w-[26px] h-[20px] bg-[#1a1a1c] border border-[#444] rounded-r-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"></div>
                                <div className="absolute right-[-5px] w-[7px] h-[26px] bg-gradient-to-b from-miransas-cyan to-miransas-magenta rounded-[2px] shadow-[0_0_10px_#00ffd1] z-10"></div>
                            </div>
                        </div>

                        {/* RASTGELE KUTULAR (Ağ İşlemleri) */}
                        <AnimatePresence mode="wait">
                            <motion.div key={scenario.key}>
                                {scenario.nodes.map((node) => (
                                    <ProcessNode key={node.id} node={node} />
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        {/* SAĞ TERMİNAL (Canlı Loglar) */}
                        <div className="absolute left-[850px] top-[140px] w-[300px] h-[320px] bg-[#0c0c0e] border border-[#222] rounded-2xl p-6 flex flex-col z-10 shadow-[0_40px_80px_rgba(0,0,0,0.9),inset_0_2px_10px_rgba(0,0,0,0.8)] overflow-hidden">
                            <div className="absolute left-[-10px] top-[160px] w-[20px] h-[20px] bg-[#050505] border-2 border-gray-600 rounded-full z-20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]"></div>

                            <div className="flex gap-2.5 mb-5 border-b border-[#222]/50 pb-4">
                                <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
                                <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
                                <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-[#1aab29] shadow-[0_0_10px_#27c93f]"></div>
                            </div>

                            <div className="flex-1 overflow-hidden font-mono text-xs leading-relaxed">
                                <AnimatePresence mode="wait">
                                    <motion.div key={scenario.key} initial="hidden" animate="visible" exit="exit" variants={{ visible: { transition: { staggerChildren: 0.1 } }, exit: { opacity: 0 } }} className="flex flex-col gap-2">
                                        <p className="text-gray-600 mb-2">root@binboi:~# tail -f /var/log/tunnels</p>
                                        {scenario.logs.map((log, index) => (
                                            <motion.p key={index} variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} className={`${index === 0 ? 'text-gray-300 font-bold' : (index === scenario.logs.length - 1 ? 'text-miransas-cyan mt-3 font-bold' : 'text-gray-500')}`}>
                                                {log}
                                            </motion.p>
                                        ))}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                    </div>
                </motion.div>
            </section>

            {/* --- EKLENTİ İÇERİK (Features) --- */}
            <section className="w-full py-32 bg-[#060606] relative z-20 border-t border-white/5">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-4xl font-bold mb-16 text-center italic tracking-tight">Engineered for the Edge</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: <Zap className="w-8 h-8" />, title: "Sub-millisecond routing", desc: "Built with Go and Rust for instantaneous data tunneling." },
                            { icon: <Globe className="w-8 h-8" />, title: "NAT & Firewall Bypass", desc: "Expose any local port to the public web safely and instantly." },
                            { icon: <Lock className="w-8 h-8" />, title: "Bank-grade security", desc: "End-to-end encryption with dynamic WAF and Rate Limiting." },
                        ].map((item, i) => (
                            <motion.div key={i} whileHover={{ y: -10 }} className="bg-[#0a0a0c] border border-white/10 p-10 rounded-3xl shadow-2xl hover:shadow-[0_20px_40px_rgba(0,255,209,0.1)] transition-all group">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-gray-400 group-hover:text-miransas-cyan transition-colors">{item.icon}</div>
                                <h3 className="text-2xl font-bold mb-3 text-white">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}