"use client";

export function RadialVisual({ version }: { version: string }) {
  return (
    <svg viewBox="0 0 760 210" xmlns="http://www.w3.org/2000/svg" className="w-full block" style={{ aspectRatio: "16/7" }}>
      <rect width="760" height="210" fill="#111" />
      <circle cx="380" cy="105" r="180" fill="none" stroke="#1e1e1e" strokeWidth="1" />
      <circle cx="380" cy="105" r="120" fill="none" stroke="#1e1e1e" strokeWidth="1" />
      <circle cx="380" cy="105" r="60" fill="none" stroke="#1e1e1e" strokeWidth="1" />
      {[80,160,240,320,400,480,560,640,720].map(x => (
        <circle key={x} cx={x} cy="40" r="2" fill="#1e1e1e" />
      ))}
      {[80,160,240,320,400,480,560,640,720].map(x => (
        <circle key={x} cx={x} cy="200" r="2" fill="#1e1e1e" />
      ))}
      <line x1="60" y1="105" x2="200" y2="30" stroke="#b8ff57" strokeWidth="1" opacity="0.5" />
      <line x1="700" y1="105" x2="560" y2="30" stroke="#57c8ff" strokeWidth="1" opacity="0.5" />
      <line x1="380" y1="10" x2="380" y2="55" stroke="#b8ff57" strokeWidth="1.5" opacity="0.6" />
      <circle cx="380" cy="105" r="28" fill="rgba(184,255,87,0.08)" />
      <circle cx="380" cy="105" r="10" fill="#b8ff57" opacity="0.9" />
      <text x="380" y="190" fontFamily="monospace" fontSize="11" fill="#444" textAnchor="middle">
        v{version} · ADVANCED REASONING ENGINE
      </text>
    </svg>
  );
}

export function HexVisual({ version }: { version: string }) {
  return (
    <svg viewBox="0 0 760 210" xmlns="http://www.w3.org/2000/svg" className="w-full block" style={{ aspectRatio: "16/7" }}>
      <defs>
        <pattern id="hexPat" x="0" y="0" width="40" height="46" patternUnits="userSpaceOnUse">
          <polygon points="20,2 38,12 38,34 20,44 2,34 2,12" fill="none" stroke="#1a1a2e" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="760" height="210" fill="#101018" />
      <rect width="760" height="210" fill="url(#hexPat)" />
      <text x="380" y="140" fontFamily="sans-serif" fontSize="100" fontWeight="800" fill="none" stroke="#1d2a50" strokeWidth="2" textAnchor="middle">AI</text>
      <text x="380" y="140" fontFamily="sans-serif" fontSize="100" fontWeight="800" fill="#1e2c5c" textAnchor="middle" opacity="0.6">AI</text>
      <line x1="100" y1="50" x2="300" y2="105" stroke="#57c8ff" strokeWidth="0.8" opacity="0.4" />
      <line x1="660" y1="50" x2="460" y2="105" stroke="#57c8ff" strokeWidth="0.8" opacity="0.4" />
      <line x1="100" y1="160" x2="300" y2="105" stroke="#b8ff57" strokeWidth="0.8" opacity="0.3" />
      <line x1="660" y1="160" x2="460" y2="105" stroke="#b8ff57" strokeWidth="0.8" opacity="0.3" />
      <circle cx="100" cy="50" r="3" fill="#57c8ff" opacity="0.6" />
      <circle cx="660" cy="50" r="3" fill="#57c8ff" opacity="0.6" />
      <circle cx="100" cy="160" r="3" fill="#b8ff57" opacity="0.5" />
      <circle cx="660" cy="160" r="3" fill="#b8ff57" opacity="0.5" />
      <text x="380" y="196" fontFamily="monospace" fontSize="11" fill="#333" textAnchor="middle">
        v{version} · ENHANCED AI AGENT INTERFACE
      </text>
    </svg>
  );
}

export function WaveVisual({ version }: { version: string }) {
  return (
    <svg viewBox="0 0 760 210" xmlns="http://www.w3.org/2000/svg" className="w-full block" style={{ aspectRatio: "16/7" }}>
      <rect width="760" height="210" fill="#0d0d0d" />
      <path d="M0 105 Q95 55 190 105 Q285 155 380 105 Q475 55 570 105 Q665 155 760 105" fill="none" stroke="#57c8ff" strokeWidth="1.5" opacity="0.4" />
      <path d="M0 90 Q95 40 190 90 Q285 140 380 90 Q475 40 570 90 Q665 140 760 90" fill="none" stroke="#b8ff57" strokeWidth="1" opacity="0.25" />
      <path d="M0 120 Q95 70 190 120 Q285 170 380 120 Q475 70 570 120 Q665 170 760 120" fill="none" stroke="#b8ff57" strokeWidth="1" opacity="0.15" />
      {[0,1,2,3,4,5,6,7].map(i => (
        <circle key={i} cx={i * 108 + 54} cy={i % 2 === 0 ? 60 : 150} r="2.5" fill="#57c8ff" opacity="0.5" />
      ))}
      <text x="380" y="195" fontFamily="monospace" fontSize="11" fill="#333" textAnchor="middle">
        v{version} · PERFORMANCE KERNEL
      </text>
    </svg>
  );
}

export function GridVisual({ version }: { version: string }) {
  return (
    <svg viewBox="0 0 760 210" xmlns="http://www.w3.org/2000/svg" className="w-full block" style={{ aspectRatio: "16/7" }}>
      <rect width="760" height="210" fill="#0c0c0c" />
      <defs>
        <pattern id="gridPat" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a1a" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="760" height="210" fill="url(#gridPat)" />
      <rect x="200" y="40" width="360" height="130" rx="8" fill="none" stroke="#1e1e1e" strokeWidth="1" />
      <rect x="220" y="60" width="140" height="90" rx="4" fill="#161616" stroke="#222" strokeWidth="0.5" />
      <rect x="380" y="60" width="160" height="40" rx="4" fill="#161616" stroke="#222" strokeWidth="0.5" />
      <rect x="380" y="110" width="160" height="40" rx="4" fill="#161616" stroke="#222" strokeWidth="0.5" />
      <circle cx="290" cy="105" r="18" fill="rgba(184,255,87,0.08)" stroke="#b8ff57" strokeWidth="0.8" opacity="0.6" />
      <text x="380" y="196" fontFamily="monospace" fontSize="11" fill="#333" textAnchor="middle">
        v{version} · INTERFACE REDESIGN
      </text>
    </svg>
  );
}
