import "server-only";

// L9, point d'entrée unique des passerelles écosystème.
//   - fetchEcosystemHealth() : état des produits pour l'affichage ;
//   - persistImportedMetrics() : historisation dans ecosystem_analytics,
//     en insertion seule, appelée par /api/ecosystem/sync ;
//   - persistProbes() : trace de chaque tentative de sonde et de sa nature
//     d'échec dans ecosystem_probes (C1-T7).

import { createServiceClient } from "../supabase/service";
import { runAllGateways } from "./gateways";
import type { EcosystemHealth, GatewayResult, ImportedMetric } from "./types";

export { GATEWAYS, runAllGateways, runGateway } from "./gateways";
export { GatewayError } from "./client";
export type {
  EcosystemHealth,
  GatewayFailure,
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
/**
 * Duree de validite d'un releve de passerelle, en secondes. Deux jours, la
 * meme valeur que celle posee par la migration 0003 sur les lignes anterieures.
 * Au dela, la valeur reste lisible mais porte la mention PERIMEE.
 */
const FRAICHEUR_PASSERELLE_S = 172800;

export async function fetchEcosystemHealth(): Promise<EcosystemHealth> {
  try {
    return summarize(await runAllGateways());
  } catch (error) {
    console.error("[ecosysteme] passerelles indisponibles :", error);
    return { results: [], allDown: true, noneConfigured: false };
  }
}

/**
 * Trace de chaque tentative de sonde (C1-T7).
 *
 * Insertion seule, une ligne par tentative, y compris quand tout va bien :
 * un journal qui ne garde que les échecs ne permet pas de dire depuis quand
 * une source ne répond plus, ni si elle a jamais répondu.
 *
 * L'extrait d'erreur est tronqué court et volontairement : une sonde ne doit
 * pas devenir un journal de fuite. La colonne est par ailleurs révoquée pour
 * la clé anonyme dans la migration 0003.
 */
export async function persistProbes(
  results: GatewayResult[],
): Promise<PersistOutcome> {
  if (results.length === 0) {
    return { inserted: 0, skipped: 0, reason: "aucune sonde à tracer" };
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return {
      inserted: 0,
      skipped: results.length,
      reason: "SUPABASE_SERVICE_ROLE_KEY absente",
    };
  }

  const rows = results.map((r) => ({
    product_slug: r.productSlug,
    division: r.division,
    source: "GET /health",
    status: r.status,
    failure_kind: r.failureKind,
    http_status: r.httpStatus,
    latency_ms: r.latencyMs,
    error_excerpt: r.error ? r.error.slice(0, 180) : null,
    observed_at: r.fetchedAt,
  }));

  const { error } = await supabase.from("ecosystem_probes").insert(rows);
  if (error) {
    return {
      inserted: 0,
      skipped: rows.length,
      reason: `insertion refusée : ${error.message}`,
    };
  }
  return { inserted: rows.length, skipped: 0, reason: null };
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
      // C1. La classe est obligatoire en base depuis la migration 0003, sans
      // valeur par defaut : classer est une decision, pas un remplissage. Une
      // valeur relevee par une passerelle sur la route de sante d'un produit
      // est reelle, elle nomme sa source et sa methode. Sans ces trois champs
      // l'insertion etait refusee en silence, et la synchronisation rendait
      // « 0 insere » avec la contrainte en clair dans son motif.
      // La formulation de method est celle que 0003 a posee sur les lignes
      // deja presentes : deux ecritures differentes pour la meme mesure
      // donneraient deux phrases differentes sur la meme page.
      data_class: "real" as const,
      method: `Relevé importé par la passerelle L9 : ${m.source}`,
      max_age_seconds: FRAICHEUR_PASSERELLE_S,
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
