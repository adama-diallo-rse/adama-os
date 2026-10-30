// =====================================================================
// EM0 et EM1, la fiche type de méthode et les sept méthodes.
//
// La fiche compte dix-sept champs, et non seize. Seize est le compte des
// sources additionnées sans doublon : les onze champs imposés par la page 15
// (section 5), les trois champs de XINV-40 qui y manquent (source, date de
// dernière revue, niveau de visibilité), la clause de renvoi obligatoire de
// la page EM (XDEC-08, texte type d'EA4) et la colonne « ce qu'il faut pour
// monter » de la correction du 7 septembre 2026. Le dix-septième champ, la
// mesure de résultat publiée, est exigé par XINV-39 pour l'état PROUVÉ et
// correspond à l'attribut « preuves » d'AXP-189 : sans lui, rien dans la
// fiche ne permet de refuser un PROUVÉ sans mesure. La correction est datée
// du 27 septembre 2026 dans la page EM.
//
// Deux règles tenues par le type lui-même, et vérifiées par
// tests/methodes.test.ts :
//   - l'état PROUVÉ ne se compile pas sans une mesure publiée, sourcée et
//     datée ;
//   - un champ vide n'est jamais rempli pour la forme : il vaut null, et la
//     page l'affiche comme un manque.
//
// Aucune ligne de logiciel dans une fiche : une méthode livre une manière de
// faire, jamais un logiciel (XINV-01). Aucune huitième méthode, aucun nom
// neuf : l'identifiant et le nom sont stables à vie.
// =====================================================================

import { RELEVES_M001, totauxDe } from "./mesures";

export const ETATS_METHODE = [
  "CONCEPT",
  "RECHERCHE",
  "TESTÉ",
  "PROUVÉ",
  "ARCHIVÉ",
] as const;
export type EtatMethode = (typeof ETATS_METHODE)[number];

export const NIVEAUX_VISIBILITE = {
  NV0: "Public",
  NV1: "Contre une adresse",
  NV2: "Payant",
  NV3: "Sous licence",
} as const;
type NiveauVisibilite = keyof typeof NIVEAUX_VISIBILITE;

const DROITS_METHODE = [
  "Lecture libre et usage commercial sous licence écrite",
  "Sous licence écrite uniquement",
  "Réservé, non diffusé",
] as const;
type DroitsMethode = (typeof DROITS_METHODE)[number];

type DateIso = `${number}-${number}-${number}`;

export type LienPublic = { libelle: string; href: string };

type MesurePubliee = {
  titre: string;
  /** Adresse publique où la mesure se lit, avec sa méthode. */
  href: string;
  /** Date du relevé publié. */
  releveLe: DateIso;
  /** Le résultat en une phrase, chiffre compris. */
  resultat: string;
};

type ClauseRenvoi =
  | {
      produit: string;
      /** Prix relevé sur la grille canonique au jour de publication. */
      prix: string;
      grille: string;
      prixVerifieLe: DateIso;
      semainesPersonne: number;
    }
  | { produit: null; motif: string };

type Version = {
  version: `${number}.${number}`;
  date: DateIso;
  changement: string;
};

type ChampsCommuns = {
  identifiant: `M-${number}`;
  /** Le nom stable, tel qu'il est arrêté par la page EM. */
  nom: string;
  /** L'affichage public, quand il diffère du nom (XDEC-52 pour M-004). */
  nomAffiche: string;
  version: `${number}.${number}`;
  utiliseeDans: readonly LienPublic[];
  dateDocumentation: DateIso;
  composants: readonly string[];
  /** Tableau vide : aucune dépendance déclarée, ce n'est pas un oubli. */
  dependances: readonly `M-${number}`[];
  limitesConnues: readonly string[];
  journal: readonly Version[];
  droits: DroitsMethode;
  source: LienPublic;
  dateDerniereRevue: DateIso;
  visibilite: NiveauVisibilite;
  clauseRenvoi: ClauseRenvoi;
  pourMonter: string;
  /** Preuve publique datée de l'état arrêté. */
  preuveEtat: LienPublic & { date: DateIso };
  codeAxp: `AXP-${number}`;
};

/**
 * PROUVÉ exige une mesure publiée, sourcée et datée (XINV-39). Toute autre
 * valeur l'admet sans l'exiger : une mesure publiée ne fait pas monter
 * l'état, c'est une décision datée qui le fait (XDEC-53).
 */
