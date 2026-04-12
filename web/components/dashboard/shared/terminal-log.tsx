"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, RadioTower, ShieldAlert } from "lucide-react";

import { DashboardSurface, DashboardTimeline } from "@/components/dashboard/shared/dashboard-primitives";
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

  const logLevels = useMemo(() => {
    const levels = logs.flatMap((entry) => {
      if (entry.includes("ERROR")) return ["ERROR"];
      if (entry.includes("WARN")) return ["WARN"];
      if (entry.includes("INFO")) return ["INFO"];
      return [];
    });
    return Array.from(new Set(levels));
  }, [logs]);

  const timelineItems = [
    {
      label: "Socket",
      title:
        status === "live"
          ? "WebSocket log stream connected"
          : status === "connecting"
            ? "Connecting to relay event stream"
            : "Relay event stream offline",
      description:
        status === "live"
          ? "The relay is actively pushing event logs into the dashboard."
          : status === "connecting"
            ? "Waiting for the relay log endpoint to accept the WebSocket connection."
            : "The UI is still usable, but live relay visibility is temporarily unavailable.",
      status:
        status === "live" ? "complete" : status === "connecting" ? "active" : "error",
      meta: status,
    },
    {
      label: "Levels",
      title: logLevels.length ? `${logLevels.join(" / ")} detected` : "Waiting for log levels",
      description:
        logLevels.length > 0
          ? "Binboi is classifying the current stream so the assistant can reason over recent events."
          : "Once the relay emits messages, the dashboard will surface INFO, WARN, and ERROR patterns here.",
      status: logLevels.length > 0 ? "complete" : "waiting",
      meta: `${logLevels.length} types`,
    },
  ] as const;

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(22rem,0.82fr)]">
      <DashboardSurface accent="cyan" className="p-0">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Relay event stream
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">Live logs and runtime clues</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
            <span
              className={`h-2 w-2 rounded-full ${
                status === "live"
                  ? "bg-miransas-cyan shadow-[0_0_12px_rgba(0,255,209,0.65)]"
                  : status === "connecting"
                    ? "bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.42)]"
                    : "bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.42)]"
              }`}
            />
            {status}
          </div>
        </div>

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-4">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              <RadioTower className="h-3.5 w-3.5 text-miransas-cyan" />
              Stream state
            </div>
            <p className="mt-3 text-sm font-medium text-white">{status}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-4">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              <Activity className="h-3.5 w-3.5 text-violet-200" />
              Recent entries
            </div>
            <p className="mt-3 text-sm font-medium text-white">{logs.length}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-4">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-200" />
              Levels
            </div>
            <p className="mt-3 text-sm font-medium text-white">{logLevels.join(", ") || "None yet"}</p>
          </div>
        </div>

        <div className="custom-scrollbar h-72 overflow-y-auto border-t border-white/10 px-6 py-5 font-mono text-[11px]">
          <div className="space-y-3">
            {logs.map((log, index) => (
              <div key={`${log}-${index}`} className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-zinc-300">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-zinc-600">
                  <span>{new Date().toLocaleTimeString()}</span>
                  {log.includes("ERROR") ? <span className="text-rose-300">error</span> : null}
                  {log.includes("WARN") ? <span className="text-amber-200">warn</span> : null}
                  {log.includes("INFO") ? <span className="text-miransas-cyan">info</span> : null}
                </div>
                <p className="mt-2 leading-6">{log}</p>
              </div>
            ))}

            {logs.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 px-4 py-8 text-center text-sm leading-7 text-zinc-500">
                {status === "offline"
                  ? "The relay is offline. Event logs will appear here again when the core becomes reachable."
                  : "Awaiting signals from the relay..."}
              </div>
            ) : null}
          </div>
        </div>
      </DashboardSurface>

      <DashboardTimeline
        eyebrow="Runtime timeline"
        title="How the relay log stream is behaving"
        items={timelineItems}
      />
    </div>
  );
}
