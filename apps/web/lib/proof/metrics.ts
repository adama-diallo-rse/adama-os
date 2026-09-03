// =====================================================================
// C1, passage d'une ligne de base à un Claim.
//
// Un seul endroit convertit une ligne de `ecosystem_analytics` ou de
// `system_metrics` en `Claim<number>`. Les pages ne manipulent plus de
// colonnes, elles manipulent des affirmations chiffrées.
//
// Ce module est volontairement pur : il ne lit ni base ni environnement, donc
// il traverse sans risque vers un composant client. L'interrupteur de
// démonstration, qui lit process.env, vit à côté dans ./demo.ts.
// =====================================================================

import type { Claim, DataClass } from "./types";

/** Durée de validité par défaut d'un relevé de passerelle, en secondes.
 *  Deux jours : le cron tourne une fois par jour, une valeur qui a sauté
 *  deux passages n'est plus une mesure du présent. */
export const DEFAULT_MAX_AGE_SECONDS = 172800;

/** Ligne d'analytics telle que la clé anonyme peut la lire. */
export type AnalyticRow = {
  metric: string;
  value: number | null;
  period: string | null;
  source: string | null;
  division: string | null;
  product_slug: string | null;
  created_at: string;
  fetched_at?: string | null;
  data_class?: string | null;
  method?: string | null;
  max_age_seconds?: number | null;
  published_at?: string | null;
};

/** Colonnes à demander à Supabase. Une seule liste, partagée. */
export const ANALYTIC_COLUMNS =
  "metric, value, period, source, division, product_slug, created_at, fetched_at, data_class, method, max_age_seconds, published_at";

/**
 * Classe d'une ligne. La colonne `data_class` est `not null` depuis la
 * migration 0003, mais une base qui n'aurait pas encore reçu la migration
 * renverrait `null` : dans ce cas la ligne bascule du côté non réel, jamais
 * du côté réel. Se tromper vers `demo` est visible, se tromper vers `real`
 * est un mensonge silencieux.
 */
function classOf(row: AnalyticRow): DataClass {
  const c = row.data_class;
  if (c === "real" || c === "historical" || c === "demo") {
    return c;
  }
  return "demo";
}

/** Suffixe d'unité déduit de la clé (pour l'instant : pourcentages). */
function suffixOf(metric: string): string {
  return metric.endsWith("_pct") ? "%" : "";
}

export function claimFromAnalytic(row: AnalyticRow): Claim<number> {
  const dataClass = classOf(row);
  return {
    value: typeof row.value === "number" ? row.value : null,
    dataClass,
    source: row.source ?? "source non renseignée",
    method:
      row.method ??
      (dataClass === "demo"
        ? "Jeu d’illustration. Ne décrit rien de réel."
        : "Méthode non renseignée."),
    fetchedAt: row.fetched_at ?? row.created_at,
    publishedAt: row.published_at ?? null,
    maxAgeSeconds:
      typeof row.max_age_seconds === "number"
        ? row.max_age_seconds
        : dataClass === "real"
          ? DEFAULT_MAX_AGE_SECONDS
          : null,
    period: row.period,
    suffix: suffixOf(row.metric),
  };
}
