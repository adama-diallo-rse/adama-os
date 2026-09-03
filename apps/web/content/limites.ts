// =====================================================================
// C3-T6, le registre public des limites connues.
//
// Ce fichier est relu par un humain et versionne. Il n'est PAS genere : une
// limite connue est un aveu, et un aveu ne se calcule pas.
//
// Regle de tenue, la seule qui compte : une limite se retire de ce fichier
// quand elle est reglee, jamais quand elle devient genante. Chaque entree
// porte donc ce qui la fermera, pour qu'on puisse verifier que la fermeture
// a bien eu lieu au lieu de constater sa disparition.
//
// Etat de chaque entree au 2 septembre 2026, verifie une par une.
// =====================================================================

export type Limite = {
  id: string;
  titre: string;
  /** Ce qui ne marche pas, sans adoucissement. */
  constat: string;
  /** Ce que cela coute au lecteur, concretement. */
  consequence: string;
  /** Ce qui fermera la limite. Un geste, pas une intention. */
  fermeture: string;
  /** Date de constat, ISO. */
  constateLe: string;
};

export const LIMITES: readonly Limite[] = [
  {
    id: "huitieme-depot",
    titre: "Le huitième dépôt n’est pas lu",
    constat:
      "Les huit dépôts du groupe sont répartis sur deux propriétaires. Un jeton de lecture à portée fine n’en couvre qu’un seul, donc sept entrées sur huit au mieux.",
    consequence:
      "Le journal de construction ne montre pas les contributions du dépôt manquant. Il le nomme, il ne le remplace pas.",
    fermeture:
      "Le seul jeton couvrant les huit donnerait aussi l’écriture. Tant que cet arbitrage tient, la limite reste ouverte et affichée.",
    constateLe: "2026-08-31",
  },
  {
    id: "route-publique-produits",
    titre: "Les produits n’exposent pas de route publique de lecture",
    constat:
      "Les deux moteurs du groupe n’exposent qu’une route de santé sans authentification. Tout le reste est authentifié par session ou réservé à l’administration.",
    consequence:
      "Le cockpit ne peut afficher qu’une disponibilité. Aucun chiffre d’usage produit n’est importable aujourd’hui, et aucun n’est inventé pour combler.",
    fermeture:
      "Une route publique versionnée, en lecture, sans donnée client, côté produit. Le jour où elle existe, elle se branche en une entrée de configuration.",
    constateLe: "2026-08-31",
  },
  {
    id: "region-analytique",
    titre: "La mesure d’audience est traitée hors de l’Union européenne",
    constat:
      "Le code et la page de confidentialité annoncent tous deux un traitement en Union européenne. Le compte réellement utilisé est hébergé aux États-Unis.",
    consequence:
      "Une contradiction entre ce que le site promet et ce qu’il fait. Tant qu’elle dure, aucune mesure n’est configurée et la contradiction est affichée ici.",
    fermeture:
      "Deux issues, et une seule sera prise : basculer le compte en région européenne, ou corriger la page pour dire la région réelle. Les deux correctifs sont préparés dans le dépôt.",
    constateLe: "2026-08-31",
  },
  {
    id: "absence-ci",
    titre: "Il n’y a pas d’intégration continue",
    constat:
      "Aucun automate ne construit ni ne teste le dépôt à chaque envoi. Le quota du service d’automatisation est épuisé.",
    consequence:
      "La vérification repose sur une commande locale, exécutée avant chaque envoi. Elle couvre le même terrain, mais elle dépend d’une discipline humaine.",
    fermeture:
      "Rétablir le quota, ou porter la même séquence sur un autre exécuteur. Aucune mesure de fréquence de déploiement n’est publiée d’ici là : elle ne serait pas mesurée.",
    constateLe: "2026-08-31",
  },
  {
    id: "base-partagee",
    titre: "La base de données est partagée avec deux produits",
    constat:
      "Le projet de base de données de ce site est le même que celui de deux produits du groupe. Ce n’est pas un choix, c’est une contrainte relevée après coup.",
    consequence:
      "Toute restauration doit être sélective, table par table. Une restauration globale écraserait les données des produits voisins.",
    fermeture:
      "La séparation est tenue par les règles de sécurité au niveau des lignes, et la procédure de restauration ne porte que sur les tables de ce site. Un projet dédié fermerait la limite pour de bon.",
    constateLe: "2026-08-31",
  },
  {
    id: "corpus-partiel",
    titre: "Le corpus documentaire ne couvre pas tout ce que le site évoque",
    constat:
      "Le corpus contient un standard de reporting simplifié et un profil. Le socle complet des normes européennes est présent dans le dépôt mais n’est pas entièrement ingéré.",
    consequence:
      "L’assistant refuse de répondre sur les parties non couvertes, plutôt que de répondre approximativement. Le refus est le comportement attendu, pas un incident.",
    fermeture:
      "Ingérer le socle complet, puis vérifier que la question de contrôle dépasse le seuil de pertinence, et non simplement qu’elle ramène quelque chose.",
    constateLe: "2026-09-02",
  },
] as const;
