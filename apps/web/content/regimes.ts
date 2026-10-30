// AXP-107, les régimes d'accès, isolés du catalogue : le tableau des
// régimes est affiché par l'accueil (composant client), qui ne doit pas
// entraîner les articles et les fiches de méthode dans son JavaScript.

// AXP-107, les régimes. Une ligne par critère, une colonne par régime.
// STRATA et Recherche n'y figurent pas : le premier est vendu par les
// produits, jamais ici ; le second suit le régime OPEN.
// ---------------------------------------------------------------------

export type CodeRegime = "OPEN" | "PRO" | "ATELIER" | "CONSEIL";

export type Regime = {
  code: CodeRegime;
  titre: string;
  contenu: string;
  acces: string;
  sansCompte: boolean;
  preuveLibre: boolean;
  ouvert: boolean;
  etat: string;
  href: string;
};

export const REGIMES: readonly Regime[] = [
  {
    code: "OPEN",
    titre: "Le laboratoire public",
    contenu:
      "Preuves, décisions, revirements, méthodes, articles, schémas et registres.",
    acces: "Gratuit, sans compte, pour toujours.",
    sansCompte: true,
    preuveLibre: true,
    ouvert: true,
    etat: "Ouvert",
    href: "/catalogue",
  },
  {
    code: "PRO",
    titre: "Les titres et les systèmes",
    contenu:
      "Titres, gabarits, systèmes installables et journal de construction détaillé.",
    acces: "Payant, à l’unité ou par abonnement.",
    sansCompte: false,
    preuveLibre: true,
    ouvert: false,
    etat: "Pas encore ouvert",
    href: "/bibliotheque",
  },
  {
    code: "ATELIER",
    titre: "La transmission",
    contenu: "Parcours, ateliers courts et programmes d’équipe.",
    acces: "Inscription nominative.",
    sansCompte: false,
    preuveLibre: true,
    ouvert: false,
    etat: "Pas encore ouvert",
    href: "/parcours",
  },
  {
    code: "CONSEIL",
    titre: "L’expertise appliquée",
    contenu: "Revue d’architecture, diagnostic court et second avis.",
    acces: "Sur devis, capacité plafonnée.",
    sansCompte: true,
    preuveLibre: true,
    ouvert: true,
    etat: "Cadre publié",
    href: "/travaillez-avec-moi",
  },
];

/** Les critères comparés, dans l'ordre du tableau. */
export const CRITERES_REGIME = [
  { cle: "contenu", libelle: "Ce qu’on y trouve" },
  { cle: "acces", libelle: "Accès" },
  { cle: "sansCompte", libelle: "Sans compte" },
  { cle: "preuveLibre", libelle: "Preuve vérifiable sans payer" },
  { cle: "etat", libelle: "État au 30 octobre 2026" },
] as const;
