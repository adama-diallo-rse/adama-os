// =====================================================================
// C6 et C14, le registre des identifiants d'ADR.
//
// Pourquoi ce fichier existe alors que le contenu des ADR vit en base.
//
// La page des principes doit dire de QUELLE decision chaque principe est
// derive, et tests/principes.test.ts doit pouvoir verifier qu'aucun
// principe ne renvoie vers une decision inexistante. Une verification qui
// demanderait une connexion a la base ne tournerait ni en local sans
// variables d'environnement, ni dans une verification hors ligne : elle
// serait desactivee au premier obstacle, et un principe orphelin passerait.
//
// Ce fichier ne porte donc que des identifiants, des titres et des statuts.
// Le texte long des ADR, lui, n'existe qu'a un seul endroit, le catalogue de
// packages/db/src/adr-catalogue.ts, qui alimente la base.
// tests/decisions.test.ts verifie que les deux ne divergent pas.
// =====================================================================

export type EntreeRegistre = {
  adrId: string;
  titre: string;
  statut: "propose" | "accepte" | "remplace" | "abandonne";
  /** Presente uniquement sur les decisions remplacees qui portent un
   *  revirement. C'est la regle generale qui remonte vers /principes. */
  regle?: string;
};

export const REGISTRE_ADR: readonly EntreeRegistre[] = [
  {
    adrId: "DEC-001",
    titre: "Récupération documentaire plutôt que réentraînement de modèle",
    statut: "accepte",
  },
  {
    adrId: "DEC-002",
    titre: "Python plutôt que Node.js pour les moteurs de calcul",
    statut: "accepte",
  },
  {
    adrId: "DEC-003",
    titre:
      "Fournisseur de modèle établi dans l’Union européenne plutôt que hors Union",
    statut: "accepte",
  },
  {
    adrId: "DEC-004",
    titre:
      "Consommer ce que les produits exposent plutôt que recalculer dans le cockpit",
    statut: "accepte",
  },
  {
    adrId: "DEC-005",
    titre: "Aucune métrique sans source, plutôt qu’un repli chiffré",
    statut: "accepte",
  },
  {
    adrId: "DEC-006",
    titre:
      "Registre de produits en base plutôt qu’un tableau écrit dans la page",
    statut: "accepte",
  },
  {
    adrId: "DEC-007",
    titre: "Échouer explicitement plutôt que répondre sans source",
    statut: "accepte",
  },
  {
    adrId: "DEC-008",
    titre:
      "Vérification locale assumée plutôt qu’intégration continue décorative",
    statut: "accepte",
  },
  {
    adrId: "DEC-009",
    titre: "Cockpit d’un ensemble logiciel plutôt que vitrine d’un produit",
    statut: "accepte",
  },
  {
    adrId: "DEC-010",
    titre:
      "Nommer la nature d’une panne plutôt que l’afficher comme une absence",
    statut: "accepte",
  },
  {
    adrId: "DEC-011",
    titre: "Une couche commerciale isolée plutôt qu’une interdiction de dépôt",
    statut: "accepte",
  },
  {
    adrId: "DEC-101",
    titre: "Un moteur de calcul dans le cockpit plutôt que dans le produit",
    statut: "remplace",
    regle: "Un calcul appartient au système qui en est responsable.",
  },
  {
    adrId: "DEC-102",
    titre: "Un repli chiffré plutôt qu’une case vide",
    statut: "remplace",
    regle: "La source précède l’affirmation.",
  },
  {
    adrId: "DEC-103",
    titre:
      "Un tableau de produits écrit dans la page plutôt qu’un registre en base",
    statut: "remplace",
    regle: "Une liste que personne ne possède devient fausse.",
  },
  {
    adrId: "DEC-104",
    titre: "Générer une réponse sans contexte plutôt qu’échouer",
    statut: "remplace",
    regle: "L’IA propose, le système décide.",
  },
  {
    adrId: "DEC-105",
    titre: "La vitrine d’un produit plutôt que le cockpit d’un ensemble",
    statut: "remplace",
    regle: "L’architecture suit la responsabilité.",
  },
  {
    adrId: "DEC-106",
    titre:
      "Un cockpit sans commerce plutôt qu’une preuve et une offre séparées",
    statut: "remplace",
    regle: "Le commerce ne gouverne jamais la preuve.",
  },
] as const;

export function entreeRegistre(adrId: string): EntreeRegistre | undefined {
  return REGISTRE_ADR.find((e) => e.adrId === adrId);
}

/** Les revirements, c'est a dire les entrees qui portent une regle. */
export const REVIREMENTS_REGISTRE = REGISTRE_ADR.filter((e) => e.regle);

/**
 * C6, point 3. Quatre decisions reelles qui meritent un ADR et que seul
 * Adama peut trancher. Elles ne sont PAS redigees : les rediger reviendrait
 * a decider a sa place. Elles sont posees ici pour qu'elles ne se perdent
 * pas, et elles ne sont pas ecrites en base.
 */
export type Proposition = {
  titre: string;
  pourquoi: string;
  question: string;
};

export const PROPOSITIONS: readonly Proposition[] = [
  {
    titre: "Domaine personnel plutôt que nom de groupe",
    pourquoi:
      "Le site est servi sur un domaine qui mêle le nom de l’auteur et celui d’un produit. Le nom du groupe, lui, n’est pas tranché.",
    question:
      "Le domaine doit-il rester personnel, porter le nom du groupe, ou les deux avec une redirection ?",
  },
  {
    titre: "Projet Supabase partagé avec les autres produits",
    pourquoi:
      "Ce cockpit partage son projet de base de données avec d’autres produits du groupe. Toute restauration devient sélective, table par table, et une erreur d’un produit expose les autres.",
    question:
      "Faut-il isoler le cockpit dans son propre projet, ou assumer le partage et écrire la procédure de restauration sélective ?",
  },
  {
    titre: "Mention de traitement automatisé verrouillée par test",
    pourquoi:
      "La mention légale d’assistance par un traitement automatisé est aujourd’hui tenue par un test. C’est un choix de gouvernance qui mérite d’être écrit comme tel.",
    question:
      "Cette mention relève-t-elle d’une obligation, d’une doctrine interne, ou des deux ?",
  },
  {
    titre:
      "Double émission d’événement analytique pendant la transition de nommage",
    pourquoi:
      "Certains événements sont émis sous deux noms pendant la transition de vocabulaire, ce qui double les compteurs sur la période.",
    question:
      "Jusqu’à quelle date la double émission est-elle tenue, et qui corrige les compteurs de la période ?",
  },
];
