// =====================================================================
// Le chargement des données publiques de l'accueil et de /os.
//
// Déplacé de app/page.tsx le 30 octobre 2026 : le cockpit quitte l'accueil
// pour devenir la page /os, et les deux surfaces lisent les mêmes lignes.
// Si Supabase est indisponible, on retombe sur des listes vides : la
// vitrine ne casse jamais, et aucune valeur n'est inventée pour meubler.
// =====================================================================

import { createHash } from "node:crypto";
import type {
  AnalyticsRow,
  DashboardData,
  DecisionRow,
  EcosystemProductRow,
  MetricRow,
  TerminalProof,
  TrajectoryRow,
} from "../components/types";
import { ANALYTIC_COLUMNS } from "./proof/metrics";
import { SUBJECT_LABEL, listClaims } from "./proof/claims";
import { lireIntegrite } from "./integrity";
import type { ClaimState } from "./proof/types";
import { filtrerDemo } from "./proof/demo";
import { fetchShippedCommits } from "./github";
import { fetchUptimeStatus } from "./uptime";
import { fetchEcosystemHealth } from "./ecosystem";
import { createPublicClient } from "./supabase/public";

const VIDE: Omit<
  DashboardData,
  "commits" | "uptime" | "gateways" | "proofStates" | "proofs" | "integrity"
> = {
  metrics: [],
  decisions: [],
  trajectory: [],
  analytics: [],
  products: [],
};

// C9-T2 : l'etat des affirmations servies, indexe par identifiant. Sert aux
// cartes de competence, qui ne proposent un lien de verification que si
// l'affirmation existe reellement. Un registre injoignable rend un objet
// vide : les cartes s'affichent alors sans lien, jamais avec un lien mort.
async function chargerPreuves(): Promise<{
  etats: Record<string, ClaimState>;
  index: TerminalProof[];
}> {
  const claims = await listClaims().catch(() => []);
  const etats: Record<string, ClaimState> = {};
  for (const c of claims) {
    etats[c.row.id] = c.state;
  }
  // C10-T11 : le meme chargement sert la commande `proof` du terminal. Une
  // seconde requete pour les memes lignes couterait un aller-retour de base
  // a chaque visite, pour une commande que peu de visiteurs taperont.
  const index: TerminalProof[] = claims.map((c) => ({
    id: c.row.id,
    statement: c.row.statement,
    subject: SUBJECT_LABEL[c.row.subject_type],
    subjectRef: c.row.subject_ref,
    state: c.state,
    source: c.claim.source,
    fetchedAt: c.claim.fetchedAt,
  }));
  return { etats, index };
}

export async function chargerDonnees(): Promise<DashboardData> {
  // L5-T2 / L8-T6 / L9 : GitHub, Better Stack et les passerelles produit
  // partent en parallèle, ils ne dépendent pas de Supabase.
  const commitsPromise = fetchShippedCommits();
  const uptimePromise = fetchUptimeStatus();
  const healthPromise = fetchEcosystemHealth();
  const preuvesPromise = chargerPreuves();

  const gatewaysDe = async () =>
    (await healthPromise).results.map((r) => ({
      productSlug: r.productSlug,
      productName: r.productName,
      division: r.division,
      status: r.status,
      latencyMs: r.latencyMs,
      fetchedAt: r.fetchedAt,
      failureKind: r.failureKind,
    }));

  const supabase = createPublicClient();
  if (!supabase) {
    return {
      ...VIDE,
      commits: await commitsPromise,
      uptime: await uptimePromise,
      gateways: await gatewaysDe(),
      proofStates: (await preuvesPromise).etats,
      proofs: (await preuvesPromise).index,
      integrity: resumeIntegrite(),
    };
  }

  const [m, d, t, a, p, commits, uptime, gateways, preuves] = await Promise.all(
    [
      supabase
        .from("system_metrics")
        .select("key, value_num, value_text, unit"),
      supabase
        .from("decisions_log")
        .select("id, title, date, category, reasoning, tags")
        .eq("is_published", true)
        .order("date", { ascending: false })
        .limit(30),
      supabase
        .from("trajectory")
        .select("id, title, status, type, eta, notes")
        .limit(30),
      supabase
        .from("ecosystem_analytics")
        .select(ANALYTIC_COLUMNS)
        .order("created_at", { ascending: false })
        .limit(48),
      supabase
        .from("ecosystem_products")
        .select(
          "slug, name, division, pillar, description, status, url, position",
        )
        .order("position", { ascending: true }),
      commitsPromise,
      uptimePromise,
      gatewaysDe(),
      preuvesPromise,
    ],
  );

  // Une lecture qui échoue et une base vide donnent le même écran. Le journal
  // serveur les distingue. Cas le plus probable : le code déployé avant que la
  // migration 0003 ne soit passée, donc des colonnes de classe absentes.
  if (a.error) {
    console.error("[couche D] métriques illisibles :", a.error.message);
  }

  // Une seule ligne par métrique produit : la plus récente. Le filtrage des
  // valeurs de démonstration (C1-T5) a lieu ici, au chargement : la grille se
  // recompose au lieu de laisser une case vide.
  const parMetrique = new Map<string, AnalyticsRow>();
  for (const row of filtrerDemo((a.data as AnalyticsRow[]) ?? [])) {
    if (!parMetrique.has(row.metric)) {
      parMetrique.set(row.metric, row);
    }
  }

  return {
    metrics: (m.data as MetricRow[]) ?? [],
    decisions: (d.data as DecisionRow[]) ?? [],
    trajectory: (t.data as TrajectoryRow[]) ?? [],
    analytics: Array.from(parMetrique.values()),
    products: (p.data as EcosystemProductRow[]) ?? [],
    commits,
    uptime,
    gateways,
    proofStates: preuves.etats,
    proofs: preuves.index,
    integrity: resumeIntegrite(),
  };
}

