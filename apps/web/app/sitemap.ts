import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "../lib/site";

// L8-T9, sitemap.
//
// Ne sont listees que les URL servies par ce domaine. Les produits du groupe
// vivent sur leurs propres domaines : les faire figurer ici serait declarer a
// Google des pages que ce site ne sert pas. Le registre ecosystem_products
// n'ajoute donc aucune URL a ce fichier, et c'est volontaire ; il alimente le
// contenu de /ecosysteme, pas la liste des adresses.
//
// La home en mode recruteur (?for=recruiter) est une variante de la meme page,
// pas une URL canonique : elle n'est pas listee.
export default function sitemap(): MetadataRoute.Sitemap {
  const maintenant = new Date();
  return [
    {
      url: SITE_URL,
      lastModified: maintenant,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/ecosysteme"),
      lastModified: maintenant,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/metrics"),
      lastModified: maintenant,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/mentions-legales"),
      lastModified: maintenant,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: absoluteUrl("/confidentialite"),
      lastModified: maintenant,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
