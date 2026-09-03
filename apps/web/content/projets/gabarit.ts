// =====================================================================
// C5-T2, le gabarit de fiche projet.
//
// Arbitrage assume, a lire avant de proposer du MDX. La couche C5 demandait
// des fiches en MDX versionne. Le gabarit impose huit blocs, aucun optionnel,
// et exige que le BUILD ECHOUE si un bloc manque. Un frontmatter MDX ne sait
// pas faire echouer un build : il faudrait un validateur d'execution, donc
// une dependance et un test de plus pour verifier le validateur.
//
// Le type TypeScript ci-dessous fait exactement ce que la couche demande, et
// il le fait a la compilation : une fiche a laquelle il manque un bloc ne
// compile pas, donc `next build` s'arrete. Le contenu reste versionne dans le
// depot, relu par un humain, non synchronise depuis une base : les trois
// proprietes que la couche exigeait du MDX sont tenues.
//
// Ce que ce fichier ne contient PAS : aucune preuve, aucune decision. Le
// bloc 05 lit proof_claims par sujet, le bloc 04 lit decisions_log par
// projet. Une fiche declare a quel sujet elle se rattache, elle ne recopie
// jamais une preuve.
// =====================================================================

/** Deux valeurs, pas trois. « Contributeur » est une reponse honorable. */
export type NiveauResponsabilite = "responsable" | "contributeur";

/** Les sept domaines, dans l'ordre d'affichage du tableau du bloc 02. */
export const DOMAINES_ROLE = [
  "architecture",
  "produit",
  "backend",
  "donnees",
  "ia",
  "frontend",
  "commercial",
] as const;

export type DomaineRole = (typeof DOMAINES_ROLE)[number];

export const DOMAINE_LABEL: Record<DomaineRole, string> = {
  architecture: "Architecture",
  produit: "Produit",
  backend: "Backend",
  donnees: "Données",
  ia: "IA",
  frontend: "Frontend",
  commercial: "Commercial",
};

/** Etat reel. Jamais une date de livraison non engagee. */
export type EtatProjet =
  | "production"
  | "developpement"
  | "prototype"
  | "projet";

export const ETAT_LABEL: Record<EtatProjet, string> = {
  production: "En production",
  developpement: "En développement",
  prototype: "Prototype",
  projet: "Projet",
};

/**
 * Le schema du bloc 03. Des colonnes de noeuds relies de gauche a droite,
 * rendues en SVG en ligne, sans bibliotheque, repliees verticalement sur
 * telephone. `flux` en est l'equivalent textuel : un lecteur d'ecran doit
 * comprendre le schema sans le voir.
 */
export type SchemaArchitecture = {
  legende: string;
  colonnes: readonly { titre: string; noeuds: readonly string[] }[];
  flux: string;
};

/** Une technologie reellement installee, et ce qu'elle fait ici. */
export type Technologie = { nom: string; role: string };

/**
 * Bloc 02. Le plus important de la page, et le seul qu'un agent n'a pas le
 * droit d'ecrire seul : `aValider` reste vrai tant qu'Adama n'a pas relu.
 */
export type BlocRole = {
  niveaux: Record<DomaineRole, NiveauResponsabilite>;
  /** Trois a cinq phrases a la premiere personne, chacune adossable a une
   *  preuve. Pas de barre de progression, pas d'autoevaluation. */
  phrases: readonly string[];
  /** Vrai tant que la formulation est une proposition, pas la parole d'Adama. */
  aValider: boolean;
  /** Ce que seul Adama peut trancher. Affiche uniquement hors production. */
  questions: readonly string[];
};

export type FicheProjet = {
  slug: string;
  titre: string;
  /** Division du groupe : STRATA, IROKO, Cockpit. */
  division: string;
  /** Categorie de filtre sur l'accueil. Le vocabulaire du visiteur, pas
   *  celui de l'organigramme. */
  categorie: string;
  /** Une ligne, le probleme, pour la carte de surface de l'accueil. */
  resume: string;
  /** Le role en un mot, pour la carte de surface. */
  roleEnUnMot: string;
  ordre: number;
  /** C5-T8. Une fiche ne se publie pas tant que ce champ est faux. */
  reluParAdama: boolean;
  /** Sujets auxquels se rattachent les preuves du bloc 05. Le bloc lit
   *  proof_claims filtre sur ces valeurs de subject_ref : il ne recopie
   *  jamais une preuve dans la fiche. */
  sujetsPreuve: readonly string[];
  /** Identifiants d'ADR du bloc 04, lus dans decisions_log. */
  adrIds: readonly string[];
  /** Affirmation mise en avant sur la carte d'accueil. Le lien de
   *  verification n'apparait que si le registre la sert reellement. */
  preuveVedette: string;

  // --- Les huit blocs, aucun optionnel ------------------------------
  /** 01. Pourquoi ce projet existe. Un probleme metier, pas une opportunite. */
  probleme: readonly string[];
  /** 02. Ce qu'Adama a personnellement fait. */
  role: BlocRole;
  /** 03. Architecture et stack. Le schema d'abord, la liste ensuite. */
  architecture: {
    schema: SchemaArchitecture;
    /** Jamais une technologie non installee. */
    stack: readonly Technologie[];
    /** « inventaire » : liste derivee de l'inventaire C0, donc exacte.
     *  « saisie » : liste saisie et relue, elle engage celui qui l'ecrit. */
    stackSource: "inventaire" | "saisie";
  };
  /** 06. Ce qui a ete volontairement refuse. */
  compromis: readonly { refuse: string; raison: string; cout: string }[];
  /** 07. Ou ca en est. */
  etat: { valeur: EtatProjet; precision: string };
  /** 08. Ce qui reste. Trois lignes maximum, sans promesse. */
  suite: readonly string[];
};

/** Les huit blocs, dans l'ordre, avec leur ancre et leur titre affiche. */
export const BLOCS = [
  { numero: "01", id: "probleme", titre: "Problème" },
  { numero: "02", id: "role", titre: "Mon rôle" },
  { numero: "03", id: "architecture", titre: "Architecture et stack" },
  { numero: "04", id: "decisions", titre: "Décisions" },
  { numero: "05", id: "preuves", titre: "Preuves" },
  { numero: "06", id: "compromis", titre: "Compromis" },
  { numero: "07", id: "etat", titre: "État" },
  { numero: "08", id: "suite", titre: "Suite" },
] as const;

export type BlocId = (typeof BLOCS)[number]["id"];
