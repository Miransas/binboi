import {
  SitePageShell,
  SitePanel,
  SiteSectionHeader,
} from "@/components/site/shared/site-primitives";

const termsSections = [
  {
    title: "Using the service",
    body: [
      "Binboi is a tunneling, webhook inspection, and developer visibility product. By using the service or self-hosted software, you agree to use it only for lawful and authorized purposes.",
      "You may not use Binboi to deliver malware, exfiltrate data, bypass network controls without authorization, abuse credentials, attack third parties, or route traffic that violates applicable law or platform rules.",
    ],
  },
  {
    title: "Accounts and credentials",
    body: [
      "You are responsible for activity performed through your dashboard account, access tokens, and deployed relay infrastructure.",
      "Keep tokens secure, rotate them when exposed, and avoid sharing raw credentials in screenshots, chat logs, or public repositories.",
    ],
  },
  {
    title: "Beta and MVP limitations",
    body: [
      "Binboi remains an early-stage product. Some features are MVP, preview, self-hosted only, or partially mocked while the product surface matures.",
      "Do not treat the service as an unlimited, highly available, or regulation-ready edge network unless you have independently validated that deployment posture yourself.",
    ],
  },
  {
    title: "Billing foundations",
    body: [
      "The website and dashboard may refer to Free and Pro plan foundations. Those labels describe product packaging intent and usage limits, even where billing and managed provisioning are still evolving.",
      "If paid plans are later introduced, additional commercial terms, invoicing, cancellation, and tax details may apply.",
    ],
  },
  {
    title: "Availability and support",
    body: [
      "We do not guarantee uninterrupted availability, error-free operation, or specific response times unless separately agreed in writing.",
      "Planned features, release timing, integrations, and roadmap items may change without notice.",
    ],
  },
  {
    title: "Ownership and feedback",
    body: [
      "You retain ownership of your application code, payloads, and content. Binboi retains ownership of the software, website, design, documentation, and related intellectual property.",
      "If you send feedback, suggestions, or product ideas, you agree that we may use that input to improve Binboi without additional compensation.",
    ],
  },
  {
    title: "Suspension and termination",
    body: [
      "We may suspend or terminate access if we reasonably believe your use is abusive, unlawful, dangerous to others, or harmful to the platform.",
      "You may stop using Binboi at any time. Self-hosted operators remain responsible for their own infrastructure cleanup and retained data.",
    ],
  },
  {
    title: "Liability",
    body: [
      "To the maximum extent permitted by law, Binboi is provided on an as-is and as-available basis.",
      "We are not liable for indirect, incidental, special, consequential, or exemplary damages arising from use of the service, including downtime, data loss, deployment mistakes, or security issues in systems you expose.",
    ],
  },
];

export default function TermsPage() {
  return (
    <SitePageShell
      eyebrow="Terms"
      title="Terms for using Binboi"
      description="These terms set the operating expectations for an early-stage developer infrastructure product: acceptable use, token responsibility, MVP limits, and practical boundaries around support, uptime, and liability."
    >
      <SitePanel>
        <SiteSectionHeader
          eyebrow="Last updated"
          title="March 30, 2026"
          description="These terms are written to be useful now while still leaving room for later paid plans, enterprise controls, and more formal managed-service terms."
        />
      </SitePanel>

      <section className="space-y-6">
        {termsSections.map((section) => (
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
