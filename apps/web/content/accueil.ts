// =====================================================================
// L'accueil d'ADAMA OS, seconde passe du 7 novembre 2026.
//
// Ce que le visiteur doit comprendre en une minute, sans connaître le
// vocabulaire du cockpit : ce qu'Adama construit, ce qu'il publie, ce qu'il
// propose, et comment chaque chose se vérifie.
//
// Source : les pages Notion « ADAMA OS », « ADAMA OS EXPANSION, plan de la
// branche connaissance et actifs intellectuels (arrêté au 7 septembre
// 2026) » et « Noyau de connaissance, programme d'implémentation ADAMA OS
// EXPANSION (7 septembre 2026) ». La thèse y est écrite ainsi : on ne vend
// pas un savoir, on vend un système installé et la preuve qu'il a déjà
// tourné. L'accompagnement de projets est un format de la branche CONSEIL,
// pas le centre.
//
// Les six branches sont aussi lues par le grand menu de l'en-tête : une
// seule liste, deux surfaces.
// =====================================================================

export type CodePilier = "construire" | "publier" | "accompagner";

type Pilier = {
  code: CodePilier;
  verbe: string;
  titre: string;
  texte: string;
  lien: { libelle: string; href: string };
};

/** Les trois choses que fait Adama, dans l'ordre où elles se nourrissent. */
export const PILIERS: readonly Pilier[] = [
  {
    code: "construire",
    verbe: "Construire",
    titre: "Des logiciels en service",
    texte:
      "STRATA ESG pour la donnée de durabilité, Pharivo pour la santé en Afrique de l’Ouest, Conhama pour l’économie durable. Des produits en ligne, utilisés, tenus.",
    lien: { libelle: "Voir les réalisations", href: "#realisations" },
  },
  {
    code: "publier",
    verbe: "Publier",
    titre: "Des méthodes qui ont tourné",
    texte:
      "Ce qui a marché dans ces produits devient une méthode nommée, datée et versionnée, avec des notes de fond, des outils et des parcours. Le laboratoire est en accès libre.",
    lien: { libelle: "Ouvrir les ressources", href: "/catalogue" },
  },
  {
    code: "accompagner",
    verbe: "Accompagner",
    titre: "Votre projet, avec la même méthode",
    texte:
      "Revue d’un système, second avis, accompagnement de six semaines : la méthode appliquée à votre projet, par celui qui l’a construite.",
    lien: { libelle: "Travailler ensemble", href: "/travaillez-avec-moi" },
  },
] as const;

export type CodeBranche =
  | "open"
  | "press"
  | "forge"
  | "atelier"
  | "conseil"
  | "signal";

type Branche = {
  code: CodeBranche;
  nom: string;
  /** Le libellé du grand menu. */
  libelle: string;
  texte: string;
  etat: string;
  /** Vrai quand la branche sert déjà quelque chose au visiteur. */
  ouverte: boolean;
  href: string;
};

/**
 * Les six branches d'ADAMA OS EXPANSION, avec leur état réel. Aucune
 * branche n'est présentée comme ouverte avant de servir quelque chose : le
 * gratuit est en ligne, le payant ne l'est pas encore.
 */
