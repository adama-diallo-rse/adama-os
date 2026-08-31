import "server-only";

// L9, définition des passerelles produit.
//
// RÈGLE DE TENUE DE CE FICHIER, à lire avant d'y ajouter une ligne :
// on ne branche que des routes dont le contrat a été relevé dans le code du
// produit, jamais une route supposée. Au 31 août 2026, les deux moteurs
// n'exposent qu'une seule surface publique en lecture :
//
//   STRATA Scope    GET /health -> {"status": "ok"}
//                   apps/api/strata_scope/api/app.py, route "/health",
//                   hors garde-fou de débit, sans authentification.
//   ESG Optimizer   GET /health -> {"status": "ok"}
//                   backend/main.py, route "/health", sans authentification.
//
// Tout le reste est authentifié par session utilisateur ou réservé à
// l'administrateur applicatif : hors de portée du cockpit, et explicitement
// interdit par la doctrine L9 (aucun appel avec une clé d'administration).
// POST /v1/ecosystem/webhook existe côté Scope, mais même un simple "ping"
// journalise un événement, donc il écrit. Le cockpit ne l'appelle pas.
//
// Ce qu'il reste à demander côté produit pour aller plus loin (une route
// publique versionnée, en lecture, sans donnée client) :
//   - Scope         : GET /v1/public/stats -> nombre d'organisations actives,
//                     de périodes gelées, de tonnes tracées ;
//   - ESG Optimizer : GET /v1/public/stats -> nombre d'analyses terminées,
//                     de rapports produits ;
//   - ordonnanceur  : GET /v1/public/scheduler -> dernière exécution et santé
//                     des tâches planifiées, sans nom de tâche client.
// Le jour où l'une de ces routes existe, elle se branche ici, en ajoutant une
// entrée à GATEWAYS. Rien d'autre ne bouge dans le cockpit.

import { getJson, normalizeOrigin } from "./client";
import type { GatewayResult, ImportedMetric } from "./types";

type HealthPayload = { status?: string };

type GatewayDefinition = {
  productSlug: string;
  productName: string;
  division: string;
  /** Variable d'environnement portant l'origine de l'API produit. */
  originEnv: string;
};

/** Passerelles déclarées. Une entrée sans variable d'environnement posée est
 *  simplement inactive : pas d'appel, pas de métrique, pas d'erreur. */
export const GATEWAYS: GatewayDefinition[] = [
  {
    productSlug: "strata-scope",
    productName: "STRATA Scope",
    division: "STRATA",
    originEnv: "ECOSYSTEM_SCOPE_API_URL",
  },
  {
    productSlug: "esg-optimizer",
    productName: "ESG Optimizer",
    division: "STRATA",
    originEnv: "ECOSYSTEM_ESG_OPTIMIZER_API_URL",
  },
];

/** Jour ISO (UTC), période des relevés de disponibilité. */
function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Sonde de disponibilité d'un produit.
 *
 * Point important, et volontaire : une valeur 0 n'est enregistrée que si le
 * produit a RÉPONDU avec un état non sain. Un délai dépassé ou une coupure
 * réseau ne produit aucune métrique, seulement un statut "unavailable". Le
 * cockpit ne sait pas distinguer une panne du produit d'une panne de sa propre
 * sortie réseau : écrire 0 dans ce cas attribuerait au produit un incident
 * qu'on n'a pas constaté.
 */
export async function runGateway(
  gateway: GatewayDefinition,
): Promise<GatewayResult> {
  const fetchedAt = new Date();
  const base = {
    productSlug: gateway.productSlug,
    productName: gateway.productName,
    division: gateway.division,
    fetchedAt: fetchedAt.toISOString(),
  };

  const origin = normalizeOrigin(process.env[gateway.originEnv]);
  if (!origin) {
    return {
      ...base,
      status: "disabled",
      latencyMs: null,
      error: null,
      metrics: [],
    };
  }

  try {
    const { data, latencyMs } = await getJson<HealthPayload>(
      `${origin}/health`,
    );
    const healthy = data?.status === "ok";
    const metric: ImportedMetric = {
      productSlug: gateway.productSlug,
      division: gateway.division,
      metric: "disponibilite_pct",
      value: healthy ? 100 : 0,
      source: "GET /health",
      fetchedAt: base.fetchedAt,
      period: isoDay(fetchedAt),
      persist: true,
    };
    return {
      ...base,
      status: healthy ? "ok" : "unavailable",
      latencyMs,
      error: healthy ? null : `état retourné : ${String(data?.status)}`,
      metrics: [metric],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[ecosysteme] ${gateway.productSlug} injoignable :`, message);
    return {
      ...base,
      status: "unavailable",
      latencyMs: null,
      error: message,
      metrics: [],
    };
  }
}

/** Exécute toutes les passerelles en parallèle. Ne lève jamais. */
export async function runAllGateways(): Promise<GatewayResult[]> {
  return Promise.all(GATEWAYS.map((gateway) => runGateway(gateway)));
}
