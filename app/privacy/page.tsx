import type { Metadata } from "next";
import NavMenu from "../components/NavMenu";
import Footer from "../sections/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Cogniate",
  description:
    "How Cogniate collects, uses, and protects information across our learning platform.",
};

const lastUpdated = "4 May 2026";

const sections = [
  {
    id: "information-we-collect",
    heading: "1. Information We Collect",
    body: (
      <>
        <p>
          We collect information you provide directly, information generated
          automatically as you use the Service, and information from third
          parties acting on your behalf.
        </p>
        <ul>
          <li>
            <strong>Account information:</strong> name, email, organisation,
            role, hashed password, and billing details.
          </li>
          <li>
            <strong>Customer content:</strong> courses, prompts, files, and
            other material you upload or generate using the Service.
          </li>
          <li>
            <strong>Communications:</strong> messages you send to us through
            support, demo, sales, or community channels.
          </li>
          <li>
            <strong>Usage data:</strong> pages viewed, features used, device
            and browser type, IP address, and approximate location.
          </li>
          <li>
            <strong>Cookies and similar technologies:</strong> see{" "}
            <a href="#cookies-and-tracking">Cookies and Tracking</a> below.
          </li>
          <li>
            <strong>Third-party sources:</strong> identity providers, billing
            processors, analytics partners, and event organisers.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    heading: "2. How We Use Information",
    body: (
      <>
        <p>We use information to:</p>
        <ul>
          <li>Operate, maintain, secure, and improve the Service.</li>
          <li>Personalise the experience and produce AI-generated outputs.</li>
          <li>
            Process payments, fulfil orders, and send transactional messages.
          </li>
          <li>Respond to enquiries and provide customer support.</li>
          <li>
            Detect, prevent, and respond to fraud, abuse, and security
            incidents.
          </li>
          <li>Comply with legal obligations and enforce our agreements.</li>
          <li>
            With your consent, send marketing communications and product
            updates.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-share-information",
    heading: "3. How We Share Information",
    body: (
      <>
        <p>We share information with:</p>
        <ul>
          <li>
            Service providers (hosting, analytics, payments, email, customer
            support) under contract.
          </li>
          <li>
            Affiliates, including Sølúna Ventures, where it supports the
            operations described above.
          </li>
          <li>Business partners and integrations you choose to connect.</li>
          <li>
            Authorities or other parties when required by law, or to protect
            rights, property, and safety.
          </li>
          <li>
            A successor in connection with a merger, acquisition, or asset
            sale, with notice where required by law.
          </li>
        </ul>
        <p>We do not sell personal information.</p>
      </>
    ),
  },
  {
    id: "ai-and-generated-content",
    heading: "4. AI and Generated Content",
    body: (
      <p>
        The Service uses third-party AI models to generate course content.
        Inputs you submit may be processed by these providers under their
        commercial terms. We do not use Customer Content to train
        Cogniate-owned models without your consent.
      </p>
    ),
  },
  {
    id: "cookies-and-tracking",
    heading: "5. Cookies and Tracking",
    body: (
      <p>
        We and our partners use cookies, local storage, and similar
        technologies to operate the Service, remember preferences, measure
        performance, and — with consent where required — provide marketing
        analytics. You can control cookies through your browser; some features
        may not work without them.
      </p>
    ),
  },
  {
    id: "data-retention",
    heading: "6. Data Retention",
    body: (
      <p>
        We retain personal information for as long as needed to provide the
        Service, comply with legal obligations, resolve disputes, and enforce
        agreements. You may request deletion subject to legal exceptions.
      </p>
    ),
  },
  {
    id: "your-rights",
    heading: "7. Your Rights",
    body: (
      <p>
        Depending on your jurisdiction (including the EEA, UK, California, and
        other regions), you may have the right to access, correct, delete,
        port, restrict, or object to the processing of your personal
        information, and to withdraw consent. To exercise these rights,
        contact{" "}
        <a href="mailto:privacy@cogniate.ai">privacy@cogniate.ai</a>. You may
        also lodge a complaint with your local data protection authority.
      </p>
    ),
  },
  {
    id: "international-transfers",
    heading: "8. International Transfers",
    body: (
      <p>
        We operate globally and may transfer your information to countries
        other than the one in which you reside. Where required, we rely on
        appropriate safeguards such as Standard Contractual Clauses.
      </p>
    ),
  },
  {
    id: "children",
    heading: "9. Children",
    body: (
      <p>
        The Service is not intended for children under 13 (or 16 in the
        EEA/UK). We do not knowingly collect personal information from
        children. If you believe a child has provided information, contact us
        so we can delete it.
      </p>
    ),
  },
  {
    id: "security",
    heading: "10. Security",
    body: (
      <p>
        We use technical and organisational measures designed to protect
        personal information. No system is perfectly secure — please use a
        strong password and notify us of any suspected unauthorised access.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "11. Changes to This Policy",
    body: (
      <p>
        We may update this Policy from time to time. Material changes will be
        communicated by posting the updated Policy and, where appropriate, by
        email or in-product notice.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "12. Contact",
    body: (
      <p>
        Cogniate US, Inc. —{" "}
        <a href="mailto:privacy@cogniate.ai">privacy@cogniate.ai</a>
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <main className="relative bg-bg-primary">
      <NavMenu />

      {/* Hero */}
      <section className="relative pt-[140px] md:pt-[180px] lg:pt-[200px] pb-12 md:pb-16 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[600px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(183,139,249,0.18) 0%, rgba(183,139,249,0.06) 35%, transparent 70%)",
          }}
        />

        <div className="relative flex flex-col items-center gap-5 md:gap-7 px-5 md:px-8 max-w-[1280px] mx-auto text-center">
          <p className="text-[11px] md:text-xs tracking-[0.2em] uppercase text-white/45 font-medium">
            Legal · Last updated {lastUpdated}
          </p>
          <h1 className="heading-gradient text-[40px] sm:text-[52px] md:text-[64px] lg:text-[68px] font-[var(--font-weight-h1)] leading-[var(--leading-h1)] tracking-[var(--tracking-h1)]">
            Privacy Policy
          </h1>
          <p className="text-body md:text-body-lg text-white/70 font-light max-w-[640px] leading-[1.5] tracking-[-0.2px]">
            Cogniate US, Inc. (&ldquo;Cogniate&rdquo;, &ldquo;we&rdquo;,
            &ldquo;us&rdquo;) provides AI-powered learning tools through
            cogniate.ai. This Policy describes how we collect, use, and share
            information when you use the Service. It applies to information
            processed by Cogniate and our affiliate Sølúna Ventures.
          </p>
        </div>
      </section>

      {/* Body */}
      <article className="legal-prose relative max-w-[760px] mx-auto px-5 md:px-8 pb-20 md:pb-28">
        <div className="h-px w-full bg-white/10 mb-12 md:mb-16" />
        {sections.map((section, i) => (
          <section
            key={section.id}
            id={section.id}
            className={i === 0 ? "" : "mt-12 md:mt-14"}
          >
            <h2>{section.heading}</h2>
            {section.body}
          </section>
        ))}
      </article>

      <Footer />
    </main>
  );
}
