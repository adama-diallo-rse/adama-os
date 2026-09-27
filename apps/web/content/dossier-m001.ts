// =====================================================================
// EM2, le dossier de référence de M-001, Evidence-First ESG Architecture.
//
// Le dossier suit la fiche EM0 champ par champ (content/methodes.ts) et y
// ajoute ce que la fiche ne porte pas : le problème résolu, la mesure de
// résultat définie avant d'être prise, et la règle de passage. Aucune
// affirmation n'y figure sans renvoi à une preuve publique. Le mot PROUVÉ n'y
// décrit jamais l'état de M-001 : il nomme la condition, pas le résultat.
// =====================================================================

export const PROBLEME_M001 = [
  "Un système ESG publie des chiffres, des statuts et des affirmations. Le lecteur ne peut en général ni remonter à leur source, ni savoir quand ils ont été observés, ni distinguer une valeur mesurée d’une valeur supposée.",
  "M-001 inverse l’ordre de construction : la preuve se conçoit avant l’affichage. Une affirmation qui n’a pas sa preuve ne se rend pas, une preuve jamais observée s’affiche comme absente, et chaque affirmation a une adresse où quiconque la vérifie.",
] as const;

/** Définie et écrite avant le relevé du 27 septembre 2026. */
export const MESURE_M001 = {
  nom: "Taux de reproduction tierce des preuves publiques",
  definition:
    "Parmi les preuves que le site publie à l’instant du relevé, la part qu’un tiers, sans compte et sans accès privé, ré-observe lui-même avec un résultat qui concorde avec ce que le site a publié.",
  formule:
    "Preuves concordantes divisées par preuves publiées, au même instant, arrondi à l’unité.",
  source: "/.well-known/adama-os.json, puis l’adresse de chaque preuve",
  perimetre:
    "Toutes les preuves de toutes les affirmations publiques servies par la sortie machine du site, sans tri ni échantillon.",
  methode:
    "Un script Node sans dépendance ni jeton lit la sortie machine, appelle chaque adresse, relit chaque commit par l’API publique de GitHub et compte chaque table avec la clé anonyme que le site sert à tout navigateur. Il classe chaque preuve en concordante, valeur changée, discordante, non reproductible ou déclarée hors tiers.",
  commande: "node scripts/mesure-m001.mjs",
  prouve:
    "Qu’un lecteur extérieur vérifie lui-même, à une date donnée, la part mesurée des preuves publiées, sans avoir à faire confiance à l’auteur.",
  neProuvePas: [
    "Que les affirmations comptent pour un lecteur.",
    "Qu’une autre organisation applique la méthode : le système mesuré est celui de son auteur.",
    "La tenue dans le temps : un seul relevé est publié à ce jour.",
  ],
} as const;

export const CANDIDATES_M001 = [
  {
    nom: "Reproduction tierce des preuves publiques",
    retenue: true,
    raison:
      "Seule candidate qu’un tiers refait sans compte, et seule qui mesure ce que la méthode produit pour un lecteur : une vérification réussie ou non.",
  },
  {
    nom: "Fraîcheur des preuves",
    retenue: false,
    raison:
      "Part des affirmations dont chaque preuve est dans sa fenêtre de validité. Écartée : elle se lit sur l’horloge du site lui-même, un tiers ne la contredit pas.",
  },
  {
    nom: "Refus affichés plutôt qu’inventés",
    retenue: false,
    raison:
      "Part des affirmations servies absentes ou périmées au lieu d’une valeur supposée. Écartée pour l’instant : elle exige un historique de relevés que le site ne conserve pas encore.",
  },
] as const;

export const REGLE_PASSAGE_M001 = {
  conditions: [
    "Une mesure de résultat est publiée ici, datée, avec son protocole rejouable. Fait le 27 septembre 2026.",
    "Un relevé postérieur à la mise en ligne de la correction FAIL-003 ne compte aucune preuve discordante parmi celles que le site déclare vérifiables par un visiteur.",
    "Adama constate ces deux faits et les écrit dans une décision datée du registre XDEC.",
  ],
  redescente:
    "M-001 redescend si un relevé ultérieur compte une preuve discordante qui n’est pas corrigée dans les trente jours, avec son entrée au registre public des erreurs.",
} as const;