export const BRANCHES: readonly Branche[] = [
  {
    code: "open",
    nom: "OPEN",
    libelle: "Le laboratoire public",
    texte:
      "Les méthodes, les décisions, les preuves, les erreurs et le cockpit, en accès libre et pour toujours.",
    etat: "En ligne",
    ouverte: true,
    href: "/catalogue",
  },
  {
    code: "press",
    nom: "PRESS",
    libelle: "Notes de fond et guides",
    texte:
      "Des notes longues et des guides, chaque affirmation reliée à sa source.",
    etat: "Premières notes en ligne",
    ouverte: true,
    href: "/bibliotheque",
  },
  {
    code: "forge",
    nom: "FORGE",
    libelle: "Outils et systèmes",
    texte:
      "Des outils et des gabarits installables, proposés seulement après avoir servi en vrai.",
    etat: "Outils gratuits en ligne",
    ouverte: true,
    href: "/outils",
  },
  {
    code: "atelier",
    nom: "ATELIER",
    libelle: "Parcours",
    texte:
      "Des parcours pour apprendre à concevoir un système de donnée, du modèle à la preuve.",
    etat: "En préparation",
    ouverte: false,
    href: "/parcours",
  },
  {
    code: "conseil",
    nom: "CONSEIL",
    libelle: "Revues et accompagnement",
    texte:
      "Revue d’architecture, second avis, accompagnement de projets en six semaines.",
    etat: "Ouvert",
    ouverte: true,
    href: "/travaillez-avec-moi",
  },
  {
    code: "signal",
    nom: "SIGNAL",
    libelle: "La lettre",
    texte:
      "Ce qui change dans un système, la décision prise, ce qui a été appris. Une lettre courte, sans bruit.",
    etat: "Inscriptions ouvertes",
    ouverte: true,
    href: "/lettre",
  },
] as const;

export type CodeMaillon =
  | "idee"
  | "experience"
  | "decision"
  | "methode"
  | "actif";

type Maillon = {
  code: CodeMaillon;
  libelle: string;
  question: string;
  texte: string;
  lien: { libelle: string; href: string };
};

/** La chaîne de l'idée à l'actif, telle qu'elle se raconte au visiteur. */
export const MAILLONS: readonly Maillon[] = [
  {
    code: "idee",
    libelle: "Idée",
    question: "Qu’est-ce qui mérite d’être essayé ?",
    texte:
      "Chaque idée est notée, datée et rangée avant d’être essayée. Une seule passe à la fois ; les autres attendent, sans être perdues.",
    lien: { libelle: "Le journal de bord", href: "/journal" },
  },
  {
    code: "experience",
    libelle: "Expérience",
    question: "Qu’est-ce qui pourrait lui donner tort ?",
    texte:
      "Un protocole court, écrit avant de commencer, confronté au réel : un utilisateur, une donnée, une mise en production.",
    lien: { libelle: "Les erreurs publiées", href: "/erreurs" },
  },
  {
    code: "decision",
    libelle: "Décision",
    question: "Qu’est-ce qui est retenu, et pourquoi ?",
    texte:
      "Ce qui est retenu, ce qui est écarté et la raison sont publiés dans un journal daté. Un revirement s’écrit aussi.",
    lien: { libelle: "Le journal des décisions", href: "/decisions" },
  },
  {
    code: "methode",
    libelle: "Méthode",
    question: "Qu’est-ce qui reste réutilisable ?",
    texte:
      "Ce qui a tenu devient une méthode nommée et versionnée, avec son état affiché : en recherche, testée, puis prouvée.",
    lien: { libelle: "La bibliothèque des méthodes", href: "/methodes" },
  },
  {
    code: "actif",
    libelle: "Actif",
    question: "Qui peut s’en servir, et dans quelles limites ?",
    texte:
      "La méthode devient un outil, une note, un parcours, un accompagnement ou un logiciel, avec ses limites écrites.",
    lien: { libelle: "Tout le catalogue", href: "/catalogue" },
  },
] as const;

/** La conviction, lue mot par mot au défilement. */
export const CONVICTION =
  "Ce qui se transmet n’est pas un savoir, c’est un système qui a déjà tourné. Chaque méthode publiée ici est d’abord passée par une de mes entreprises, et chaque affirmation renvoie à sa preuve.";

type Question = { q: string; r: string };

