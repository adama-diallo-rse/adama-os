import type { MetadataRoute } from "next";
import { CATALOG } from "../content/learn/catalog";
import { getVeilleList } from "../sanity/lib/queries";

// L8-T5 — Sitemap : la home (le mode ?for=recruiter est une variante de la
// même page, pas une URL canonique) + Open Metrics (L4-T13) + la veille (L5-T5,
// index + un lien par article publié) + les formations (L5-T6, index, cours et
// leçons gratuites ; les leçons premium ne sont pas indexées).
const BASE = "https://adama-os-web.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getVeilleList();

  const veilleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE}/veille/${a.slug}`,
    lastModified: a.publishedAt ? new Date(a.publishedAt) : new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const learnEntries: MetadataRoute.Sitemap = CATALOG.flatMap((c) => [
    {
      url: `${BASE}/learn/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    ...c.lessons
      .filter((l) => l.free)
      .map((l) => ({
        url: `${BASE}/learn/${c.slug}/${l.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
  ]);

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE}/metrics`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE}/veille`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE}/learn`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE}/strata`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE}/audit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...veilleEntries,
    ...learnEntries,
  ];
}
