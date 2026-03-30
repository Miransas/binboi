/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function BandwidthChart({ currentUsage }: { currentUsage: number }) {
  const [data, setData] = useState<{ time: string; usage: number }[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    setData((prevData) => {
      const newData = [...prevData, { time: timeStr, usage: currentUsage }];
      // Sadece son 12 veri noktasını tut (Grafik çok sıkışmasın)
      if (newData.length > 12) return newData.slice(1);
      return newData;
    });
  }, [currentUsage]);

  return (
    <div className="h-[200px] w-full bg-[#080808] border border-white/5 rounded-2xl p-4 overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Live Throughput</h3>
        <p className="text-miransas-cyan text-lg font-black italic">{currentUsage.toFixed(2)} KB/s</p>
      </div>

      {mounted ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ffd1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00ffd1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="usage" 
              stroke="#00ffd1" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorUsage)" 
              isAnimationActive={false}
            />
            <XAxis dataKey="time" hide />
            <YAxis hide domain={[0, 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '10px' }}
              itemStyle={{ color: '#00ffd1' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full rounded-2xl bg-black/20" />
      )}
    </div>
  );
}