export type FicheMethode = ChampsCommuns &
  (
    | { etat: Exclude<EtatMethode, "PROUVÉ">; mesure: MesurePubliee | null }
    | { etat: "PROUVÉ"; mesure: MesurePubliee }
  );

/** Les dix-sept champs, dans l'ordre de la fiche, avec leur source écrite. */
export const CHAMPS_FICHE = [
  {
    champ: "Identifiant",
    source: "Page 15, section 5",
    valeur: "Liste fermée, M-001 à M-999, jamais réattribué",
    vide: "Refusée : une fiche sans identifiant n'existe pas.",
  },
  {
    champ: "Nom",
    source: "Page 15, section 5 ; noms arrêtés par la page EM",
    valeur: "Texte, stable à vie",
    vide: "Refusée.",
  },
  {
    champ: "Version",
    source: "Page 15, section 5 ; XINV-40",
    valeur: "Format contrôlé X.Y",
    vide: "Refusée : un objet sans version n'entre pas dans le graphe.",
  },
  {
    champ: "État de maturité",
    source: "Page 15, sections 3 et 5 ; XINV-39",
    valeur: "Liste fermée : CONCEPT, RECHERCHE, TESTÉ, PROUVÉ, ARCHIVÉ",
    vide: "Refusée.",
  },
  {
    champ: "Utilisée dans",
    source: "Page 15, section 5",
    valeur: "Liens vers des preuves publiques",
    vide: "Affiché : « Manque : aucun usage publié ».",
  },
  {
    champ: "Date de documentation",
    source: "Page 15, section 5",
    valeur: "Date",
    vide: "Refusée.",
  },
  {
    champ: "Composants",
    source: "Page 15, section 5 et colonne « Ce qu'elle couvre »",
    valeur: "Liste de textes",
    vide: "Affiché : « Manque : composants non décrits ».",
  },
  {
    champ: "Dépendances",
    source: "Page 15, section 5",
    valeur: "Liste fermée d'identifiants M",
    vide: "Affiché : « Aucune dépendance déclarée », valeur explicite.",
  },
  {
    champ: "Limites connues",
    source: "Page 15, section 5, limite obligatoire",
    valeur: "Au moins une limite écrite",
    vide: "Refusée : une méthode sans limite est une promesse.",
  },
  {
    champ: "Journal des versions",
    source: "Page 15, section 5",
    valeur: "Liste datée",
    vide: "Refusée.",
  },
  {
    champ: "Droits",
    source: "Page 15, section 5 ; XINV-42",
    valeur: "Liste fermée",
    vide: "Refusée.",
  },
  {
    champ: "Source",
    source: "XINV-40",
    valeur: "Lien public",
    vide: "Refusée : un objet sans source n'entre pas dans le graphe.",
  },
  {
    champ: "Date de dernière revue",
    source: "XINV-40",
    valeur: "Date, postérieure ou égale à la documentation",
    vide: "Refusée.",
  },
  {
    champ: "Niveau de visibilité",
    source: "XINV-40 ; passe n° 2, arbitrage 3",
    valeur: "Liste fermée : NV0, NV1, NV2, NV3",
    vide: "Refusée.",
  },
  {
    champ: "Clause de renvoi STRATA ESG",
    source: "Page EM et XDEC-08 ; texte type EA4",
    valeur: "Texte type chiffré, ou « aucun produit » motivé",
    vide: "Refusée : le champ dit l'absence, il ne disparaît pas.",
  },
  {
    champ: "Ce qu'il faut pour monter",
    source: "Page EM, correction du 7 septembre 2026",
    valeur: "Texte",
    vide: "Refusée.",
  },
  {
    champ: "Mesure de résultat publiée",
    source: "XINV-39 ; attribut « preuves » d'AXP-189",
    valeur: "Lien public et date du relevé",
    vide: "Affiché : « Aucune mesure publiée ». Obligatoire pour PROUVÉ.",
  },
] as const;

/**
 * La mesure publiée de M-001 se lit dans le dernier relevé publié, jamais
 * recopiée : un nouveau relevé change la fiche sans qu'on la réécrive.
 */
function mesureM001(): MesurePubliee {
  const releve = RELEVES_M001[0];
  if (!releve) throw new Error("M-001 exige un relevé publié.");
  const t = totauxDe(releve);
  return {
    titre: "Taux de reproduction tierce des preuves publiques",
    href: "/methodes/m-001#mesure",
    releveLe: releve.releveLe.slice(0, 10) as DateIso,
    resultat: `${t.concordant} preuves publiques sur ${t.preuves} reproduites par un tiers sans compte, avec un résultat qui concorde ; ${t.discordant} discordante${t.discordant > 1 ? "s" : ""}.`,
  };
}

