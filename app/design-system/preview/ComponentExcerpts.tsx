import EyebrowBadge from "../../components/EyebrowBadge";
import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonSecondary from "../../components/ButtonSecondary";

export default function ComponentExcerpts() {
  return (
    <div className="space-y-12">
      {/* Class chains duplicate Hero/Landscape verbatim so the cascade can preview on the live heading shape — do not DRY without preserving that contract */}
      {/* Hero excerpt */}
      <div className="border border-white/10 rounded-lg p-8 bg-bg-secondary">
        <EyebrowBadge>AI POWERED COURSE CREATOR</EyebrowBadge>
        <h1 className="mt-6 text-center">
          <span className="heading-gradient block text-h1-mobile sm:text-h1-tablet lg:text-h1-desktop font-[var(--font-weight-h1)] leading-[var(--leading-h1)] tracking-[var(--tracking-h1)]">
            The future of{" "}
            <span className="font-serif italic font-normal text-h1-italic-mobile sm:text-h1-italic-tablet lg:text-h1-italic-desktop tracking-[var(--tracking-h1)]">
              learning,
            </span>
          </span>
          <span className="heading-gradient block text-h1-mobile sm:text-h1-tablet lg:text-h1-desktop font-[var(--font-weight-h1)] leading-[var(--leading-h1)] tracking-[var(--tracking-h1)]">
            authored in minutes.
          </span>
        </h1>
        <div className="mt-8 flex gap-4 justify-center">
          <ButtonPrimary>Book a Demo</ButtonPrimary>
          <ButtonSecondary>Join the Community</ButtonSecondary>
        </div>
      </div>

      {/* Section h2 excerpt */}
      <div className="border border-white/10 rounded-lg p-8 bg-bg-secondary">
        <h2 className="landscape-heading-gradient text-center text-h2-mobile sm:text-h2-tablet lg:text-h2-desktop font-[var(--font-weight-h2)] leading-[var(--leading-h2)] tracking-[var(--tracking-h2)]">
          Imagine being 150x faster.
        </h2>
      </div>
    </div>
  );
}
