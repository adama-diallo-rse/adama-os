// =====================================================================
// C3-T4, les huit modes de panne.
//
// Contenu editorial versionne et relu, comme les fiches projet. Ce n'est pas
// une donnee : c'est une promesse de comportement, et quelqu'un en repond.
//
// La troisieme colonne, « ce qui n'est jamais fait », est la raison d'etre de
// cette page. Les deux premieres decrivent une degradation, la troisieme
// decrit une discipline. C'est elle qui distingue un systeme prudent d'un
// systeme qui remplit les trous.
//
// Regle de tenue : chaque mode porte la commande qui le rejoue en local, et
// scripts/failure-drill.mjs refuse de tourner si un identifiant declare ici
// n'y a pas d'equivalent. La page ne peut donc pas promettre un comportement
// que rien ne rejoue.
// =====================================================================

import type { CapabilityId } from "../lib/health/types";

export type ModePanne = {
  id: string;
  titre: string;
  /** Capacite touchee, telle qu'elle apparait dans la matrice de sante. */
  capacite: CapabilityId;
  /** Ce qui se passe, cote systeme. */
  effet: string;
  /** Ce que le visiteur voit, a l'ecran. */
  visible: string;
  /** Ce qui n'est jamais fait. La colonne qui porte le message. */
  jamais: string;
  /** Identifiant du scenario dans scripts/failure-drill.mjs. */
  simulation: string;
};

export const MODES_PANNE: readonly ModePanne[] = [
  {
    id: "github-indisponible",
    titre: "L’hébergeur des dépôts ne répond pas",
    capacite: "github",
    effet:
      "Chaque dépôt est lu séparément. Un dépôt qui ne répond pas n’annule pas les autres, la lecture des sept autres se termine normalement.",
    visible:
      "Le journal de construction s’affiche partiellement, et les dépôts non lus sont nommés un par un, avec leur raison.",
    jamais:
      "Aucune contribution n’est inventée, aucun compteur n’est arrondi, et aucun dépôt manquant n’est passé sous silence.",
    simulation: "github-indisponible",
  },
  {
    id: "jeton-github",
    titre: "Le jeton de lecture est expiré ou de portée insuffisante",
    capacite: "github",
    effet:
      "Les dépôts hors de portée du jeton répondent une erreur d’autorisation. Le cas est structurel ici : les huit dépôts vivent sur deux propriétaires, et un jeton n’en couvre qu’un.",
    visible:
      "Le dépôt manquant est nommé, avec la mention « hors de portée du jeton ». Le compte affiché est celui des dépôts réellement lus, jamais huit par principe.",
    jamais:
      "Le jeton n’est jamais élargi à une portée d’écriture pour combler le trou, et le nombre de dépôts affiché n’est jamais celui du registre quand la lecture n’a pas abouti.",
    simulation: "jeton-github",
  },
  {
    id: "base-indisponible",
    titre: "La base de données ne répond pas",
    capacite: "base",
    effet:
      "Les pages qui lisent la base rendent leur état vide. La navigation, les pages éditoriales et le journal de construction restent entiers, ils ne dépendent pas de la base.",
    visible:
      "Chaque zone alimentée par la base annonce l’absence de sa source, en toutes lettres, à l’endroit exact où la donnée aurait dû se trouver.",
    jamais:
      "Aucune valeur de remplacement n’est affichée, aucun cache figé n’est ressorti, et aucune zone ne disparaît en silence comme si elle n’avait jamais existé.",
    simulation: "base-indisponible",
  },
  {
    id: "corpus-vide",
    titre: "Le corpus documentaire est vide ou hors sujet",
    capacite: "rag",
    effet:
      "La recherche documentaire ne ramène aucun passage au-dessus du seuil de pertinence. La réponse n’est pas produite.",
    visible:
      "L’assistant refuse de répondre et le dit. La matrice de santé passe la capacité en dégradé, avec le score obtenu.",
    jamais:
      "Le modèle ne répond jamais de mémoire, ne complète jamais une réponse partielle, et ne cite jamais une source qu’il n’a pas réellement reçue.",
    simulation: "corpus-vide",
  },
  {
    id: "api-produit",
    titre: "L’interface d’un produit ne répond pas",
    capacite: "passerelles",
    effet:
      "La sonde échoue. Aucune métrique n’est écrite pour ce produit sur cette période.",
    visible:
      "La métrique disparaît et la case porte la mention « source indisponible ». Elle ne vaut pas zéro : une absence de mesure n’est pas une mesure à zéro.",
    jamais:
      "Aucun zéro de remplacement n’est écrit en base, et aucune moyenne n’est calculée sur une série trouée.",
    simulation: "api-produit",
  },
  {
    id: "sortie-reseau",
    titre: "La sortie réseau de ce site est coupée",
    capacite: "passerelles",
    effet:
      "Les appels sortants échouent avant d’atteindre les produits. Rien ne permet de dire si les produits vont bien ou mal.",
    visible:
      "L’état passe en INDÉTERMINÉ, distinct de DÉGRADÉ, avec la phrase « le produit n’a pas pu être joint depuis ce site ».",
    jamais:
      "Une panne de ce site n’est jamais présentée comme une panne d’un produit du groupe, et un état inconnu n’est jamais converti en panne constatée.",
    simulation: "sortie-reseau",
  },
  {
    id: "produit-retire",
    titre: "Un produit est retiré du registre",
    capacite: "base",
    effet:
      "Le produit disparaît du registre lu par le site. Les cartes, la carte de l’écosystème et le journal cessent de le citer, au même rendu.",
    visible:
      "Rien. C’est le comportement attendu : le produit n’existe plus pour ce site, il ne laisse pas de case vide derrière lui.",
    jamais:
      "Aucun lien mort n’est laissé derrière, aucune page de produit orpheline ne subsiste, et aucun nom n’est conservé en dur dans un composant.",
    simulation: "produit-retire",
  },
  {
    id: "cle-modele",
    titre: "L’accès au fournisseur de modèle est absent ou invalide",
    capacite: "assistant",
    effet:
      "La route de l’assistant échoue franchement, avant toute génération. Aucune requête n’est envoyée.",
    visible:
      "L’assistant se déclare hors service, en une phrase, et propose les pages qui répondent sans lui.",
    jamais:
      "L’assistant ne répond jamais de mémoire, ne bascule jamais sur un jeu de réponses écrites d’avance, et ne fait jamais semblant de chercher.",
    simulation: "cle-modele",
  },
] as const;

/** La phrase de doctrine qui ferme la page. Une seule, sans commentaire. */
export const DOCTRINE_PANNE = "Le système préfère l’absence à l’invention.";
