import type { MetadataRoute } from "next";

// L8-T5 — Indexation : la vitrine oui, les pages privées non.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/checkin", "/login", "/api/"],
    },
    sitemap: "https://adama-os-web.vercel.app/sitemap.xml",
  };
}
