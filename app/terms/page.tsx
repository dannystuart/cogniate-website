import type { Metadata } from "next";
import NavMenu from "../components/NavMenu";
import Footer from "../sections/Footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern access to and use of the Cogniate platform.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

const lastUpdated = "4 May 2026";

const sections = [
  {
    id: "eligibility",
    heading: "1. Eligibility",
    body: (
      <p>
        You must be at least 13 years old (16 in the EEA/UK) to use the
        Service. If you use the Service for an organisation, you confirm that
        you have authority to bind that organisation, and both you and the
        organisation accept these Terms.
      </p>
    ),
  },
  {
    id: "accounts",
    heading: "2. Accounts",
    body: (
      <p>
        You are responsible for maintaining the security of your account and
        for all activity that occurs under it. Notify us promptly of any
        unauthorised use.
      </p>
    ),
  },
  {
    id: "plans-and-payment",
    heading: "3. Plans, Trials, and Payment",
    body: (
      <p>
        Paid plans are billed according to the pricing presented at signup.
        Unless stated otherwise, fees are non-refundable. We may change
        pricing for future renewal terms with prior notice.
      </p>
    ),
  },
  {
    id: "license",
    heading: "4. License to the Service",
    body: (
      <p>
        Cogniate grants you a limited, non-exclusive, non-transferable,
        revocable licence to access and use the Service for your internal
        business or personal use, subject to these Terms.
      </p>
    ),
  },
  {
    id: "acceptable-use",
    heading: "5. Acceptable Use",
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>
            Reverse engineer, decompile, or attempt to derive source code,
            except as permitted by law.
          </li>
          <li>
            Use the Service to violate law, infringe intellectual property, or
            harm minors.
          </li>
          <li>Send spam, malware, or otherwise interfere with the Service.</li>
          <li>
            Bypass usage limits, scrape data, or evade rate limiting.
          </li>
          <li>
            Use the Service to develop a competing product, service, or model.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "your-content",
    heading: "6. Your Content",
    body: (
      <p>
        You retain ownership of content you upload to the Service
        (&ldquo;Customer Content&rdquo;). You grant Cogniate a worldwide,
        non-exclusive licence to host, process, and display Customer Content
        as necessary to operate the Service. You are responsible for ensuring
        you have the rights to share Customer Content.
      </p>
    ),
  },
  {
    id: "ai-output",
    heading: "7. AI Output",
    body: (
      <p>
        The Service uses AI models to generate text, images, and other content
        based on your prompts and inputs (&ldquo;Output&rdquo;). Output may
        not be unique, may be inaccurate, and may not be suitable for all
        uses. You are responsible for reviewing and validating Output before
        relying on or distributing it.
      </p>
    ),
  },
  {
    id: "intellectual-property",
    heading: "8. Intellectual Property",
    body: (
      <p>
        The Service — including the platform, models, brand, and
        documentation — is owned by Cogniate or its licensors. Except for the
        licence granted in Section 4, no rights are transferred to you.
      </p>
    ),
  },
  {
    id: "third-party-services",
    heading: "9. Third-Party Services",
    body: (
      <p>
        The Service may interoperate with third-party services. Your use of
        those services is subject to their terms; Cogniate is not responsible
        for them.
      </p>
    ),
  },
  {
    id: "confidentiality",
    heading: "10. Confidentiality",
    body: (
      <p>
        Each party will protect the other&rsquo;s confidential information
        using reasonable care.
      </p>
    ),
  },
  {
    id: "suspension-and-termination",
    heading: "11. Suspension and Termination",
    body: (
      <p>
        We may suspend or terminate access for violations of these Terms or to
        protect the Service. You may stop using the Service at any time.
        Sections that should survive termination will survive.
      </p>
    ),
  },
  {
    id: "disclaimers",
    heading: "12. Disclaimers",
    body: (
      <p>
        The Service is provided &ldquo;as is&rdquo; and &ldquo;as
        available&rdquo;. To the maximum extent permitted by law, Cogniate
        disclaims all warranties, express or implied, including
        merchantability, fitness for a particular purpose, and
        non-infringement.
      </p>
    ),
  },
  {
    id: "limitation-of-liability",
    heading: "13. Limitation of Liability",
    body: (
      <p>
        To the maximum extent permitted by law, Cogniate&rsquo;s total
        liability arising out of or relating to these Terms or the Service is
        limited to the amounts paid by you in the 12 months preceding the
        claim. Cogniate is not liable for indirect, incidental, special,
        consequential, or punitive damages.
      </p>
    ),
  },
  {
    id: "indemnification",
    heading: "14. Indemnification",
    body: (
      <p>
        You will indemnify and hold harmless Cogniate, its affiliates
        including Sølúna Ventures, and their personnel from any third-party
        claim arising out of your Customer Content or your breach of these
        Terms.
      </p>
    ),
  },
  {
    id: "governing-law",
    heading: "15. Governing Law",
    body: (
      <p>
        These Terms are governed by the laws of the State of Delaware, USA,
        without regard to conflict-of-laws principles. The parties consent to
        the exclusive jurisdiction of the state and federal courts located in
        Delaware for any dispute not subject to arbitration.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "16. Changes",
    body: (
      <p>
        We may update these Terms from time to time. Material changes will be
        communicated by posting the updated Terms and, where appropriate, by
        email or in-product notice. Continued use after changes take effect
        constitutes acceptance.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "17. Contact",
    body: (
      <p>
        Cogniate US, Inc. —{" "}
        <a href="mailto:legal@cogniate.ai">legal@cogniate.ai</a>
      </p>
    ),
  },
];

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-body md:text-body-lg text-white/70 font-light max-w-[640px] leading-[1.5] tracking-[-0.2px]">
            These Terms govern your access to and use of cogniate.ai and the
            Cogniate platform (the &ldquo;Service&rdquo;), provided by
            Cogniate US, Inc. By using the Service you agree to these Terms.
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
