import { redirect } from "next/navigation";
import { Dashboard } from "../components/dashboard";
import { cartesProjet, categoriesProjet } from "../content/projets";
import type {
  AnalyticsRow,
  DashboardData,
  DecisionRow,
  EcosystemProductRow,
  MetricRow,
  TerminalProof,
  TrajectoryRow,
} from "../components/types";
import { ANALYTIC_COLUMNS } from "../lib/proof/metrics";
import { SUBJECT_LABEL, listClaims } from "../lib/proof/claims";
import { lireIntegrite } from "../lib/integrity";
import type { ClaimState } from "../lib/proof/types";
import { filtrerDemo } from "../lib/proof/demo";
import { fetchShippedCommits } from "../lib/github";
import { fetchUptimeStatus } from "../lib/uptime";
import { fetchEcosystemHealth } from "../lib/ecosystem";
import { createPublicClient } from "../lib/supabase/public";

// Page serveur : charge les données publiques (RLS, clé anon) puis délègue
// tout le rendu au composant client Dashboard (animations, terminal Ctrl+K).
// Si Supabase est indisponible, on retombe sur des listes vides : la vitrine
// ne casse jamais, et aucune valeur n'est inventée pour meubler.
export const dynamic = "force-dynamic";

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

async function chargerDonnees(): Promise<DashboardData> {
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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Les parametres sont lus AVANT le chargement : une requete qui finit en
  // redirection n'a aucune raison d'appeler GitHub, Supabase et les sondes
  // produit au prealable.
  const params = await searchParams;

  // L6-T4 puis C9-T4 : ?for=recruiter reste un alias vivant, il ne disparait
  // pas. Un lien envoye par courriel il y a trois mois doit continuer de
  // fonctionner.
  //
  // C'est une REDIRECTION et non plus une seconde vue. La vue precedente
  // rendait un parcours recruteur distinct de /recruteur : deux surfaces
  // pour le meme lecteur, qui divergeaient deja au 2 septembre 2026, l'une
  // vendant une capacite et l'autre une situation. Un alias mene au meme
  // endroit, sinon ce n'est pas un alias, c'est un second site.
  if (params.for === "recruiter") {
    redirect("/recruteur");
  }

  // C10-T9, l'alias symetrique. ?mode=technical ouvre directement la lecture
  // technique. Ce n'est pas un second site : c'est un ORDRE DE LECTURE, et
  // c'est pourquoi il redirige au lieu de rendre une seconde vue. Le
  // parametre vit dans l'URL et jamais dans le stockage du navigateur, pour
  // qu'un lien envoye a un directeur technique ouvre la bonne page chez lui
  // comme chez n'importe qui d'autre.
  if (params.mode === "technical" || params.for === "cto") {
    redirect("/technique");
  }

  const data = await chargerDonnees();

  return (
    <Dashboard
      data={data}
      cartes={cartesProjet()}
      categories={categoriesProjet()}
    />
  );
}
