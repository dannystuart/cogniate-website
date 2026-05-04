import type { Metadata } from "next";
import NavMenu from "../components/NavMenu";
import Footer from "../sections/Footer";
import PricingHero from "../components/pricing/PricingHero";
import PricingNav from "../components/pricing/PricingNav";
import AuthoringSection from "../components/pricing/AuthoringSection";
// Hidden for now — keep imports/components in tree so we can re-enable later.
// import PublishingSection from "../components/pricing/PublishingSection";
// import AddOnsSection from "../components/pricing/AddOnsSection";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Plans for solo creators, teams, and enterprises. Authoring, publishing, and stackable boosts.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing · Cogniate",
    description:
      "Plans for solo creators, teams, and enterprises. Authoring, publishing, and stackable boosts.",
    url: "/pricing",
    type: "website",
  },
};

export default function PricingPage() {
  return (
    <main className="relative bg-bg-primary">
      <NavMenu />
      <PricingHero />
      <PricingNav />
      <AuthoringSection />
      {/* <PublishingSection /> */}
      {/* <AddOnsSection /> */}
      <Footer />
    </main>
  );
}
