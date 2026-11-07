// =====================================================================
// EC4, AXP-158, puis refonte commerciale du 7 novembre 2026 : la barre du
// visiteur en six temps.
//
// Réalisations, Méthodes, Ressources, Travailler ensemble, À propos, puis
// la seule sortie vers STRATA ESG. L'ordre ne se reorganise pas par page. Chaque temps
// nomme la page ou il mene, la question du visiteur a laquelle il repond,
// et le signal qui dirait qu'il ne sert a rien. Ce signal est une regle de
// retrait : un temps qui ne mene nulle part sort de la barre, il ne s'y
// maintient pas par habitude.
//
// Les pages visees existent toutes aujourd'hui. /os, /savoir et /idees sont
// des chantiers de la vague X3 (EC6, EC10, EC11) : aucun temps n'y renvoie
// avant qu'elles soient en ligne.
// =====================================================================

export const URL_STRATA = "https://www.strata-esg.fr/";

export type TempsParcours = {
  code:
    | "realisations"
    | "methodes"
    | "ressources"
    | "ensemble"
    | "profil"
    | "strata";
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

// 7 novembre 2026, seconde passe : ADAMA OS n'est pas une offre de
// conseil, c'est un systeme de travail rendu public. La barre suit les
// questions d'un visiteur qui decouvre : qu'avez-vous construit, comment
// travaillez-vous, que puis-je utiliser, pouvons-nous travailler ensemble,
// qui etes-vous. La sortie vers STRATA ESG reste la derniere et la seule.
export const PARCOURS_VISITEUR: readonly TempsParcours[] = [
  {
    code: "realisations",
    libelle: "Réalisations",
    libelleEn: "Work",
    href: "/projets",
    actifSur: ["/projets", "/ecosysteme"],
    question: "Qu’avez-vous réellement construit, et est-ce en service ?",
    signalInutile:
      "Les réalisations sont affichées sans qu’aucune fiche projet ne soit ouverte.",
    sortie: false,
  },
  {
    code: "methodes",
    libelle: "Méthodes",
    libelleEn: "Methods",
    href: "/methodes",
    actifSur: ["/methodes", "/methode", "/principes", "/comment-je-travaille"],
    question: "Comment travaillez-vous, et qu’est-ce qui a été prouvé ?",
    signalInutile:
      "La bibliothèque des méthodes est ouverte puis quittée sans qu’aucune fiche ne soit lue.",
    sortie: false,
  },
  {
    code: "ressources",
    libelle: "Ressources",
    libelleEn: "Resources",
    href: "/catalogue",
    actifSur: [
      "/catalogue",
      "/articles",
      "/en/articles",
      "/bibliotheque",
      "/outils",
      "/playbooks",
      "/parcours",
      "/technique",
      "/decisions",
      "/preuves",
      "/revirements",
      "/journal",
      "/erreurs",
      "/expansion",
      "/ecriture",
      "/lettre",
      "/os",
    ],
    question: "Qu’est-ce que je peux lire et utiliser ici sans rien acheter ?",
    signalInutile:
      "Aucune ressource gratuite n’est ouverte depuis le catalogue pendant un trimestre.",
    sortie: false,
  },
  {
    code: "ensemble",
    libelle: "Travailler ensemble",
    libelleEn: "Work with me",
    href: "/travaillez-avec-moi",
    actifSur: ["/travaillez-avec-moi", "/diagnostic", "/revue-architecture"],
    question: "Pouvez-vous m’aider sur mon projet, et sous quelle forme ?",
    signalInutile:
      "Les visites de la page ne mènent à aucun premier échange ni à aucune demande écrite.",
    sortie: false,
  },
  {
    code: "profil",
    libelle: "À propos",
    libelleEn: "About",
    href: "/a-propos",
    actifSur: ["/a-propos"],
    question: "Qui êtes-vous, et qui vous fait déjà confiance ?",
    signalInutile:
      "La page À propos est quittée avant la section des organisations.",
    sortie: false,
  },
  {
    code: "strata",
    libelle: "STRATA ESG",
    libelleEn: "STRATA ESG",
    href: URL_STRATA,
    actifSur: [],
    question: "Mon besoin exige-t-il un logiciel de durabilité opérationnel ?",
    signalInutile:
      "La sortie est suivie d’un retour immédiat sur ce site, sans visite du logiciel.",
    sortie: true,
  },
] as const;
