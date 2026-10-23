// =====================================================================
// EN0, l'échantillon de cent objets réels qui valide le schéma du graphe.
//
// Règle d'échantillonnage : chaque objet existe déjà, dans le dépôt, sur le
// site ou dans un registre du programme, et il est lu dans sa source quand
// elle est dans le dépôt. Les treize types sont parcourus ; un type sans
// objet réel reste vide et le dit (PLAYBOOK et PARCOURS au 27 septembre
// 2026), il n'est jamais rempli par un objet fabriqué. Le compte est
// complété par les idées AXP dont le libellé est écrit en page 16 du plan.
//
// date_objet : première publication de l'objet, ou, quand elle n'est pas
// établie, sa date d'entrée dans le graphe. publie_le reste nul quand la
// date de publication n'est pas établie : l'objet ne sera pas servi avant
// qu'EN1 la relève.
// =====================================================================

import { ADR_CATALOGUE } from "@adama/db/adr-catalogue";
import { ARTICLES } from "../../content/articles";
import { RELEVES_M001 } from "../../content/mesures";
import { METHODES, texteClauseRenvoi } from "../../content/methodes";

export type ObjetGraphe = {
  id: string;
  type:
    | "idee"
    | "source"
    | "decision"
    | "affirmation"
    | "preuve"
    | "methode"
    | "cadre"
    | "produit"
    | "article"
    | "playbook"
    | "parcours"
    | "gabarit"
    | "composant_strata";
  titre: string;
  version: string;
  etat: "concept" | "recherche" | "teste" | "prouve" | "archive";
  visibilite: "nv0" | "nv1" | "nv2" | "nv3";
  source: string;
  origine: "adama" | "tiers" | "strata" | "contribution";
  date_objet: string;
  date_derniere_revue: string;
  auteur: string;
  droits: "lecture_libre" | "licence_ecrite" | "reserve" | "droits_tiers";
  langue: "fr" | "en" | "fr+en";
  publie_le: string | null;
  renvoi_strata: string | null;
};

type LienGraphe = {
  de: string;
  nature:
    | "prouve"
    | "mesure"
    | "source"
    | "depend_de"
    | "applique"
    | "associe_a"
    | "decide"
    | "remplace"
    | "cite";
  vers: string;
};

const JOUR = "2026-09-27";
const AUTEUR = "Adama Diallo";
const PAGE_16 = "https://www.notion.so/3d4455fe99dd81349cc9ec925fc3ed78";
const REGISTRE_XDEC = "https://www.notion.so/3d4455fe99dd818385b1e6b863baedac";

const base = (
  o: Partial<ObjetGraphe> &
    Pick<ObjetGraphe, "id" | "type" | "titre" | "source">,
): ObjetGraphe => ({
  version: "1.0",
  etat: "teste",
  visibilite: "nv0",
  origine: "adama",
  date_objet: JOUR,
  date_derniere_revue: JOUR,
  auteur: AUTEUR,
  droits: "lecture_libre",
  langue: "fr",
  publie_le: null,
  renvoi_strata: null,
  ...o,
});

const ETAT: Record<string, ObjetGraphe["etat"]> = {
  CONCEPT: "concept",
  RECHERCHE: "recherche",
  TESTÉ: "teste",
  PROUVÉ: "prouve",
  ARCHIVÉ: "archive",
};

const releve = RELEVES_M001[0];
if (!releve) throw new Error("Aucun relevé M-001 publié.");

const slug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// ---------------------------------------------------------------------
// METHODE, sept, lues dans les fiches EM0
// ---------------------------------------------------------------------
const methodes = METHODES.map((m) =>
  base({
    id: m.identifiant,
    type: "methode",
    titre: m.nomAffiche,
    version: m.version,
    // Un objet n'entre jamais dans le graphe à PROUVÉ : il y entre à TESTÉ
    // et y monte par PASSAGES_EN0, une fois sa mesure publiée liée.
    etat: m.etat === "PROUVÉ" ? "teste" : ETAT[m.etat],
    source: m.source.href,
    date_objet: m.dateDocumentation,
    date_derniere_revue: m.dateDerniereRevue,
    droits: "licence_ecrite",
    renvoi_strata: texteClauseRenvoi(m.clauseRenvoi),
  }),
);

