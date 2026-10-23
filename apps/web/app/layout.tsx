import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Courier_Prime, DM_Sans } from "next/font/google";
import { ConsentBanner } from "../components/consent-banner";
import {
  CONTACT_EMAIL,
  GITHUB_PROFILE_URL,
  GITHUB_REPO_URL,
} from "../components/types";
import { SITE_URL } from "../lib/site";
import {
  ACTIVITE,
  FORMATION,
  IDENTITE,
  ORGANISATIONS_ACTUELLES,
  POSTE_ACTUEL,
  TITRE_COURT,
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
// EH3 : l’article long bilingue et ses preuves cassées.
import "./article.css";
// EW3 : registre public des erreurs, sa taxonomie et son gabarit en cinq blocs.
import "./erreurs.css";
// EC1 a EG2 : signature verifiable, parcours en cinq temps, notes de fond,
// quatre portes, diagnostic court, revue et console des demandes.
import "./conseil.css";
// Vague 1 des strates : méthodes, mesure de M-001, écriture avec assistance,
// tenue privée et corrections d’objets publiés.
import "./strates.css";
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
    default: "ADAMA OS | Rendre l’économie réelle mesurable",
    template: "%s · ADAMA OS",
  },
  // La description est ce qu'un moteur affiche sous le titre : au-dela
  // d'environ 160 caracteres, il coupe et choisit lui-meme la suite. Elle
  // porte donc la capacite et la situation, les deux seules choses qu'un
  // lecteur de resultat de recherche a besoin de savoir.
  description: `${IDENTITE.capacite} ${IDENTITE.situation}`,
  // Les maisons viennent de la source unique de profil : un mot-cle qui ne
  // figure pas sur la page est un mot-cle qui ment.
  keywords: [
    IDENTITE.nom,
    ...ACTIVITE.maisons,
    "RSE",
    "ESG",
    "CSRD",
    "ESRS",
    "VSME",
    "reporting durabilité",
    "gestion d’officine",
    "Sénégal",
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
    title: "ADAMA OS | Rendre l’économie réelle mesurable",
    description: ADAMA_OS.sousTitre,
    url: "/",
    siteName: "ADAMA OS",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ADAMA OS | Rendre l’économie réelle mesurable",
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
  // Les organisations actuelles se lisent dans la source du profil.
  // Recopiees ici, elles divergeraient le jour ou la source change, et le
  // resultat de recherche montrerait une personne que la page ne decrit pas.
  worksFor: ORGANISATIONS_ACTUELLES.map((o) => ({
    "@type": "Organization",
    name: o.organisation,
    ...(o.precision
      ? {
          location: { "@type": "Place", name: o.precision },
        }
      : {}),
  })),
  alumniOf: FORMATION.map((f) => ({
    "@type": "CollegeOrUniversity",
    name: f.precision,
  })),
  homeLocation: ACTIVITE.villes.map((ville) => ({
    "@type": "Place",
    name: ville,
  })),
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
    "Gestion d’officine",
    "Next.js",
    "Supabase",
    "Python",
  ],
};

const siteJsonLd = {
  "@type": "WebSite",
  "@id": `${SITE_URL}#site`,
  name: "ADAMA OS",
  // EC1 : le titre court se lit dans la source du profil, comme partout.
  alternateName: `ADAMA OS, ${TITRE_COURT.texte}`,
  description: ADAMA_OS.sousTitre,
  url: SITE_URL,
  inLanguage: "fr-FR",
  author: { "@id": `${SITE_URL}#adama-diallo` },
};

// C13-T5 retire le 23 octobre 2026. Un troisieme noeud declarait la
// recherche de poste (type Demand, un par intitule vise). La recherche est
// close depuis le 10 octobre 2026 : un moteur ou un agent qui lirait encore
// ce noeud presenterait Adama comme candidat, ce que la page ne dit plus.
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
