export function LandingSignalBand() {
  const items = [
    {
      label: "Tunnel truth",
      value: "Public URL, route, and target stay visible.",
    },
    {
      label: "Webhook focus",
      value: "Signatures, retries, and app failures get first-class attention.",
    },
    {
      label: "Operator feel",
      value: "CLI auth, docs, dashboard, and AI search act like one product.",
    },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#070709]/82 px-5 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,255,209,0.08),transparent_18%,transparent_82%,rgba(255,0,255,0.08))]" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-[radial-gradient(circle_at_left,rgba(0,255,209,0.14),transparent_65%)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-[radial-gradient(circle_at_right,rgba(255,0,255,0.14),transparent_65%)]" />
        <div className="relative grid gap-3 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-[1.3rem] border border-white/10 bg-black/20 px-4 py-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                {item.label}
              </p>
              <p className="mt-2 text-sm leading-7 text-zinc-200">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
