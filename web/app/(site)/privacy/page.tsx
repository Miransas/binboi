export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-[70vh] max-w-4xl px-6 pb-20 pt-32 text-white">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-miransas-cyan">
        Privacy
      </p>
      <h1 className="mt-4 text-4xl font-black tracking-tight">Privacy policy</h1>
      <div className="mt-8 space-y-6 text-sm leading-8 text-zinc-400">
        <p>
          Binboi is still in early development. Treat this page as a placeholder until the final
          legal copy lands.
        </p>
        <p>
          For now the safest assumption is simple: do not tunnel sensitive internal systems through
          a public URL unless you also control the relay, domain, and access policy.
        </p>
      </div>
    </main>
  );
}
