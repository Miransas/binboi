import {
  DocsCallout,
  DocsCodeBlock,
  DocsPageShell,
  DocsSection,
  DocsTable,
  type TocItem,
} from "../_components/docs-primitives";

const toc: TocItem[] = [
  { id: "command-surface", title: "Command surface" },
  { id: "auth-commands", title: "Auth commands" },
  { id: "tunnel-commands", title: "Tunnel commands" },
  { id: "planned-commands", title: "Planned commands" },
  { id: "daily-workflow", title: "Daily workflow" },
];

export default function CliDocsPage() {
  return (
    <DocsPageShell
      eyebrow="CLI"
      title="The Binboi CLI, command by command."
      description="The CLI is intentionally compact, but the docs need to explain both the commands available today and the product-facing commands that are planned next. This guide does that without pretending unfinished commands already ship."
      toc={toc}
    >
      <DocsSection
        id="command-surface"
        eyebrow="Reference"
        title="Current CLI command surface"
        description="The table below distinguishes what is available in the repository today from commands that are documented as the intended product surface."
      >
        <DocsTable
          title="CLI command overview"
          columns={["Command", "Status", "Purpose"]}
          rows={[
            ["`binboi login --token <token>`", "Available", "Validate an access token and save it to local config."],
            ["`binboi logout`", "Planned", "Will remove locally stored auth state. For now, edit or remove `~/.binboi/config.json` manually."],
            ["`binboi whoami`", "Available", "Verify the active token and print the authenticated identity."],
            ["`binboi http 3000`", "Alias planned", "Product-facing shorthand for an HTTP tunnel. Today use `binboi start 3000 my-app`."],
            ["`binboi tcp 5432`", "Planned", "Reserved for raw TCP exposure once that surface is production-ready."],
            ["`binboi tunnels`", "Planned", "Will list active or reserved tunnels from the CLI."],
            ["`binboi stop`", "Planned", "Will stop a running tunnel cleanly from the CLI."],
            ["`binboi logs`", "Planned", "Will tail structured logs or request visibility streams."],
            ["`binboi regions`", "Planned", "Will show the available regions and nodes when multi-region exists."],
            ["`binboi config`", "Planned", "Will inspect and modify local CLI config in a friendlier way."],
            ["`binboi version`", "Available", "Print the CLI version for support and packaging verification."],
          ]}
        />
      </DocsSection>

      <DocsSection
        id="auth-commands"
        eyebrow="Authentication"
        title="Login, whoami, and local auth checks"
        description="The auth path is the most important CLI surface because every tunnel depends on it."
      >
        <DocsCodeBlock
          title="Auth-focused commands"
          language="bash"
          code={`binboi login --token <dashboard-token>
binboi whoami
binboi version`}
        />

        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>`binboi login` validates the token against the backend and writes it to local config.</p>
          <p>`binboi whoami` is the fastest way to prove that your saved token still works before debugging a failing tunnel.</p>
          <p>`binboi version` is intentionally simple because package managers and operator runbooks depend on predictable output.</p>
        </div>
      </DocsSection>

      <DocsSection
        id="tunnel-commands"
        eyebrow="Traffic"
        title="Running tunnels from the CLI"
        description="Today the working HTTP tunnel entrypoint is `binboi start`, even though the product docs also describe the future `binboi http` shape."
      >
        <DocsCodeBlock
          title="Current working tunnel flow"
          language="bash"
          code={`binboi start 3000 my-app

# Intended future alias
binboi http 3000`}
        />

        <DocsCallout title="Why document the alias?" tone="amber">
          Because users naturally expect protocol-shaped commands such as `http` and `tcp`. The
          docs make that future direction visible, while still telling you exactly which command
          works today.
        </DocsCallout>
      </DocsSection>

      <DocsSection
        id="planned-commands"
        eyebrow="Roadmap"
        title="Documented commands that are still planned"
        description="Some commands matter enough to document now because they describe the intended product experience."
      >
        <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm leading-7 text-zinc-300">
          <p>`binboi logout` should clear local credentials safely.</p>
          <p>`binboi tunnels` should list local and remote tunnel state without needing the dashboard.</p>
          <p>`binboi stop` should terminate a running tunnel in a clean, operator-friendly way.</p>
          <p>`binboi logs` should bridge the gap between raw relay events and request-specific visibility.</p>
          <p>`binboi regions` should become meaningful once the product grows beyond a single primary node.</p>
          <p>`binboi config` should provide a clearer interface for inspecting file-based and environment-based config.</p>
        </div>
      </DocsSection>

      <DocsSection
        id="daily-workflow"
        eyebrow="Workflow"
        title="A realistic daily CLI workflow"
        description="Most developers do not need the whole command surface every day. They need a reliable sequence that tells them whether the environment is healthy."
      >
        <DocsCodeBlock
          title="Typical daily routine"
          language="bash"
          code={`binboi whoami
binboi start 3000 local-dashboard
curl https://local-dashboard.binboi.link/health`}
        />
      </DocsSection>
    </DocsPageShell>
  );
}
