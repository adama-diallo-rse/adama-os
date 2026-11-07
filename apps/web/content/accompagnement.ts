// =====================================================================
// L'accompagnement de projets, l'un des formats de la branche CONSEIL
// d'ADAMA OS, et les logos et photographies que partagent l'accueil et
// les pages du site.
//
// Source : la page Notion « Accompagnement de projets, offre adamesg-os.fr
// (arrêté au 10 octobre 2026) » et ses sous-pages 1, 3 et 6. Seconde passe
// du 7 novembre 2026, décidée par Adama :
//   - l'offre est ouverte, sans date d'ouverture annoncée ;
//   - aucun prix n'est publié, la grille reste interne ;
//   - l'accompagnement est un format parmi d'autres, pas le centre du site.
//
// Règles tenues par tests/accompagnement.test.ts : une seule formule mise
// en avant, aucun montant publié, aucun nom de bénéficiaire pilote tant que
// son accord écrit d'étude de cas n'est pas reçu, la durabilité renvoyée
// vers STRATA ESG.
// =====================================================================

import { EXPERIENCES, FORMATION } from "./profil";

export const PROMESSE = {
  titre: "Vos idées, structurées en un projet qui avance.",
  phrase:
    "J’aide les porteurs de projets à structurer leur projet, prioriser leurs actions et installer un système de travail qui tient, en six semaines.",
} as const;

/** L'état de l'offre, tel qu'il se dit au visiteur. */
export const ETAT_OFFRE = {
  arreteLe: "2026-11-07",
  badge: "Ouvert",
  texte:
    "Un premier échange de trente minutes, gratuit et sans engagement, suffit pour savoir si le format vous convient et par où commencer.",
} as const;

type Situation = {
  code: string;
  titre: string;
  reponse: string;
};

/** Pour qui : trois situations, dites avec les mots de celles et ceux qui les vivent. */
export const SITUATIONS: readonly Situation[] = [
  {
    code: "idees",
    titre: "Vous avez beaucoup d’idées, et pas encore de plan.",
    reponse:
      "On choisit ce qui mérite d’être poursuivi, on écarte le reste, et on l’écrit pour ne plus y revenir.",
  },
  {
    code: "urgences",
    titre: "Vous avancez, mais tout vous semble urgent.",
    reponse:
      "Vous repartez avec une feuille de route priorisée : maintenant, ensuite, plus tard.",
  },
  {
    code: "organisation",
    titre: "Votre organisation vous ralentit.",
    reponse:
      "Un seul espace de suivi, une routine hebdomadaire et des processus documentés que vous tenez seul.",
  },
] as const;

type Semaine = {
  numero: number;
  verbe: string;
  objectif: string;
  livrable: string;
  duree: string;
};

/** Le programme, semaine par semaine (page 3 de l'offre). */
export const SEMAINES: readonly Semaine[] = [
  {
    numero: 1,
    verbe: "Clarifier",
    objectif: "Comprendre le projet et décider ce qui mérite d’être poursuivi.",
    livrable:
      "Fiche projet d’une page, objectif à six semaines, trois priorités.",
    duree: "75 min",
  },
  {
    numero: 2,
    verbe: "Positionner",
    objectif: "Préciser à qui le projet sert, et pourquoi il doit exister.",
    livrable:
      "Proposition de valeur, premier utilisateur cible, hypothèses à tester.",
    duree: "60 min",
  },
  {
    numero: 3,
    verbe: "Prioriser",
    objectif: "Séparer l’essentiel du secondaire.",
    livrable: "Feuille de route priorisée et première revue de progression.",
    duree: "60 min",
  },
  {
    numero: 4,
    verbe: "Organiser",
    objectif: "Rendre l’exécution simple et visible.",
    livrable: "Tableau de pilotage, plan de la semaine, routine de revue.",
    duree: "60 min",
  },
  {
    numero: 5,
    verbe: "Passer à l’action",
    objectif: "Confronter le projet à la réalité.",
    livrable:
      "Un test réel : entretien, démonstration, prototype ou offre, et ses enseignements.",
    duree: "60 min",
  },
  {
    numero: 6,
    verbe: "Consolider",
    objectif: "Mesurer le chemin parcouru et préparer la suite.",
    livrable: "Bilan avant et après, feuille de route à trente jours.",
    duree: "75 min",
  },
] as const;

