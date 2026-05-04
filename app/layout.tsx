import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollRestorer from "./components/ScrollRestorer";
import FormModalProvider from "./lib/form-modal/FormModalProvider";

const scrollRestorationScript = `
try {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (sessionStorage.getItem('cogniate:scrollY')) {
    document.documentElement.dataset.restoring = 'true';
  }
} catch (e) {}
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://cogniate.ai");

const siteName = "Cogniate";
const siteDescription =
  "Cogniate is the AI-powered course creator. Go from concept to deployable course in under 60 minutes — no instructional designers, no production teams.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cogniate — AI-powered course creator",
    template: "%s · Cogniate",
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "AI course creator",
    "course authoring",
    "instructional design",
    "learning platform",
    "AI learning",
    "Cogniate",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: "Cogniate — AI-powered course creator",
    description: siteDescription,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cogniate — AI-powered course creator",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: scrollRestorationScript }} />
      </head>
      <body>
        <ScrollRestorer />
        <FormModalProvider>{children}</FormModalProvider>
      </body>
    </html>
  );
}
