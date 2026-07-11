// L5-T6 — Catalogue du parcours /learn (source de vérité de la STRUCTURE).
// 4 niveaux, chacun = un cours vendable. Le contenu long de chaque leçon vit en
// MDX dans ce même dossier (content/learn/<mdxKey>.mdx). Le prix et la
// disponibilité peuvent être surchargés depuis le Studio Sanity (cf. course.ts),
// mais tout fonctionne sans Sanity : le repo suffit.

export type Lesson = {
  /** Segment d'URL : /learn/<course.slug>/<lesson.slug>. */
  slug: string;
  title: string;
  /** Chapô court (liste + meta description). */
  summary: string;
  /** true = lisible sans achat (aperçu). false = derrière le paywall. */
  free: boolean;
  /** Nom du fichier MDX (sans extension) dans content/learn/. */
  mdxKey: string;
};

export type Course = {
  /** Niveau 1 à 4. Clé de correspondance avec les entitlements et Sanity. */
  level: number;
  /** Segment d'URL : /learn/<slug>. */
  slug: string;
  title: string;
  /** Sous-titre affiché sous le titre. */
  tagline: string;
  /** Prix par défaut (surchargé par Sanity si présent). */
  priceLabel: string;
  /** Disponible à l'achat par défaut (surchargé par Sanity). */
  available: boolean;
  lessons: Lesson[];
};

export const CATALOG: Course[] = [
  {
    level: 1,
    slug: "csrd-esg-automatise",
    title: "CSRD / ESG automatisé",
    tagline:
      "Comprendre la CSRD et produire un reporting de durabilité fiable, sans y passer ses semaines.",
    priceLabel: "49 €",
    available: true,
    lessons: [
      {
        slug: "introduction",
        title: "Pourquoi automatiser son reporting CSRD",
        summary:
          "Le coût caché du reporting manuel, ce que la CSRD change vraiment, et la promesse d'un pipeline automatisé.",
        free: true,
        mdxKey: "n1-01-introduction",
      },
      {
        slug: "cadre-csrd-esrs",
        title: "Le cadre CSRD / ESRS en pratique",
        summary:
          "Périmètre, calendrier, ESRS transverses et thématiques : la carte complète pour ne rien manquer.",
        free: false,
        mdxKey: "n1-02-cadre-csrd-esrs",
      },
      {
        slug: "double-materialite",
        title: "La double matérialité pas à pas",
        summary:
          "Matérialité d'impact et matérialité financière : méthode, seuils et matrice exploitable.",
        free: false,
        mdxKey: "n1-03-double-materialite",
      },
      {
        slug: "collecte-donnees",
        title: "Collecter et fiabiliser les données",
        summary:
          "Cartographier les sources, poser les bons points de collecte et garantir l'auditabilité.",
        free: false,
        mdxKey: "n1-04-collecte-donnees",
      },
      {
        slug: "automatiser-le-rapport",
        title: "Automatiser le rapport de bout en bout",
        summary:
          "Le pipeline concret : de la donnée brute au rapport ESRS, avec Adama OS et STRATA.",
        free: false,
        mdxKey: "n1-05-automatiser-le-rapport",
      },
    ],
  },
  {
    level: 2,
    slug: "vsme-pme",
    title: "VSME pour les PME",
    tagline:
      "Le standard volontaire VSME : un reporting proportionné pour les PME hors périmètre CSRD obligatoire.",
    priceLabel: "39 €",
    available: true,
    lessons: [
      {
        slug: "introduction",
        title: "VSME : à qui ça sert et pourquoi",
        summary:
          "Le standard VSME de l'EFRAG, sa logique de proportionnalité et sa place face à la CSRD.",
        free: true,
        mdxKey: "n2-00-plan",
      },
    ],
  },
  {
    level: 3,
    slug: "bilan-carbone-scopes",
    title: "Bilan carbone & Scopes 1-2-3",
    tagline:
      "Construire un bilan d'émissions solide selon le GHG Protocol, du périmètre au plan de réduction.",
    priceLabel: "49 €",
    available: true,
    lessons: [
      {
        slug: "introduction",
        title: "Les trois scopes, sans confusion",
        summary:
          "Scopes 1, 2 et 3 selon le GHG Protocol : définitions, frontières et pièges classiques.",
        free: true,
        mdxKey: "n3-00-plan",
      },
    ],
  },
  {
    level: 4,
    slug: "strategie-esg-financement",
    title: "Stratégie ESG & financement durable",
    tagline:
      "Transformer le reporting en avantage : trajectoire de réduction, taxonomie UE et accès au financement vert.",
    priceLabel: "59 €",
    available: false,
    lessons: [
      {
        slug: "introduction",
        title: "Du reporting à la stratégie",
        summary:
          "Relier données ESG, trajectoire climat et financement : la logique du niveau avancé.",
        free: true,
        mdxKey: "n4-00-plan",
      },
    ],
  },
];

/** Un cours par slug d'URL, ou undefined. */
export function getCourseBySlug(slug: string): Course | undefined {
  return CATALOG.find((c) => c.slug === slug);
}

/** Une leçon par slugs, avec son cours parent. */
export function getLesson(
  courseSlug: string,
  lessonSlug: string,
): { course: Course; lesson: Lesson } | undefined {
  const course = getCourseBySlug(courseSlug);
  if (!course) return undefined;
  const lesson = course.lessons.find((l) => l.slug === lessonSlug);
  if (!lesson) return undefined;
  return { course, lesson };
}
