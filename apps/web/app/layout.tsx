import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Courier_Prime, DM_Sans } from "next/font/google";
import { ConsentBanner } from "../components/consent-banner";
import {
  CONTACT_EMAIL,
  GITHUB_PROFILE_URL,
  GITHUB_REPO_URL,
} from "../components/types";
import { SITE_URL, absoluteUrl } from "../lib/site";
import {
  DEMANDE,
  DISPONIBILITE,
  EXPERIENCE_ACTUELLE,
  IDENTITE,
  POSTE_ACTUEL,
  RECHERCHE,
} from "../content/profil";
import { ADAMA_OS } from "../content/adama-os";
import "./globals.css";
import "./portfolio.css";
import "./subpages.css";
// C1-T4 et C2 : marqueurs de provenance, page de verification, index des
// preuves. Un seul fichier, charge partout, parce que les marqueurs vivent
// aussi bien sur la home que dans le cockpit.
import "./proof.css";
// C5, C6, C7, C9 et C14 : narration, fiches projet, journal d'architecture,
// revirements et principes. Une feuille par famille de couches, comme
// proof.css : un seul fichier de mille lignes de plus dans subpages.css
// aurait cesse d'etre relisible.
import "./narrative.css";
// systeme.css : les vagues V4 a V8 (sante, carte, journal, technique,
// confiance, integrite). Meme raison que proof.css et narrative.css, un
// fichier de plus dans subpages.css le rendrait illisible.
import "./systeme.css";
import "./expansion.css";
// EH0 : la page de la lettre SIGNAL et sa console privee. Une famille de
// surfaces, une feuille, comme les precedentes.
import "./lettre.css";
import localFont from "next/font/local";

const syne = localFont({
  src: "../public/fonts/syne-variable.ttf",
  variable: "--font-syne",
  display: "swap",
  weight: "400 800",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["300", "400"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["300", "400", "500"],
});

const courierPrime = Courier_Prime({
  subsets: ["latin"],
  variable: "--font-courier-prime",
  display: "swap",
  weight: ["400", "700"],
});

// L8-T5, Métadonnées home. L'image OG est générée au build par
// app/opengraph-image.tsx (statique : aucune donnée dynamique).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ADAMA OS | Construire l’ESG numérique",
    template: "%s · ADAMA OS",
  },
  // La description est ce qu'un moteur affiche sous le titre : au-dela
  // d'environ 160 caracteres, il coupe et choisit lui-meme la suite. Elle
  // porte donc la capacite et la disponibilite, les deux seules choses
  // qu'un lecteur de resultat de recherche a besoin de savoir. La demande
  // complete reste dans le JSON-LD et sur /recruteur, ou elle a la place.
  description: `${ADAMA_OS.proposition} ${ADAMA_OS.sousTitre}`,
  // Les intitulés recherchés viennent de la source unique de profil : un
  // mot-clé qui ne figure pas sur la page est un mot-clé qui ment.
  keywords: [
    IDENTITE.nom,
    "RSE",
    "ESG",
    "CSRD",
    "ESRS",
    "VSME",
    ...RECHERCHE.postes,
    "reporting durabilité",
    "STRATA ESG",
  ],
  alternates: { canonical: "/" },
  // Favicon, apple-icon et manifeste sont servis par les conventions de
  // fichiers (app/icon.svg, app/favicon.ico, app/apple-icon.png,
  // app/manifest.ts). Seul le libelle d'ecran d'accueil iOS se declare ici.
  appleWebApp: { title: "ADAMA OS" },
  robots: { index: true, follow: true },
  // Propriete Search Console https://adamesg-os.fr/, ouverte le 9 septembre
  // 2026. Le jeton est public par construction : il est servi dans le HTML
  // de chaque page. Il ne donne aucun droit, il prouve seulement que le
  // proprietaire du compte controle ce domaine. Ne pas le retirer : Google
  // revoque la propriete des qu'il ne le trouve plus.
  verification: {
    google: "9MNunaSiGbPwx8_DDYpwGqI7gAocN2nHoB57B7UQF8w",
  },
  openGraph: {
    title: "ADAMA OS | Construire l’ESG numérique",
    description: ADAMA_OS.sousTitre,
    url: "/",
    siteName: "ADAMA OS",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ADAMA OS | Construire l’ESG numérique",
    description: ADAMA_OS.sousTitre,
  },
};

