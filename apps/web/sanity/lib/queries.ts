import type { PortableTextBlock } from "@portabletext/react";
import { sanityClient } from "./client";

// L5-T5 — Requêtes GROQ de la page publique /veille.
// Toutes passent par le client de lecture (published) : aucun brouillon exposé.

export type VeilleListItem = {
  title: string;
  slug: string;
  summary: string;
  publishedAt: string | null;
  source: string | null;
  tags: string[];
};

export type VeilleArticle = VeilleListItem & {
  body: PortableTextBlock[] | null;
  originalUrl: string | null;
};

const LIST_QUERY = `*[_type == "veilleArticle" && defined(slug.current)]
  | order(publishedAt desc){
    "title": title,
    "slug": slug.current,
    "summary": summary,
    "publishedAt": publishedAt,
    "source": source->title,
    "tags": tags[]->title
  }`;

const ARTICLE_QUERY = `*[_type == "veilleArticle" && slug.current == $slug][0]{
    "title": title,
    "slug": slug.current,
    "summary": summary,
    "publishedAt": publishedAt,
    "source": source->title,
    "tags": tags[]->title,
    "body": body,
    "originalUrl": originalUrl
  }`;

const SLUGS_QUERY = `*[_type == "veilleArticle" && defined(slug.current)].slug.current`;

/** Liste des articles publiés (récent d'abord). [] si Sanity non configuré. */
export async function getVeilleList(): Promise<VeilleListItem[]> {
  if (!sanityClient) return [];
  const rows = await sanityClient.fetch<VeilleListItem[]>(LIST_QUERY);
  return (rows ?? []).map((r) => ({ ...r, tags: r.tags ?? [] }));
}

/** Un article par slug, ou null s'il n'existe pas / Sanity non configuré. */
export async function getVeilleArticle(
  slug: string,
): Promise<VeilleArticle | null> {
  if (!sanityClient) return null;
  const article = await sanityClient.fetch<VeilleArticle | null>(ARTICLE_QUERY, {
    slug,
  });
  if (!article) return null;
  return { ...article, tags: article.tags ?? [] };
}

/** Tous les slugs publiés (sitemap + génération de routes). */
export async function getVeilleSlugs(): Promise<string[]> {
  if (!sanityClient) return [];
  return (await sanityClient.fetch<string[]>(SLUGS_QUERY)) ?? [];
}
