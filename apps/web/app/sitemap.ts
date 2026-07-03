import type { MetadataRoute } from "next";
import { getVeilleList } from "../sanity/lib/queries";

// L8-T5 — Sitemap : la home (le mode ?for=recruiter est une variante de la
// même page, pas une URL canonique) + Open Metrics (L4-T13) + la veille (L5-T5,
// index + un lien par article publié).
const BASE = "https://adama-os-web.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getVeilleList();

  const veilleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE}/veille/${a.slug}`,
    lastModified: a.publishedAt ? new Date(a.publishedAt) : new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

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
    ...veilleEntries,
  ];
}
