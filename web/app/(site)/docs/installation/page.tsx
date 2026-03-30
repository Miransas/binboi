import {
  DocsCallout,
  DocsCard,
  DocsCardGrid,
  DocsCodeBlock,
  DocsPageShell,
  DocsSection,
  type TocItem,
} from "../_components/docs-primitives";

const toc: TocItem[] = [
  { id: "install-overview", title: "Install overview" },
  { id: "homebrew", title: "Homebrew" },
  { id: "npm", title: "npm direction" },
  { id: "direct-binary", title: "Direct binary" },
  { id: "contributors", title: "Contributor setup" },
];

export default function InstallationPage() {
  return (
    <DocsPageShell
      eyebrow="Installation"
      title="Choose the install path that matches how your team works."
      description="Binboi is designed to be comfortable as a packaged CLI and straightforward to build from source. This guide covers Homebrew, npm wrapper direction, direct release binaries, and local contributor setup."
      toc={toc}
    >
      <DocsSection
        id="install-overview"
        eyebrow="Overview"
        title="Installation paths at a glance"
        description="Most users should prefer a packaged binary, while contributors or operators often build from source."
      >
        <DocsCardGrid columns={2}>
          <DocsCard
            eyebrow="Recommended"
            badge="Preferred"
            title="Homebrew"
            description="The cleanest macOS developer install path once your release artifacts are published."
            tone="cyan"
          />
          <DocsCard
            eyebrow="Direction"
            badge="Planned"
            title="npm global wrapper"
            description="A convenient future path for JavaScript-heavy teams, especially when they already use npm-based developer tooling."
            tone="amber"
          />
          <DocsCard
            eyebrow="Manual"
            badge="Supported"
            title="Direct release binary"
            description="Download the correct `tar.gz` for your OS and architecture and place `binboi` on your PATH."
            tone="emerald"
          />
          <DocsCard
            eyebrow="Contributors"
            badge="Available"
            title="Build from source"
            description="Ideal when you are modifying the relay, CLI, or dashboard locally and want complete control over the build."
          />
        </DocsCardGrid>
      </DocsSection>

      <DocsSection
        id="homebrew"
        eyebrow="Packages"
        title="Install with Homebrew"
        description="Homebrew is the most polished install story for macOS users once release binaries are published."
      >
        <DocsCodeBlock
          title="Homebrew install"
          language="bash"
          code={`brew install binboi/tap/binboi
binboi version`}
        />

        <p className="text-base leading-8 text-zinc-300">
          The repository now includes release-friendly artifact naming, a sample Homebrew formula,
          and a stable `binboi version` command for formula testing. That makes the Homebrew path
          a realistic distribution target rather than placeholder packaging.
        </p>
      </DocsSection>

      <DocsSection
        id="npm"
        eyebrow="JavaScript teams"
        title="npm global install direction"
        description="The npm wrapper is part of the product direction, especially for teams that live inside Node-based developer tooling."
      >
        <DocsCodeBlock
          title="Planned npm flow"
          language="bash"
          code={`npm install -g @binboi/cli
binboi version`}
          note="Treat this as packaging direction unless your published package already exists. The current repo focuses on a solid Go CLI first."
        />

        <DocsCallout title="Why document it now?" tone="amber">
          Because teams evaluating the product often ask how the CLI will be distributed in real
          life. The docs should answer that honestly even before every packaging channel is fully
          live.
        </DocsCallout>
      </DocsSection>

      <DocsSection
        id="direct-binary"
        eyebrow="Manual install"
        title="Direct binary installation"
        description="Direct binary install is the simplest cross-platform path when you are distributing internal builds or testing release candidates."
      >
        <DocsCodeBlock
          title="Direct binary install"
          language="bash"
          code={`tar -xzf binboi_0.4.0_darwin_arm64.tar.gz
sudo mv binboi /usr/local/bin/binboi
binboi version`}
        />

        <div className="rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>Release artifact naming follows the pattern `binboi_&lt;version&gt;_&lt;os&gt;_&lt;arch&gt;.tar.gz`.</p>
          <p className="mt-3">That convention keeps Homebrew, direct downloads, and CI packaging aligned around one predictable artifact layout.</p>
        </div>
      </DocsSection>

      <DocsSection
        id="contributors"
        eyebrow="Local development"
        title="Contributor setup"
        description="If you are changing code in the relay or dashboard, build everything locally and run the pieces side by side."
      >
        <DocsCodeBlock
          title="Contributor install flow"
          language="bash"
          code={`git clone https://github.com/sardorazimov/binboi.git
cd binboi
go build -o binboi-server ./cmd/binboi-server
go build -o binboi ./cmd/binboi-client
cd web
npm install
npm run dev`}
        />

        <DocsCallout title="Local contributor rule of thumb" tone="cyan">
          Build the server and CLI directly from source when you are changing tunnel lifecycle,
          auth, or dashboard behavior. That keeps your debugging loop close to the real codepath.
        </DocsCallout>
      </DocsSection>
    </DocsPageShell>
  );
}
