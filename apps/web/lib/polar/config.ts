import "server-only";

// L6-T5 — Configuration Polar (paiements). Tout est optionnel : sans clés,
// les fonctions renvoient null / {} et les routes checkout retombent en
// mode dégradé (redirection vers /learn/acces). Le build ne dépend jamais
// de Polar. Serveur uniquement (jamais préfixé NEXT_PUBLIC_ à part le SITE_URL
// qui, lui, est public par nature).

/** Environnement Polar : "sandbox" (défaut, sûr) ou "production". */
export type PolarServer = "sandbox" | "production";

export function polarServer(): PolarServer {
  return process.env.POLAR_SERVER?.trim() === "production"
    ? "production"
    : "sandbox";
}

/** Base de l'API Polar selon l'environnement. */
export function polarApiBase(): string {
  return polarServer() === "production"
    ? "https://api.polar.sh"
    : "https://sandbox-api.polar.sh";
}

/** Jeton d'accès organisation Polar (Organization Access Token). null si absent. */
export function polarToken(): string | null {
  const t = process.env.POLAR_ACCESS_TOKEN?.trim();
  return t ? t : null;
}

/** Secret de vérification des webhooks (Standard Webhooks). null si absent. */
export function polarWebhookSecret(): string | null {
  const s = process.env.POLAR_WEBHOOK_SECRET?.trim();
  return s ? s : null;
}

/** URL publique du site (pour construire les success_url). */
export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    "";
  if (!raw) return "http://localhost:3000";
  // VERCEL_PROJECT_PRODUCTION_URL vient sans schéma.
  const withScheme = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
  return withScheme.replace(/\/+$/, "");
}

/** URL de retour après un achat de formation réussi. */
export function courseSuccessUrl(): string {
  return `${siteUrl()}/learn/acces?purchased=1`;
}

/** URL de retour après le démarrage d'un essai SaaS. */
export function trialSuccessUrl(): string {
  return `${siteUrl()}/strata?trial=1`;
}

// --- Mapping niveau de formation → identifiant produit Polar ---------------
// Chaque niveau (1 à 4) correspond à un produit Polar distinct. Les IDs sont
// injectés par variables d'environnement (créées dans le dashboard Polar, T5).
const LEVEL_ENV: Record<number, string> = {
  1: "POLAR_PRODUCT_L1",
  2: "POLAR_PRODUCT_L2",
  3: "POLAR_PRODUCT_L3",
  4: "POLAR_PRODUCT_L4",
};

/** ID produit Polar pour un niveau de formation, ou null si non configuré. */
export function productIdForLevel(level: number): string | null {
  const envKey = LEVEL_ENV[level];
  if (!envKey) return null;
  const id = process.env[envKey]?.trim();
  return id ? id : null;
}

/** Niveau de formation correspondant à un ID produit Polar, ou null. */
export function levelForProductId(productId: string | null | undefined): number | null {
  if (!productId) return null;
  for (const [levelStr, envKey] of Object.entries(LEVEL_ENV)) {
    if (process.env[envKey]?.trim() === productId) {
      return Number(levelStr);
    }
  }
  return null;
}

/** ID produit Polar de l'abonnement SaaS STRATA (essai gratuit T9), ou null. */
export function saasProductId(): string | null {
  const id = process.env.POLAR_PRODUCT_SAAS?.trim();
  return id ? id : null;
}

/** Vrai si Polar est suffisamment configuré pour créer un checkout. */
export function polarConfigured(): boolean {
  return polarToken() !== null;
}
