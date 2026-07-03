// L5-T3 — Sources de veille + extraction des items.
// Extraction volontairement sans dépendance (regex sur les <a>) : robuste au
// build, facile à ajuster. Les sélecteurs/heuristiques sont à affiner selon le
// HTML réel des pages (voir MAX_ITEMS et le filtre de pertinence ci-dessous).

export type SourceKind = "EFRAG" | "GHG";

export type VeilleSource = {
  /** _id déterministe du document Sanity (source.<id>). */
  id: string;
  name: string;
  kind: SourceKind;
  /** Page listant les actualités à scanner. */
  listUrl: string;
  /** Le chemin de l'article doit contenir un de ces segments (ex: "/news"). */
  pathIncludes: string[];
};

export type SourceItem = {
  title: string;
  url: string;
  /** Clé de nouveauté (URL normalisée). */
  externalId: string;
};

// Pages de veille. À ajuster si les URLs officielles changent.
export const SOURCES: VeilleSource[] = [
  {
    id: "efrag",
    name: "EFRAG",
    kind: "EFRAG",
    listUrl: "https://www.efrag.org/en/news-and-calendar/news",
    pathIncludes: ["/news", "/projects", "/publications"],
  },
  {
    id: "ghg",
    name: "GHG Protocol",
    kind: "GHG",
    listUrl: "https://ghgprotocol.org/blog",
    pathIncludes: ["/blog", "/news"],
  },
];

const MAX_ITEMS = 15;
const MIN_TITLE_LEN = 25;
// Longueur mini du dernier segment d'URL pour ressembler à un slug d'article
// (écarte les liens de navigation type /news, /about, /contact, /en).
const MIN_SLUG_LEN = 12;

/** Normalise une URL en clé stable (sans query/fragment ni slash final). */
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    u.search = "";
    return `${u.origin}${u.pathname}`.replace(/\/+$/, "");
  } catch {
    return url;
  }
}

/** Décode les entités HTML les plus courantes dans un titre. */
function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

/** Récupère les items candidats d'une source (liens + titres). */
export async function fetchSourceItems(
  source: VeilleSource,
): Promise<SourceItem[]> {
  const res = await fetch(source.listUrl, {
    headers: { "User-Agent": "AdamaOS-Veille/1.0 (+https://adama-os-web.vercel.app)" },
  });
  if (!res.ok) {
    throw new Error(`Fetch ${source.name} ${res.status}`);
  }
  const html = await res.text();
  const base = new URL(source.listUrl);

  const anchor = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const seen = new Set<string>();
  const items: SourceItem[] = [];

  for (const match of html.matchAll(anchor)) {
    const rawHref = match[1];
    const rawInner = match[2];
    if (!rawHref || rawInner === undefined) continue;
    const title = decodeEntities(rawInner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
    if (title.length < MIN_TITLE_LEN) continue;

    let parsed: URL;
    try {
      parsed = new URL(rawHref, base);
    } catch {
      continue;
    }
    if (!/^https?:$/.test(parsed.protocol)) continue;

    // Même domaine que la source : écarte les liens externes (réseaux sociaux...).
    if (parsed.host !== base.host) continue;

    const path = parsed.pathname.toLowerCase();
    // Doit être sous une section d'article de cette source.
    if (!source.pathIncludes.some((p) => path.includes(p))) continue;

    // Écarte la page liste elle-même.
    if (normalizeUrl(parsed.toString()) === normalizeUrl(source.listUrl)) continue;

    // Slug d'article : dernier segment assez long et avec au moins un tiret.
    // Cela élimine les liens de navigation (/news, /about, /en, ...).
    const segments = path.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1] ?? "";
    if (lastSegment.length < MIN_SLUG_LEN || !lastSegment.includes("-")) continue;

    const url = parsed.toString();
    const externalId = normalizeUrl(url);
    if (seen.has(externalId)) continue;
    seen.add(externalId);

    items.push({ title, url, externalId });
    if (items.length >= MAX_ITEMS) break;
  }

  return items;
}
