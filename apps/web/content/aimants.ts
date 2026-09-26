// =====================================================================
// EH6, AXP-75, l'aimant a adresses, et la regle qui le borne.
//
// La regle, applicable par quelqu'un qui ne l'a pas ecrite : un contenu
// gratuit ne sert d'aimant que s'il remplit les quatre conditions
// suivantes, toutes verifiables sans demander a son auteur.
//   1. Il etait publie AVANT d'etre designe comme aimant.
//   2. Un chantier l'a commande pour lui-meme, sans mentionner la liste.
//   3. Il resterait identique, au mot pres, si la lettre disparaissait.
//   4. Il ne demande rien d'autre qu'une adresse, et seulement a la fin.
// Un contenu qui echoue a une seule condition a ete produit specialement,
// et la branche EH le refuse.
//
// tests/aimants.test.ts verifie les conditions 1, 2 et 4 sur chaque entree,
// et que le lien de l'article porte bien la provenance de l'aimant.
// =====================================================================

type Aimant = {
  id: string;
  /** Le travail reel dont il est le sous-produit. */
  sousProduitDe: string;
  /** Code du chantier qui l'a commande. */
  chantier: string;
  publieLe: string;
  designeLe: string;
  chemins: readonly string[];
  /** Ce qu'il demande en echange. */
  demande: "une adresse";
  /** Lien vers la lettre, avec la provenance que la base garde. */
  lien: { fr: string; en: string };
};

const CAMPAGNE =
  "utm_source=adamesg-os&utm_medium=aimant&utm_campaign=methode-de-preuve";

export const AIMANT_METHODE: Aimant = {
  id: "methode-de-preuve",
  sousProduitDe:
    "La passe de vérification n° 2 du programme, publiée comme article long avec ses décisions rejetées et ses preuves cassées.",
  chantier: "EH3",
  publieLe: "2026-09-18",
  designeLe: "2026-09-26",
  chemins: ["/articles/methode-de-preuve", "/en/articles/proof-method"],
  demande: "une adresse",
  lien: {
    fr: `/lettre?${CAMPAGNE}&utm_content=fr`,
    en: `/lettre?${CAMPAGNE}&utm_content=en`,
  },
};

export const AIMANTS: readonly Aimant[] = [AIMANT_METHODE];

// Le gabarit unitaire, sous-produit d'un systeme deja vendu, s'ajoutera a
// la reouverture du chantier, quand EE4 existera (vague X2). Il n'est pas
// declare ici avant d'exister.
