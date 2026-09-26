import { POSITIONNEMENT, SIGNATURE_TEXTE, TITRE_COURT } from "./profil";

// La marque lit sa source unique (EC1 a EC3) : aucune de ces trois chaines
// n'est recopiee ici, pour qu'un changement de phrase ne laisse jamais deux
// versions en ligne.
export const ADAMA_OS = {
  nom: "ADAMA OS",
  territoire: TITRE_COURT.affiche,
  proposition: POSITIONNEMENT.fr,
  sousTitre: "Méthodes, systèmes et outils pour construire l’ESG numérique.",
  signature: SIGNATURE_TEXTE,
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
    action: "Choisir une porte",
    href: "/travaillez-avec-moi",
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
