import type { MetadataRoute } from "next";
import { absoluteUrl } from "../lib/site";

// L8-T5, Indexation : la vitrine oui, les pages privées non.
//
// Pages privées ou sans intérêt d'index : espace de tenue, saisie du jour,
// authentification, API. /mot-de-passe et /auth servent la connexion par
// lien : indexées, elles enverraient un visiteur sur un formulaire vide
// depuis un résultat de recherche.
// /journal?* : les variantes filtrées du journal (vue, division, dépôt,
// période) ont toutes pour canonique /journal. Les laisser explorer
// consomme du budget d'exploration et remplit le rapport Search Console de
// pages « Autre page avec balise canonique correcte ». La page /journal
// elle-même reste explorable.
const INTERDITS = [
  "/admin",
  "/checkin",
  "/login",
  "/mot-de-passe",
  "/auth/",
  "/api/",
  "/journal?*",
];

// 14 novembre 2026 : les robots des assistants de recherche sont nommés un
// par un. La règle générale les autorisait déjà ; les nommer rend le choix
// lisible, pour eux comme pour qui relit ce fichier : ce site veut être lu,
// cité et résumé, avec ses sources. Un groupe nommé remplace la règle
// générale pour le robot concerné, il porte donc les mêmes interdits.
const ROBOTS_ASSISTANTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "MistralAI-User",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: INTERDITS },
      { userAgent: ROBOTS_ASSISTANTS, allow: "/", disallow: INTERDITS },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