// Barre du navigateur mobile : la creme du fond, comme le symbole.
export const viewport: Viewport = {
  themeColor: "#F2EDE4",
};

// L8-T5 puis L8-T9, JSON-LD : identité machine-lisible pour Google et les
// moteurs IA. Deux nœuds ici, statiques et injectés côté serveur : la personne
// et le site. L'organisation et les logiciels sont déclarés sur /ecosysteme,
// où ils sont lus depuis le registre produits plutôt que recopiés.
const personJsonLd = {
  "@type": "Person",
  "@id": `${SITE_URL}#adama-diallo`,
  name: IDENTITE.nom,
  // C9-T8 : ces valeurs ne s'ecrivent plus ici. Le hero, le JSON-LD, le mode
  // recruteur et la modale lisent tous content/profil.ts, et
  // tests/profil.test.ts verifie qu'aucun intitule de poste ne reapparait en
  // dur ailleurs. Un profil qui se contredit entre la page et le resultat de
  // recherche montre deux personnes differentes.
  jobTitle: POSTE_ACTUEL,
  description: `${IDENTITE.capacite} ${IDENTITE.situation}`,
  // L'employeur actuel se lit dans la source du profil. Recopie ici, il
  // divergerait le jour ou la source change, et le resultat de recherche
  // montrerait une personne que la page ne decrit pas.
  worksFor: [
    { "@type": "Organization", name: EXPERIENCE_ACTUELLE.organisation },
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
    name: DEMANDE,
    availabilityStarts: RECHERCHE.disponibleLe,
    areaServed: RECHERCHE.zone,
  },
};

const siteJsonLd = {
  "@type": "WebSite",
  "@id": `${SITE_URL}#site`,
  name: "ADAMA OS",
  alternateName: "ADAMA OS, ESG Data Systems",
  description: ADAMA_OS.sousTitre,
  url: SITE_URL,
  inLanguage: "fr-FR",
  author: { "@id": `${SITE_URL}#adama-diallo` },
};

// C13-T5, la recherche d'emploi, lisible par une machine.
//
// L'objectif n'est PAS le trafic : c'est qu'une recherche sur le nom d'Adama
// trouve un ensemble coherent. Un agent qui prefiltre une candidature lit ce
// noeud, la page d'accueil, /llms.txt et le document machine : les quatre
// disent la meme chose parce qu'ils lisent la meme source.
//
// Le type retenu est JobSeeker et non JobPosting : Adama cherche un poste, il
// n'en publie pas un. Annoncer une offre d'emploi serait faux, et un agent
// qui indexerait ce site comme un employeur produirait exactement la
// confusion que cette couche existe pour eviter.
const rechercheJsonLd = {
  "@type": "Person",
  "@id": `${SITE_URL}#recherche`,
  name: IDENTITE.nom,
  mainEntityOfPage: absoluteUrl("/recruteur"),
  seeks: RECHERCHE.postes.map((poste) => ({
    "@type": "Demand",
    name: poste,
    availabilityStarts: RECHERCHE.disponibleLe,
    areaServed: { "@type": "AdministrativeArea", name: RECHERCHE.zone },
    eligibleCustomerType: RECHERCHE.contrats.join(" / "),
  })),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [personJsonLd, siteJsonLd, rechercheJsonLd],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${syne.variable} ${cormorant.variable} ${dmSans.variable} ${courierPrime.variable}`}
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
