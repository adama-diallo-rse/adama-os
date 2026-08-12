// L0-T6, origine publique du site.
// Source de vérité unique pour les métadonnées, le sitemap, robots.txt et le
// JSON-LD. Définie dans Vercel (Project Settings, Environment Variables) et
// dans apps/web/.env.local. Tant que le domaine propre n'est pas branché, le
// repli reste le domaine Vercel : brancher le domaine se réduit alors à poser
// la variable, sans toucher au code.
const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://adama-os-web.vercel.app";

/** Origine canonique, sans slash final. Exemple : https://exemple.fr */
export const SITE_URL = RAW_SITE_URL.trim().replace(/\/+$/, "");

/** URL absolue à partir d'un chemin relatif ("/metrics"). */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
