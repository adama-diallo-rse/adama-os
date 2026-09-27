// Registre public des erreurs, EW3.
//
// Une entree n'existe que si les faits et la correction sont deja documentes
// dans le depot. Le registre ne transforme pas une anecdote en confession :
// il transforme une erreur constatee en regle que le systeme peut rejouer.

export const CATEGORIES_ERREUR = [
  "Mauvais marché",
  "Mauvaise hypothèse",
  "Mauvaise architecture",
  "Mauvais prix",
  "Mauvais canal",
  "Mauvais moment",
  "Mauvaise exécution",
  "Erreur réglementaire",
  "Erreur de recrutement",
  "Erreur de communication",
  "Idée abandonnée",
] as const;

type CategorieErreur = (typeof CATEGORIES_ERREUR)[number];

type DateIso = `${number}-${number}-${number}`;

/**
 * ES2, l'erreur publiée dans un objet. Les trois champs de XDEC-26 se
 * rangent dans les blocs d'EW3 : ce qui était écrit va dans le bloc 1, ce qui
 * est vrai dans le bloc 2, ce qui a changé dans la méthode dans le bloc 4.
 * Ce type ajoute ce que les blocs ne portent pas : l'objet et sa version, la
 * citation mot pour mot, la source de ce qui est vrai et les deux dates.
 */
type ObjetCorrige = {
  nature: "Affirmation publiée" | "Article" | "Fiche de méthode" | "Page";
  reference: string;
  version: string;
  href: string;
  /** Ce qui était écrit, mot pour mot. */
  ecrit: readonly string[];
  vrai: string;
  sourceVrai: { label: string; href: string };
  changementMethode: string;
  dateConstat: DateIso;
  /** Null tant que la correction n'est pas en ligne. */
  dateCorrection: DateIso | null;
};

export type EntreeErreur = {
  id: `FAIL-${string}`;
  /** Version publiée de l'entrée. Toute modification publiée l'incrémente. */
  version?: number;
  objet?: ObjetCorrige;
  /** Les versions antérieures, conservées telles qu'elles ont été publiées. */
  historique?: readonly VersionAnterieure[];
  date: DateIso;
  titre: string;
  categorie: CategorieErreur;
  statut: "convertie" | "ouverte";
  pense: string;
  faits: string;
  cause: string;
  changement: string;
  implication: string;
  methode?: {
    titre: string;
    regle: string;
  };
  sources: readonly {
    label: string;
    href: string;
  }[];
};

type VersionAnterieure = Omit<EntreeErreur, "historique"> & {
  remplaceeLe: DateIso;
  motif: string;
};

const OBJET_FAIL_003: ObjetCorrige = {
  nature: "Affirmation publiée",
  reference: "strata-scope-depot-suivi et esg-optimizer-depot-suivi",
  version: "Registre de preuve C2, énoncés semés avant le 27 septembre 2026",
  href: "/verifier/strata-scope-depot-suivi",
  ecrit: [
    "Le code de STRATA Scope est versionné dans un dépôt suivi par ce cockpit, dont le dernier commit est lisible publiquement.",
    "Le code d’ESG Optimizer est versionné dans un dépôt suivi par ce cockpit, dont le dernier commit est lisible publiquement.",
  ],
  vrai: "Les deux dépôts sont privés. Le cockpit en relève le dernier commit avec son jeton de lecture ; un visiteur ne peut pas relire ce commit.",
  sourceVrai: {
    label: "Mesure de reproduction tierce du 27 septembre 2026",
    href: "/methodes/m-001#mesure",
  },
  changementMethode:
    "Chaque preuve marquée vérifiable par un visiteur est relue sans jeton avant d’être publiée comme telle. Le protocole de la mesure de M-001 est ce contrôle, et il se rejoue par quiconque.",
  dateConstat: "2026-09-27",
  dateCorrection: null,
};

const FAIL_003_V1 = {
  id: "FAIL-003",
  version: 1,
  date: "2026-09-27",
  titre: "Deux dépôts privés étaient présentés comme lisibles publiquement",
  categorie: "Mauvaise hypothèse",
  statut: "ouverte",
  pense:
    "Une preuve lue avec succès par le cockpit pouvait être présentée comme vérifiable par n’importe quel visiteur, puisque l’adresse du dépôt était publiée.",
  faits:
    "Le 27 septembre 2026, la mesure de reproduction tierce a appelé l’API publique de GitHub sans jeton. Les dépôts de STRATA Scope et d’ESG Optimizer répondent 404 : quatre preuves publiques sur dix-sept ne se relisent pas.",
  cause:
    "Le cockpit lit GitHub avec son propre jeton. Il voyait donc des dépôts privés comme lisibles, et aucune étape ne refaisait la lecture depuis la position d’un visiteur sans compte.",
  changement:
    "Une preuve ne se déclare vérifiable par un visiteur qu’après une relecture sans jeton. La mesure de M-001 refait cette relecture sur chaque preuve publique, et les deux énoncés sont corrigés sans changer leur adresse de vérification.",
  implication:
    "Pour STRATA ESG, une preuve remise à un client sera relue depuis un poste sans accès avant d’être dite vérifiable par lui. Une preuve que seul l’éditeur peut relire se déclare comme telle.",
  methode: {
    titre: "Relire depuis la position du lecteur",
    regle:
      "Une preuve se déclare vérifiable par un visiteur seulement si un appel sans jeton, sans compte et sans accès privé la relit avec le même résultat.",
  },
  objet: OBJET_FAIL_003,
  sources: [
    {
      label: "Protocole de la mesure, rejouable sans compte",
      href: "https://github.com/adama-diallo-rse/adama-os/blob/main/scripts/mesure-m001.mjs",
    },
    {
      label: "Correction datée des deux énoncés et des quatre preuves",
      href: "https://github.com/adama-diallo-rse/adama-os/blob/main/packages/db/migrations/0008_depots_prives.sql",
    },
  ],
} satisfies EntreeErreur;

