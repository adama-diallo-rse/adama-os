// Registre public des erreurs, EW3.
//
// Une entree n'existe que si les faits et la correction sont deja documentes
// dans le depot. Le registre ne transforme pas une anecdote en confession :
// il transforme une erreur constatee en regle que le systeme peut rejouer.

export const CATEGORIES_ERREUR = [
  "Mauvais marché",
  "Mauvaise hypothèse",
  "Mauvaise architecture",
  "Mauvais prix",
  "Mauvais canal",
  "Mauvais moment",
  "Mauvaise exécution",
  "Erreur réglementaire",
  "Erreur de recrutement",
  "Erreur de communication",
  "Idée abandonnée",
] as const;

type CategorieErreur = (typeof CATEGORIES_ERREUR)[number];

type EntreeErreur = {
  id: `FAIL-${string}`;
  date: `${number}-${number}-${number}`;
  titre: string;
  categorie: CategorieErreur;
  statut: "convertie" | "ouverte";
  pense: string;
  faits: string;
  cause: string;
  changement: string;
  implication: string;
  methode?: {
    titre: string;
    regle: string;
  };
  sources: readonly {
    label: string;
    href: string;
  }[];
};

export const ERREURS: readonly EntreeErreur[] = [
  {
    id: "FAIL-002",
    date: "2026-09-12",
    titre: "Une restauration vide avait l’air réussie",
    categorie: "Mauvaise hypothèse",
    statut: "convertie",
    pense:
      "Comparer le nombre de lignes et l’empreinte avant et après suffisait à prouver qu’une sauvegarde pouvait être restaurée.",
    faits:
      "Une table vide donnait zéro ligne et la même empreinte des deux côtés. Le chemin de restauration pouvait donc rester inutilisé tout en produisant un résultat identique.",
    cause:
      "Le contrôle mesurait l’égalité du résultat, mais pas l’exercice réel du chemin. Deux absences égales étaient traitées comme une preuve positive.",
    changement:
      "Le test distingue désormais réussi, partiel et échoué. Une table vide est nommée comme non exercée, et le rapport compte séparément les tables qui portent réellement des lignes.",
    implication:
      "Une sauvegarde ne devient une preuve qu’après restauration de contenu significatif. Pour STRATA ESG, toute répétition de reprise devra contenir au moins un objet réel fictif par table critique et publier les zones non exercées.",
    methode: {
      titre: "Prouver le chemin, pas seulement l’égalité",
      regle:
        "Un contrôle positif exige une donnée qui traverse le chemin testé. Une entrée vide produit un état partiel, jamais un succès complet.",
    },
    sources: [
      {
        label: "Procédure de continuité et résultats de restauration",
        href: "https://github.com/adama-diallo-rse/adama-os/blob/main/docs/CONTINUITE.md#test-de-restauration",
      },
      {
        label: "Script de répétition reproductible",
        href: "https://github.com/adama-diallo-rse/adama-os/blob/main/scripts/restore-drill.mjs",
      },
    ],
  },
  {
    id: "FAIL-001",
    date: "2026-09-02",
    titre: "Trois tests de sécurité passaient sur une adresse fausse",
    categorie: "Mauvaise exécution",
    statut: "convertie",
    pense:
      "Recevoir une erreur lors de la lecture d’une colonne protégée suffisait à prouver que les règles de sécurité refusaient correctement l’accès.",
    faits:
      "Le banc d’essai répondait 404 parce que le chemin était faux. Trois cas sur six passaient pourtant au vert, exactement comme si PostgreSQL avait refusé la lecture.",
    cause:
      "L’assertion vérifiait seulement qu’une erreur existait. Elle ne vérifiait ni sa provenance, ni son code, et aucun contrôle positif ne prouvait que le banc pouvait lire une donnée autorisée.",
    changement:
      "Les refus doivent maintenant porter le code PostgreSQL 42501. Un contrôle de garde lit d’abord une donnée publique, et le contrôle d’intégrité refuse le succès si les cas sont ignorés.",
    implication:
      "Pour STRATA ESG, un test de sécurité devra toujours combiner une lecture autorisée, un refus exact et une contre-épreuve. Toute erreur générique reste un incident de test, jamais une preuve de protection.",
    methode: {
      titre: "Contrôle positif, refus exact, contre-épreuve",
      regle:
        "Une protection n’est prouvée que si le service répond, si l’accès permis fonctionne et si l’accès interdit échoue pour la raison attendue.",
    },
    sources: [
      {
        label: "Compte rendu du faux positif et protocole de rejeu",
        href: "https://github.com/adama-diallo-rse/adama-os/blob/main/docs/RLS.md",
      },
      {
        label: "Tests d’intégration qui verrouillent la correction",
        href: "https://github.com/adama-diallo-rse/adama-os/blob/main/apps/web/tests/rls.integration.test.ts",
      },
    ],
  },
] as const;

export function mesurerConversion(erreurs: readonly EntreeErreur[] = ERREURS) {
  const publiees = erreurs.length;
  const converties = erreurs.filter(
    (erreur) => erreur.statut === "convertie" && erreur.methode,
  ).length;

  return {
    publiees,
    converties,
    taux: publiees === 0 ? null : Math.round((converties / publiees) * 100),
  };
}
