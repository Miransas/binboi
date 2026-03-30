const logs = [
  { v: "v1.0.4", date: "2026-03-28", changes: ["Added Neural Traffic Inspector", "Implemented DNS TXT Verification", "M1 Optimization"] },
  { v: "v1.0.0", date: "2026-03-12", changes: ["Core Engine Release", "Yamux Protocol Integration", "Basic Tunneling Active"] },
];

export default function ChangelogPage() {
  return (
    <div className="pt-40 max-w-3xl mx-auto px-6 pb-20">
      <h1 className="text-4xl font-black italic uppercase mb-16">Neural_Updates</h1>
      <div className="relative border-l border-white/10 ml-4 space-y-16">
        {logs.map((log, i) => (
          <div key={i} className="relative pl-12">
            <div className="absolute -left-[6px] top-1 w-3 h-3 bg-miransas-cyan rounded-full shadow-[0_0_10px_#00ffd1]" />
            <div className="flex items-baseline gap-4 mb-4">
              <h3 className="text-2xl font-black italic text-white">{log.v}</h3>
              <span className="text-[10px] text-gray-600 font-mono font-bold uppercase">{log.date}</span>
            </div>
            <ul className="space-y-2">
              {log.changes.map((c, idx) => (
                <li key={idx} className="text-sm text-gray-500 font-mono italic">- {c}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}