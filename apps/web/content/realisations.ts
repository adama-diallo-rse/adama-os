// =====================================================================
// La page des réalisations, 7 novembre 2026.
//
// Les fiches projet disent chaque maison en détail ; cette page dit les
// terrains qu'elles servent, et ce qui les relie. Sources : les fiches de
// content/projets, le site public pharivo.com et la plateforme de marque
// de Pharivo dans Notion (8 octobre 2026). Aucun état n'est avancé plus loin
// que ce que ces sources affichent : ce qui n'est pas ouvert est écrit
// « pas encore ouvert », sans date.
// =====================================================================

type Terrain = {
  slug: string;
  terrain: string;
  ville: string;
  phrase: string;
};

/** Le terrain de chaque maison, dans l'ordre des fiches. */
export const TERRAINS: readonly Terrain[] = [
  {
    slug: "strata-esg",
    terrain: "Durabilité",
    ville: "Paris",
    phrase:
      "Rendre la donnée de durabilité d’une entreprise exploitable, vérifiable et opposable, du reporting à l’empreinte carbone.",
  },
  {
    slug: "pharivo",
    terrain: "Santé",
    ville: "Dakar",
    phrase:
      "Construire les logiciels opérationnels de la santé en Afrique de l’Ouest, en commençant par l’officine.",
  },
  {
    slug: "conhama",
    terrain: "Économie durable",
    ville: "Paris",
    phrase:
      "Faire se trouver les acteurs de l’économie durable, qui travaillent côte à côte sans se voir.",
  },
  {
    slug: "adama-os",
    terrain: "Laboratoire",
    ville: "Paris et Dakar",
    phrase:
      "Rendre public le système de travail qui a construit les trois autres, avec ses décisions, ses preuves et ses erreurs.",
  },
] as const;

type AxeSante = {
  nom: string;
  pour: string;
  texte: string;
  ouvert: boolean;
};

/**
 * Pharivo, la santé en Afrique de l'Ouest : l'officine d'abord, puis ce
 * qui la relie aux autres acteurs. L'état de chaque axe est celui que
 * pharivo.com affiche.
 */
export const AXES_SANTE: readonly AxeSante[] = [
  {
    nom: "Pharivo Officine",
    pour: "Les pharmacies, seules ou en groupe",
    texte:
      "Le comptoir, le stock lot par lot, les péremptions, les prix administrés, le tiers payant et le crédit client, même sans réseau.",
    ouvert: true,
  },
  {
    nom: "L’approvisionnement",
    pour: "Les officines et leurs grossistes",
    texte:
      "Les achats, les commandes et les transferts entre officines, sans ressaisie d’un outil à l’autre.",
    ouvert: false,
  },
  {
    nom: "Les lieux de soins",
    pour: "Les cliniques et les structures de soins",
    texte:
      "Le même socle, porté là où le soin se donne, avec les règles propres à chaque pays.",
    ouvert: false,
  },
  {
    nom: "Des systèmes qui se parlent",
    pour: "L’officine, la clinique, le grossiste et l’assureur",
    texte:
      "Des outils qui échangent leurs données au lieu de les recopier, chacun restant maître des siennes.",
    ouvert: false,
  },
] as const;

/** La phrase de pharivo.com, citée telle quelle. */
export const PHRASE_PHARIVO =
  "Officine est le premier produit, pas le dernier.";