/** Ce que le bénéficiaire garde à la fin, quel que soit le projet. */
export const RESULTATS = [
  "Un plan d’action à trente jours",
  "Une feuille de route priorisée",
  "Un tableau de pilotage qui sert vraiment",
  "Un bilan avant et après, chiffré sur votre propre grille",
] as const;

type Formule = {
  code: "accompagnement" | "diagnostic" | "sprint" | "outils";
  titre: string;
  pourQuoi: string;
  contenu: readonly string[];
  duree: string;
  /** La formule mise en avant. Une seule. */
  principale: boolean;
};

/** La gamme (page 6). Aucun prix publié : il se fixe par écrit, format par format. */
export const FORMULES: readonly Formule[] = [
  {
    code: "accompagnement",
    titre: "Accompagnement de six semaines",
    pourQuoi: "Passer d’un projet flou à un système de travail qui tient.",
    contenu: [
      "Un diagnostic de départ et une grille de maturité",
      "Six séances, une par semaine, sur un créneau fixe",
      "Un livrable concret à chaque séance",
      "Un bilan final et une feuille de route à trente jours",
    ],
    duree: "6 semaines",
    principale: true,
  },
  {
    code: "diagnostic",
    titre: "Diagnostic stratégique",
    pourQuoi: "Savoir où vous en êtes avant de vous engager.",
    contenu: [
      "Un entretien approfondi",
      "Une analyse écrite",
      "Un plan d’action",
    ],
    duree: "Une séance",
    principale: false,
  },
  {
    code: "sprint",
    titre: "Sprint de structuration",
    pourQuoi: "Débloquer un seul sujet : une offre, un projet, une équipe.",
    contenu: [
      "Un périmètre unique, fixé d’avance",
      "Un travail ciblé et intensif",
      "Un livrable prêt à l’emploi",
    ],
    duree: "1 à 2 semaines",
    principale: false,
  },
  {
    code: "outils",
    titre: "Mise en place d’outils",
    pourQuoi: "Arrêter de perdre du temps sur les tâches qui se répètent.",
    contenu: [
      "La carte de vos tâches répétitives",
      "Le choix et la configuration des outils",
      "Un flux de travail documenté, que vous maîtrisez",
    ],
    duree: "Selon le périmètre",
    principale: false,
  },
] as const;

export const NOTE_FORMULES =
  "Chaque format se fixe par une proposition écrite après le premier échange : périmètre, dates, livrables et ce qui est exclu.";

/** La frontière (page 1) : ce qui ne se vend pas ici. */
export const HORS_PERIMETRE = [
  "conseil juridique",
  "audit réglementaire",
  "recommandation d’investissement",
  "certification",
] as const;

export const RENVOI_DURABILITE =
  "Votre sujet est la durabilité, la RSE ou un reporting ESG ? Il se traite avec STRATA ESG, qui édite les logiciels et l’accompagnement pour cela.";

type Question = { q: string; r: string };

export const QUESTIONS: readonly Question[] = [
  {
    q: "Je ne travaille pas dans le numérique. Est-ce pour moi ?",
    r: "Oui, si votre projet a besoin d’être structuré : offre, organisation, suivi commercial, outils. La méthode sert dans tous les secteurs. Elle ne juge pas la technique de votre métier, elle organise la façon de le faire avancer.",
  },
  {
    q: "Combien de temps faut-il y consacrer ?",
    r: "Une séance par semaine, d’une heure, et d’une heure et quart pour la première et la dernière. Ajoutez le temps d’exécuter ce qui a été décidé : c’est là que le projet avance.",
  },
  {
    q: "Comment se fixe le prix ?",
    r: "Après le premier échange, je vous envoie une proposition écrite : périmètre, dates, livrables, ce qui est exclu et le montant. Rien ne commence avant votre accord.",
  },
  {
    q: "Pourquoi vous faire confiance ?",
    r: "Parce que j’applique la méthode à mes propres entreprises avant de la proposer. STRATA ESG, Pharivo et Conhama sont en production, et chaque décision qui les a construites est publiée sur ce site, avec sa date et sa source.",
  },
  {
    q: "Mon sujet concerne la durabilité ou la RSE.",
    r: RENVOI_DURABILITE,
  },
] as const;

