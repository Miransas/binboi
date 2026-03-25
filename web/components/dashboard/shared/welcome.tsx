"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Activity, 
  Zap, 
  ArrowUpRight, 
  Globe, 
  ShieldCheck, 
  Terminal, 
  Plus, 
  Key 
} from "lucide-react";

// Mock Data - Bunları ileride Go Backend + Drizzle'dan çekeceğiz
const STATS = [
  { label: "Active Tunnels", value: "3", icon: <Zap className="text-miransas-cyan" />, trend: "Running smoothly" },
  { label: "Total Requests (24h)", value: "1.2M", icon: <Activity className="text-miransas-magenta" />, trend: "+15.2%" },
  { label: "Data Transfer", value: "45.2 GB", icon: <ArrowUpRight className="text-purple-400" />, trend: "Avg: 1.8 GB/h" },
];

const TUNNELS = [
  { id: 1, name: "sazlab.binboi.link", target: "localhost:3000", status: "ACTIVE", region: "eu-central", latency: "12ms", color: "#00FFD1" },
  { id: 2, name: "api-v2.binboi.link", target: "localhost:8080", status: "ACTIVE", region: "us-east", latency: "45ms", color: "#FF00FF" },
  { id: 3, name: "demo-shop.binboi.link", target: "localhost:5000", status: "ACTIVE", region: "ap-southeast", latency: "68ms", color: "#A855F7" },
];

export default function DashboardWelcone() {
  return (
    <div className="p-6 lg:p-10 space-y-10">
      
      {/* 1. Üst Başlık ve Durum */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter">
            Welcome back, <span className="text-miransas-cyan">Sardor</span>
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">Neural Node Status: <span className="text-emerald-400">ONLINE</span></p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10 transition-all text-sm font-bold">
            <Key className="w-4 h-4" />
            New Token
          </button>
          <button className="flex items-center gap-2 bg-miransas-cyan text-black px-4 py-2 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(0,255,209,0.4)] transition-all text-sm">
            <Plus className="w-4 h-4" />
            Create Tunnel
          </button>
        </div>
      </div>

      {/* 2. Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STATS.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
              {stat.icon}
            </div>
            <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">{stat.label}</p>
            <h2 className="text-4xl font-black mt-2 tracking-tight">{stat.value}</h2>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-gray-400 font-mono">{stat.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. Ana Tünel Listesi & Yan Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Tünel Kartları (Sol Taraf) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-4 h-4" /> Active Neural Tunnels
            </h3>
          </div>
          
          {TUNNELS.map((tunnel, i) => (
            <motion.div 
              key={tunnel.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className="group relative p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 hover:border-white/20 transition-all flex items-center justify-between overflow-hidden"
            >
              {/* Sol taraftaki renkli şerit */}
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: tunnel.color }} />
              
              <div className="flex items-center gap-6">
                <div className="space-y-1">
                  <h4 className="text-xl font-bold text-white group-hover:text-miransas-cyan transition-colors">
                    {tunnel.name}
                  </h4>
                  <p className="text-sm text-gray-500 font-mono">
                    → {tunnel.target}
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-10">
                <div className="text-right">
                  <p className="text-[10px] text-gray-600 font-mono uppercase">Region</p>
                  <p className="text-xs font-bold text-gray-300">{tunnel.region}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-600 font-mono uppercase">Latency</p>
                  <p className="text-xs font-bold text-emerald-400">{tunnel.latency}</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-miransas-cyan">
                  {tunnel.status}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Yan Panel (Sağ Taraf) */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0d0d0d] border border-white/5 space-y-4">
            <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest">Recent Logs</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="text-[10px] font-mono border-l border-white/10 pl-3 py-1">
                  <span className="text-miransas-cyan">GET</span> /api/v1/users
                  <br />
                  <span className="text-gray-600">200 OK — 15ms</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-miransas-magenta/20 to-transparent border border-miransas-magenta/20">
            <ShieldCheck className="w-8 h-8 text-miransas-magenta mb-4" />
            <h4 className="font-bold text-sm">Security Node</h4>
            <p className="text-xs text-gray-500 mt-2">All traffic is encrypted with end-to-end TLS.</p>
          </div>
        </div>

      </div>
    </div>
  );
}