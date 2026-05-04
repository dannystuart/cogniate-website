// Single source of truth for pricing tiers.
// CTAs use FORM_HASH for deep-linking — matches the FormModalProvider hash sync
// (registry id "book-a-demo"). PricingTierCard intercepts the click to open the
// modal imperatively while keeping the href so right-click → open-in-new-tab works.

export const BOOK_DEMO_HREF = "#book-a-demo";

export type AuthoringTier = {
  id: string;
  eyebrow: string;
  name: string;
  positioning: string;
  monthly: number | null;          // null = custom
  annualPerMonth: number | null;   // null = no annual published
  annualPerYear: number | null;
  priceLabel?: string;             // overrides numeric (e.g. "Custom", "From $199")
  priceCaption?: string;           // tiny line under price (e.g. "/seat · min 5")
  highlights: { icon: HighlightIcon; label: string; sub?: string }[];
  details: { label: string; value: string }[];
  ctaLabel: string;
  popular?: boolean;
};

export type HighlightIcon = "users" | "library" | "tokens" | "exports" | "shield" | "sparkle" | "globe" | "infinity";

export const individualTiers: AuthoringTier[] = [
  {
    id: "free",
    eyebrow: "FREE",
    name: "Free",
    positioning: "Try the platform on a single course.",
    monthly: 0,
    annualPerMonth: 0,
    annualPerYear: 0,
    priceCaption: "forever",
    highlights: [
      { icon: "users", label: "1 user", sub: "solo" },
      { icon: "library", label: "1 course", sub: "max 7 lessons" },
      { icon: "tokens", label: "100 tokens", sub: "Lyra only" },
    ],
    details: [
      { label: "Library", value: "1 course (max 7 lessons)" },
      { label: "Tokens", value: "100/mo (Lyra only)" },
      { label: "Exports", value: "SCORM 1.2" },
      { label: "Domain", value: "Cogniate subdomain only" },
      { label: "Branding", value: "Watermarked publishing" },
      { label: "Support", value: "Community Slack" },
      { label: "Trial", value: "—" },
    ],
    ctaLabel: "Start free",
  },
  {
    id: "creator",
    eyebrow: "MOST POPULAR",
    name: "Creator",
    positioning: "For working creators who ship regularly.",
    monthly: 39,
    annualPerMonth: 29,
    annualPerYear: 348,
    priceCaption: "per month",
    highlights: [
      { icon: "users", label: "1 user + 2 collaborators" },
      { icon: "library", label: "10 courses", sub: "expandable" },
      { icon: "tokens", label: "1,500 tokens", sub: "full stack" },
    ],
    details: [
      { label: "Library", value: "10 courses (expandable via Library Packs)" },
      { label: "Tokens", value: "1,500/mo (full creative stack)" },
      { label: "Exports", value: "SCORM 1.2" },
      { label: "Domain", value: "Custom domain supported" },
      { label: "Branding", value: "Cogniate Community Back" },
      { label: "Support", value: "Community Slack" },
      { label: "Trial", value: "7-day free trial of next tier" },
    ],
    ctaLabel: "Book a Demo",
    popular: true,
  },
  {
    id: "pro-creator",
    eyebrow: "PRO",
    name: "Pro Creator",
    positioning: "For studios and senior creators.",
    monthly: 75,
    annualPerMonth: 63,
    annualPerYear: 756,
    priceCaption: "per month",
    highlights: [
      { icon: "users", label: "1 user + 5 collaborators" },
      { icon: "library", label: "30 courses" },
      { icon: "tokens", label: "6,000 tokens", sub: "full stack" },
    ],
    details: [
      { label: "Library", value: "30 courses" },
      { label: "Tokens", value: "6,000/mo (full stack)" },
      { label: "Exports", value: "SCORM 1.2 / 2004, xAPI, HTML5, LTI 1.3" },
      { label: "Branding", value: "Remove Cogniate branding" },
      { label: "Features", value: "Version branching, advanced Lyra, priority support" },
      { label: "Trial", value: "None (upgrade from Creator)" },
    ],
    ctaLabel: "Book a Demo",
  },
];

