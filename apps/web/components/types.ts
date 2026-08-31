// Types partagés du dashboard (Couches A/B/C/D).
// Miroir des lignes lues via Supabase (schéma Drizzle packages/db).

export type MetricRow = {
  key: string;
  value_num: number | null;
  value_text: string | null;
  unit: string | null;
};

export type DecisionRow = {
  id: string;
  title: string;
  date: string;
  category: string;
  reasoning: string;
  tags: string[];
};

export type TrajectoryStatus = "now" | "next" | "later";
export type TrajectoryType = "feature" | "expansion" | "risk";

export type TrajectoryRow = {
  id: string;
  title: string;
  status: TrajectoryStatus;
  type: TrajectoryType;
  eta: string | null;
  notes: string | null;
};

// L1-T10 : une metrique produit du groupe (table ecosystem_analytics,
// ex-strata_analytics). La provenance accompagne la valeur.
export type AnalyticsRow = {
  metric: string;
  value: number;
  period: string | null;
  division: string | null;
  product_slug: string | null;
};

// L1-T9 : une ligne du registre produits, telle que la cle anon peut la lire
// (repo_full_name est revoquee pour anon, elle n'apparait pas ici).
export type EcosystemStatus = "live" | "building" | "planned";

export type EcosystemProductRow = {
  slug: string;
  name: string;
  division: string;
  pillar: string | null;
  description: string | null;
  status: EcosystemStatus;
  url: string | null;
  position: number;
};

// L9 : etat d'une passerelle produit, tel qu'il traverse vers le client.
export type GatewayStatusRow = {
  productSlug: string;
  productName: string;
  division: string;
  status: "ok" | "unavailable" | "disabled";
  latencyMs: number | null;
  fetchedAt: string;
};

// L5-T2 : un commit GitHub du feed "Shipped" (sha court, titre, ISO date),
// avec le produit et la division dont il provient.
export type CommitRow = {
  sha: string;
  message: string;
  date: string;
  url: string;
  product: string;
  division: string;
};

export type DashboardData = {
  metrics: MetricRow[];
  decisions: DecisionRow[];
  trajectory: TrajectoryRow[];
  /** Métriques produit du groupe (ecosystem_analytics). */
  analytics: AnalyticsRow[];
  /** Registre produits public (ecosystem_products), trié par position. */
  products: EcosystemProductRow[];
  commits: CommitRow[];
  // L8-T6 : statut Better Stack. null → repli sur system_metrics.
  uptime: "up" | "down" | null;
  /** L9 : état des passerelles produit. Liste vide = aucune configurée. */
  gateways: GatewayStatusRow[];
};

export const CONTACT_EMAIL = "diadamflow@gmail.com";
// Liens d'interface uniquement. La liste des depots suivis par le feed n'est
// PAS ici, elle vit dans lib/repos.ts (L5-T2).
export const GITHUB_PROFILE_URL = "https://github.com/adama-diallo-rse";
export const GITHUB_REPO_URL = "https://github.com/adama-diallo-rse/adama-os";
export const CV_PATH = "/adama-diallo-cv.pdf";
// L6-T2 : nom du fichier proposé au téléchargement (le fichier physique
// dans public/ reste adama-diallo-cv.pdf).
export const CV_DOWNLOAD_NAME = "CV_AdamaDiallo_RSE.pdf";
// L6-T2 : lien Cal.com (ex: "adama-diallo/15min"). Vide → repli mailto.
export const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK ?? "";
export const DEFAULT_DEADLINE_ISO = "2026-10-31T00:00:00+01:00";
export const DEFAULT_TARGET_WEIGHT = 80;
