"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Activity, ArrowRight, ShieldCheck, Globe } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
  latency: string;
}

export default function TrafficPolicy() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 📡 WebSocket Bağlantısı
    const socket = new WebSocket("ws://localhost:8080/ws/logs");

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    
    socket.onmessage = (event) => {
      // Örnek gelen veri formatı: "GET /api/v1/users 200 12ms"
      const rawData = event.data;
      const parts = rawData.split(" ");
      
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        method: parts[0] || "GET",
        path: parts[1] || "/",
        status: parseInt(parts[2]) || 200,
        latency: parts[3] || "0ms",
      };

      setLogs((prev) => [newLog, ...prev].slice(0, 50)); // Son 50 logu tut
    };

    return () => socket.close();
  }, []);

  return (
    <div className="bg-[#080808] border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full animate-pulse ${connected ? 'bg-miransas-cyan shadow-[0_0_10px_#00ffd1]' : 'bg-red-500'}`} />
          <h3 className="text-xl font-black italic tracking-tighter uppercase text-white">Neural_Traffic_Inspector</h3>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase">
          <span className="flex items-center gap-1"><Activity size={12} /> Live_Stream</span>
          <span className="text-gray-800">|</span>
          <span>Buffer: {logs.length}/50</span>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-white/[0.01] text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5">
        <div className="col-span-2 text-miransas-cyan">Timestamp</div>
        <div className="col-span-1 text-center">Method</div>
        <div className="col-span-5">Neural_Path</div>
        <div className="col-span-2 text-center">Status</div>
        <div className="col-span-2 text-right">Latency</div>
      </div>

      {/* Logs Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2" ref={scrollRef}>
        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20, backgroundColor: "rgba(0, 255, 209, 0.1)" }}
                animate={{ opacity: 1, x: 0, backgroundColor: "rgba(0, 0, 0, 0)" }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-12 gap-4 px-6 py-3 rounded-xl hover:bg-white/5 transition-colors items-center group font-mono"
              >
                <div className="col-span-2 text-[10px] text-gray-500">{log.timestamp}</div>
                
                <div className="col-span-1 flex justify-center">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                    log.method === 'POST' ? 'bg-purple-500/10 text-purple-400' : 'bg-miransas-cyan/10 text-miransas-cyan'
                  }`}>
                    {log.method}
                  </span>
                </div>

                <div className="col-span-5 text-xs text-gray-300 truncate italic">
                  {log.path}
                </div>

                <div className="col-span-2 flex justify-center">
                  <span className={`text-[10px] font-bold flex items-center gap-1 ${
                    log.status >= 400 ? 'text-red-500' : 'text-miransas-cyan'
                  }`}>
                    {log.status >= 400 ? '●' : '○'} {log.status}
                  </span>
                </div>

                <div className="col-span-2 text-right text-[10px] font-bold text-gray-600 group-hover:text-miransas-cyan transition-colors">
                  {log.latency}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {logs.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-40 text-gray-700 opacity-20 italic">
              <Terminal size={48} className="mb-4" />
              <p className="uppercase tracking-[0.3em] font-black text-xs">Waiting_for_Neural_Traffic...</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-black border-t border-white/5 flex justify-between items-center px-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[9px] text-gray-600 font-bold uppercase">
             <ShieldCheck size={12} className="text-miransas-cyan" /> Encryption: Active
          </div>
          <div className="flex items-center gap-2 text-[9px] text-gray-600 font-bold uppercase">
             <Globe size={12} /> Gateway: US-East-1
          </div>
        </div>
        <button 
          onClick={() => setLogs([])}
          className="text-[9px] font-black text-gray-600 hover:text-white uppercase transition-colors"
        >
          Clear_Buffer
        </button>
      </div>
    </div>
  );
}