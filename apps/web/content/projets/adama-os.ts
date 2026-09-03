import type { FicheProjet } from "./gabarit";

// =====================================================================
// C5-T3 et C5-T9, fiche Adama OS.
//
// La liste de technologies du bloc 03 ne se declare pas au jugé : chaque
// entree porte le nom exact d'une dependance directe du depot, et
// tests/projets.test.ts verifie que ce nom figure dans docs/inventory.json,
// produit par `pnpm inventory`. Une technologie retiree du depot fait
// echouer le test avant de pouvoir rester affichee.
//
// Le precedent qui a motive cette regle : la documentation de ce depot a
// annonce shadcn/ui, Tremor, Radix et lucide alors qu'aucun n'etait installe.
// =====================================================================

export const ADAMA_OS: FicheProjet = {
  slug: "adama-os",
  titre: "Adama OS",
  division: "Cockpit",
  categorie: "Exploration",
  resume:
    "Un portfolio affirme, et personne ne peut vérifier. Celui-ci se donne la contrainte inverse : ne rien afficher qu’il ne puisse justifier.",
  roleEnUnMot: "Auteur",
  ordre: 30,
  reluParAdama: false,
  preuveVedette: "cockpit-code-public",
  sujetsPreuve: [
    "adama-os",
    "ecosystem_products",
    "ecosystem_analytics",
    "ecosystem_probes",
    "proof_claims",
  ],
  adrIds: ["DEC-004", "DEC-005", "DEC-006", "DEC-007", "DEC-008", "DEC-009"],

  probleme: [
    "Un portfolio d’ingénieur est un document où l’auteur est à la fois la source et le juge. Rien n’y est vérifiable, tout y est affirmé, et le lecteur le sait : il lit en escomptant une part d’exagération.",
    "Le problème n’est pas la sincérité de l’auteur, c’est l’absence de mécanisme. Sans source citée, sans date de relevé et sans méthode, une phrase vraie et une phrase fausse se ressemblent exactement.",
    "Ce site applique à lui-même la discipline de preuve que les produits du groupe appliquent à la donnée de durabilité : chaque affirmation porte sa source, sa méthode et sa date, et une affirmation sans preuve n’est pas grisée, elle est absente.",
  ],

  role: {
    niveaux: {
      architecture: "responsable",
      produit: "responsable",
      backend: "responsable",
      donnees: "responsable",
      ia: "responsable",
      frontend: "responsable",
      commercial: "contributeur",
    },
    phrases: [
      "J’ai conçu et écrit ce site entièrement, de la base de données aux animations, et je l’exploite sur son propre domaine.",
      "J’ai posé le type qui rend impossible l’affichage d’un chiffre nu : un composant n’accepte pas un nombre, il accepte une affirmation qui porte sa source, sa méthode et sa date.",
      "J’ai écrit les tests qui verrouillent les règles plutôt que de compter sur ma discipline : l’absence de repli chiffré, l’interdiction des chiffres écrits en dur, le budget de surface de l’écran d’accueil.",
      "J’ai renoncé à l’intégration continue et je l’ai documenté comme une décision, avec son coût, au lieu de laisser croire qu’elle existe.",
    ],
    aValider: true,
    questions: [
      "La mention « commercial : contributeur » est-elle juste pour un projet sans client, ou faut-il la retirer plutôt que de la baisser ?",
      "Faut-il citer ici le nombre de tests, sachant qu’il change à chaque commit et devrait alors être lu depuis l’inventaire ?",
    ],
  },

  architecture: {
    schema: {
      legende: "Des sources au lecteur, sans étape non nommée",
      colonnes: [
        {
          titre: "Sources",
          noeuds: [
            "GitHub",
            "API des produits",
            "Base Supabase",
            "Corpus documentaire",
          ],
        },
        {
          titre: "Collecte",
          noeuds: ["Lecture seule", "Délai borné", "Sondes tracées"],
        },
        {
          titre: "Qualification",
          noeuds: ["Classe de donnée", "Provenance", "Fraîcheur"],
        },
        {
          titre: "Restitution",
          noeuds: [
            "Affirmation et preuve",
            "Page de vérification",
            "Document machine",
          ],
        },
      ],
      flux: "Le site lit GitHub, les routes de santé des produits, sa base Supabase et son corpus documentaire, toujours en lecture seule et avec un délai borné. Chaque valeur reçoit une classe de donnée, une provenance et une durée de validité, puis n’est restituée qu’accompagnée de sa preuve, d’une page de vérification permanente et d’un document lisible par une machine.",
    },
    stack: [
      { nom: "next", role: "rendu serveur, routes et métadonnées" },
      { nom: "react", role: "interface et état local des composants" },
      {
        nom: "typescript",
        role: "le type Claim, qui tient la règle de provenance",
      },
      {
        nom: "tailwindcss",
        role: "utilitaires, en complément des feuilles éditoriales",
      },
      {
        nom: "framer-motion",
        role: "animations, désactivées si le système le demande",
      },
      { nom: "drizzle-orm", role: "schéma typé, source de vérité de la base" },
      {
        nom: "postgres",
        role: "accès direct pour les migrations et les semis",
      },
      {
        nom: "@supabase/ssr",
        role: "session serveur et politiques de sécurité au niveau ligne",
      },
      { nom: "ai", role: "agent conversationnel adossé au corpus" },
      { nom: "@ai-sdk/openai", role: "vectorisation du corpus documentaire" },
      { nom: "posthog-js", role: "mesure d’audience, après consentement" },
      { nom: "@sentry/nextjs", role: "remontée des erreurs de production" },
      { nom: "vitest", role: "les tests qui verrouillent les règles" },
      { nom: "cmdk", role: "terminal de navigation" },
    ],
    stackSource: "inventaire",
  },

  compromis: [
    {
      refuse: "Aucun repli chiffré quand une source ne répond pas.",
      raison:
        "Un chiffre de remplacement se comporte comme un vrai. Une case vide dit la vérité, un nombre inventé la remplace définitivement.",
      cout: "Un tableau de bord troué les jours où une source est indisponible, y compris devant un recruteur.",
    },
    {
      refuse: "Aucun calcul métier dans ce cockpit.",
      raison:
        "Un calcul appartient au système qui en est responsable et qui le teste. Ici, il aurait divergé du produit sans que personne s’en aperçoive.",
      cout: "Trois semaines de code jetées, et un cockpit qui ne peut afficher que ce que les produits exposent.",
    },
    {
      refuse: "Pas d’intégration continue.",
      raison:
        "Le quota d’exécution disponible était épuisé. Plutôt qu’un pipeline décoratif, la vérification est locale, scriptée et assumée comme telle.",
      cout: "Rien n’empêche mécaniquement un commit non vérifié d’arriver sur la branche principale.",
    },
    {
      refuse: "Aucune bibliothèque de composants tierce.",
      raison:
        "La charte est une contrainte éditoriale précise. Une bibliothèque aurait imposé ses formes et rendu la page indistincte de mille autres.",
      cout: "Tout est écrit à la main, y compris l’accessibilité des dialogues et de la navigation au clavier.",
    },
  ],

  etat: {
    valeur: "production",
    precision:
      "En ligne sur son domaine, code public. Les couches de preuve, de décisions et de narration sont en place ; les affirmations dont la preuve est un document détenu par Adama restent non publiées tant qu’il n’a pas renseigné l’observation.",
  },

  suite: [
    "Publier les affirmations d’expérience une fois leur observation renseignée.",
    "Brancher une route publique de statistiques dès qu’un produit du groupe en expose une.",
  ],
};
