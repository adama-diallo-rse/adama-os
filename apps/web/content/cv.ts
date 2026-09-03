// =====================================================================
// C12-T8, le CV comme source unique.
//
// Le defaut que ce fichier ferme : un CV en PDF, un site, un profil en ligne
// et un depot public qui racontent quatre versions du meme parcours. Un
// recruteur qui recoit le PDF cherche le nom sur un moteur, tombe sur le
// profil, puis sur le site, puis sur le depot. La moindre contradiction
// entre ces quatre surfaces annule le travail des douze couches
// precedentes, parce qu'elle est la seule chose qu'il retiendra.
//
// Ce fichier ne DUPLIQUE rien de content/profil.ts : il l'importe. Identite,
// intitules de poste, disponibilite, experiences et formation viennent de la
// source unique de profil. Ce qui vit ici, et seulement ici, ce sont les
// AFFIRMATIONS du CV : les phrases qu'un lecteur pourrait vouloir verifier.
//
// Regle non negociable, verrouillee par tests/cv.test.ts : chaque
// affirmation porte l'identifiant d'une affirmation du registre de preuve.
// Une phrase de CV qui ne peut pas etre adossee a une preuve n'entre pas
// dans ce fichier, et donc pas dans le CV.
// =====================================================================

import {
  COMPETENCES,
  DEMANDE,
  DISPONIBILITE,
  EXPERIENCES,
  FORMATION,
  IDENTITE,
  RECHERCHE,
} from "./profil";

export type AffirmationCv = {
  id: string;
  /** La phrase telle qu'elle figure sur le CV. */
  phrase: string;
  /** Identifiant d'affirmation dans le registre de preuve (proof_claims). */
  preuveId: string;
  /** Section du CV ou la phrase apparait. */
  section: "profil" | "experience" | "projets" | "competences";
};

/**
 * Les affirmations verifiables du CV.
 *
 * Chaque `preuveId` doit exister dans le registre de preuve. Le test lit le
 * catalogue de semis pour le verifier : c'est la definition versionnee de ce
 * que la table contient, et donc la seule verification possible sans base.
 */
/**
 * Une experience rendue en phrase, composee depuis la source.
 *
 * Le 2 septembre 2026, deux affirmations de ce fichier recopiaient un role :
 * « Coordination RSE et reporting chez Younivibe » et une reformulation du
 * role d'AG2R. L'en-tete de ce fichier promet pourtant qu'il n'y duplique
 * rien. Une affirmation de CV qui derive de la source est precisement la
 * contradiction que docs/COHERENCE.md existe pour empecher.
 */
function phraseExperience(id: string): string {
  const exp = EXPERIENCES.find((e) => e.id === id);
  if (!exp) {
    throw new Error(
      `Affirmation de CV adossee a une experience inconnue : ${id}`,
    );
  }
  const lieu = exp.precision
    ? `${exp.organisation} (${exp.precision})`
    : exp.organisation;
  return `${exp.role} chez ${lieu}`;
}

export const AFFIRMATIONS_CV: readonly AffirmationCv[] = [
  {
    id: "cockpit-public",
    phrase:
      "Le code de ce cockpit est public et son historique de contributions est lisible.",
    preuveId: "cockpit-code-public",
    section: "projets",
  },
  {
    id: "esg-optimizer",
    phrase: "ESG Optimizer est en ligne et son interface publique répond.",
    preuveId: "esg-optimizer-en-ligne",
    section: "projets",
  },
  {
    id: "strata-scope",
    phrase: "STRATA Scope est en ligne et son interface publique répond.",
    preuveId: "strata-scope-en-ligne",
    section: "projets",
  },
  {
    id: "registre-produits",
    phrase:
      "Le registre des produits du groupe vit en base de données, pas dans le code des pages.",
    preuveId: "registre-produits-en-base",
    section: "competences",
  },
  {
    id: "provenance",
    phrase:
      "Chaque valeur chiffrée publiée porte sa source, sa méthode d’obtention et sa date.",
    preuveId: "metriques-portent-leur-provenance",
    section: "competences",
  },
  {
    id: "pannes",
    phrase:
      "Les sondes vers les produits distinguent une panne du produit d’une panne de la sortie réseau.",
    preuveId: "sondes-distinguent-les-pannes",
    section: "competences",
  },
  {
    id: "stage-ag2r",
    phrase: `${phraseExperience("ag2r")}.`,
    preuveId: "stage-ag2r-data-esg",
    section: "experience",
  },
  {
    id: "younivibe",
    phrase: `${phraseExperience("younivibe")}.`,
    preuveId: "coordination-rse-younivibe",
    section: "experience",
  },
];

/**
 * Le CV, assemble depuis la source unique de profil.
 *
 * Aucune chaine d'identite, d'intitule ou de disponibilite n'est ecrite ici.
 * tests/cv.test.ts echoue si l'une d'elles reapparait en clair.
 */
export const CV = {
  identite: IDENTITE,
  recherche: RECHERCHE,
  disponibilite: DISPONIBILITE,
  demande: DEMANDE,
  competences: COMPETENCES,
  experiences: EXPERIENCES,
  formation: FORMATION,
  affirmations: AFFIRMATIONS_CV,
} as const;
