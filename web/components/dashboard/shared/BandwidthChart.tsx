/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useId, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function BandwidthChart({ currentUsage }: { currentUsage: number }) {
  const [data, setData] = useState<{ time: string; usage: number }[]>([]);
  const [mounted, setMounted] = useState(false);
  const gradientId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    setData((prevData) => {
      const next = [...prevData, { time: timeStr, usage: currentUsage }];
      return next.length > 12 ? next.slice(1) : next;
    });
  }, [currentUsage]);

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(0,0,0,0.16))] p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,255,209,0.15),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.12),transparent_34%)]" />
      <div className="relative z-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Live throughput
            </h3>
            <p className="mt-2 text-3xl font-black tracking-tight text-white">
              {currentUsage.toFixed(1)} <span className="text-base text-miransas-cyan">KB/s</span>
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            12-point live sample
          </div>
        </div>

        <div className="mt-6 h-[220px]">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ffd1" stopOpacity={0.42} />
                    <stop offset="95%" stopColor="#00ffd1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="usage"
                  stroke="#00ffd1"
                  strokeWidth={2.25}
                  fillOpacity={1}
                  fill={`url(#${gradientId})`}
                  isAnimationActive={false}
                />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#090b10",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    fontSize: "11px",
                    boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
                  }}
                  itemStyle={{ color: "#00ffd1" }}
                  labelStyle={{ color: "#a1a1aa" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full rounded-[1.5rem] border border-white/10 bg-black/20" />
          )}
        </div>
      </div>
    </div>
  );
}