// ---------------------------------------------------------------------
// AFFIRMATION et PREUVE, lues dans le relevé publié de M-001
// ---------------------------------------------------------------------
const affirmations = [...new Set(releve.preuves.map((p) => p.affirmation))].map(
  (id) =>
    base({
      id,
      type: "affirmation",
      titre: `Affirmation publique ${id}`,
      source: `https://adamesg-os.fr/verifier/${id}`,
      etat: "teste",
    }),
);

const preuves = releve.preuves.map((p, i) =>
  base({
    id: `P-${String(i + 1).padStart(3, "0")}`,
    type: "preuve",
    titre: `Preuve ${p.nature} de ${p.affirmation}`,
    source: p.adresse.startsWith("http")
      ? p.adresse
      : `${p.nature}:${p.adresse}`,
    date_objet: (p.publieLe ?? JOUR).slice(0, 10),
    date_derniere_revue: JOUR,
    origine:
      p.adresse.includes("strata") || p.adresse.includes("esg-optimizer")
        ? "strata"
        : "adama",
  }),
);

const mesureM001 = base({
  id: "P-M001-20260927",
  type: "preuve",
  titre:
    "Mesure de reproduction tierce des preuves publiques, relevé du 27 septembre 2026",
  source: "https://adamesg-os.fr/methodes/m-001#mesure",
  publie_le: JOUR,
});

// ---------------------------------------------------------------------
// ARTICLE, trois, bilingues
// ---------------------------------------------------------------------
const articles = ARTICLES.map((a) =>
  base({
    id: `ART-${slug(a.href.split("/").pop() ?? a.code)}`,
    type: "article",
    titre: a.titre,
    source: `https://adamesg-os.fr${a.href}`,
    langue: "fr+en",
    date_objet: a.dateIso,
    publie_le: a.dateIso,
  }),
);

// ---------------------------------------------------------------------
// COMPOSANT STRATA et PRODUIT
// ---------------------------------------------------------------------
const composants = [
  ["ESG-OPTIMIZER", "ESG Optimizer", "https://esg-optimizer.fr"],
  ["STRATA-SCOPE", "STRATA Scope", "https://scope.esg-optimizer.fr"],
  ["STRATA-PLATFORM", "STRATA Platform", "https://www.strata-esg.fr/"],
  ["STRATA-FOUNDATION", "STRATA Foundation", "https://www.strata-esg.fr/"],
  ["STRATA-WATCH", "STRATA Watch", "https://www.strata-esg.fr/"],
  ["STRATA-ACADEMY", "STRATA Academy", "https://www.strata-esg.fr/"],
].map(([id, titre, source]) =>
  base({
    id: id!,
    type: "composant_strata",
    titre: titre!,
    source: source!,
    origine: "strata",
    droits: "droits_tiers",
  }),
);

const produits = [
  ["PROD-REVUE-ARCHITECTURE", "Revue d’architecture", "/revue-architecture"],
  ["PROD-DIAGNOSTIC-COURT", "Diagnostic court", "/diagnostic"],
  ["PROD-LETTRE-SIGNAL", "Lettre SIGNAL", "/lettre"],
].map(([id, titre, chemin]) =>
  base({
    id: id!,
    type: "produit",
    titre: titre!,
    source: `https://adamesg-os.fr${chemin}`,
    droits: "licence_ecrite",
  }),
);

// ---------------------------------------------------------------------
// DECISION : les ADR du catalogue, puis les décisions XDEC du jour
// ---------------------------------------------------------------------
// Echantillon arrete au JOUR : un ADR date apres lui (les decisions Pharivo
// du 23 octobre 2026 en portent un du 6 octobre) aurait une revue anterieure
// a sa propre date, ce que la contrainte graphe_objets_revue_apres_date
// refuse a juste titre. L'echantillon reste celui du 27 septembre.
const adr = ADR_CATALOGUE.filter((a) => a.date <= JOUR).map((a) =>
  base({
    id: a.adrId,
    type: "decision",
    titre: a.titre,
    source: `https://adamesg-os.fr/decisions/${a.adrId}`,
    date_objet: a.date,
    etat: a.statut === "remplace" ? "archive" : "teste",
  }),
);

