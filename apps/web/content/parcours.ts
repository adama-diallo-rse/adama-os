// =====================================================================
// EC4, AXP-158, le parcours visiteur en cinq temps.
//
// Explore, Learn, Build, Work with me, Use STRATA : l'ordre est celui de la
// branche EC, et il ne se reorganise pas par page. Chaque temps nomme la
// page ou il mene, la question du visiteur a laquelle il repond, et le
// signal qui dirait qu'il ne sert a rien. Ce signal est une regle de
// retrait : un temps qui ne mene nulle part sort de la barre, il ne s'y
// maintient pas par habitude.
//
// Les pages visees existent toutes aujourd'hui. /os, /savoir et /idees sont
// des chantiers de la vague X3 (EC6, EC10, EC11) : aucun temps n'y renvoie
// avant qu'elles soient en ligne.
// =====================================================================

export const URL_STRATA = "https://www.strata-esg.fr/";

export type TempsParcours = {
  code: "explorer" | "apprendre" | "construire" | "ensemble" | "strata";
  libelle: string;
  libelleEn: string;
  href: string;
  /** Racines de chemin sur lesquelles le temps est marque courant. */
  actifSur: readonly string[];
  question: string;
  /** Ce qui, mesure, dirait que ce temps ne sert a rien. */
  signalInutile: string;
  /** Vrai pour le seul temps qui quitte le site. */
  sortie: boolean;
};

export const PARCOURS_VISITEUR: readonly TempsParcours[] = [
  {
    code: "explorer",
    libelle: "Explorer",
    libelleEn: "Explore",
    href: "/decisions",
    actifSur: [
      "/decisions",
      "/preuves",
      "/revirements",
      "/journal",
      "/erreurs",
      "/expansion",
    ],
    question: "Qu’est-ce qui a réellement été fait, et comment le vérifier ?",
    signalInutile:
      "Les visites du temps Explorer ne mènent à aucune ouverture de décision ni de preuve.",
    sortie: false,
  },
  {
    code: "apprendre",
    libelle: "Apprendre",
    libelleEn: "Learn",
    href: "/articles",
    actifSur: ["/articles", "/en/articles"],
    question: "Qu’est-ce que je peux comprendre ici sans rien acheter ?",
    signalInutile: "Aucune note de fond n’est lue jusqu’à sa dernière section.",
    sortie: false,
  },
  {
    code: "construire",
    libelle: "Construire",
    libelleEn: "Build",
    href: "/methode",
    actifSur: ["/methode", "/principes", "/technique"],
    question: "Comment passer d’une idée à un actif vérifiable ?",
    signalInutile: "La méthode est ouverte puis quittée sans lecture.",
    sortie: false,
  },
  {
    code: "ensemble",
    libelle: "Travailler ensemble",
    libelleEn: "Work with me",
    href: "/travaillez-avec-moi",
    actifSur: ["/travaillez-avec-moi", "/diagnostic", "/revue-architecture"],
    question: "Mon problème relève-t-il d’une revue, et laquelle ?",
    signalInutile:
      "Les demandes reçues ne remplissent jamais les quatre conditions d’acceptation.",
    sortie: false,
  },
  {
    code: "strata",
    libelle: "Utiliser STRATA",
    libelleEn: "Use STRATA",
    href: URL_STRATA,
    actifSur: [],
    question: "Mon besoin exige-t-il un logiciel opérationnel ?",
    signalInutile:
      "La sortie est suivie d’un retour immédiat sur ce site, sans visite du logiciel.",
    sortie: true,
  },
] as const;
