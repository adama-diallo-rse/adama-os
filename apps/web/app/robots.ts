import type { MetadataRoute } from "next";
import { absoluteUrl } from "../lib/site";

// L8-T5, Indexation : la vitrine oui, les pages privées non.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Pages privees ou sans interet d'index : espace de tenue, saisie du
      // jour, authentification, API. /mot-de-passe et /auth servent la
      // connexion par lien : indexees, elles enverraient un visiteur sur un
      // formulaire vide depuis un resultat de recherche.
      disallow: [
        "/admin",
        "/checkin",
        "/login",
        "/mot-de-passe",
        "/auth/",
        "/api/",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