/** C12-T2 : le resume du dernier calcul, lu depuis l'artefact versionne. */
function resumeIntegrite() {
  const rapport = lireIntegrite();
  if (!rapport) {
    return null;
  }
  return {
    executedAt: rapport.executedAt,
    ageJours: rapport.ageJours,
    perime: rapport.perime,
    reussis: rapport.controls.filter((c) => c.status === "reussi").length,
    echoues: rapport.controls.filter((c) => c.status === "echoue").length,
    nonExecutes: rapport.controls.filter((c) => c.status === "non_execute")
      .length,
  };
}

// ---------------------------------------------------------------------
// Les preuves citables (refonte du 30 octobre 2026).
//
// Une citation reprend exactement ce que le registre sert : l'énoncé, le
// sujet, la source, la date de lecture et l'adresse de vérification.
// L'empreinte est le SHA-256 de ce texte canonique, calculé ici à chaque
// rendu : elle ne prouve rien d'autre que l'intégrité de la citation
// copiée, et elle le dit.
// ---------------------------------------------------------------------

export type CitationPreuve = {
  id: string;
  enonce: string;
  sujet: string;
  source: string;
  luLe: string | null;
  etat: TerminalProof["state"];
  adresse: string;
  texte: string;
  empreinte: string;
};

export function citer(preuve: TerminalProof, origine: string): CitationPreuve {
  const adresse = `${origine}/verifier/${preuve.id}`;
  const date = preuve.fetchedAt
    ? preuve.fetchedAt.slice(0, 10)
    : "date absente";
  const texte = `Diallo, A. (${date}). ${preuve.statement} ADAMA OS, registre de preuve, ${preuve.id}. Source : ${preuve.source}. ${adresse}`;
  return {
    id: preuve.id,
    enonce: preuve.statement,
    sujet: preuve.subject,
    source: preuve.source,
    luLe: preuve.fetchedAt,
    etat: preuve.state,
    adresse,
    texte,
    empreinte: createHash("sha256").update(texte, "utf8").digest("hex"),
  };
}

/** Les preuves servies par une source vivante, les plus récentes d'abord. */
export function preuvesCitables(
  preuves: readonly TerminalProof[],
  origine: string,
  nombre = 3,
): CitationPreuve[] {
  return preuves
    .filter((p) => p.state === "real")
    .sort((a, b) => (b.fetchedAt ?? "").localeCompare(a.fetchedAt ?? ""))
    .slice(0, nombre)
    .map((p) => citer(p, origine));
}

/** La citation d'une décision d'architecture, même forme que celle d'une preuve. */
export function citerDecision(
  decision: {
    adr_id: string;
    title: string;
    date: string;
    decision?: string | null;
  },
  origine: string,
): Omit<CitationPreuve, "etat"> {
  const adresse = `${origine}/decisions/${decision.adr_id}`;
  const texte = `Diallo, A. (${decision.date}). ${decision.adr_id}, ${decision.title}. ADAMA OS, journal des décisions d’architecture. ${adresse}`;
  return {
    id: decision.adr_id,
    enonce: decision.decision ?? decision.title,
    sujet: "Décision d’architecture",
    source: "Journal des décisions, catalogue versionné dans le dépôt",
    luLe: decision.date,
    adresse,
    texte,
    empreinte: createHash("sha256").update(texte, "utf8").digest("hex"),
  };
}
