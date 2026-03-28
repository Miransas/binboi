// components/dashboard/MatrixScanner.tsx
export default function MatrixScanner() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none font-mono text-[8px] leading-none select-none">
      <div className="flex gap-2 justify-around">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="animate-matrix-fall" style={{ animationDelay: `${Math.random() * 2}s` }}>
            {Array.from({ length: 50 }).map((_, j) => (
              <div key={j} className="mb-1 text-miransas-cyan">
                {Math.random() > 0.5 ? "1" : "0"}
              </div>
            ))}
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes matrix-fall {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-matrix-fall {
          animation: matrix-fall 10s linear infinite;
        }
      `}</style>
    </div>
  );
}