export const ERREURS: readonly EntreeErreur[] = [
  {
    id: "FAIL-004",
    version: 1,
    date: "2026-09-27",
    titre:
      "La page du programme publiait des niveaux d’accès et un compte de décisions faux",
    categorie: "Erreur de communication",
    statut: "convertie",
    pense:
      "Les libellés des niveaux de visibilité et le nombre de décisions pouvaient être recopiés depuis une version de travail du programme, sans relecture contre le registre qui fait foi.",
    faits:
      "La page /expansion publiait NV1 « Sur demande », NV2 « Réservé » et NV3 « Partenaire », alors que l’arbitrage du 7 septembre 2026 fixe NV1 contre une adresse, NV2 payant et NV3 sous licence. Elle annonçait 43 décisions quand le registre en comptait 48.",
    cause:
      "Les valeurs étaient écrites en dur dans le contenu de la page, sans lien avec le registre qui fait foi, et aucun contrôle ne comparait les deux.",
    changement:
      "Les libellés reprennent l’arbitrage mot pour mot. Les compteurs d’erreurs ouvertes et de méthodes prouvées sont lus dans leurs registres, et le compte de décisions, tenu hors du dépôt, porte la date de son relevé.",
    implication:
      "Pour STRATA ESG, un chiffre ou un libellé affiché sur une page publique se lit dans sa source au moment de la construction, ou il porte la date à laquelle il a été recopié.",
    methode: {
      titre: "Lire la source, ou dater la copie",
      regle:
        "Un compteur ou un libellé repris d’un registre se lit dans ce registre. S’il est recopié, il porte la date de sa copie.",
    },
    objet: {
      nature: "Page",
      reference: "/expansion",
      version: "Page publiée le 26 septembre 2026, commit 7061a50",
      href: "/expansion",
      ecrit: [
        "NV1, Sur demande, Accès identifié",
        "NV2, Réservé, Accès individuel",
        "NV3, Partenaire, Accès contractuel",
        "Décisions XDEC : 43",
      ],
      vrai: "NV1 contre une adresse, NV2 payant, NV3 sous licence, selon l’arbitrage 3 de la passe de vérification n° 2. Le registre XDEC comptait 48 décisions le 26 septembre 2026 et en compte 60 au relevé du 27 septembre 2026.",
      sourceVrai: {
        label: "Niveaux de visibilité repris dans la fiche type des méthodes",
        href: "/methodes#fiche-type",
      },
      changementMethode:
        "Un libellé ou un compteur public qui vient d’un registre est lu dans ce registre par le code de la page, ou porte la date de sa copie. Un test compare désormais les niveaux publiés à ceux de la fiche type.",
      dateConstat: "2026-09-27",
      dateCorrection: "2026-09-27",
    },
    sources: [
      {
        label: "Contenu corrigé de la page du programme",
        href: "https://github.com/adama-diallo-rse/adama-os/blob/main/apps/web/content/expansion.ts",
      },
    ],
  },
  {
    ...FAIL_003_V1,
    version: 2,
    statut: "convertie",
    changement:
      "Une preuve ne se déclare vérifiable par un visiteur qu’après une relecture sans jeton. Les deux énoncés et les quatre preuves sont corrigés en ligne le 27 septembre 2026, sans changer leur adresse, et le relevé de 21 h 13 ne compte plus aucune discordance.",
    objet: { ...OBJET_FAIL_003, dateCorrection: "2026-09-27" },
    sources: [
      ...FAIL_003_V1.sources,
      {
        label: "Relevé du 27 septembre 2026 à 21 h 13 UTC, zéro discordance",
        href: "https://github.com/adama-diallo-rse/adama-os/blob/main/apps/web/content/mesures/m001-2026-09-27T2113Z.json",
      },
    ],
    historique: [
      {
        ...FAIL_003_V1,
        remplaceeLe: "2026-09-27",
        motif:
          "correction 0008 jouée en production et second relevé sans discordance",
      },
    ],
  },
  {
    id: "FAIL-002",
    date: "2026-09-12",
    titre: "Une restauration vide avait l’air réussie",
    categorie: "Mauvaise hypothèse",
    statut: "convertie",
    pense:
      "Comparer le nombre de lignes et l’empreinte avant et après suffisait à prouver qu’une sauvegarde pouvait être restaurée.",
    faits:
      "Une table vide donnait zéro ligne et la même empreinte des deux côtés. Le chemin de restauration pouvait donc rester inutilisé tout en produisant un résultat identique.",
    cause:
      "Le contrôle mesurait l’égalité du résultat, mais pas l’exercice réel du chemin. Deux absences égales étaient traitées comme une preuve positive.",
    changement:
      "Le test distingue désormais réussi, partiel et échoué. Une table vide est nommée comme non exercée, et le rapport compte séparément les tables qui portent réellement des lignes.",
    implication:
      "Une sauvegarde ne devient une preuve qu’après restauration de contenu significatif. Pour STRATA ESG, toute répétition de reprise devra contenir au moins un objet réel fictif par table critique et publier les zones non exercées.",
    methode: {
      titre: "Prouver le chemin, pas seulement l’égalité",
      regle:
        "Un contrôle positif exige une donnée qui traverse le chemin testé. Une entrée vide produit un état partiel, jamais un succès complet.",
    },
    sources: [
      {
        label: "Procédure de continuité et résultats de restauration",
        href: "https://github.com/adama-diallo-rse/adama-os/blob/main/docs/CONTINUITE.md#test-de-restauration",
      },
      {
        label: "Script de répétition reproductible",
        href: "https://github.com/adama-diallo-rse/adama-os/blob/main/scripts/restore-drill.mjs",
      },
    ],
  },
  {
    id: "FAIL-001",
    date: "2026-09-02",
    titre: "Trois tests de sécurité passaient sur une adresse fausse",
    categorie: "Mauvaise exécution",
    statut: "convertie",
    pense:
      "Recevoir une erreur lors de la lecture d’une colonne protégée suffisait à prouver que les règles de sécurité refusaient correctement l’accès.",
    faits:
      "Le banc d’essai répondait 404 parce que le chemin était faux. Trois cas sur six passaient pourtant au vert, exactement comme si PostgreSQL avait refusé la lecture.",
    cause:
      "L’assertion vérifiait seulement qu’une erreur existait. Elle ne vérifiait ni sa provenance, ni son code, et aucun contrôle positif ne prouvait que le banc pouvait lire une donnée autorisée.",
    changement:
      "Les refus doivent maintenant porter le code PostgreSQL 42501. Un contrôle de garde lit d’abord une donnée publique, et le contrôle d’intégrité refuse le succès si les cas sont ignorés.",
    implication:
      "Pour STRATA ESG, un test de sécurité devra toujours combiner une lecture autorisée, un refus exact et une contre-épreuve. Toute erreur générique reste un incident de test, jamais une preuve de protection.",
    methode: {
      titre: "Contrôle positif, refus exact, contre-épreuve",
      regle:
        "Une protection n’est prouvée que si le service répond, si l’accès permis fonctionne et si l’accès interdit échoue pour la raison attendue.",
    },
    sources: [
      {
        label: "Compte rendu du faux positif et protocole de rejeu",
        href: "https://github.com/adama-diallo-rse/adama-os/blob/main/docs/RLS.md",
      },
      {
        label: "Tests d’intégration qui verrouillent la correction",
        href: "https://github.com/adama-diallo-rse/adama-os/blob/main/apps/web/tests/rls.integration.test.ts",
      },
    ],
  },
] as const;

