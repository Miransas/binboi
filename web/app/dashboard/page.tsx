/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { motion } from "framer-motion";
import { Activity, Globe, ShieldCheck, Terminal, Zap, ArrowUpRight, Copy, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function DashboardOverview() {
    // Örnek veriler (Bunları SWR veya Drizzle ile DB'den çekeceğiz)
    const mockTunnels = [
        { id: "tnl_1", name: "lost-signal-api", url: "https://sad.binboi.link", status: "online", traffic: "1.2 MB/s", port: 8080 },
        { id: "tnl_2", name: "worktio-webhook", url: "https://worktio.binboi.link", status: "online", traffic: "45 KB/s", port: 3000 },
        { id: "tnl_3", name: "test-env", url: "https://dev-sardor.binboi.link", status: "offline", traffic: "0 KB/s", port: 5173 },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">

            {/* 📝 Karşılama Başlığı */}
            <header className="mb-10 flex items-end justify-between">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
                    <p className="text-gray-400 text-sm mt-1">Monitor your active tunnels and network traffic.</p>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all"
                >
                    <Zap className="w-4 h-4 fill-black" /> New Tunnel
                </motion.button>
            </header>

            {/* 📊 İstatistik Kartları (Bento Style) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard icon={<Globe />} title="Active Tunnels" value="2" trend="+1 this week" color="text-miransas-cyan" />
                <StatCard icon={<Activity />} title="Total Traffic (24h)" value="14.2 GB" trend="High load" color="text-miransas-magenta" />
                <StatCard icon={<ShieldCheck />} title="Blocked Threats" value="1,402" trend="WAF active" color="text-green-400" />
            </div>

            {/* 🚀 CLI Hızlı Başlangıç Kutusu */}
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="mb-10 bg-[#0e0e0e] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
            >
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                        <Terminal className="w-5 h-5 text-gray-400" /> Start from CLI
                    </h3>
                    <p className="text-sm text-gray-500">Run this command in your terminal to instantly expose port 3000.</p>
                </div>
                <div className="flex items-center gap-3 bg-[#161616] border border-white/5 p-2 pr-4 rounded-xl w-full md:w-auto">
                    <div className="px-3 py-1.5 bg-black rounded-lg border border-white/5 font-mono text-sm text-miransas-cyan">
                        binboi http 3000
                    </div>
                    <button className="text-gray-400 hover:text-white transition-colors p-2" title="Copy command">
                        <Copy className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>

            {/* 🟢 Aktif Tüneller Tablosu */}
            <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-[#0e0e0e] border border-white/10 rounded-2xl overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-white/10 bg-[#111] flex justify-between items-center">
                    <h3 className="font-bold text-white">Endpoints</h3>
                    <Link href="/dashboard/tunnels" className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                        View all <ArrowUpRight className="w-3 h-3" />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-[#0a0a0a] border-b border-white/5">
                            <tr>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">URL</th>
                                <th className="px-6 py-3 font-medium">Local Target</th>
                                <th className="px-6 py-3 font-medium">Traffic</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockTunnels.map((tunnel) => (
                                <tr key={tunnel.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`relative flex h-2.5 w-2.5`}>
                                                {tunnel.status === 'online' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-miransas-cyan opacity-75"></span>}
                                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${tunnel.status === 'online' ? 'bg-miransas-cyan' : 'bg-gray-600'}`}></span>
                                            </span>
                                            <span className="text-gray-300 capitalize text-xs">{tunnel.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-white">
                                        <a href={tunnel.url} target="_blank" className="hover:text-miransas-cyan transition-colors hover:underline underline-offset-4 decoration-white/20">
                                            {tunnel.url.replace('https://', '')}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-gray-400 text-xs">
                                        localhost:{tunnel.port}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                                        {tunnel.traffic}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                            <MoreHorizontal className="w-5 h-5 ml-auto" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

        </div>
    );
}

// Alt Bileşen: İstatistik Kartı
function StatCard({ icon, title, value, trend, color }: { icon: React.ReactNode, title: string, value: string, trend: string, color: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0e0e0e] border border-white/10 rounded-2xl p-6 flex flex-col justify-between"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl bg-white/5 ${color} border border-white/5`}>
                    {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" } as any)}
                </div>
                <span className="text-xs font-mono text-gray-500">{trend}</span>
            </div>
            <div>
                <h4 className="text-gray-400 text-sm mb-1">{title}</h4>
                <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
            </div>
        </motion.div>
    );
}