export const QUESTIONS_ACCUEIL: readonly Question[] = [
  {
    q: "Qu’est-ce qu’ADAMA OS, en une phrase ?",
    r: "Le système de travail d’Adama Diallo, rendu public : les logiciels qu’il construit, les décisions qu’il prend, les preuves qui les appuient, et les méthodes qui en sortent pour servir à d’autres.",
  },
  {
    q: "Faut-il travailler dans la durabilité pour faire appel à vous ?",
    r: "Non. Les logiciels de durabilité sont chez STRATA ESG. La méthode, elle, sert tout projet qui doit passer d’une idée à un système qui tient : une offre, une organisation, des données, des outils.",
  },
  {
    q: "Que puis-je utiliser sans rien payer ?",
    r: "Tout le laboratoire public : les méthodes, les notes de fond, les outils, les décisions et les preuves. Ce qui est gratuit le reste.",
  },
  {
    q: "Comment se passe un premier échange ?",
    r: "Trente minutes, gratuites et sans engagement. Vous décrivez la situation, je vous dis si je peux aider et sous quelle forme. Une proposition écrite suit, seulement si elle a du sens.",
  },
  {
    q: "Où travaillez-vous, et en quelle langue ?",
    r: "Entre Paris et Dakar, avec des porteurs de projets en France et en Afrique de l’Ouest. En français, et l’échange peut commencer en wolof ou en pular.",
  },
  {
    q: "Comment vérifier ce que vous affirmez ?",
    r: "Chaque affirmation du site porte sa source et une page de vérification. Les décisions sont datées, les erreurs publiées, et l’état du système se lit en direct.",
  },
] as const;

// =====================================================================
// Le premier écran. Trois verbes, et la figure d'ADAMA OS en quatre
// strates : ce qui tourne en bas, ce qui le transmet en haut.
// =====================================================================

export const TITRE_HERO = ["Construire", "Prouver", "Transmettre"] as const;

export type CodeStrate = "logiciels" | "decisions" | "preuves" | "methodes";

type Strate = {
  code: CodeStrate;
  libelle: string;
  detail: string;
};

/** Les quatre strates, de la base au sommet. */
export const STRATES: readonly Strate[] = [
  {
    code: "logiciels",
    libelle: "Logiciels",
    detail: "trois maisons en service",
  },
  {
    code: "decisions",
    libelle: "Décisions",
    detail: "un journal daté",
  },
  {
    code: "preuves",
    libelle: "Preuves",
    detail: "reliées à leur source",
  },
  {
    code: "methodes",
    libelle: "Méthodes",
    detail: "publiées, versionnées",
  },
] as const;

/** Les mêmes strates, pour la racine anglaise. */
export const STRATES_EN: readonly Strate[] = [
  {
    code: "logiciels",
    libelle: "Software",
    detail: "three companies in service",
  },
  { code: "decisions", libelle: "Decisions", detail: "a dated log" },
  { code: "preuves", libelle: "Proofs", detail: "linked to their source" },
  { code: "methodes", libelle: "Methods", detail: "published, versioned" },
] as const;

export const TITRE_HERO_EN = ["Build", "Prove", "Pass on"] as const;

/** Les trois piliers, pour la racine anglaise. Les fiches liées sont en français. */
export const PILIERS_EN: readonly Pilier[] = [
  {
    code: "construire",
    verbe: "Build",
    titre: "Software in service",
    texte:
      "STRATA ESG for sustainability data, Pharivo for health in West Africa, Conhama for the sustainable economy. Products that are live, used and maintained.",
    lien: { libelle: "See the work (in French)", href: "/projets" },
  },
  {
    code: "publier",
    verbe: "Publish",
    titre: "Methods that have run",
    texte:
      "What worked in these products becomes a named, dated and versioned method, with notes, tools and proofs. The lab is open to everyone.",
    lien: { libelle: "Read the notes", href: "#en-notes" },
  },
  {
    code: "accompagner",
    verbe: "Work together",
    titre: "Your project, the same method",
    texte:
      "A six-week programme, an architecture review or a second opinion: the method applied to your project, by the person who built it.",
    lien: { libelle: "How I work (in French)", href: "/comment-je-travaille" },
  },
] as const;
