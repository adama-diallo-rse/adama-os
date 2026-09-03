// Libellés et formatage des métriques produit du groupe (ecosystem_analytics,
// ex-strata_analytics). Partagé par la Couche D (aperçu) et la page publique
// /metrics (L4-T13).

const METRIC_LABELS: Record<string, string> = {
  audits_vsme: "Audits VSME",
  docs_rag: "Docs RAG",
  uptime_pct: "Uptime",
  users: "Utilisateurs",
  reports: "Rapports",
  leads: "Leads",
  api_requests: "Requêtes API",
  simulations: "Simulations",
  // L9 : relevé de disponibilité produit, issu de la sonde GET /health.
  disponibilite_pct: "Disponibilité",
  pme_analysees: "PME analysées",
  requetes_api: "Requêtes API",
  audits_lances: "Audits lancés",
};

/** Libellé lisible d'une clé de métrique (repli : clé humanisée). */
export function metricLabel(key: string): string {
  return (
    METRIC_LABELS[key] ??
    key.replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase())
  );
}

// C1. Les trois fonctions de formatage qui vivaient ici, metricSuffix,
// metricDecimals et formatMetric, ont ete retirees : le formatage d'une
// valeur appartient desormais au composant qui rend un Claim, et le suffixe
// d'unite est derive dans lib/proof/metrics.ts, au meme endroit que le reste
// de la conversion d'une ligne de base. Les garder en double aurait laisse
// deux verites sur la facon d'ecrire un nombre.
