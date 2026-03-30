import Link from "next/link";

import {
  SitePageShell,
  SitePanel,
  SiteSectionHeader,
} from "@/components/site/shared/site-primitives";

const plans = [
  {
    name: "Free",
    price: "$0",
    description:
      "For local development, solo builders, and self-hosted operators validating the workflow.",
    features: ["HTTP tunnels", "Access tokens", "3 active tokens", "3 tunnel slots", "Docs and assistant search"],
  },
  {
    name: "Pro",
    price: "$19",
    description:
      "For teams that want more credentials, more tunnel capacity, and better foundations for shared workflows.",
    features: ["25 active tokens", "25 tunnel slots", "Custom domain foundations", "Usage and debugging foundations", "Priority product updates"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description:
      "For organizations that need stronger identity, deployment guidance, and future private networking controls.",
    features: ["Deployment support", "Identity and RBAC roadmap", "Private networking roadmap", "Commercial support motion", "Policy-heavy rollout planning"],
  },
];

export default function PricingPage() {
  return (
    <SitePageShell
      eyebrow="Pricing"
      title="Simple plan foundations for a focused developer product"
      description="Binboi pricing is intentionally straightforward. Free and Pro already shape token and tunnel limits in the product, while Enterprise remains a future operator motion rather than a fake checkout screen."
    >
      <SitePanel>
        <SiteSectionHeader
          eyebrow="Plan logic"
          title="Start small, then expand limits when the workflow proves itself"
          description="The current repository is strongest as a self-hosted HTTP tunnel product. Pricing is designed to support that reality without overselling maturity."
        />
      </SitePanel>

      <section className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <SitePanel
            key={plan.name}
            className={
              plan.featured
                ? "border-miransas-cyan/25 bg-[linear-gradient(180deg,rgba(0,255,209,0.07),rgba(7,7,9,0.9))]"
                : undefined
            }
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
              {plan.name}
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-white">{plan.price}</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-400">{plan.description}</p>
            <div className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <div
                  key={feature}
                  className="rounded-[1.25rem] border border-white/10 bg-black/35 px-4 py-3 text-sm leading-7 text-zinc-300"
                >
                  {feature}
                </div>
              ))}
            </div>
          </SitePanel>
        ))}
      </section>

      <SitePanel>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-black tracking-tight text-white">
              Need the exact product limits and CLI flow?
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              The docs explain how tokens, tunnel slots, and CLI authentication behave today, while
              the dashboard exposes the same limits directly in the product UI.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/docs/authentication"
              className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              Read auth docs
            </Link>
            <Link
              href="/dashboard/access-tokens"
              className="rounded-full bg-miransas-cyan px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Open access tokens
            </Link>
          </div>
        </div>
      </SitePanel>
    </SitePageShell>
  );
}
