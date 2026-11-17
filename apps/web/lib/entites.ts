// =====================================================================
// Le graphe d'entités du site, 14 novembre 2026.
//
// Un moteur de recherche, comme un assistant qui résume, ne lit pas des
// pages : il relie des entités. Une personne, ses organisations, son site.
// Jusqu'ici chaque page écrivait sa propre personne (`{ "@type": "Person",
// name: "Adama Diallo" }`) : six nœuds sans identifiant, donc six
// personnes différentes pour une machine, et aucune n'était reliée aux
// maisons.
//
// Ici, chaque entité porte un identifiant stable (`@id`). La personne est
// décrite une fois, dans le gabarit racine, et toutes les pages y
// renvoient par référence. Les maisons déclarent leur fondateur par le
// même identifiant : c'est ce lien, lisible par une machine, qui dit que
// l'auteur d'ADAMA OS est le fondateur de STRATA ESG.
//
// Les noms, le titre, les villes et les langues se lisent dans
// content/profil.ts. Rien ne se recopie ici.
// =====================================================================

import { SITE_URL, absoluteUrl } from "./site";
import {
  ACTIVITE,
  FORMATION,
  IDENTITE,
  LANGUES,
  POSTE_ACTUEL,
  TITRE_COURT,
} from "../content/profil";
import { ADAMA_OS } from "../content/adama-os";
import {
  CONTACT_EMAIL,
  GITHUB_PROFILE_URL,
  GITHUB_REPO_URL,
  LINKEDIN_PROFILE_URL,
} from "../components/types";

/** Identifiant de la personne, le même sur toutes les pages. */
export const ID_PERSONNE = `${SITE_URL}#adama-diallo`;
/** Identifiant du site. */
export const ID_SITE = `${SITE_URL}#site`;

type Maison = {
  /** Fragment de l'identifiant, stable depuis le 30 octobre 2026. */
  ancre: string;
  nom: (typeof ACTIVITE.maisons)[number];
  description: string;
  url: string;
  lieu?: { ville: string; pays: string };
};

/**
 * Les trois maisons, telles que les machines les lisent. L'ordre est celui
 * de l'activité ; tests/referencement.test.ts vérifie que les deux listes
 * nomment exactement les mêmes maisons.
 */
export const MAISONS: readonly Maison[] = [
  {
    ancre: "organisation",
    nom: "STRATA ESG",
    description: "Logiciels et accompagnement pour la donnée de durabilité.",
    url: "https://www.strata-esg.fr",
    lieu: { ville: "Paris", pays: "FR" },
  },
  {
    ancre: "conhama",
    nom: "Conhama",
    description: "La carte vivante de l’économie durable.",
    url: "https://conhama.com/fr",
  },
  {
    ancre: "pharivo",
    nom: "Pharivo",
    description:
      "Logiciels de santé en Afrique de l’Ouest, en commençant par l’officine.",
    url: "https://pharivo.com",
    lieu: { ville: "Dakar", pays: "SN" },
  },
] as const;

/** Identifiant d'une maison, à partir de son fragment. */
export function idMaison(ancre: string): string {
  return `${SITE_URL}#${ancre}`;
}

/** Renvoi vers la personne : l'identifiant, et le nom pour qui lit sans graphe. */
export function refPersonne() {
  return {
    "@type": "Person" as const,
    "@id": ID_PERSONNE,
    name: IDENTITE.nom,
    url: absoluteUrl("/a-propos"),
  };
}

/** Les sujets que le site traite réellement, page à l'appui. */
const SUJETS = [
  "Architecture logicielle",
  "Logiciels SaaS",
  "Donnée ESG",
  "Reporting de durabilité",
  "CSRD",
  "ESRS",
  "VSME",
  "Bilan carbone",
  "RSE",
  "Logiciels de santé",
  "Gestion d’officine",
  "Afrique de l’Ouest",
  "Next.js",
  "Supabase",
  "Python",
] as const;

/** La personne, décrite une seule fois. */
function noeudPersonne() {
  return {
    "@type": "Person",
    "@id": ID_PERSONNE,
    name: IDENTITE.nom,
    givenName: IDENTITE.prenom,
    familyName: IDENTITE.patronyme,
    jobTitle: POSTE_ACTUEL,
    description: `${IDENTITE.capacite} ${IDENTITE.situation}`,
    url: SITE_URL,
    mainEntityOfPage: absoluteUrl("/a-propos"),
    email: `mailto:${CONTACT_EMAIL}`,
    worksFor: MAISONS.map((m) => ({
      "@type": "Organization",
      "@id": idMaison(m.ancre),
      name: m.nom,
    })),
    alumniOf: FORMATION.map((f) => ({
      "@type": "CollegeOrUniversity",
      name: f.precision,
    })),
    workLocation: ACTIVITE.villes.map((ville) => ({
      "@type": "Place",
      name: ville,
    })),
    knowsLanguage: LANGUES.map((l) => l.code),
    knowsAbout: [...SUJETS],
    sameAs: [LINKEDIN_PROFILE_URL, GITHUB_PROFILE_URL, GITHUB_REPO_URL],
  };
}

/** Le site, publié par la personne. */
function noeudSite() {
  return {
    "@type": "WebSite",
    "@id": ID_SITE,
    name: ADAMA_OS.nom,
    alternateName: `${ADAMA_OS.nom}, ${TITRE_COURT.texte}`,
    description: ADAMA_OS.sousTitre,
    url: SITE_URL,
    inLanguage: "fr-FR",
    author: { "@id": ID_PERSONNE },
    publisher: { "@id": ID_PERSONNE },
    about: { "@id": ID_PERSONNE },
  };
}

/** Les maisons, chacune reliée à son fondateur par identifiant. */
function noeudsMaisons() {
  return MAISONS.map((m) => ({
    "@type": "Organization",
    "@id": idMaison(m.ancre),
    name: m.nom,
    description: m.description,
    url: m.url,
    ...(m.lieu
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: m.lieu.ville,
            addressCountry: m.lieu.pays,
          },
        }
      : {}),
    founder: { "@id": ID_PERSONNE },
  }));
}

/** Le graphe servi sur toutes les pages par le gabarit racine. */
export function grapheRacine() {
  return {
    "@context": "https://schema.org",
    "@graph": [noeudPersonne(), noeudSite(), ...noeudsMaisons()],
  };
}

/** Une liste de questions et réponses, au format FAQPage. */
export function noeudQuestions(
  questions: readonly { q: string; r: string }[],
  chemin: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${absoluteUrl(chemin)}#questions`,
    inLanguage: "fr-FR",
    isPartOf: { "@id": ID_SITE },
    about: { "@id": ID_PERSONNE },
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.q,
      acceptedAnswer: { "@type": "Answer", text: q.r },
    })),
  };
}

/** Sérialise un nœud pour une balise de script, sans fermer la balise. */
export function serialiser(noeud: unknown): string {
  return JSON.stringify(noeud).replace(/</g, "\\u003c");
}
