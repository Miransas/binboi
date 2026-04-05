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
    <div className="relative overflow-hidden rounded-xl border border-white/8 bg-[#0d0f12] p-5">
      <div className="relative">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              Live throughput
            </h3>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
              {currentUsage.toFixed(1)} <span className="text-base text-zinc-400">KB/s</span>
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            12-point live sample
          </div>
        </div>

        <div className="mt-6 h-[220px]">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e4e4e7" stopOpacity={0.24} />
                    <stop offset="95%" stopColor="#e4e4e7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="usage"
                  stroke="#e4e4e7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#${gradientId})`}
                  isAnimationActive={false}
                />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d0f12",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    fontSize: "11px",
                    boxShadow: "none",
                  }}
                  itemStyle={{ color: "#e4e4e7" }}
                  labelStyle={{ color: "#a1a1aa" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full rounded-xl border border-white/8 bg-black/20" />
          )}
        </div>
      </div>
    </div>
  );
}
