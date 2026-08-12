import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "../lib/site";

// Sitemap : la home (le mode ?for=recruiter est une variante de la meme page,
// pas une URL canonique), Open Metrics (L4-T13) et le hub STRATA. Les produits
// STRATA vivent sur leurs propres domaines (esg-optimizer.fr,
// scope.esg-optimizer.fr) et ne sont pas listes dans ce sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/metrics"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/strata"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
