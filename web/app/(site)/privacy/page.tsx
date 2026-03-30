import {
  SitePageShell,
  SitePanel,
  SiteSectionHeader,
} from "@/components/site/shared/site-primitives";

const privacySections = [
  {
    title: "What Binboi collects",
    body: [
      "Binboi may collect account information such as name, email address, avatar, and sign-in metadata when authentication providers are enabled.",
      "The product also stores access-token metadata such as token name, prefix, creation time, last-used time, revocation state, and a secure hash of the token. Raw token values are not stored after creation.",
      "For operating the tunnel platform, Binboi may process tunnel metadata, request counts, byte counts, event logs, IP information, and webhook or request metadata that passes through the relay.",
    ],
  },
  {
    title: "How Binboi uses data",
    body: [
      "We use data to operate the control plane, authenticate CLI sessions, maintain audit trails, prevent abuse, debug failures, and improve the reliability of the product.",
      "If you enable AI-assisted search or summaries, the assistant uses server-side context and optional environment-configured model access to answer product questions. Secrets are not intended to be sent to the client browser.",
    ],
  },
  {
    title: "Traffic and sensitive data",
    body: [
      "Binboi is built for developer workflows, not for silently processing unlimited sensitive production traffic.",
      "Operators should avoid tunneling highly regulated or internal-only systems through public URLs unless they control the deployment, logging, domain, and security boundaries.",
      "Where request or webhook inspection exists, it should be treated as operational tooling. Keep payload retention narrow and avoid sending secrets that do not need to traverse the tunnel.",
    ],
  },
  {
    title: "Retention and deletion",
    body: [
      "Account records, token metadata, and event logs may be retained for operational, security, and audit purposes for as long as reasonably necessary.",
      "Where practical, operators can revoke tokens, delete local data stores, or remove self-hosted infrastructure to limit retained information.",
    ],
  },
  {
    title: "Security posture",
    body: [
      "Binboi stores access tokens as hashes plus prefixes, uses revocation states, and aims to keep operational credentials separate from dashboard account access.",
      "No software system is perfectly secure, especially in early-stage infrastructure products. Operators remain responsible for deployment choices, network exposure, firewall rules, and edge TLS.",
    ],
  },
  {
    title: "Contact and updates",
    body: [
      "If you have privacy questions, requests, or concerns, contact the project operator through the repository or the company channels referenced on the Binboi website.",
      "This privacy policy may evolve as Binboi adds managed infrastructure, billing, more formal data processing relationships, or broader team features.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <SitePageShell
      eyebrow="Privacy"
      title="Privacy policy for an early-stage tunnel and webhook platform"
      description="This policy explains the narrow, practical privacy posture behind Binboi today: account access, token metadata, relay events, and request visibility needed to operate the product without pretending it is already a mature global edge network."
    >
      <SitePanel>
        <SiteSectionHeader
          eyebrow="Last updated"
          title="March 30, 2026"
          description="This page is written as serious early-stage SaaS policy text. It should be reviewed again before public managed rollout, billing launch, or enterprise data-processing commitments."
        />
      </SitePanel>

      <section className="space-y-6">
        {privacySections.map((section) => (
          <SitePanel key={section.title}>
            <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
            <div className="mt-5 space-y-4 text-sm leading-8 text-zinc-400">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </SitePanel>
        ))}
      </section>
    </SitePageShell>
  );
}
