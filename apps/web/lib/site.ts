// L0-T6, origine publique du site.
// Source de vérité unique pour les métadonnées, le sitemap, robots.txt et le
// JSON-LD. Trois niveaux, du plus explicite au plus dégradé :
//   1. NEXT_PUBLIC_SITE_URL : le domaine propre (adamesg-os.fr). À poser dans
//      Vercel sur le SEUL environnement Production, et dans
//      apps/web/.env.local en local.
//   2. VERCEL_URL : injectée par Vercel sur chaque preview deploy, sans
//      protocole. Sans elle, une PR annonce l'origine de production dans ses
//      métadonnées et son sitemap, ce qui fausse l'aperçu de partage.
//   3. le domaine propre en dur, repli de dernier recours (build local sans
//      .env.local, exécution hors Vercel). Volontairement le vrai domaine et
//      non l'ancienne URL .vercel.app : un repli qui pointe ailleurs que le
//      site produit des liens canoniques faux.
const FALLBACK_SITE_URL = "https://adamesg-os.fr";

/** Normalise une variable d'environnement : vide ou blanche vaut absente. */
function normalize(value: string | undefined): string | undefined {
  const trimmed = value?.trim().replace(/\/+$/, "");
  return trimmed ? trimmed : undefined;
}

// NEXT_PUBLIC_VERCEL_URL est la même valeur, exposée au navigateur quand les
// variables système Vercel sont activées. Lue en premier pour que l'origine
// reste correcte si un composant client vient un jour importer SITE_URL.
const VERCEL_HOST =
  normalize(process.env.NEXT_PUBLIC_VERCEL_URL) ??
  normalize(process.env.VERCEL_URL);

/** Origine canonique, sans slash final. Exemple : https://adamesg-os.fr */
export const SITE_URL =
  normalize(process.env.NEXT_PUBLIC_SITE_URL) ??
  (VERCEL_HOST ? `https://${VERCEL_HOST}` : FALLBACK_SITE_URL);

/** Nom d'hôte seul, sans protocole ("adamesg-os.fr"). */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");

/** URL absolue à partir d'un chemin relatif ("/metrics"). */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
