// =====================================================================
// C5-T1, la source de verite des fiches projet.
//
// Contenu editorial versionne dans le depot, relu par un humain. Il ne se
// synchronise pas depuis une base : une fiche projet n'est pas une donnee,
// c'est un texte dont quelqu'un repond.
//
// Quatre fiches depuis le 30 octobre 2026, une par maison : STRATA ESG et
// ses cinq produits, Pharivo, ADAMA OS et Conhama. Les deux anciennes
// fiches ESG Optimizer et STRATA Scope sont réunies dans celle de STRATA
// ESG ; leurs adresses redirigent vers l'ancre du produit. Le plafond reste
// fermé à quatre : le lecteur qui en compare quatre les lit toutes, celui
// qui en voit huit n'en lit aucune.
// =====================================================================

import { ADAMA_OS } from "./adama-os";
import { CONHAMA } from "./conhama";
import { PHARIVO } from "./pharivo";
import { STRATA_ESG } from "./strata-esg";
import { ETAT_LABEL, type EtatProjet, type FicheProjet } from "./gabarit";

export const FICHES: readonly FicheProjet[] = [
  STRATA_ESG,
  PHARIVO,
  ADAMA_OS,
  CONHAMA,
].sort((a, b) => a.ordre - b.ordre);

export function ficheParSlug(slug: string): FicheProjet | undefined {
  return FICHES.find((f) => f.slug === slug);
}

/**
 * C5-T7, la carte de surface.
 *
 * Quatre informations, pas plus : le probleme en une ligne, le role en un
 * mot, l'etat, et une preuve. Tout le reste passe derriere le lien vers la
 * fiche.
 *
 * Cette projection existe pour une raison precise : l'accueil est un
 * composant client, et lui passer les fiches entieres embarquerait tout leur
 * texte dans le bundle envoye au navigateur. La page serveur construit donc
 * les cartes, et n'envoie qu'elles.
 */
export type CarteProjet = {
  slug: string;
  titre: string;
  division: string;
  categorie: string;
  resume: string;
  roleEnUnMot: string;
  etat: EtatProjet;
  etatLabel: string;
  preuveVedette: string;
  /** Les produits d'une maison, réduits à leur nom et leur adresse. */
  produits: { slug: string; nom: string; url: string }[];
};

export function cartesProjet(): CarteProjet[] {
  return FICHES.map((f) => ({
    slug: f.slug,
    titre: f.titre,
    division: f.division,
    categorie: f.categorie,
    resume: f.resume,
    roleEnUnMot: f.roleEnUnMot,
    etat: f.etat.valeur,
    etatLabel: ETAT_LABEL[f.etat.valeur],
    preuveVedette: f.preuveVedette,
    produits: (f.produits ?? []).map((p) => ({
      slug: p.slug,
      nom: p.nom,
      url: p.url,
    })),
  }));
}

/** Les categories de filtre reellement representees, « Tout » en tete. */
export function categoriesProjet(): string[] {
  return ["Tout", ...Array.from(new Set(FICHES.map((f) => f.categorie)))];
}

export * from "./gabarit";
