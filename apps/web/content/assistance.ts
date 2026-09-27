// =====================================================================
// ET0, AXP-284, XDEC-28 : ce qui est écrit avec assistance et ce qui ne
// l'est pas, dit une fois, clairement, publiquement.
//
// La position vit à un seul endroit, /ecriture, en français puis en anglais.
// Elle parle d'écriture avec assistance, dans les mots de XDEC-28, et n'en
// fait jamais un argument. Le traitement automatique du site y garde son nom
// public : le moteur.
//
// Elle est adossée à une règle de marquage par objet (MARQUAGES) : chaque
// objet publié dit quelle part est assistée, qui l'a relu et à quelle date.
// tests/position-assistance.test.ts vérifie que chaque article publié porte
// sa mention et que la position passe le contrôle de vocabulaire d'ADEC-19.
//
// Interdit de la branche ET, tenu ici : aucun texte signé du nom d'Adama
// qu'il n'a pas écrit ou relu ligne à ligne. Une mention « relu » n'est
// inscrite que par Adama lui-même.
// =====================================================================

type DateIso = `${number}-${number}-${number}`;

export const POSITION_DATEE = {
  ecriteLe: "2026-09-27",
  revueAuPlusTardLe: "2027-03-27",
} as const;

export const POSITION_FR = {
  titre: "Ce qui est écrit avec assistance, et ce qui ne l’est pas.",
  paragraphes: [
    "Une partie de ce site est écrite avec assistance : le code, et des premières versions de certains textes. L’assistance est un outil d’écriture, comme un correcteur. Elle n’est l’auteur de rien.",
    "Ce qui ne l’est jamais : les décisions, les arbitrages, l’état de maturité d’une méthode, le choix de publier ou de retirer. Les chiffres publiés viennent d’un relevé nommé, jamais d’un texte rédigé. Aucun texte ne paraît sous mon nom sans que je l’aie écrit ou relu ligne à ligne.",
    "Qui relit : moi, Adama Diallo, chaque texte publié, avant sa publication. Il n’y a pas d’autre relecteur à ce jour, et le jour où il y en aura un, son rôle sera écrit ici.",
    "Comment chaque objet le signale : un article, une lettre, un livrable de conseil ou un titre porte une mention, écrit sans assistance ou écrit avec assistance et relu ligne à ligne, avec la date de la relecture. Le registre ci-dessous liste les objets publiés et leur mention.",
    "Les réponses du moteur de ce site sont produites automatiquement et se présentent comme telles. Elles ne sont pas des textes signés.",
    "Ce n’est ni un argument ni une excuse. C’est une information, donnée une fois pour qu’on n’ait pas à la deviner.",
  ],
} as const;

export const POSITION_EN = {
  titre: "What is written with assistance, and what is not.",
  paragraphes: [
    "Part of this site is written with assistance: the code, and first drafts of some texts. Assistance is a writing tool, like a spell checker. It is the author of nothing.",
    "What never is: decisions, trade-offs, the maturity state of a method, the choice to publish or withdraw. Published figures come from a named reading, never from drafted text. No text appears under my name unless I wrote it or reviewed it line by line.",
    "Who reviews: I do, Adama Diallo, every published text, before publication. There is no other reviewer today; the day there is one, their role will be written here.",
    "How each object says so: an article, a letter, a consulting deliverable or a title carries a mention, written without assistance or written with assistance and reviewed line by line, with the review date. The register below lists published objects and their mention.",
    "Answers from this site’s engine are produced automatically and are presented as such. They are not signed texts.",
    "This is neither a selling point nor an excuse. It is information, given once so nobody has to guess.",
  ],
} as const;

export const PARTS_ASSISTEES = [
  "Écrit sans assistance",
  "Écrit avec assistance, relu ligne à ligne",
] as const;

type Marquage = {
  objet: "Article" | "Lettre" | "Livrable de conseil" | "Titre" | "Page";
  reference: string;
  href: string;
  part: (typeof PARTS_ASSISTEES)[number];
  relecteur: "Adama Diallo";
  reluLe: DateIso;
};

/**
 * Le registre des mentions. Une ligne par objet publié, inscrite par Adama.
 * Un article publié sans ligne ici fait échouer le test ET0.
 */
export const MARQUAGES: readonly Marquage[] = [
  {
    objet: "Page",
    reference: "Position sur l’écriture avec assistance",
    href: "/ecriture",
    part: "Écrit avec assistance, relu ligne à ligne",
    relecteur: "Adama Diallo",
    reluLe: "2026-09-27",
  },
  {
    objet: "Article",
    reference: "La méthode de preuve",
    href: "/articles/methode-de-preuve",
    part: "Écrit avec assistance, relu ligne à ligne",
    relecteur: "Adama Diallo",
    reluLe: "2026-09-18",
  },
  {
    objet: "Article",
    reference: "The proof method",
    href: "/en/articles/proof-method",
    part: "Écrit avec assistance, relu ligne à ligne",
    relecteur: "Adama Diallo",
    reluLe: "2026-09-18",
  },
  {
    objet: "Article",
    reference: "Sept contraintes de la donnée ESG en Afrique de l’Ouest",
    href: "/articles/sept-contraintes-donnee-esg-afrique-ouest",
    part: "Écrit avec assistance, relu ligne à ligne",
    relecteur: "Adama Diallo",
    reluLe: "2026-09-18",
  },
  {
    objet: "Article",
    reference: "Seven constraints of West African ESG data",
    href: "/en/articles/seven-constraints-west-african-esg-data",
    part: "Écrit avec assistance, relu ligne à ligne",
    relecteur: "Adama Diallo",
    reluLe: "2026-09-18",
  },
  {
    objet: "Article",
    reference: "Architecture de la donnée ESG en Afrique de l’Ouest",
    href: "/articles/architecture-donnee-esg-afrique-ouest",
    part: "Écrit avec assistance, relu ligne à ligne",
    relecteur: "Adama Diallo",
    reluLe: "2026-09-18",
  },
  {
    objet: "Article",
    reference: "West African ESG data architecture",
    href: "/en/articles/west-african-esg-data-architecture",
    part: "Écrit avec assistance, relu ligne à ligne",
    relecteur: "Adama Diallo",
    reluLe: "2026-09-18",
  },
];

/**
 * La phrase à placer en dernière page de tout livrable de conseil, et à
 * signaler au dossier d'assurance EK2 (point 10 de sa section 2).
 */
export const PHRASE_LIVRABLE_CONSEIL =
  "Ce livrable a pu être préparé en partie avec des outils d’assistance à l’écriture. Chaque ligne a été relue par Adama Diallo avant remise. Les constats, les recommandations et les décisions sont les siens.";