const XDEC_DU_JOUR: readonly [number, string][] = [
  [49, "Ouverture anticipée de la vague 1 des strates au 27 septembre 2026"],
  [50, "La matière déjà publique se range sans attendre ED1"],
  [51, "La fiche de méthode compte dix-sept champs"],
  [52, "M-004 s’affiche Frontière de décision du moteur"],
  [53, "Règle de passage de M-001 à l’état PROUVÉ"],
  [54, "Le graphe servi vit dans la base du cockpit, quatorze attributs"],
  [55, "La fiche d’expérimentation d’EP0 est la source unique"],
  [56, "EQ0 est couvert par EU0 et son complément"],
  [57, "Le tableau de bord ES0 est un instrument privé"],
  [58, "Les seuils d’arrêt chiffrés par branche"],
  [59, "Le seuil hebdomadaire de charge personnelle"],
  [60, "La position sur l’écriture avec assistance et sa revue"],
  [61, "Passage de M-001 à l’état PROUVÉ"],
];
const xdec = XDEC_DU_JOUR.map(([n, titre]) =>
  base({
    id: `XDEC-${n}`,
    type: "decision",
    titre,
    source: REGISTRE_XDEC,
    visibilite: "nv0",
    droits: "reserve",
  }),
);

// ---------------------------------------------------------------------
// GABARIT, CADRE, SOURCE
// ---------------------------------------------------------------------
const gabarits = [
  [
    "GAB-FICHE-METHODE",
    "Fiche type de méthode à dix-sept champs",
    "https://adamesg-os.fr/methodes#fiche-type",
  ],
  [
    "GAB-FICHE-EXPERIMENTATION",
    "Fiche d’expérimentation du laboratoire",
    "https://www.notion.so/3d4455fe99dd814e8cd9fa947b1b989e",
  ],
  [
    "GAB-ERREUR-CINQ-BLOCS",
    "Gabarit d’erreur publique en cinq blocs",
    "https://adamesg-os.fr/erreurs",
  ],
  [
    "GAB-CLAUSE-RENVOI",
    "Clause de renvoi chiffrée vers STRATA",
    "https://www.notion.so/3d7455fe99dd803cbbc0dc729a88a6aa",
  ],
  [
    "GAB-MENTION-ASSISTANCE",
    "Mention d’écriture avec assistance par objet",
    "https://adamesg-os.fr/ecriture",
  ],
].map(([id, titre, source]) =>
  base({ id: id!, type: "gabarit", titre: titre!, source: source! }),
);

const cadres = [
  [
    "CADRE-CSRD",
    "Directive sur la publication d’informations en matière de durabilité",
    "https://eur-lex.europa.eu/eli/dir/2022/2464/oj",
  ],
  [
    "CADRE-ESRS-1",
    "Normes européennes de publication, premier ensemble",
    "https://eur-lex.europa.eu/eli/reg_del/2023/2772/oj",
  ],
  [
    "CADRE-VSME",
    "Norme volontaire de publication pour les PME",
    "https://www.efrag.org/en/smes-and-sustainability-reporting",
  ],
  [
    "CADRE-GHG-PROTOCOL",
    "GHG Protocol, norme de comptabilité des entreprises",
    "https://ghgprotocol.org/corporate-standard",
  ],
  [
    "CADRE-IFRS-S2",
    "IFRS S2, informations liées au climat",
    "https://www.ifrs.org/issued-standards/ifrs-sustainability-standards-navigator/ifrs-s2-climate-related-disclosures/",
  ],
].map(([id, titre, source]) =>
  base({
    id: id!,
    type: "cadre",
    titre: titre!,
    source: source!,
    origine: "tiers",
    droits: "droits_tiers",
    etat: "recherche",
  }),
);

const sources = [
  [
    "SRC-ESRS-SET1-PDF",
    "Texte des ESRS, premier ensemble, corpus du moteur",
    "corpus/esrs-set1.pdf",
  ],
  [
    "SRC-VSME-PDF",
    "Texte de la VSME, corpus du moteur",
    "corpus/vsme-standard.pdf",
  ],
  [
    "SRC-GRILLE-STRATA",
    "Grille publique des prix de STRATA ESG",
    "https://www.strata-esg.fr/tarifs",
  ],
  ["SRC-PAGE-16", "Page 16 du plan, ce qui manquait encore", PAGE_16],
].map(([id, titre, source]) =>
  base({
    id: id!,
    type: "source",
    titre: titre!,
    source: source!,
    origine: id === "SRC-PAGE-16" ? "adama" : "tiers",
    droits: id === "SRC-PAGE-16" ? "reserve" : "droits_tiers",
    etat: "recherche",
  }),
);

