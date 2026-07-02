import type { MetadataRoute } from "next";

// L8-T5 — Sitemap minimal : la home (le mode ?for=recruiter est une
// variante de la même page, pas une URL canonique à indexer).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://adama-os-web.vercel.app",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