// --- Les logos ------------------------------------------------------------

export type LogoOrganisation = {
  id: string;
  nom: string;
  /** Nom de base dans public/logos (version couleur). */
  fichier: string;
  largeur: number;
  hauteur: number;
  /** Hauteur d'affichage dans la bande, réglée à l'œil, logo par logo. */
  affichage: number;
};

/** Les structures qui accompagnent les projets d'Adama. */
export const PARTENAIRES: readonly LogoOrganisation[] = [
  {
    id: "institut-engagement",
    nom: "Institut de l’Engagement",
    fichier: "institut-engagement",
    largeur: 189,
    hauteur: 200,
    affichage: 64,
  },
  {
    id: "google-for-startups",
    nom: "Google for Startups",
    fichier: "google-for-startups",
    largeur: 1270,
    hauteur: 200,
    affichage: 30,
  },
  {
    id: "cci-paris-idf",
    nom: "CCI Paris Île-de-France",
    fichier: "cci-paris-idf",
    largeur: 1092,
    hauteur: 200,
    affichage: 38,
  },
] as const;

/**
 * Les organisations où Adama a travaillé et s'est formé. Seules leurs
 * marques sont décrites ici : le nom est projeté depuis content/profil.ts
 * (EXPERIENCES, FORMATION), la source unique du parcours, pour qu'aucune
 * liste d'organisations ne soit recopiée à la main (tests/profil.test.ts).
 */
const MARQUES_REFERENCES: readonly Omit<LogoOrganisation, "nom">[] = [
  {
    id: "ministere",
    fichier: "mefp-senegal",
    largeur: 464,
    hauteur: 200,
    affichage: 46,
  },
  {
    id: "ag2r",
    fichier: "ag2r-la-mondiale",
    largeur: 368,
    hauteur: 140,
    affichage: 40,
  },
  { id: "upec", fichier: "upec", largeur: 171, hauteur: 140, affichage: 44 },
  { id: "afev", fichier: "afev", largeur: 361, hauteur: 140, affichage: 34 },
  {
    id: "younivibe",
    fichier: "younivibe",
    largeur: 146,
    hauteur: 140,
    affichage: 40,
  },
];

function nomDe(id: string): string {
  const experience = EXPERIENCES.find((e) => e.id === id);
  if (experience) {
    // « Stage » ou « Service civique » ne nomment pas l'organisation ; un
    // lieu, si : « Ministère des Finances, Sénégal ».
    const lieu = ["Stage", "Service civique"].includes(experience.precision)
      ? ""
      : experience.precision;
    return lieu
      ? `${experience.organisation}, ${lieu}`
      : experience.organisation;
  }
  const formation = FORMATION.find((f) => f.id === id);
  if (formation) return formation.precision;
  throw new Error(`Organisation inconnue du parcours : ${id}`);
}

export const REFERENCES: readonly LogoOrganisation[] = MARQUES_REFERENCES.map(
  (m) => ({ ...m, nom: nomDe(m.id) }),
);

// --- Les photographies ------------------------------------------------------

export type Photo = {
  src: string;
  alt: string;
  largeur: number;
  hauteur: number;
};

/** Photographies retravaillées pour le site (étalonnage de la charte). */
export const PHOTOS = {
  equipe: {
    src: "/photos/equipe-construire.jpg",
    alt: "Une équipe penchée sur un ordinateur portable, l’un d’eux montre un point précis du stylo.",
    largeur: 3840,
    hauteur: 4800,
  },
  seance: {
    src: "/photos/seance-echange.jpg",
    alt: "Quatre personnes échangent debout autour d’une table basse, dans un bureau lumineux.",
    largeur: 3840,
    hauteur: 2560,
  },
  atelier: {
    src: "/photos/atelier-methodes.jpg",
    alt: "Trois personnes autour d’une table couverte de documents et de schémas, devant une bibliothèque ornée d’art africain.",
    largeur: 3840,
    hauteur: 2560,
  },
  dakar: {
    src: "/photos/dakar-rue.jpg",
    alt: "Une rue de Dakar : un car rapide peint à la main et un taxi jaune et noir au premier plan.",
    largeur: 3840,
    hauteur: 4800,
  },
} as const satisfies Record<string, Photo>;
