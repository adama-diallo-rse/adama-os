export const ADAMA_OS = {
  nom: "ADAMA OS",
  territoire: "ESG · DATA · SYSTEMS",
  proposition:
    "Je conçois des systèmes numériques qui rendent la donnée de durabilité exploitable, vérifiable et opposable.",
  sousTitre: "Méthodes, systèmes et outils pour construire l’ESG numérique.",
  signature: "Construit par Adama. Chaque mot vérifiable en un clic.",
} as const;

export const PARCOURS_PUBLICS = [
  {
    code: "OPEN",
    titre: "Explorer les travaux",
    description:
      "Décisions, expériences, erreurs et preuves, avec leur date et leur source.",
    action: "Voir les travaux",
    href: "/decisions",
  },
  {
    code: "FORGE",
    titre: "Construire un système",
    description:
      "Une méthode concrète pour relier une idée, une décision, une preuve et un actif réutilisable.",
    action: "Utiliser la méthode",
    href: "/methode",
  },
  {
    code: "CONSEIL",
    titre: "Résoudre un problème",
    description:
      "Faire relire une architecture de donnée, de preuve ou d’automatisation avant d’empiler des outils.",
    action: "Voir la revue",
    href: "/revue-architecture",
  },
] as const;

export const CHAINE_PREUVE = [
  {
    code: "AXP",
    libelle: "Idée",
    question: "Qu’est-ce qui mérite d’être testé ?",
  },
  {
    code: "EXP",
    libelle: "Expérience",
    question: "Quel protocole peut contredire l’idée ?",
  },
  {
    code: "XDEC",
    libelle: "Décision",
    question: "Qu’est-ce qui a été retenu, écarté et pourquoi ?",
  },
  {
    code: "M",
    libelle: "Méthode",
    question: "Qu’est-ce qui reste réutilisable après le test ?",
  },
  {
    code: "ASSET",
    libelle: "Actif",
    question: "Qui peut l’utiliser, dans quelles limites ?",
  },
] as const;

export const ETATS_CONNAISSANCE = [
  "CONCEPT",
  "RECHERCHE",
  "TESTÉ",
  "PROUVÉ",
  "ARCHIVÉ",
] as const;
