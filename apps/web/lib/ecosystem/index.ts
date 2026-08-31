import "server-only";

// L9, point d'entrée unique des passerelles écosystème.
//   - fetchEcosystemHealth() : état des produits pour l'affichage ;
//   - persistImportedMetrics() : historisation dans ecosystem_analytics,
//     en insertion seule, appelée par /api/ecosystem/sync.

import { createServiceClient } from "../supabase/service";
import { runAllGateways } from "./gateways";
import type { EcosystemHealth, GatewayResult, ImportedMetric } from "./types";

export { GATEWAYS, runAllGateways, runGateway } from "./gateways";
export type {
  EcosystemHealth,
  GatewayResult,
  GatewayStatus,
  ImportedMetric,
} from "./types";

/** Agrège les résultats en une vue directement affichable. */
export function summarize(results: GatewayResult[]): EcosystemHealth {
  const configured = results.filter((r) => r.status !== "disabled");
  return {
    results,
    allDown:
      configured.length > 0 && configured.every((r) => r.status !== "ok"),
    noneConfigured: configured.length === 0,
  };
}

/**
 * État des passerelles, pour le rendu du dashboard.
 *
 * Mode dégradé global : si aucune passerelle ne répond, le dashboard reste
 * entièrement fonctionnel et le dit. Cette fonction ne lève jamais et ne
 * bloque jamais plus longtemps que le délai du client (2,5 s par passerelle,
 * en parallèle), avec un cache Next de 5 minutes côté fetch.
 */
export async function fetchEcosystemHealth(): Promise<EcosystemHealth> {
  try {
    return summarize(await runAllGateways());
  } catch (error) {
    console.error("[ecosysteme] passerelles indisponibles :", error);
    return { results: [], allDown: true, noneConfigured: false };
  }
}

export type PersistOutcome = {
  inserted: number;
  skipped: number;
  reason: string | null;
};

/**
 * Historise les métriques importées dans ecosystem_analytics.
 *
 * Insertion seule, jamais d'écrasement : l'historique est la matière de la
 * courbe. Idempotence par (produit, métrique, période) pour qu'un second
 * passage du cron dans la même journée ne double pas les points.
 */
export async function persistImportedMetrics(
  metrics: ImportedMetric[],
): Promise<PersistOutcome> {
  const persistable = metrics.filter((m) => m.persist);
  if (persistable.length === 0) {
    return { inserted: 0, skipped: 0, reason: "aucune métrique à historiser" };
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return {
      inserted: 0,
      skipped: persistable.length,
      reason: "SUPABASE_SERVICE_ROLE_KEY absente",
    };
  }

  // Points déjà présents pour les périodes concernées.
  const periods = Array.from(
    new Set(persistable.map((m) => m.period).filter((p): p is string => !!p)),
  );
  const existing = new Set<string>();
  if (periods.length > 0) {
    const { data, error } = await supabase
      .from("ecosystem_analytics")
      .select("metric, product_slug, period")
      .in("period", periods);
    if (error) {
      return {
        inserted: 0,
        skipped: persistable.length,
        reason: `lecture impossible : ${error.message}`,
      };
    }
    for (const row of (data as {
      metric: string;
      product_slug: string | null;
      period: string | null;
    }[]) ?? []) {
      existing.add(
        `${row.product_slug ?? ""}|${row.metric}|${row.period ?? ""}`,
      );
    }
  }

  const rows = persistable
    .filter(
      (m) => !existing.has(`${m.productSlug}|${m.metric}|${m.period ?? ""}`),
    )
    .map((m) => ({
      metric: m.metric,
      value: m.value,
      period: m.period,
      source: m.source,
      division: m.division,
      product_slug: m.productSlug,
      fetched_at: m.fetchedAt,
    }));

  if (rows.length === 0) {
    return {
      inserted: 0,
      skipped: persistable.length,
      reason: "points déjà présents pour cette période",
    };
  }

  const { error } = await supabase.from("ecosystem_analytics").insert(rows);
  if (error) {
    return {
      inserted: 0,
      skipped: persistable.length,
      reason: `insertion refusée : ${error.message}`,
    };
  }

  return {
    inserted: rows.length,
    skipped: persistable.length - rows.length,
    reason: null,
  };
}
