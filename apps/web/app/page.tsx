import { Dashboard } from "../components/dashboard";
import { RecruiterView } from "../components/recruiter-view";
import type {
  AnalyticsRow,
  DashboardData,
  DecisionRow,
  EcosystemProductRow,
  MetricRow,
  TrajectoryRow,
} from "../components/types";
import { fetchShippedCommits } from "../lib/github";
import { fetchUptimeStatus } from "../lib/uptime";
import { fetchEcosystemHealth } from "../lib/ecosystem";
import { createPublicClient } from "../lib/supabase/public";

// Page serveur : charge les données publiques (RLS, clé anon) puis délègue
// tout le rendu au composant client Dashboard (animations, terminal Ctrl+K).
// Si Supabase est indisponible, on retombe sur des listes vides : la vitrine
// ne casse jamais, et aucune valeur n'est inventée pour meubler.
export const dynamic = "force-dynamic";

type AnalyticsRaw = AnalyticsRow & { created_at: string };

const VIDE: Omit<DashboardData, "commits" | "uptime" | "gateways"> = {
  metrics: [],
  decisions: [],
  trajectory: [],
  analytics: [],
  products: [],
};

async function chargerDonnees(): Promise<DashboardData> {
  // L5-T2 / L8-T6 / L9 : GitHub, Better Stack et les passerelles produit
  // partent en parallèle, ils ne dépendent pas de Supabase.
  const commitsPromise = fetchShippedCommits();
  const uptimePromise = fetchUptimeStatus();
  const healthPromise = fetchEcosystemHealth();

  const gatewaysDe = async () =>
    (await healthPromise).results.map((r) => ({
      productSlug: r.productSlug,
      productName: r.productName,
      division: r.division,
      status: r.status,
      latencyMs: r.latencyMs,
      fetchedAt: r.fetchedAt,
    }));

  const supabase = createPublicClient();
  if (!supabase) {
    return {
      ...VIDE,
      commits: await commitsPromise,
      uptime: await uptimePromise,
      gateways: await gatewaysDe(),
    };
  }

  const [m, d, t, a, p, commits, uptime, gateways] = await Promise.all([
    supabase.from("system_metrics").select("key, value_num, value_text, unit"),
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
      .select("metric, value, period, division, product_slug, created_at")
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
  ]);

  // Une seule ligne par métrique produit : la plus récente.
  const parMetrique = new Map<string, AnalyticsRow>();
  for (const row of (a.data as AnalyticsRaw[]) ?? []) {
    if (!parMetrique.has(row.metric)) {
      parMetrique.set(row.metric, {
        metric: row.metric,
        value: row.value,
        period: row.period,
        division: row.division,
        product_slug: row.product_slug,
      });
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
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [data, params] = await Promise.all([chargerDonnees(), searchParams]);

  // L6-T4 : ?for=recruiter → layout simplifié et imprimable.
  if (params.for === "recruiter") {
    return <RecruiterView data={data} />;
  }

  return <Dashboard data={data} />;
}