/**
 * ES2 et ES0 : une erreur ouverte est une entrée publiée dont le statut est
 * « ouverte », c'est-à-dire dont la correction n'est pas encore en ligne ou
 * dont aucune méthode ne ferme le défaut. C'est la seule lecture de
 * l'indicateur « erreurs ouvertes » du tableau de bord.
 */
export function erreursOuvertes(erreurs: readonly EntreeErreur[] = ERREURS) {
  return erreurs.filter((erreur) => erreur.statut === "ouverte").length;
}

/**
 * La forme canonique d'une version publiée, celle dont l'empreinte est
 * inscrite dans content/erreurs-empreintes.ts. L'ordre des clés est fixé ici
 * et nulle part ailleurs : changer un seul caractère publié change
 * l'empreinte.
 */
export function formeCanonique(
  entree: Omit<EntreeErreur, "historique">,
): string {
  return JSON.stringify([
    entree.id,
    entree.version ?? 1,
    entree.date,
    entree.titre,
    entree.categorie,
    entree.statut,
    entree.pense,
    entree.faits,
    entree.cause,
    entree.changement,
    entree.implication,
    entree.methode ?? null,
    entree.objet ?? null,
    entree.sources,
  ]);
}

export function mesurerConversion(erreurs: readonly EntreeErreur[] = ERREURS) {
  const publiees = erreurs.length;
  const converties = erreurs.filter(
    (erreur) => erreur.statut === "convertie" && erreur.methode,
  ).length;

  return {
    publiees,
    converties,
    taux: publiees === 0 ? null : Math.round((converties / publiees) * 100),
  };
}
