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

// C1-T8 : "done" est ajoute par la migration 0003. Une entree dont
// l'echeance est passee ne peut plus rester "now" indefiniment.
export type TrajectoryStatus = "now" | "next" | "later" | "done";
export type TrajectoryType = "feature" | "expansion" | "risk";

export type TrajectoryRow = {
  id: string;
  title: string;
  status: TrajectoryStatus;
  type: TrajectoryType;
  eta: string | null;
  notes: string | null;
};

// L1-T10 puis C1 : une metrique produit du groupe (table
// ecosystem_analytics). La provenance accompagne la valeur, et depuis la
// couche C1 la classe de la donnee aussi. Une seule definition de la ligne,
// celle de lib/proof/metrics.ts : les composants d'affichage ne manipulent
// plus des colonnes mais des Claim.
import type { AnalyticRow as AnalyticsRow } from "../lib/proof/metrics";
import type { ClaimState } from "../lib/proof/types";

export type { AnalyticsRow };

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
  /** C1-T7 : nature de l'echec. Une panne du produit et une panne de la
   *  sortie reseau du cockpit ne s'affichent plus de la meme facon. */
  failureKind:
    | "produit_non_sain"
    | "delai_depasse"
    | "erreur_reseau"
    | "reponse_illisible"
    | null;
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
  /** C8 : "owner/repo" d'origine, pour filtrer le journal par depot et pour
   *  rattacher un commit a un chantier sans dependre du nom de produit. */
  repo: string;
};

// C3-T6 et C8-T6 : etat de lecture d'un depot suivi. Un depot non lu est
// NOMME, avec sa raison. Il n'est jamais simplement omis.
export type RepoStatusRow = {
  fullName: string;
  product: string;
  division: string;
  ok: boolean;
  reason: string | null;
  commits: number;
};

/**
 * C10-T11, index de preuve servi au terminal.
 *
 * Volontairement plat et minuscule : il traverse vers un composant client, et
 * embarquer les preuves completes doublerait le poids envoye au navigateur
 * pour une commande que peu de visiteurs taperont. Chaque entree porte de
 * quoi restituer source, etat et adresse de verification, exactement comme la
 * page de verification, jamais moins.
 */
export type TerminalProof = {
  id: string;
  statement: string;
  subject: string;
  subjectRef: string | null;
  state: ClaimState;
  source: string;
  fetchedAt: string | null;
};

/** C12-T2, resume du rapport d'integrite servi au terminal. */
export type TerminalIntegrity = {
  executedAt: string;
  ageJours: number;
  perime: boolean;
  reussis: number;
  echoues: number;
  nonExecutes: number;
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
  /** C9-T2 : état des affirmations servies par le registre de preuve,
   *  indexé par identifiant. Une clé absente signifie que l'affirmation
   *  n'est pas servie : aucun lien de vérification ne doit alors être
   *  proposé. Un Record et non une Map : la valeur traverse la frontière
   *  serveur vers client, et une Map ne la traverse pas. */
  proofStates: Record<string, ClaimState>;
  /** C10-T11 : index de preuve, pour la commande `proof` du terminal. */
  proofs: TerminalProof[];
  /** C10-T11 et C12-T2 : resume du dernier calcul d'integrite. */
  integrity: TerminalIntegrity | null;
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
