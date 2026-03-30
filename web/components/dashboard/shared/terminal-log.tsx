"use client";
import { useEffect, useState } from "react";
import { buildWsUrl } from "@/lib/binboi";

export default function TerminalLog() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<"connecting" | "live" | "offline">("connecting");

  useEffect(() => {
    const socket = new WebSocket(buildWsUrl("/ws/logs"));

    socket.onopen = () => setStatus("live");
    
    socket.onmessage = (event) => {
      setLogs((prev) => [event.data, ...prev].slice(0, 50));
    };

    socket.onerror = () => setStatus("offline");
    socket.onclose = () => setStatus("offline");

    return () => {
      if (socket.readyState === 1) socket.close();
    };
  }, []);

  return (
    <div className="bg-[#080808] mt-10 border border-white/10 rounded-xl p-6 font-mono text-[10px] h-64 overflow-y-auto shadow-inner">
      <div className="flex items-center gap-2 text-miransas-cyan mb-4 animate-pulse font-bold tracking-widest uppercase">
        <span className="h-1.5 w-1.5 bg-miransas-cyan rounded-full" />
        Live Neural Stream
      </div>
      <div className="mb-4 text-[10px] uppercase tracking-[0.2em] text-gray-600">
        {status === "live" ? "relay connected" : status === "connecting" ? "connecting" : "relay offline"}
      </div>
      <div className="space-y-2">
        {logs.map((log, i) => (
          <div key={i} className="text-gray-400 border-l border-white/5 pl-3">
            <span className="text-gray-600 mr-2 opacity-50">{new Date().toLocaleTimeString()}</span>
            <span className={log.includes("ERROR") ? "text-red-500" : ""}>{log}</span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-gray-700 italic opacity-50">
            {status === "offline" ? "Core acik degil. Relay baslatildiginda loglar burada gorunecek." : "Awaiting signals from the core..."}
          </div>
        )}
      </div>
    </div>
  );
}