export const teamTiers: AuthoringTier[] = [
  {
    id: "team",
    eyebrow: "TEAM",
    name: "Team",
    positioning: "Real-time co-authoring for a working team.",
    monthly: 59,
    annualPerMonth: 59,
    annualPerYear: null,
    priceCaption: "per seat / month · min 5",
    highlights: [
      { icon: "users", label: "Min 5 seats", sub: "$297 entry" },
      { icon: "library", label: "Unlimited", sub: "soft cap 50" },
      { icon: "tokens", label: "30,000 pooled" },
    ],
    details: [
      { label: "Seat minimum", value: "5 seats ($297/mo entry)" },
      { label: "Library", value: "Unlimited (soft cap 50)" },
      { label: "Tokens", value: "30,000/mo pooled" },
      { label: "Collaboration", value: "Real-time co-authoring, role permissions" },
      { label: "Support", value: "Named point-of-contact" },
      { label: "Trial", value: "None (sales-led)" },
    ],
    ctaLabel: "Book a Demo",
    popular: true,
  },
  {
    id: "agency",
    eyebrow: "AGENCY",
    name: "Agency",
    priceLabel: "From $199",
    monthly: null,
    annualPerMonth: null,
    annualPerYear: null,
    priceCaption: "per seat · custom quoted",
    positioning: "For agencies serving multiple clients.",
    highlights: [
      { icon: "users", label: "Negotiated seats" },
      { icon: "library", label: "Unlimited", sub: "across workspaces" },
      { icon: "tokens", label: "100,000 pooled" },
    ],
    details: [
      { label: "Seat minimum", value: "Negotiated (per deal)" },
      { label: "Library", value: "Unlimited across client workspaces" },
      { label: "Tokens", value: "100,000/mo pooled" },
      { label: "Features", value: "Multi-tenant briefing, multi-tenant workspaces, partner program" },
      { label: "Catalog status", value: "NOT in Stripe catalog — custom invoicing per deal" },
      { label: "Ownership", value: "Sales team" },
    ],
    ctaLabel: "Talk to sales",
  },
  {
    id: "enterprise",
    eyebrow: "ENTERPRISE",
    name: "Enterprise",
    priceLabel: "Custom",
    monthly: null,
    annualPerMonth: null,
    annualPerYear: null,
    priceCaption: "by requirement",
    positioning: "For organisations with compliance & scale needs.",
    highlights: [
      { icon: "shield", label: "SSO/SAML, SCIM" },
      { icon: "library", label: "Volume pool" },
      { icon: "globe", label: "Data residency" },
    ],
    details: [
      { label: "Seats", value: "By requirement / volume pool" },
      { label: "Compliance", value: "SSO/SAML 2.0 + SCIM, GDPR, HIPAA, SOC 2 Type II posture" },
      { label: "Features", value: "Lesson-level branching, dedicated CSM, SLA, with credits" },
      { label: "Catalog status", value: "NOT in Stripe catalog — contract-based invoicing" },
      { label: "Ownership", value: "Enterprise sales (Mona with Kathryn Vatti on IP/legal)" },
    ],
    ctaLabel: "Talk to sales",
  },
];

// ──────────── Publishing (reference) ────────────

export type PublishingTier = {
  id: string;
  name: string;
  eyebrow: string;
  priceLabel: string;
  priceCaption: string;
  learnersLabel: string;
  features: string[];
  popular?: boolean;
};

export const publishingTiers: PublishingTier[] = [
  {
    id: "pub-starter",
    name: "Starter",
    eyebrow: "STARTER",
    priceLabel: "$9",
    priceCaption: "per course / month",
    learnersLabel: "Up to 100 learners",
    features: ["SCORM hosting", "Basic analytics", "Cogniate subdomain"],
  },
  {
    id: "pub-growth",
    name: "Growth",
    eyebrow: "MOST POPULAR",
    priceLabel: "$29",
    priceCaption: "per course / month",
    learnersLabel: "Up to 1,000 learners",
    features: ["Custom domain", "Certificates", "Advanced analytics"],
    popular: true,
  },
  {
    id: "pub-scale",
    name: "Scale",
    eyebrow: "SCALE",
    priceLabel: "$99",
    priceCaption: "per course / month",
    learnersLabel: "Up to 10,000 learners",
    features: ["API access", "SSO", "Compliance logs", "Priority support"],
  },
  {
    id: "pub-enterprise",
    name: "Enterprise",
    eyebrow: "ENTERPRISE",
    priceLabel: "Custom",
    priceCaption: "no quote",
    learnersLabel: "Unlimited learners",
    features: ["Dedicated infra", "SLA", "Data residency"],
  },
];

// ──────────── Add-ons (reference) ────────────

export type AddOn = {
  id: string;
  name: string;
  price: string;
  quantity: string;
  provides: string;
};

export const addOns: AddOn[] = [
  {
    id: "library-pack",
    name: "Library Pack",
    price: "$19/mo",
    quantity: "Unlimited stackable",
    provides: "+10 authoring courses per pack",
  },
  {
    id: "spark-boost",
    name: "Spark Boost",
    price: "$9/mo",
    quantity: "One per account",
    provides: "+1,000 tokens",
  },
  {
    id: "ignite-boost",
    name: "Ignite Boost",
    price: "$19/mo",
    quantity: "One per account",
    provides: "+5,000 tokens",
  },
  {
    id: "blaze-boost",
    name: "Blaze Boost",
    price: "$49/mo",
    quantity: "One per account",
    provides: "+15,000 tokens",
  },
  {
    id: "unlimited-boost",
    name: "Unlimited Boost",
    price: "$99/mo",
    quantity: "One per account",
    provides: "Unlimited tokens (1 authoring library)",
  },
  {
    id: "org-wide-boost",
    name: "Org-Wide Boost",
    price: "$199/mo",
    quantity: "One per workspace",
    provides: "+50,000 pooled tokens",
  },
];
