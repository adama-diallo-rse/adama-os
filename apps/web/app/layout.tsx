import type { Metadata, Viewport } from "next";
import { ConsentBanner } from "../components/consent-banner";
import { IleDefilement } from "../components/mouvement/ile-defilement";
import { SITE_URL } from "../lib/site";
import { grapheRacine, serialiser } from "../lib/entites";
import { ACTIVITE, IDENTITE, REFERENCEMENT } from "../content/profil";
import { ADAMA_OS } from "../content/adama-os";
// Les rôles de couleur et l'échelle typographique d'ADAMA OS (révision du
// 30 octobre 2026), chargés avant toute autre feuille.
import "./identite.css";
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
// Refonte du 30 octobre 2026 : le kit de page intérieure commun, l'accueil
// en cinq actes et les surfaces du catalogue. Chargée en dernier, elle a le
// dernier mot sur les feuilles historiques.
import "./refonte.css";
// Refonte commerciale du 7 novembre 2026 : en-tête à commandes de même
// hauteur, bande de confiance, photographies et offre d'accompagnement.
import "./accompagnement.css";
import localFont from "next/font/local";

// 7 novembre 2026 : la typographie de STRATA ESG, relevée sur
// strata-esg.fr, pour que les maisons parlent d'une même voix. Trois
// familles autohébergées, licence SIL Open Font License 1.1, notées dans
// CREDITS.md : Inter Tight pour les titres et l'interface (le mot accentué
// en italique), DM Sans pour le texte courant. Courier Prime a quitté le
// site le 7 novembre au soir : les libellés passent en Inter Tight.
const interTight = localFont({
  src: "./fonts/inter-tight-latin-wght-normal.woff2",
  variable: "--font-inter-tight",
  display: "swap",
  weight: "100 900",
});

const interTightItalique = localFont({
  src: "./fonts/inter-tight-latin-wght-italic.woff2",
  variable: "--font-inter-tight-italique",
  display: "swap",
  style: "italic",
  weight: "100 900",
  preload: false,
});

// Seconde passe, même jour : Host Grotesk porte les grands titres, le
// premier écran compris, et son italique le mot accentué. Inter Tight
// garde l'interface et les intertitres.
const hostGrotesk = localFont({
  src: "./fonts/host-grotesk-latin-wght-normal.woff2",
  variable: "--font-host-grotesk",
  display: "swap",
  weight: "300 800",
});

const hostGroteskItalique = localFont({
  src: "./fonts/host-grotesk-latin-wght-italic.woff2",
  variable: "--font-host-grotesk-italique",
  display: "swap",
  style: "italic",
  weight: "300 800",
  preload: false,
});

const dmSans = localFont({
  src: "./fonts/dm-sans-latin-wght-normal.woff2",
  variable: "--font-dm-sans",
  display: "swap",
  weight: "100 1000",
});

// Le rideau d'épure de l'accueil : posé AVANT la première peinture, et
// seulement à la première visite, hors réduction de mouvement. Sans script,
// il n'existe pas : le titre et le contenu sont visibles d'emblée.
const SCRIPT_RIDEAU = `try{var d=document.documentElement;if(location.pathname==="/"&&!localStorage.getItem("adama-rideau")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){d.setAttribute("data-rideau","");localStorage.setItem("adama-rideau","1")}}catch(e){}`;

// L8-T5, Métadonnées par défaut. L'image OG est générée au build par
// app/opengraph-image.tsx (statique : aucune donnée dynamique).
//
// 14 novembre 2026 : le titre par défaut et la description disent qui, quel
// métier et où, avec les mots qu'un lecteur tape dans un moteur. Ils se
// lisent dans content/profil.ts (REFERENCEMENT), comme le h1 de l'accueil.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: REFERENCEMENT.accueil.titre,
    template: "%s · ADAMA OS",
  },
  // La description est ce qu'un moteur affiche sous le titre : au-delà
  // d'environ 160 caractères, il coupe et choisit lui-même la suite.
  description: REFERENCEMENT.accueil.description,
  // Les maisons viennent de la source unique de profil : un mot-clé qui ne
  // figure pas sur la page est un mot-clé qui ment.
  keywords: [
    IDENTITE.nom,
    ADAMA_OS.nom,
    ...ACTIVITE.maisons,
    "architecture logicielle",
    "logiciels ESG",
    "SaaS",
    "donnée de durabilité",
    "CSRD",
    "VSME",
    "bilan carbone",
    "logiciels de santé",
    "accompagnement de projets",
    ...ACTIVITE.villes,
    "Afrique de l’Ouest",
    "Sénégal",
  ],
  authors: [{ name: IDENTITE.nom, url: `${SITE_URL}/a-propos` }],
  creator: IDENTITE.nom,
  publisher: IDENTITE.nom,
  alternates: { canonical: "/" },
  // Favicon, apple-icon et manifeste sont servis par les conventions de
  // fichiers (app/icon.svg, app/favicon.ico, app/apple-icon.png,
  // app/manifest.ts). Seul le libellé d'écran d'accueil iOS se déclare ici.
  appleWebApp: { title: "ADAMA OS" },
  // Les aperçus longs sont autorisés explicitement : un extrait de texte
  // sans limite et une grande image, pour les résultats enrichis comme pour
  // les réponses rédigées par un assistant de recherche.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  // Propriété Search Console https://adamesg-os.fr/, ouverte le 9 septembre
  // 2026. Le jeton est public par construction : il est servi dans le HTML
  // de chaque page. Il ne donne aucun droit, il prouve seulement que le
  // propriétaire du compte contrôle ce domaine. Ne pas le retirer : Google
  // révoque la propriété dès qu'il ne le trouve plus.
  verification: {
    google: "9MNunaSiGbPwx8_DDYpwGqI7gAocN2nHoB57B7UQF8w",
  },
  openGraph: {
    title: REFERENCEMENT.accueil.titre,
    description: ADAMA_OS.sousTitre,
    url: "/",
    siteName: "ADAMA OS",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: REFERENCEMENT.accueil.titre,
    description: ADAMA_OS.sousTitre,
  },
};

// Barre du navigateur mobile : l'ivoire du fond en clair, l'encre en sombre.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f3ea" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f1a" },
  ],
};

// L8-T5 puis L8-T9, JSON-LD : identité lisible par une machine, pour les
// moteurs de recherche et les assistants. Depuis le 14 novembre 2026, le
// graphe vit dans lib/entites.ts : la personne, le site et les trois
// maisons, chacun avec son identifiant, servis sur toutes les pages. Les
// logiciels restent déclarés sur /ecosysteme, lus depuis le registre
// produits.
//
// C13-T5 retiré le 23 octobre 2026 : aucun nœud ne déclare plus de
// recherche de poste, close depuis le 10 octobre 2026.
const jsonLd = grapheRacine();

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${hostGrotesk.variable} ${hostGroteskItalique.variable} ${interTight.variable} ${interTightItalique.variable} ${dmSans.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_RIDEAU }} />
      </head>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialiser(jsonLd) }}
        />
        {children}
        <ConsentBanner />
        <IleDefilement />
      </body>
    </html>
  );
}