const ARTICLE = "/articles/methode-de-preuve";
const PREUVE_ETATS = {
  libelle: "Correction publique des états, article du 18 septembre 2026",
  href: `${ARTICLE}#preuves-cassees`,
  date: "2026-09-18",
} as const;
const GRILLE_STRATA = "https://www.strata-esg.fr/tarifs";
const VERSION_INITIALE: Version = {
  version: "1.0",
  date: "2026-09-27",
  changement:
    "Première fiche au format EM0, état arrêté par la passe de vérification n° 2.",
};

export const METHODES: readonly FicheMethode[] = [
  {
    identifiant: "M-001",
    codeAxp: "AXP-192",
    nom: "Evidence-First ESG Architecture",
    nomAffiche: "Evidence-First ESG Architecture",
    version: "1.1",
    etat: "PROUVÉ",
    utiliseeDans: [
      { libelle: "Registre de preuve du site", href: "/preuves" },
      {
        libelle: "Sortie machine des affirmations",
        href: "/.well-known/adama-os.json",
      },
      {
        libelle: "Vérification publique d'une affirmation",
        href: "/verifier/registre-de-preuve-tenu",
      },
      { libelle: "Journal des décisions d'architecture", href: "/decisions" },
    ],
    dateDocumentation: "2026-09-18",
    composants: [
      "Modèle de preuve : une affirmation ne se rend pas sans sa preuve.",
      "Lignage : chaque preuve dit sa source et sa méthode.",
      "Versionnage : les décisions remplacées restent en ligne.",
      "Correspondance des exigences : chaque affirmation nomme ce qu'elle établit.",
      "Vérification : une adresse publique par affirmation.",
      "Distribution : la même preuve servie aux personnes et aux machines.",
    ],
    dependances: [],
    limitesConnues: [
      "La mesure publiée porte sur un seul système, construit par l'auteur de la méthode.",
      "Une preuve reproduite établit qu'une affirmation se vérifie, pas qu'elle compte pour un lecteur.",
      "Une preuve tirée d'un dépôt privé ne peut pas être relue par un tiers (FAIL-003).",
    ],
    journal: [
      {
        version: "1.1",
        date: "2026-09-27",
        changement:
          "Passage à PROUVÉ (XDEC-61) : le relevé de 21 h 13 UTC, postérieur à la correction FAIL-003, ne compte aucune discordance.",
      },
      {
        version: "1.0",
        date: "2026-09-27",
        changement:
          "Première fiche au format EM0, état arrêté par la passe de vérification n° 2, et première mesure de résultat publiée.",
      },
    ],
    droits: "Lecture libre et usage commercial sous licence écrite",
    source: { libelle: "La méthode de preuve, article long", href: ARTICLE },
    dateDerniereRevue: "2026-09-27",
    visibilite: "NV0",
    clauseRenvoi: {
      produit: "ESG Optimizer, formule Pro",
      prix: "149 euros par mois",
      grille: GRILLE_STRATA,
      prixVerifieLe: "2026-09-27",
      semainesPersonne: 6,
    },
    pourMonter:
      "État le plus haut. M-001 redescend si un relevé compte une discordance non corrigée sous trente jours (XDEC-53).",
    preuveEtat: {
      libelle: "Mesure de résultat publiée, second relevé sans discordance",
      href: "/methodes/m-001#mesure",
      date: "2026-09-27",
    },
    mesure: mesureM001(),
  },
  {
    identifiant: "M-002",
    codeAxp: "AXP-193",
    nom: "Solo SaaS Build System",
    nomAffiche: "Solo SaaS Build System",
    version: "1.0",
    etat: "TESTÉ",
    utiliseeDans: [
      { libelle: "Journal des décisions d'architecture", href: "/decisions" },
      { libelle: "Journal des versions", href: "/changelog" },
      { libelle: "Inventaire machine du dépôt", href: "/technique" },
      { libelle: "Matrice de santé et modes de panne", href: "/systeme" },
    ],
    dateDocumentation: "2026-09-27",
    composants: [
      "Organisation d'un bâtisseur seul.",
      "Arbitrages écrits avec leur raison.",
      "Registres tenus à la main et vérifiés en code.",
      "Documentation au fil de la construction.",
      "Exploitation seul : sauvegarde, santé, reprise.",
    ],
    dependances: [],
    limitesConnues: [
      "Un seul praticien l'a appliquée : son auteur.",
      "Elle suppose un budget de temps mesuré, que la méthode ne crée pas.",
    ],
    journal: [VERSION_INITIALE],
    droits: "Lecture libre et usage commercial sous licence écrite",
    source: {
      libelle: "Correction publique des états",
      href: `${ARTICLE}#preuves-cassees`,
    },
    dateDerniereRevue: "2026-09-27",
    visibilite: "NV0",
    clauseRenvoi: {
      produit: null,
      motif:
        "Aucun produit STRATA ESG ne correspond : la méthode porte sur l'organisation d'un bâtisseur seul, que STRATA ESG ne vend pas.",
    },
    pourMonter: "Un usage par quelqu'un d'autre qu'Adama, daté.",
    preuveEtat: PREUVE_ETATS,
    mesure: null,
  },
  {
    identifiant: "M-003",
    codeAxp: "AXP-194",
    nom: "ESG Canonicalization",
    nomAffiche: "ESG Canonicalization",
    version: "1.0",
    etat: "TESTÉ",
    utiliseeDans: [
      {
        libelle: "Corpus documentaire du moteur, inventaire public",
        href: "/technique",
      },
    ],
    dateDocumentation: "2026-09-27",
    composants: [
      "Une donnée ESG existe une fois.",
      "Une seule représentation par donnée, reliée à sa source.",
      "Les variantes de libellé se rattachent à la représentation, elles ne la dupliquent pas.",
    ],
    dependances: [],
    limitesConnues: [
      "Éprouvée sur un seul corpus, celui du moteur de ce site.",
      "Elle ne fournit aucune valeur ni aucun facteur : elle organise la donnée, elle ne la produit pas.",
    ],
    journal: [VERSION_INITIALE],
    droits: "Lecture libre et usage commercial sous licence écrite",
    source: {
      libelle: "Correction publique des états",
      href: `${ARTICLE}#preuves-cassees`,
    },
    dateDerniereRevue: "2026-09-27",
    visibilite: "NV0",
    clauseRenvoi: {
      produit: "ESG Optimizer, formule Pro",
      prix: "149 euros par mois",
      grille: GRILLE_STRATA,
      prixVerifieLe: "2026-09-27",
      semainesPersonne: 8,
    },
    pourMonter: "Un second corpus, extérieur.",
    preuveEtat: PREUVE_ETATS,
    mesure: null,
  },
  {
    identifiant: "M-004",
    codeAxp: "AXP-195",
    nom: "Engine Decision Boundary",
    nomAffiche: "Frontière de décision du moteur",
    version: "1.0",
    etat: "TESTÉ",
    utiliseeDans: [
      {
        libelle: "Modes de panne : le moteur ne répond pas sous le seuil",
        href: "/systeme/pannes",
      },
      { libelle: "Inventaire technique de la chaîne", href: "/technique" },
    ],
    dateDocumentation: "2026-09-27",
    composants: [
      "Ce que le moteur propose.",
      "Ce qu'il ne décide jamais.",
      "La couche de preuve autour de chaque réponse, et le refus quand elle manque.",
    ],
    dependances: ["M-001"],
    limitesConnues: [
      "Les seuils décrivent des portes précises dans une chaîne précise, pas une qualité générale du moteur.",
      "Aucune mesure publiée du taux de refus observé à ce jour.",
    ],
    journal: [VERSION_INITIALE],
    droits: "Lecture libre et usage commercial sous licence écrite",
    source: {
      libelle: "Correction publique des états",
      href: `${ARTICLE}#preuves-cassees`,
    },
    dateDerniereRevue: "2026-09-27",
    visibilite: "NV0",
    clauseRenvoi: {
      produit: null,
      motif:
        "Aucun produit STRATA ESG ne correspond : la méthode décrit une frontière de décision, pas un résultat ESG qu'un logiciel produirait.",
    },
    pourMonter: "Une mesure publiée du taux de refus de la chaîne.",
    preuveEtat: PREUVE_ETATS,
    mesure: null,
  },
  {
    identifiant: "M-005",
    codeAxp: "AXP-196",
    nom: "Proof-Oriented Product Architecture",
    nomAffiche: "Proof-Oriented Product Architecture",
    version: "1.0",
    etat: "TESTÉ",
    utiliseeDans: [
      { libelle: "Registre de preuve du site", href: "/preuves" },
      {
        libelle: "Le type qui interdit une valeur sans provenance, code public",
        href: "https://github.com/adama-diallo-rse/adama-os/blob/main/apps/web/lib/proof/types.ts",
      },
    ],
    dateDocumentation: "2026-09-27",
    composants: [
      "Chaque sortie du produit porte sa preuve.",
      "Une valeur sans provenance ne s'affiche pas.",
      "Les états absent et périmé se déduisent à la lecture, ils ne se stockent pas.",
    ],
    dependances: ["M-001"],
    limitesConnues: [
      "Appliquée à un seul produit, ce site.",
      "Elle ralentit l'affichage de tout chiffre dont la source n'est pas encore branchée, et c'est voulu.",
    ],
    journal: [VERSION_INITIALE],
    droits: "Lecture libre et usage commercial sous licence écrite",
    source: {
      libelle: "Correction publique des états",
      href: `${ARTICLE}#preuves-cassees`,
    },
    dateDerniereRevue: "2026-09-27",
    visibilite: "NV0",
    clauseRenvoi: {
      produit: null,
      motif:
        "Aucun produit STRATA ESG ne correspond : la méthode porte sur la conception de tout produit, pas sur un résultat ESG.",
    },
    pourMonter: "Un second produit.",
    preuveEtat: PREUVE_ETATS,
    mesure: null,
  },
  {
    identifiant: "M-006",
    codeAxp: "AXP-197",
    nom: "Public Build System",
    nomAffiche: "Public Build System",
    version: "1.0",
    etat: "TESTÉ",
    utiliseeDans: [
      { libelle: "Journal public", href: "/journal" },
      { libelle: "Journal des versions", href: "/changelog" },
      {
        libelle: "Frontières de données, ce qui ne se publie jamais",
        href: "/confiance",
      },
      {
        libelle: "Dépôt public du site",
        href: "https://github.com/adama-diallo-rse/adama-os",
      },
    ],
    dateDocumentation: "2026-09-27",
    composants: [
      "Ce qui se publie : décisions, corrections, livraisons.",
      "Ce qui ne se publie jamais : données de client, secrets, résultats commerciaux.",
      "Construire en public sans se mettre en danger.",
    ],
    dependances: [],
    limitesConnues: [
      "Un seul praticien la publie : son auteur.",
      "Publier son travail établit une pratique, pas un résultat.",
    ],
    journal: [VERSION_INITIALE],
    droits: "Lecture libre et usage commercial sous licence écrite",
    source: {
      libelle: "Correction publique des états",
      href: `${ARTICLE}#preuves-cassees`,
    },
    dateDerniereRevue: "2026-09-27",
    visibilite: "NV0",
    clauseRenvoi: {
      produit: null,
      motif:
        "Aucun produit STRATA ESG ne correspond : la méthode porte sur la manière de publier un travail, que STRATA ESG ne vend pas.",
    },
    pourMonter: "Un second praticien qui l'applique et le publie.",
    preuveEtat: PREUVE_ETATS,
    mesure: null,
  },
  {
    identifiant: "M-007",
    codeAxp: "AXP-198",
    nom: "ESG Systems Mapping",
    nomAffiche: "ESG Systems Mapping",
    version: "1.0",
    etat: "RECHERCHE",
    utiliseeDans: [],
    dateDocumentation: "2026-09-27",
    composants: ["Cartographier un système ESG existant avant de le refaire."],
    dependances: ["M-003"],
    limitesConnues: [
      "Aucun essai daté : la méthode est une hypothèse instruite, pas une pratique.",
    ],
    journal: [VERSION_INITIALE],
    droits: "Lecture libre et usage commercial sous licence écrite",
    source: {
      libelle: "Correction publique des états",
      href: `${ARTICLE}#preuves-cassees`,
    },
    dateDerniereRevue: "2026-09-27",
    visibilite: "NV0",
    clauseRenvoi: {
      produit: "ESG Optimizer, formule Pro",
      prix: "149 euros par mois",
      grille: GRILLE_STRATA,
      prixVerifieLe: "2026-09-27",
      semainesPersonne: 10,
    },
    pourMonter: "Un premier essai daté.",
    preuveEtat: PREUVE_ETATS,
    mesure: null,
  },
];

