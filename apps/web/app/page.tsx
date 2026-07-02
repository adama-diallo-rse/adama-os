import { Dashboard } from "../components/dashboard";
import { RecruiterView } from "../components/recruiter-view";
import type {
  DashboardData,
  DecisionRow,
  MetricRow,
  StrataMetricRow,
  TrajectoryRow,
} from "../components/types";
import { fetchShippedCommits } from "../lib/github";
import { fetchUptimeStatus } from "../lib/uptime";
import { createPublicClient } from "../lib/supabase/public";

// Page serveur : charge les données publiques (RLS, clé anon) puis délègue
// tout le rendu au composant client Dashboard (animations, terminal Ctrl+K).
// Si Supabase est indisponible, on retombe sur des listes vides : la vitrine
// ne casse jamais.
export const dynamic = "force-dynamic";

type StrataRaw = StrataMetricRow & { created_at: string };

async function chargerDonnees(): Promise<DashboardData> {
  // L5-T1 / L8-T6 : GitHub et Better Stack partent en parallèle,
  // ils ne dépendent pas de Supabase.
  const commitsPromise = fetchShippedCommits();
  const uptimePromise = fetchUptimeStatus();

  const supabase = createPublicClient();
  if (!supabase) {
    return {
      metrics: [],
      decisions: [],
      trajectory: [],
      strata: [],
      commits: await commitsPromise,
      uptime: await uptimePromise,
    };
  }

  const [m, d, t, s, commits, uptime] = await Promise.all([
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
      .from("strata_analytics")
      .select("metric, value, period, created_at")
      .order("created_at", { ascending: false })
      .limit(24),
    commitsPromise,
    uptimePromise,
  ]);

  // Une seule ligne par métrique STRATA : la plus récente.
  const strataByMetric = new Map<string, StrataMetricRow>();
  for (const row of (s.data as StrataRaw[]) ?? []) {
    if (!strataByMetric.has(row.metric)) {
      strataByMetric.set(row.metric, {
        metric: row.metric,
        value: row.value,
        period: row.period,
      });
    }
  }

  return {
    metrics: (m.data as MetricRow[]) ?? [],
    decisions: (d.data as DecisionRow[]) ?? [],
    trajectory: (t.data as TrajectoryRow[]) ?? [],
    strata: Array.from(strataByMetric.values()),
    commits,
    uptime,
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
