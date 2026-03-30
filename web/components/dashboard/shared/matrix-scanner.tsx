// components/dashboard/MatrixScanner.tsx
const columns = Array.from({ length: 20 }, (_, columnIndex) => ({
  delay: `${(columnIndex % 5) * 0.35}s`,
  digits: Array.from({ length: 50 }, (_, digitIndex) =>
    (columnIndex + digitIndex) % 2 === 0 ? "1" : "0"
  ),
}));

export default function MatrixScanner() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none font-mono text-[8px] leading-none select-none">
      <div className="flex gap-2 justify-around">
        {columns.map((column, i) => (
          <div key={i} className="animate-matrix-fall" style={{ animationDelay: column.delay }}>
            {column.digits.map((digit, j) => (
              <div key={j} className="mb-1 text-miransas-cyan">
                {digit}
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
