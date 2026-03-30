import {
  DocsCallout,
  DocsPageShell,
  DocsSection,
  DocsTable,
  type TocItem,
} from "../_components/docs-primitives";

const toc: TocItem[] = [
  { id: "region-basics", title: "Region basics" },
  { id: "nodes", title: "Nodes" },
  { id: "latency", title: "Latency" },
  { id: "selection-guidance", title: "Selection guidance" },
];

export default function RegionsPage() {
  return (
    <DocsPageShell
      eyebrow="Regions"
      title="Regions, nodes, and why latency still matters in a tunnel product."
      description="Regions are the logical locations where relay traffic enters the Binboi network, and nodes are the concrete relay instances serving that traffic. Even in a debugging product, latency matters because it shapes user experience, provider timeout behavior, and how trustworthy a tunnel feels."
      toc={toc}
    >
      <DocsSection
        id="region-basics"
        eyebrow="Basics"
        title="What a region is"
        description="A region is a logical location such as `us-east`, `eu-west`, or `local` that helps operators and users reason about where traffic enters the relay."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>In a mature deployment, users choose a region close to themselves or close to the systems generating traffic.</p>
          <p>That choice affects response time, webhook timeout risk, and how predictable the development experience feels across teams.</p>
        </div>
      </DocsSection>

      <DocsSection
        id="nodes"
        eyebrow="Nodes"
        title="What a node is"
        description="Nodes are the actual relay instances serving traffic inside a region."
      >
        <DocsTable
          title="Region and node model"
          columns={["Concept", "Meaning", "Current repository status"]}
          rows={[
            ["Region", "Logical location for traffic entry and operator reasoning.", "The current MVP defaults to a single `local` region."],
            ["Node", "Concrete relay instance that serves tunnels.", "The current MVP behaves like a single primary node."],
            ["Selection", "How a user or operator chooses an entry point.", "Planned for richer multi-region control planes."],
          ]}
        />
      </DocsSection>

      <DocsSection
        id="latency"
        eyebrow="Performance"
        title="Why latency matters"
        description="Tunnel products are still network products, even when they are used for debugging."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>Slow regions make every request feel heavier and can increase webhook retries for providers with tight timeouts.</p>
          <p>If the relay is far from both the developer and the service sending traffic, the tunnel may still work but feel unreliable under load or during debugging.</p>
        </div>
      </DocsSection>

      <DocsSection
        id="selection-guidance"
        eyebrow="Guidance"
        title="How to choose a region"
        description="Start simple and optimize later."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>For self-hosted teams, start with one known-good region that matches most engineers or staging traffic.</p>
          <p>Add more nodes or regions only after you can observe health, route behavior, and operational tradeoffs clearly.</p>
          <p>If you mostly debug provider webhooks, choose the region that best matches the provider and your operators, not just your eventual production region.</p>
        </div>

        <DocsCallout title="Current MVP note" tone="amber">
          The present repository is still effectively single-region and single-node. The docs
          explain the region model now because it is part of the product direction and helps teams
          self-host with realistic expectations.
        </DocsCallout>
      </DocsSection>
    </DocsPageShell>
  );
}