// ---------------------------------------------------------------------
// IDEE, libellés de la page 16, pour compléter jusqu'à cent
// ---------------------------------------------------------------------
const IDEES: readonly [number, string][] = [
  [223, "Doctrine des canaux"],
  [224, "Plateforme de vente tierce"],
  [225, "Places de marché de gabarits"],
  [226, "Auto-édition longue"],
  [227, "Dossier pour un éditeur classique"],
  [228, "Droits étrangers"],
  [229, "Syndication d’articles"],
  [230, "Revente par des tiers"],
  [231, "Affiliation entrante seulement"],
  [232, "Agrégateurs et lettres tierces"],
  [233, "Le paquet de lancement"],
  [234, "Registre des canaux et de leur rendement"],
  [245, "Cartographie des institutions"],
  [246, "Intervention en école"],
  [247, "Direction de mémoire et participation à un jury"],
  [248, "Adhésion à une association professionnelle"],
  [249, "Groupe de travail normatif"],
  [250, "Partenariats avec des bailleurs et des agences de développement"],
  [251, "Ordres professionnels et fédérations"],
  [252, "Distinctions et palmarès"],
  [253, "Incubateurs et écoles africaines"],
  [254, "Chaire ou cours long"],
  [255, "Règle de formulation institutionnelle"],
  [266, "Registre des erreurs publiées"],
  [271, "Tableau de bord de la branche"],
  [272, "Seuils d’arrêt chiffrés"],
  [284, "Position publique sur l’usage de l’IA dans la production"],
  [299, "Rétro annuelle publique"],
  [300, "Règle de charge personnelle"],
];

const sansIdees = [
  ...methodes,
  ...affirmations,
  ...preuves,
  mesureM001,
  ...articles,
  ...composants,
  ...produits,
  ...adr,
  ...xdec,
  ...gabarits,
  ...cadres,
  ...sources,
];

const idees = IDEES.slice(0, Math.max(0, 100 - sansIdees.length)).map(
  ([n, titre]) =>
    base({
      id: `AXP-${n}`,
      type: "idee",
      titre,
      source: PAGE_16,
      etat: "concept",
      droits: "reserve",
    }),
);

export const ECHANTILLON_EN0: readonly ObjetGraphe[] = [...sansIdees, ...idees];

/** Les montées d'état réelles, rejouées après l'insertion des liens. */
export const PASSAGES_EN0: readonly { id: string; etat: "prouve" }[] =
  METHODES.filter((m) => m.etat === "PROUVÉ").map((m) => ({
    id: m.identifiant,
    etat: "prouve" as const,
  }));

/** Types sans objet réel au jour du relevé : déclarés vides, jamais remplis. */
export const TYPES_SANS_OBJET_REEL = ["playbook", "parcours"] as const;

// ---------------------------------------------------------------------
// Les liens, réels eux aussi
// ---------------------------------------------------------------------
export const LIENS_EN0: readonly LienGraphe[] = [
  // chaque preuve relevée établit son affirmation
  ...releve.preuves.map((p, i) => ({
    de: `P-${String(i + 1).padStart(3, "0")}`,
    nature: "prouve" as const,
    vers: p.affirmation,
  })),
  // la mesure publiée de M-001
  { de: "P-M001-20260927", nature: "mesure", vers: "M-001" },
  // dépendances déclarées dans les fiches
  ...METHODES.flatMap((m) =>
    m.dependances.map((d) => ({
      de: m.identifiant,
      nature: "depend_de" as const,
      vers: d,
    })),
  ),
  // clauses de renvoi chiffrées
  ...METHODES.filter((m) => m.clauseRenvoi.produit !== null).map((m) => ({
    de: m.identifiant,
    nature: "associe_a" as const,
    vers: "ESG-OPTIMIZER",
  })),
  // l'article long applique M-001, la décision du jour la régit
  { de: "ART-methode-de-preuve", nature: "applique", vers: "M-001" },
  { de: "XDEC-53", nature: "decide", vers: "M-001" },
  { de: "XDEC-61", nature: "decide", vers: "M-001" },
  { de: "GAB-FICHE-METHODE", nature: "applique", vers: "M-001" },
  // un ADR remplacé et son successeur
  ...ADR_CATALOGUE.filter((a) => a.remplace).map((a) => ({
    de: a.adrId,
    nature: "remplace" as const,
    vers: a.remplace!,
  })),
];
