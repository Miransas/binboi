const logs = [
  {
    v: "v0.4.0",
    date: "2026-03-30",
    changes: [
      "Added account-backed access tokens with prefix-plus-hash storage.",
      "Implemented binboi login, whoami, and config-based CLI authentication.",
      "Added Homebrew-ready version output and release artifact documentation.",
    ],
  },
  {
    v: "v0.3.0",
    date: "2026-03-30",
    changes: [
      "Rebuilt the control plane around a coherent SQLite-backed MVP.",
      "Added real tunnel reservation, token rotation, and domain verification endpoints.",
      "Replaced blank dashboard pages with useful product content.",
    ],
  },
  {
    v: "v0.2.0",
    date: "2026-03-28",
    changes: [
      "Improved the landing page and stabilized the dashboard shell.",
      "Added safer fallback states when backend services are offline.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="pt-40 max-w-3xl mx-auto px-6 pb-20">
      <h1 className="text-4xl font-black uppercase mb-16">Changelog</h1>
      <div className="relative border-l border-white/10 ml-4 space-y-16">
        {logs.map((log, i) => (
          <div key={i} className="relative pl-12">
            <div className="absolute -left-[6px] top-1 w-3 h-3 bg-miransas-cyan rounded-full shadow-[0_0_10px_#00ffd1]" />
            <div className="flex items-baseline gap-4 mb-4">
              <h3 className="text-2xl font-black text-white">{log.v}</h3>
              <span className="text-[10px] text-gray-600 font-mono font-bold uppercase">{log.date}</span>
            </div>
            <ul className="space-y-2">
              {log.changes.map((c, idx) => (
                <li key={idx} className="text-sm text-gray-500">- {c}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
