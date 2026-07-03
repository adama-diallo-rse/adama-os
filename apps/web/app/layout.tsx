import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ConsentBanner } from "../components/consent-banner";
import {
  CONTACT_EMAIL,
  GITHUB_OWNER,
  GITHUB_REPO_URL,
} from "../components/types";
import "./globals.css";

const SITE_URL = "https://adama-os-web.vercel.app";

// L8-T5 — Métadonnées home. L'image OG est générée au build par
// app/opengraph-image.tsx (statique : aucune donnée dynamique).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Adama OS, System Architect",
    template: "%s · Adama OS",
  },
  description:
    "Tableau de bord en direct d'Adama Diallo, architecte de Strata. RSE, ESG, CSRD, ESRS, VSME.",
  keywords: [
    "Adama Diallo",
    "RSE",
    "ESG",
    "CSRD",
    "ESRS",
    "VSME",
    "chargé de mission Data ESG",
    "reporting durabilité",
    "Strata",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Adama OS, System Architect",
    description:
      "Le dashboard système d'Adama Diallo, architecte de Strata. RSE / ESG × ingénierie.",
    url: "/",
    siteName: "Adama OS",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adama OS, System Architect",
    description:
      "Le dashboard système d'Adama Diallo, architecte de Strata.",
  },
};

// L8-T5 — JSON-LD Person : identité machine-lisible pour Google et
// les moteurs IA. Données 100% statiques, injectées côté serveur.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Adama Diallo",
  jobTitle: "Chargé de missions RSE - Data ESG & Solutions IA",
  description:
    "Profil hybride RSE / ESG et ingénierie. Fondateur de Strata (CSRD, ESRS, VSME). En stage Data ESG & Solutions IA chez AG2R LA MONDIALE jusqu'au 31 octobre 2026.",
  worksFor: [
    { "@type": "Organization", name: "AG2R LA MONDIALE" },
    { "@type": "Organization", name: "STRATA" },
  ],
  url: SITE_URL,
  email: `mailto:${CONTACT_EMAIL}`,
  sameAs: [`https://github.com/${GITHUB_OWNER}`, GITHUB_REPO_URL],
  knowsAbout: [
    "RSE",
    "ESG",
    "CSRD",
    "ESRS",
    "VSME",
    "Reporting de durabilité",
    "Next.js",
    "Supabase",
    "Python",
  ],
  seeks: {
    "@type": "Demand",
    name: "CDI / CDD : Chargé de mission Data ESG, Consultant RSE ou Chef de projet Conformité / Automatisation, Île-de-France, à partir de novembre 2026",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
