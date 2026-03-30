import {
  SitePageShell,
  SitePanel,
  SiteSectionHeader,
} from "@/components/site/shared/site-primitives";

export default function PrivateNetworkingPage() {
  return (
    <SitePageShell
      eyebrow="Private access"
      title="Private networking is a future Binboi layer, not a hidden MVP feature"
      description="The current Binboi product is strongest as a public HTTP tunnel platform with request and webhook debugging. Private overlays, raw TCP segmentation, and policy-heavy enterprise controls come later and should be described honestly."
    >
      <section className="grid gap-6 lg:grid-cols-2">
        <SitePanel>
          <SiteSectionHeader
            eyebrow="Today"
            title="Public HTTP exposure with explicit product boundaries"
            description="The repository currently exposes services through a managed domain or verified custom domain and relies on the surrounding edge stack for tighter network controls."
          />
          <div className="mt-6 space-y-4 text-sm leading-7 text-zinc-400">
            <p>HTTP tunneling, access tokens, request visibility, logs, and developer-focused debugging are the real MVP surfaces.</p>
            <p>If you need IP restriction or private-edge behavior today, use your own ingress, firewall, VPN, or edge proxy in front of Binboi.</p>
          </div>
        </SitePanel>

        <SitePanel>
          <SiteSectionHeader
            eyebrow="Later"
            title="What a true private networking release would need"
            description="Private access is not just a route checkbox. It requires stronger identity, policy enforcement, audit trails, and clear operator guarantees."
          />
          <div className="mt-6 space-y-4 text-sm leading-7 text-zinc-400">
            <p>Future private networking should include explicit machine identity, route-aware policy, edge enforcement, and better observability for TCP and non-HTTP traffic.</p>
            <p>Binboi will be more trustworthy if it ships those features after the current HTTP and control-plane lifecycle is fully battle-tested.</p>
          </div>
        </SitePanel>
      </section>
    </SitePageShell>
  );
}
