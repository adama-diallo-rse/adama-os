// L9, modèle commun des passerelles écosystème.
//
// Principe non négociable de la couche : le cockpit CONSOMME, il ne recalcule
// jamais et il n'écrit jamais dans un produit. Toute valeur affichée ici vient
// d'une API produit, en lecture seule, et porte sa provenance.

/** Métrique importée d'un produit. Les quatre champs de provenance sont
 *  obligatoires : sans eux, l'interface n'affiche pas la valeur. */
export type ImportedMetric = {
  /** Produit d'origine, slug de ecosystem_products. */
  productSlug: string;
  /** Division du groupe (STRATA, IROKO, Cockpit). */
  division: string;
  /** Clé de la métrique, telle qu'elle sera stockée et libellée. */
  metric: string;
  value: number;
  /** Nom de la route qui a servi la valeur, ex. "GET /health". */
  source: string;
  /** Instant du relevé, côté cockpit, en ISO 8601. */
  fetchedAt: string;
  /** Période couverte, ex. "2026-08-31". Null pour un point instantané. */
  period: string | null;
  /** Faux pour une mesure d'affichage seulement (non historisée). */
  persist: boolean;
};

/** État d'une passerelle après exécution. Trois issues, jamais davantage. */
export type GatewayStatus = "ok" | "unavailable" | "disabled";

export type GatewayResult = {
  productSlug: string;
  productName: string;
  division: string;
  status: GatewayStatus;
  /** Latence de l'appel en millisecondes. Null si la source n'a pas répondu. */
  latencyMs: number | null;
  /** ISO 8601 de la tentative. */
  fetchedAt: string;
  /** Message technique, journalisé, jamais affiché tel quel à un visiteur. */
  error: string | null;
  metrics: ImportedMetric[];
};

/** Vue agrégée, passée au dashboard. */
export type EcosystemHealth = {
  results: GatewayResult[];
  /** Vrai si aucune passerelle n'a répondu : mode dégradé global. */
  allDown: boolean;
  /** Vrai si aucune passerelle n'est configurée. */
  noneConfigured: boolean;
};
