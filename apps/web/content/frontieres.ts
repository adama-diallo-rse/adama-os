// =====================================================================
// C11, les frontieres de donnees.
//
// Trois questions, dans cet ordre : qu'est-ce qui entre, qu'est-ce qui sort,
// et qu'est-ce qui n'entre jamais. La troisieme est celle qui compte, et
// c'est celle que presque personne ne documente.
//
// Regle de tenue de la liste des interdits : chaque ligne porte le test qui
// la verrouille, ou dit explicitement qu'aucun test ne la verrouille. Une
// regle tenue par la discipline et une regle tenue par un test n'ont pas la
// meme valeur, et les confondre serait exactement le genre d'arrondi que ce
// site refuse ailleurs.
// =====================================================================

export type SensFlux = "entrant" | "sortant" | "interdit";

export type Flux = {
  id: string;
  de: string;
  vers: string;
  sens: SensFlux;
  /** Ce qui transite, en une phrase. */
  quoi: string;
};

export const FLUX: readonly Flux[] = [
  {
    id: "github",
    de: "Hébergeur des dépôts",
    vers: "Adama OS",
    sens: "entrant",
    quoi: "Messages de commit, dates et noms de dépôt. Rien du contenu des fichiers.",
  },
  {
    id: "produits",
    de: "Produits du groupe",
    vers: "Adama OS",
    sens: "entrant",
    quoi: "Un état de santé, sans compte et sans donnée client.",
  },
  {
    id: "visiteur",
    de: "Visiteur",
    vers: "Adama OS",
    sens: "entrant",
    quoi: "Ce qu’il écrit dans l’assistant, et sa prise de contact s’il en laisse une.",
  },
  {
    id: "modele",
    de: "Adama OS",
    vers: "Fournisseur de modèle",
    sens: "sortant",
    quoi: "La question posée et les extraits de corpus qui la fondent. Aucune donnée de contact.",
  },
  {
    id: "ecriture",
    de: "Adama OS",
    vers: "Produits du groupe",
    sens: "interdit",
    quoi: "Rien. Le cockpit consomme, il ne recalcule pas, et il n’écrit jamais chez un produit.",
  },
];

export type Interdit = {
  id: string;
  regle: string;
  /** Pourquoi la regle existe, en une phrase. */
  raison: string;
  /**
   * Fichier de test qui verrouille la regle, ou null quand aucun test ne le
   * fait. Ne jamais remplir ce champ par optimisme : une regle annoncee
   * comme testee et qui ne l'est pas est pire que la meme regle annoncee
   * comme simplement tenue.
   */
  test: string | null;
};

export const INTERDITS: readonly Interdit[] = [
  {
    id: "donnees-client",
    regle: "Aucune donnée client d’un produit du groupe n’entre ici",
    raison:
      "Les seules routes appelées sont des routes de santé publiques, sans compte et sans paramètre.",
    test: "tests/frontieres.test.ts",
  },
  {
    id: "corpus",
    regle: "Aucun document confidentiel n’entre dans le corpus documentaire",
    raison:
      "Le corpus ne contient que des textes publics et mon propre parcours. L’ingestion est manuelle, document par document.",
    test: null,
  },
  {
    id: "cle-admin",
    regle: "Aucune clé d’administration ne circule dans une passerelle",
    raison:
      "Les passerelles ne portent aucun en-tête d’autorisation. Une passerelle qui s’authentifie devient une porte.",
    test: "tests/frontieres.test.ts",
  },
  {
    id: "secret-navigateur",
    regle: "Aucun secret ne descend dans le navigateur",
    raison:
      "Seules les variables explicitement publiques traversent. Les clés de service et le jeton de lecture des dépôts restent côté serveur.",
    test: "tests/frontieres.test.ts",
  },
  {
    id: "route-admin",
    regle: "Aucun appel authentifié vers une route d’administration",
    raison:
      "Même un appel de contrôle vers une route qui journalise un événement est une écriture. Le cockpit ne l’émet pas.",
    test: "tests/frontieres.test.ts",
  },
];

/** Ce que fait un modele ici, et ce qu'il ne fait pas. */
export const TRANSPARENCE_IA = {
  ou: "Un seul endroit : l’assistant documentaire de ce site.",
  recoit:
    "La question posée, l’historique court de la conversation, et les extraits du corpus retrouvés pour cette question.",
  neRecoitPas:
    "Aucune donnée de contact, aucune donnée client d’un produit, aucun contenu de base autre que le corpus documentaire.",
  neDecidePas:
    "Rien. Il propose une formulation à partir de sources qu’il a reçues. Le choix des sources est fait avant lui, par une recherche vectorielle, et le refus de répondre est décidé par le code, pas par le modèle.",
  principe: "L’IA propose, le système décide.",
} as const;
