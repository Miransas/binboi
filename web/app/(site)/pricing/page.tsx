const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For local development, small teams, and self-hosted control planes getting started.",
    features: ["HTTP tunnels", "Access tokens", "3 active tokens", "3 tunnel slots"],
  },
  {
    name: "Pro",
    price: "$19",
    description: "A plan foundation for larger teams that want more credentials, more tunnels, and future managed infrastructure.",
    features: ["Higher token limits", "Higher tunnel limits", "Custom domains", "Usage analytics foundations"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations that need private networking, formal identity, and support.",
    features: ["Dedicated infrastructure", "SSO and RBAC", "Private CA roadmap", "Support and migration help"],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black px-6 pb-20 pt-32 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-miransas-cyan">Pricing</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight">Simple plans for a focused product</h1>
          <p className="mt-5 text-sm leading-7 text-zinc-400">
            The current repository is best treated as a self-hosted MVP, but the dashboard and API now expose real Free and Pro foundations instead of a single flat access model.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-3xl border p-6 ${
                plan.featured
                  ? "border-miransas-cyan/40 bg-miransas-cyan/5"
                  : "border-white/10 bg-[#080808]"
              }`}
            >
              <h2 className="text-2xl font-semibold text-white">{plan.name}</h2>
              <p className="mt-3 text-4xl font-black tracking-tight text-white">{plan.price}</p>
              <p className="mt-4 text-sm leading-7 text-zinc-400">{plan.description}</p>
              <ul className="mt-6 space-y-3 text-sm leading-7 text-zinc-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
