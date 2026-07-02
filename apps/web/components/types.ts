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

export type StrataMetricRow = {
  metric: string;
  value: number;
  period: string | null;
};

// L5-T1 : un commit GitHub du feed "Shipped" (sha court, titre, ISO date).
export type CommitRow = {
  sha: string;
  message: string;
  date: string;
  url: string;
};

export type DashboardData = {
  metrics: MetricRow[];
  decisions: DecisionRow[];
  trajectory: TrajectoryRow[];
  strata: StrataMetricRow[];
  commits: CommitRow[];
  // L8-T6 : statut Better Stack. null → repli sur system_metrics.
  uptime: "up" | "down" | null;
};

export const CONTACT_EMAIL = "diadamflow@gmail.com";
export const GITHUB_OWNER = "adama-diallo-rse";
export const GITHUB_REPO = "adama-os";
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`;
export const CV_PATH = "/adama-diallo-cv.pdf";
// L6-T2 : nom du fichier proposé au téléchargement (le fichier physique
// dans public/ reste adama-diallo-cv.pdf).
export const CV_DOWNLOAD_NAME = "CV_AdamaDiallo_RSE.pdf";
// L6-T2 : lien Cal.com (ex: "adama-diallo/15min"). Vide → repli mailto.
export const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK ?? "";
export const DEFAULT_DEADLINE_ISO = "2026-10-31T00:00:00+01:00";
export const DEFAULT_TARGET_WEIGHT = 80;
