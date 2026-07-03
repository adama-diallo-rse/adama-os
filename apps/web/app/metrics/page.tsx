import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@adama/ui";
import { AnimatedNumber } from "../../components/animated-number";
import { createPublicClient } from "../../lib/supabase/public";
import {
  formatMetric,
  metricDecimals,
  metricLabel,
  metricSuffix,
} from "../../lib/metrics";

// L4-T13, Page Open Metrics publique.
// Lecture des métriques produit STRATA (strata_analytics) via la clé anon,
// filtrée par la RLS (policy strata_public_read). Server component : le SEO
// voit le contenu, et si Supabase est indisponible la page ne casse jamais.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Open Metrics — STRATA",
  description:
    "Métriques produit STRATA en accès public : audits VSME, corpus RAG, uptime et usage du moteur ESG.",
  alternates: { canonical: "/metrics" },
};

type StrataRow = {
  metric: string;
  value: number;
  period: string | null;
  source: string | null;
  created_at: string;
};

// Repli affiché si la table est vide (cohérent avec la Couche D).
const FALLBACK: StrataRow[] = [
  { metric: "audits_vsme", value: 12, period: "beta", source: "engine", created_at: new Date().toISOString() },
  { metric: "docs_rag", value: 340, period: "corpus", source: "ingest", created_at: new Date().toISOString() },
  { metric: "uptime_pct", value: 99.9, period: "30j", source: "betterstack", created_at: new Date().toISOString() },
];

async function loadMetrics(): Promise<StrataRow[]> {
  const supabase = createPublicClient();
  if (!supabase) {
    return FALLBACK;
  }
  const { data } = await supabase
    .from("strata_analytics")
    .select("metric, value, period, source, created_at")
    .order("created_at", { ascending: false })
    .limit(120);

  const rows = (data as StrataRow[]) ?? [];
  return rows.length > 0 ? rows : FALLBACK;
}

// Date lisible, formatée en UTC pour éviter tout écart serveur / client.
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export default async function MetricsPage() {
  const rows = await loadMetrics();

  // Une carte par métrique : la valeur la plus récente (rows déjà triées desc).
  const latest = new Map<string, StrataRow>();
  for (const row of rows) {
    if (!latest.has(row.metric)) {
      latest.set(row.metric, row);
    }
  }
  const headline = Array.from(latest.values());
  const history = rows.slice(0, 24);

  return (
    <div className="bg-grid min-h-dvh">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8 sm:py-14">
        {/* En-tête */}
        <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Link
              href="/"
              className="font-mono text-xs uppercase tracking-[0.16em] text-emerald transition-colors hover:text-emerald-bright"
            >
              ← Adama OS
            </Link>
            <h1 className="font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Open Metrics
            </h1>
            <p className="max-w-xl font-mono text-sm text-muted">
              Métriques produit STRATA en accès public. Transparence sur l&apos;usage
              du moteur ESG, mises à jour en continu.
            </p>
          </div>
          <Badge variant="emerald" dot>
            Public
          </Badge>
        </header>

        {/* Grille des métriques (dernière valeur par métrique) */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {headline.map((row) => (
            <Card key={row.metric} className="scroll-mt-24">
              <CardContent className="py-4">
                <AnimatedNumber
                  value={row.value}
                  decimals={metricDecimals(row.value)}
                  suffix={metricSuffix(row.metric)}
                  className="font-mono text-2xl font-semibold tabular-nums text-emerald-bright"
                />
                <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-faint">
                  {metricLabel(row.metric)}
                </p>
                {row.period ? (
                  <p className="mt-0.5 font-mono text-[0.6rem] text-muted">
                    {row.period}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Journal des relevés récents */}
        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Relevés récents</CardTitle>
              <Badge variant="default">{history.length} points</Badge>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <ul>
                {history.map((row, i) => (
                  <li
                    key={`${row.metric}-${row.created_at}-${i}`}
                    className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5 last:border-b-0"
                  >
                    <span className="flex items-center gap-2 font-mono text-xs text-muted">
                      <span className="text-emerald">›</span>
                      {metricLabel(row.metric)}
                      {row.source ? (
                        <span className="text-faint"> · {row.source}</span>
                      ) : null}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-xs tabular-nums text-emerald-bright">
                        {formatMetric(row.value, row.metric)}
                      </span>
                      <span className="font-mono text-[0.6rem] text-faint">
                        {formatDate(row.created_at)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Pied de page */}
        <footer className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border pt-5 sm:flex-row sm:items-center">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-faint">
            Adama Diallo — System Architect · Strata
          </p>
          <Link
            href="/"
            className="font-mono text-[0.65rem] text-emerald transition-colors hover:text-emerald-bright"
          >
            ← retour au dashboard
          </Link>
        </footer>
      </div>
    </div>
  );
}
