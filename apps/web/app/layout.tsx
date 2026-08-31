import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ConsentBanner } from "../components/consent-banner";
import {
  CONTACT_EMAIL,
  GITHUB_PROFILE_URL,
  GITHUB_REPO_URL,
} from "../components/types";
import { SITE_URL } from "../lib/site";
import "./globals.css";
import "./portfolio.css";
import "./subpages.css";
import localFont from "next/font/local";

const syne = localFont({
  src: "../public/fonts/syne-variable.ttf",
  variable: "--font-syne",
  display: "swap",
  weight: "400 800",
});

// L8-T5, Métadonnées home. L'image OG est générée au build par
// app/opengraph-image.tsx (statique : aucune donnée dynamique).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Adama Diallo | RSE, data et développement",
    template: "%s · Adama OS",
  },
  description:
    "Adama Diallo, en stage Data ESG chez AG2R LA MONDIALE. Mes projets STRATA ESG et IROKO, mon parcours en RSE et mon journal de développement.",
  keywords: [
    "Adama Diallo",
    "RSE",
    "ESG",
    "CSRD",
    "ESRS",
    "VSME",
    "chargé de mission Data ESG",
    "reporting durabilité",
    "STRATA ESG",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Adama Diallo | RSE, data et développement",
    description:
      "Mon parcours en RSE et mes projets logiciels : STRATA ESG, IROKO et Adama OS.",
    url: "/",
    siteName: "Adama OS",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adama Diallo | RSE, data et développement",
    description:
      "RSE, data et développement. Projets, parcours et atelier ouvert.",
  },
};

// L8-T5 puis L8-T9, JSON-LD : identité machine-lisible pour Google et les
// moteurs IA. Deux nœuds ici, statiques et injectés côté serveur : la personne
// et le site. L'organisation et les logiciels sont déclarés sur /ecosysteme,
// où ils sont lus depuis le registre produits plutôt que recopiés.
const personJsonLd = {
  "@type": "Person",
  "@id": `${SITE_URL}#adama-diallo`,
  name: "Adama Diallo",
  jobTitle: "Chargé de missions RSE - Data ESG & Solutions IA",
  description:
    "Fondateur de STRATA ESG (CSRD, ESRS, VSME). En stage Data ESG & Solutions IA chez AG2R LA MONDIALE jusqu'au 31 octobre 2026. Développe les projets STRATA ESG, IROKO et Adama OS.",
  worksFor: [
    { "@type": "Organization", name: "AG2R LA MONDIALE" },
    { "@type": "Organization", name: "STRATA ESG" },
  ],
  url: SITE_URL,
  email: `mailto:${CONTACT_EMAIL}`,
  sameAs: [GITHUB_PROFILE_URL, GITHUB_REPO_URL],
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

const siteJsonLd = {
  "@type": "WebSite",
  "@id": `${SITE_URL}#site`,
  name: "Adama OS",
  alternateName: "Adama OS, System Dashboard",
  url: SITE_URL,
  inLanguage: "fr-FR",
  author: { "@id": `${SITE_URL}#adama-diallo` },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [personJsonLd, siteJsonLd],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${syne.variable}`}
    >
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
