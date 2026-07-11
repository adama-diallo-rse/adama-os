import { sanityClient } from "./client";

// L5-T6 — Surcharges CMS des formations. Lecture seule, publiée uniquement.
// Renvoie une map { level → override }. [] / {} si Sanity non configuré : le
// catalogue du repo (content/learn/catalog.ts) reste la source de vérité.

export type CourseOverride = {
  level: number;
  priceLabel: string | null;
  available: boolean | null;
  checkoutUrl: string | null;
};

const OVERRIDES_QUERY = `*[_type == "course" && defined(level)]{
    "level": level,
    "priceLabel": priceLabel,
    "available": available,
    "checkoutUrl": checkoutUrl
  }`;

/** Map des surcharges par niveau. {} si Sanity absent ou vide. */
export async function getCourseOverrides(): Promise<
  Record<number, CourseOverride>
> {
  if (!sanityClient) return {};
  const rows =
    (await sanityClient.fetch<CourseOverride[]>(OVERRIDES_QUERY)) ?? [];
  const map: Record<number, CourseOverride> = {};
  for (const row of rows) {
    if (typeof row.level === "number") {
      map[row.level] = row;
    }
  }
  return map;
}
