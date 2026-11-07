// =====================================================================
// Comment je travaille, 7 novembre 2026.
//
// Pour le visiteur qui veut savoir à quoi s'attendre avant d'écrire : les
// étapes d'une collaboration, les règles tenues, ce qu'il peut vérifier lui
// même et où le travail se fait. Chaque phrase reprend une règle déjà
// tenue ailleurs sur le site (questions de l'accueil, programme de
// l'accompagnement, principes) ; aucune promesse nouvelle n'est écrite ici.
// =====================================================================

type Etape = {
  titre: string;
  duree: string;
  texte: string;
  /** La vignette du programme qui l'illustre. */
  vignette: number;
};

export const ETAPES_TRAVAIL: readonly Etape[] = [
  {
    titre: "Le premier échange",
    duree: "30 minutes, gratuit",
    texte:
      "Vous décrivez la situation. Je vous dis si je peux aider et sous quelle forme, ou vers qui aller si ce n’est pas moi.",
    vignette: 1,
  },
  {
    titre: "La proposition écrite",
    duree: "Après l’échange",
    texte:
      "Le périmètre, le format, la durée et ce qui vous restera à la fin, par écrit. Elle ne vient que si elle a du sens.",
    vignette: 2,
  },
  {
    titre: "Le travail",
    duree: "Selon le format",
    texte:
      "Une séance par semaine, un livrable à chaque fois, et chaque séance se termine par une décision écrite et datée.",
    vignette: 4,
  },
  {
    titre: "Le bilan",
    duree: "Dernière séance",
    texte:
      "Un avant et un après, chiffré sur votre propre grille : ce qui a été décidé, ce qui a été construit, ce qui reste ouvert.",
    vignette: 6,
  },
] as const;

type Regle = { titre: string; texte: string };

export const REGLES_TRAVAIL: readonly Regle[] = [
  {
    titre: "J’écris avant de construire.",
    texte:
      "Le besoin, le périmètre et ce qui pourrait donner tort au projet sont posés par écrit avant la première ligne de travail.",
  },
  {
    titre: "Une séance, une décision.",
    texte:
      "Chaque rendez-vous se termine par une décision datée : ce qui est retenu, ce qui est écarté, et pourquoi.",
  },
  {
    titre: "Rien n’est annoncé avant d’exister.",
    texte:
      "Un état affiché est un état réel. Ce qui n’est pas prêt est écrit « en préparation », sans date promise.",
  },
  {
    titre: "La source précède l’affirmation.",
    texte:
      "Un chiffre sans source n’entre pas dans un livrable, ni sur ce site. Chaque affirmation renvoie à sa preuve.",
  },
  {
    titre: "Les erreurs se publient.",
    texte:
      "Elles ont leur registre daté, avec ce qui a changé dans la méthode. Un revirement s’écrit aussi.",
  },
  {
    titre: "Ce qui est gratuit le reste.",
    texte:
      "Les méthodes, les notes, les outils et les preuves du laboratoire public restent en accès libre.",
  },
] as const;

type Verification = { titre: string; texte: string; href: string };

export const VERIFICATIONS: readonly Verification[] = [
  {
    titre: "Les preuves",
    texte: "Chaque affirmation du site, sa source et son état.",
    href: "/preuves",
  },
  {
    titre: "Les décisions",
    texte: "Le journal daté de ce qui a été retenu et écarté.",
    href: "/decisions",
  },
  {
    titre: "Les erreurs",
    texte: "Ce qui a raté, et ce qui a changé ensuite.",
    href: "/erreurs",
  },
  {
    titre: "Les principes",
    texte: "Les règles tenues, chacune avec son coût.",
    href: "/principes",
  },
  {
    titre: "L’état du système",
    texte: "Ce qui tourne, en direct, et ce qui est en panne.",
    href: "/os",
  },
  {
    titre: "Les méthodes",
    texte: "Les méthodes publiées, avec leur niveau de preuve.",
    href: "/methodes",
  },
] as const;
