// =====================================================================
// AXP-106 et AXP-107, le catalogue et ses régimes (refonte du 30 octobre
// 2026).
//
// Le catalogue ne fabrique aucun objet. Il RANGE ce qui existe déjà dans
// le dépôt : les articles, les méthodes et leur état, les registres et les
// outils publics. Un objet absent d'ici n'existe pas encore ; un objet
// présent ici renvoie à une page qui existe, ce que tests/catalogue.test.ts
// vérifie route par route.
//
// Les rubriques suivent AXP-106. La rubrique consacrée au moteur n'a pas de
// surface publique : ses objets se rangent sous Construire et Architecture.
// Les régimes suivent AXP-107. Aucun prix, aucune date d'ouverture : le
// gratuit ne recule jamais, et une branche fermée le dit en clair.
// =====================================================================

import { ARTICLES } from "./articles";
import { METHODES, type EtatMethode } from "./methodes";

export type EtatObjet = EtatMethode | "OUVERT";

export type ObjetCatalogue = {
  titre: string;
  href: string;
  /** La forme de l'objet : ce que le visiteur trouvera en l'ouvrant. */
  forme: "Article" | "Méthode" | "Registre" | "Outil" | "Page" | "Sortie";
  etat: EtatObjet;
  resume: string;
  /** Vrai pour la seule sortie du site, vers le logiciel. */
  externe?: boolean;
};

export type Rubrique = {
  code: string;
  titre: string;
  question: string;
  objets: readonly ObjetCatalogue[];
};

const articles: ObjetCatalogue[] = ARTICLES.map((a) => ({
  titre: a.titre,
  href: a.href,
  forme: "Article",
  etat: "OUVERT",
  resume: a.sousTitre,
}));

const methode = (id: string, resume: string): ObjetCatalogue => {
  const m = METHODES.find((f) => f.identifiant === id);
  if (!m) throw new Error(`Méthode ${id} absente du registre`);
  return {
    titre: `${m.identifiant}, ${m.nomAffiche}`,
    href: `/methodes/${m.identifiant.toLowerCase()}`,
    forme: "Méthode",
    etat: m.etat,
    resume,
  };
};

export const RUBRIQUES: readonly Rubrique[] = [
  {
    code: "savoir",
    titre: "Savoir",
    question: "Que puis-je comprendre ici sans rien acheter ?",
    objets: [
      ...articles,
      {
        titre: "Les principes",
        href: "/principes",
        forme: "Page",
        etat: "OUVERT",
        resume:
          "Cinq règles dérivées d’erreurs réelles, chacune avec son prix.",
      },
    ],
  },
  {
    code: "construire",
    titre: "Construire",
    question: "Comment passer d’une idée à un actif vérifiable ?",
    objets: [
      {
        titre: "La méthode, de l’idée à l’actif",
        href: "/methode",
        forme: "Page",
        etat: "OUVERT",
        resume:
          "Idée, expérience, décision, méthode, actif : la chaîne que suit chaque objet publié ici.",
      },
      methode(
        "M-001",
        "Une affirmation ne se rend pas sans sa preuve, sa source et sa date.",
      ),
      methode(
        "M-005",
        "Concevoir un produit dont chaque écran sait d’où vient ce qu’il affiche.",
      ),
      methode(
        "M-003",
        "Ramener des référentiels différents à un modèle de donnée commun.",
      ),
    ],
  },
  {
    code: "outils",
    titre: "Outils",
    question: "Que puis-je utiliser tout de suite, gratuitement ?",
    objets: [
      {
        titre: "Vérifier une affirmation",
        href: "/verifier/registre-de-preuve-tenu",
        forme: "Outil",
        etat: "OUVERT",
        resume:
          "Une adresse publique par affirmation : source, date de lecture et état, sans compte.",
      },
      {
        titre: "Le simulateur VSME",
        href: "/os#simulateur",
        forme: "Outil",
        etat: "OUVERT",
        resume:
          "Mesurer la complétude d’une déclaration volontaire, champ par champ, dans le navigateur.",
      },
      {
        titre: "La sortie machine des affirmations",
        href: "/.well-known/adama-os.json",
        forme: "Outil",
        etat: "OUVERT",
        resume:
          "Les mêmes affirmations, leurs sources et leurs états, servis en JSON pour un programme.",
      },
    ],
  },
  {
    code: "architecture",
    titre: "Architecture",
    question: "Comment ce système est-il construit, et pourquoi ainsi ?",
    objets: [
      {
        titre: "Le journal des décisions",
        href: "/decisions",
        forme: "Registre",
        etat: "OUVERT",
        resume:
          "Chaque décision structurante, ses options écartées et ce qu’elle coûte.",
      },
      {
        titre: "La lecture technique",
        href: "/technique",
        forme: "Page",
        etat: "OUVERT",
        resume: "Pile, schéma, frontières de données et modes de panne.",
      },
      {
        titre: "La revue d’architecture",
        href: "/revue-architecture",
        forme: "Page",
        etat: "OUVERT",
        resume:
          "Faire relire un système de donnée ou de preuve avant d’empiler des outils.",
      },
      methode(
        "M-004",
        "Ce que le moteur propose, ce que le système décide, et où passe la frontière.",
      ),
    ],
  },
  {
    code: "activite",
    titre: "Activité",
    question:
      "Comment une personne seule construit-elle et tient-elle ce système ?",
    objets: [
      methode(
        "M-002",
        "Construire un logiciel seul, sans perdre la trace de ce qui a été décidé.",
      ),
      methode(
        "M-006",
        "Construire en public : ce qui se publie, quand, et avec quelle preuve.",
      ),
      {
        titre: "Ce sur quoi je suis revenu",
        href: "/revirements",
        forme: "Registre",
        etat: "OUVERT",
        resume: "Les corrections, leur trace dans le code et leur coût.",
      },
      {
        titre: "Le registre des erreurs",
        href: "/erreurs",
        forme: "Registre",
        etat: "OUVERT",
        resume: "Chaque erreur publiée reste visible à côté de sa correction.",
      },
    ],
  },
  {
    code: "atelier",
    titre: "Atelier",
    question: "Puis-je apprendre à construire ces systèmes avec un parcours ?",
    objets: [
      {
        titre: "Les parcours ATELIER",
        href: "/parcours",
        forme: "Page",
        etat: "CONCEPT",
        resume:
          "Aucun parcours n’est ouvert. La page dit ce qu’il contiendra, et ce qu’il ne fera jamais.",
      },
    ],
  },
  {
    code: "ecosysteme",
    titre: "Écosystème",
    question: "Où ces méthodes deviennent-elles réellement du logiciel ?",
    objets: [
      {
        titre: "Le registre de l’écosystème",
        href: "/ecosysteme",
        forme: "Registre",
        etat: "OUVERT",
        resume:
          "Les produits du groupe, leur division, leur état lu en base et leur lien.",
      },
      {
        titre: "STRATA ESG",
        href: "https://www.strata-esg.fr/",
        forme: "Sortie",
        etat: "OUVERT",
        resume:
          "Quand le besoin exige un logiciel opérationnel : la seule sortie du site.",
        externe: true,
      },
    ],
  },
];

export {
  CRITERES_REGIME,
  REGIMES,
  type CodeRegime,
  type Regime,
} from "./regimes";

/** Tous les objets, à plat, pour les contrôles et les comptes. */
export function tousLesObjets(): ObjetCatalogue[] {
  return RUBRIQUES.flatMap((r) => r.objets);
}
