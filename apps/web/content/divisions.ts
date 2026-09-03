// =====================================================================
// C4-T6, la phrase de role de chaque division.
//
// Une phrase, factuelle, qui dit ce que la division FAIT. Pas un slogan, pas
// une promesse de valeur, pas un positionnement marketing : le lecteur vise
// est un ingenieur, et une phrase de brochure lui coute la confiance qu'il
// venait d'accorder au reste de la page.
//
// Ce fichier ne CREE aucune division. Il fournit une phrase pour celles que
// le registre produits contient reellement. Une division presente en base et
// absente d'ici s'affiche sans phrase, ce qui se voit ; une division presente
// ici et absente de la base ne s'affiche pas du tout, parce que la carte se
// construit depuis la base et jamais depuis ce fichier.
//
// Les cles sont celles de la colonne `division` du registre. Elles sont
// conservees telles quelles, y compris STRATA, dont le renommage trouerait
// l'historique de mesure d'audience. Le NOM AFFICHE d'une division n'est pas
// ici : il vit dans components/brand-signature.ts, qui le sert deja a tout le
// site. Une seconde table de noms aurait diverge au premier renommage.
// =====================================================================

export const ROLES_DIVISION: Record<string, string> = {
  STRATA:
    "La conformité et la donnée de durabilité : collecte, contrôle, restitution réglementaire. C’est la division qui porte le métier.",
  IROKO:
    "L’outillage d’exploitation d’une petite structure : gestion, suivi, automatisation du quotidien.",
  Afrique:
    "Le portage du même socle sur des contextes de données et de réglementation différents. En préparation.",
  Cockpit:
    "Le socle personnel. Il lit les produits ci-dessus, en publie l’état, et n’en héberge aucun.",
};

/**
 * Libelle editorial d'une division, sur la carte de l'ecosysteme.
 *
 * Ce n'est PAS un doublon de `divisionName` de components/brand-signature.
 * Les deux repondent a deux questions differentes, et les confondre produit
 * un contresens : `divisionName` rend le nom de MARQUE d'une division, donc
 * « Adama OS » pour la cle Cockpit. Sur la carte, la division Cockpit
 * contient deja un produit nomme Adama OS et le noeud lecteur s'appelle
 * Adama OS : afficher la division sous ce nom donnerait trois fois le meme
 * mot pour trois objets differents.
 *
 * Ici, on nomme la division par ce qu'elle EST dans l'organisation. Une cle
 * absente de cette table s'affiche telle quelle, ce qui se voit.
 */
export const LIBELLE_DIVISION: Record<string, string> = {
  STRATA: "STRATA ESG",
  IROKO: "IROKO",
  Afrique: "Afrique",
  Cockpit: "Socle personnel",
};

/** Libelle d'affichage, ou la cle brute si elle n'est pas nommee ici. */
export function libelleDivision(division: string): string {
  return LIBELLE_DIVISION[division] ?? division;
}
