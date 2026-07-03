// Libellés et formatage des métriques STRATA (strata_analytics).
// Partagé par la Couche D (aperçu) et la page publique /metrics (L4-T13).

const METRIC_LABELS: Record<string, string> = {
  audits_vsme: "Audits VSME",
  docs_rag: "Docs RAG",
  uptime_pct: "Uptime",
  users: "Utilisateurs",
  reports: "Rapports",
  leads: "Leads",
  api_requests: "Requêtes API",
  simulations: "Simulations",
};

/** Libellé lisible d'une clé de métrique (repli : clé humanisée). */
export function metricLabel(key: string): string {
  return (
    METRIC_LABELS[key] ??
    key.replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase())
  );
}

/** Suffixe d'unité déduit de la clé (pour l'instant : pourcentages). */
export function metricSuffix(key: string): string {
  return key.endsWith("_pct") ? "%" : "";
}

/** Décimales : 1 pour les valeurs non entières (pourcentages fins), 0 sinon. */
export function metricDecimals(value: number): number {
  return Number.isInteger(value) ? 0 : 1;
}

/** Formatage FR d'une valeur de métrique, avec suffixe optionnel. */
export function formatMetric(value: number, key: string): string {
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: metricDecimals(value),
    maximumFractionDigits: metricDecimals(value),
  }).format(value);
  return `${formatted}${metricSuffix(key)}`;
}