/** Texte type d'EA4, adapté du kit à la méthode, chiffres de la grille du jour. */
export function texteClauseRenvoi(clause: ClauseRenvoi): string {
  if (clause.produit === null) return clause.motif;
  return `Cette méthode vous apprend à concevoir ce système. Si votre besoin est d'obtenir le résultat sans construire l'outil, le produit qui le produit existe déjà : ${clause.produit}, au prix public en vigueur de ${clause.prix}. Construire ce système représente au minimum ${clause.semainesPersonne} semaines-personne.`;
}

type Manque = { champ: string; bloquant: boolean; texte: string };

/**
 * Le contrôle de validation de la fiche, champ par champ. Un manque
 * bloquant refuse la fiche ; un manque non bloquant s'affiche comme tel.
 * C'est ce contrôle que tests/methodes.test.ts fait tourner sur les sept
 * fiches, et qu'il fait échouer sur une fiche construite pour être refusée.
 */
export function controlerFiche(fiche: FicheMethode): Manque[] {
  const manques: Manque[] = [];
  const bloque = (champ: string, texte: string) =>
    manques.push({ champ, bloquant: true, texte });
  const signale = (champ: string, texte: string) =>
    manques.push({ champ, bloquant: false, texte });

  if (!/^M-\d{3}$/.test(fiche.identifiant))
    bloque("Identifiant", "Format M-NNN attendu.");
  if (!fiche.nom.trim()) bloque("Nom", "Nom absent.");
  if (!/^\d+\.\d+$/.test(fiche.version))
    bloque("Version", "Format X.Y attendu.");
  if (!ETATS_METHODE.includes(fiche.etat))
    bloque("État de maturité", "Valeur hors liste.");
  if (fiche.utiliseeDans.length === 0)
    signale("Utilisée dans", "Manque : aucun usage publié.");
  for (const lien of fiche.utiliseeDans) {
    if (!/^(\/|https:\/\/)/.test(lien.href))
      bloque("Utilisée dans", `Lien non public : ${lien.href}`);
  }
  if (fiche.composants.length === 0)
    signale("Composants", "Manque : composants non décrits.");
  if (fiche.limitesConnues.length === 0)
    bloque("Limites connues", "Une méthode sans limite est une promesse.");
  if (fiche.journal.length === 0)
    bloque("Journal des versions", "Journal vide.");
  if (!DROITS_METHODE.includes(fiche.droits))
    bloque("Droits", "Valeur hors liste.");
  if (!/^(\/|https:\/\/)/.test(fiche.source.href))
    bloque("Source", "Source non publique.");
  if (fiche.dateDerniereRevue < fiche.dateDocumentation) {
    bloque("Date de dernière revue", "Antérieure à la documentation.");
  }
  if (!(fiche.visibilite in NIVEAUX_VISIBILITE))
    bloque("Niveau de visibilité", "Valeur hors liste.");
  if (fiche.clauseRenvoi.produit === null && !fiche.clauseRenvoi.motif.trim()) {
    bloque(
      "Clause de renvoi STRATA ESG",
      "L'absence de produit doit être motivée.",
    );
  }
  if (!fiche.pourMonter.trim())
    bloque("Ce qu'il faut pour monter", "Condition absente.");
  if (fiche.etat === "PROUVÉ") {
    const m = fiche.mesure as MesurePubliee | null | undefined;
    if (!m || !m.href || !m.releveLe || !m.resultat) {
      bloque(
        "Mesure de résultat publiée",
        "Refusé : PROUVÉ sans mesure de résultat publiée, sourcée et datée (XINV-39).",
      );
    }
  }
  for (const dep of fiche.dependances) {
    if (!METHODES_CODES.has(dep))
      bloque("Dépendances", `Méthode inconnue : ${dep}.`);
  }
  return manques;
}

const METHODES_CODES = new Set([
  "M-001",
  "M-002",
  "M-003",
  "M-004",
  "M-005",
  "M-006",
  "M-007",
]);

export function methodeDe(slug: string): FicheMethode | undefined {
  return METHODES.find(
    (m) => m.identifiant.toLowerCase() === slug.toLowerCase(),
  );
}

/** L'indicateur d'ES0, méthodes à l'état PROUVÉ, lu dans les fiches. */
export function methodesProuvees(methodes: readonly FicheMethode[] = METHODES) {
  return {
    prouvees: methodes.filter((m) => m.etat === "PROUVÉ").length,
    total: methodes.length,
  };
}
