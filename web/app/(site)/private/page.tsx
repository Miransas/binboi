export default function PrivateNetworkingPage() {
  return (
    <main className="mx-auto min-h-[70vh] max-w-5xl px-6 pb-20 pt-32 text-white">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-miransas-cyan">Private access</p>
      <h1 className="mt-4 text-5xl font-black tracking-tight">Private networking comes later</h1>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-white/10 bg-[#080808] p-6">
          <h2 className="text-2xl font-semibold text-white">Current MVP</h2>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            The repository currently exposes public HTTP endpoints through a managed base domain or custom domains that you verify yourself.
          </p>
        </section>
        <section className="rounded-3xl border border-white/10 bg-[#080808] p-6">
          <h2 className="text-2xl font-semibold text-white">Future direction</h2>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            Private overlays, raw TCP, policy-aware network segmentation, and formal enterprise identity should arrive only after the self-hosted HTTP core is battle-tested.
          </p>
        </section>
      </div>
    </main>
  );
}
