import type { MetadataRoute } from "next";

// L8-T5 — Sitemap : la home (le mode ?for=recruiter est une variante de la
// même page, pas une URL canonique) + la page publique Open Metrics (L4-T13).
const BASE = "https://adama-os-web.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
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
  ];
}
