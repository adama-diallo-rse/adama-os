// =====================================================================
// C14, comment ce site fonctionne.
//
// La chaine en sept etapes, et pour chacune le fichier ou la table qui
// l'implemente reellement. Une etape qui ne peut pas nommer son
// implementation n'est pas une etape, c'est une case de schema.
//
// Puis la lecture cote a cote, qui est le coeur de la page : la meme chaine
// appliquee deux fois. A gauche, ce qu'un produit du groupe fait d'une
// donnee de durabilite, decrit generiquement. A droite, ce que ce site fait
// d'une affirmation professionnelle.
//
// Interdit tenu ici : aucune donnee de durabilite reelle n'est traitee sur
// ce site. La colonne de gauche decrit une methode, elle ne montre aucun
// chiffre : confondre les deux couterait cher.
// =====================================================================

export type EtapeChaine = {
  id: string;
  titre: string;
  /** Ce que fait l'etape, en une phrase. */
  quoi: string;
  /** Fichier, table ou route qui l'implemente dans ce depot. */
  implementation: readonly string[];
};

export const CHAINE: readonly EtapeChaine[] = [
  {
    id: "sources",
    titre: "Sources",
    quoi: "GitHub, les routes de santé des produits, la base de données et le corpus documentaire. Rien d’autre n’entre.",
    implementation: [
      "apps/web/lib/github.ts",
      "apps/web/lib/ecosystem/gateways.ts",
      "apps/web/lib/supabase/public.ts",
      "corpus/",
    ],
  },
  {
    id: "collecte",
    titre: "Collecte",
    quoi: "Lecture seule, délai borné, mise en cache, et aucune écriture vers un produit. Une passerelle qui écrit devient une porte.",
    implementation: [
      "apps/web/lib/ecosystem/client.ts",
      "apps/web/app/api/ecosystem/sync/route.ts",
    ],
  },
  {
    id: "qualification",
    titre: "Qualification",
    quoi: "Chaque valeur reçoit sa classe de donnée, sa provenance et sa durée de validité. Sans elles, elle ne peut pas être rendue.",
    implementation: [
      "apps/web/lib/proof/types.ts",
      "apps/web/lib/proof/metrics.ts",
      "table ecosystem_analytics",
    ],
  },
  {
    id: "validation",
    titre: "Validation",
    quoi: "Le schéma typé, les politiques de sécurité au niveau ligne, les contraintes de base et les tests qui verrouillent les règles.",
    implementation: [
      "packages/db/src/schema.ts",
      "packages/db/migrations/",
      "apps/web/tests/",
    ],
  },
  {
    id: "restitution",
    titre: "Restitution",
    quoi: "Une affirmation ne sort jamais seule : elle porte sa preuve, sa source, sa date et sa méthode. Sans preuve, elle est absente.",
    implementation: [
      "apps/web/lib/proof/claims.ts",
      "apps/web/components/proof/proof.tsx",
      "table proof_claims",
    ],
  },
  {
    id: "verification",
    titre: "Vérification",
    quoi: "Une adresse permanente par affirmation, citable des années, et le même registre servi dans un format lisible par une machine.",
    implementation: [
      "apps/web/app/verifier/[id]/page.tsx",
      "apps/web/app/.well-known/adama-os.json/route.ts",
      "apps/web/app/llms.txt/route.ts",
    ],
  },
  {
    id: "lecteur",
    titre: "Lecteur",
    quoi: "Un recruteur, un directeur technique, un partenaire, un collaborateur. Chacun doit pouvoir refaire la vérification lui-même.",
    implementation: [
      "apps/web/app/recruteur/page.tsx",
      "apps/web/app/preuves/page.tsx",
      "apps/web/app/decisions/page.tsx",
    ],
  },
] as const;

/** Equivalent textuel du schema, pour les lecteurs d'ecran. */
export const CHAINE_TEXTE =
  "La chaîne compte sept étapes successives : sources, collecte, qualification, validation, restitution, vérification, lecteur. Chaque étape reçoit le résultat de la précédente et nomme le fichier ou la table qui l’implémente dans ce dépôt.";

export type LigneParallele = {
  maillon: string;
  /** Ce qu'un produit du groupe en fait, decrit generiquement. */
  durabilite: string;
  /** Ce que ce site en fait, sur une affirmation professionnelle. */
  portfolio: string;
};

export const PARALLELE: readonly LigneParallele[] = [
  {
    maillon: "Source",
    durabilite: "D’où vient la donnée d’activité, et qui l’a fournie.",
    portfolio:
      "D’où vient l’affirmation : un dépôt, une route, une table, un document.",
  },
  {
    maillon: "Définition",
    durabilite: "Ce que la donnée mesure exactement, au sens du référentiel.",
    portfolio:
      "Ce que l’affirmation dit exactement, en une phrase qui ne se réinterprète pas.",
  },
  {
    maillon: "Méthode",
    durabilite: "Le facteur appliqué et la règle de calcul retenue.",
    portfolio:
      "Comment la vérification est faite : appel, lecture, comptage, relecture.",
  },
  {
    maillon: "Période",
    durabilite:
      "L’exercice couvert, et la durée pendant laquelle le chiffre reste valable.",
    portfolio:
      "La date d’observation, et la durée au delà de laquelle l’affirmation est marquée périmée.",
  },
  {
    maillon: "Preuve",
    durabilite: "La pièce qui permet à un tiers de refaire le calcul.",
    portfolio:
      "L’adresse permanente qui permet à un visiteur de refaire la vérification.",
  },
  {
    maillon: "Sortie",
    durabilite: "Le format remis au destinataire, et sa version.",
    portfolio: "La page publiée, et le document machine servi au même moment.",
  },
  {
    maillon: "Révocation",
    durabilite:
      "Ce qui se passe quand la donnée est invalidée après publication.",
    portfolio:
      "Ce qui se passe quand une preuve n’est plus observable : l’affirmation disparaît, elle n’est pas grisée.",
  },
] as const;

/** La phrase de fin. Le seul endroit du site ou une phrase a le droit
 *  d'etre spectaculaire, parce que tout le reste l'a meritee. */
export const SIGNATURE =
  "Ce portfolio est construit selon le principe exact des systèmes que je conçois : ne rien affirmer que je ne puisse vérifier.";
