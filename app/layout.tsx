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

export const metadata: Metadata = {
  title: "Cogniate",
  description: "Cogniate — AI-powered course creator. From concept to deployment in under 60 minutes.",
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
