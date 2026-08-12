import type { MetadataRoute } from "next";
import { absoluteUrl } from "../lib/site";

// L8-T5 — Indexation : la vitrine oui, les pages privées non.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/checkin", "/login", "/api/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
