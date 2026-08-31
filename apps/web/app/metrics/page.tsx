import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { AnimatedNumber } from "../../components/animated-number";
import { createPublicClient } from "../../lib/supabase/public";
import {
  formatMetric,
  metricDecimals,
  metricLabel,
  metricSuffix,
} from "../../lib/metrics";

// L4-T13, Page Open Metrics publique.
// Lecture des métriques produit du groupe (ecosystem_analytics) via la clé
// anon, filtrée par la RLS (policy ecosystem_analytics_public_read). Server
// component : le SEO voit le contenu, et si Supabase est indisponible la page
// ne casse jamais. Aucun repli chiffré, ici comme ailleurs.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Métriques publiques, écosystème",
  description:
    "Métriques produit du groupe en accès public : relevés d'usage et de disponibilité, avec leur source et leur date.",
  alternates: { canonical: "/metrics" },
};

type AnalyticRow = {
  metric: string;
  value: number;
  period: string | null;
  source: string | null;
  division: string | null;
  product_slug: string | null;
  created_at: string;
};

async function loadMetrics(): Promise<AnalyticRow[]> {
  // Aucun repli chiffré : sans relevé, la page affiche son état vide.
  const supabase = createPublicClient();
  if (!supabase) {
    return [];
  }
  const { data } = await supabase
    .from("ecosystem_analytics")
    .select("metric, value, period, source, division, product_slug, created_at")
    .order("created_at", { ascending: false })
    .limit(120);

  return (data as AnalyticRow[]) ?? [];
}

// Date lisible, formatée en UTC pour éviter tout écart serveur / client.
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "Non disponible";
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
  const latest = new Map<string, AnalyticRow>();
  for (const row of rows) {
    if (!latest.has(row.metric)) {
      latest.set(row.metric, row);
    }
  }
  const headline = Array.from(latest.values());
  const history = rows.slice(0, 24);

  return (
    <PageShell>
      <PageIntro
        eyebrow="SUIVI / MÉTRIQUES PUBLIQUES"
        title={
          <>
            Les projets,
            <br />
            <span className="serif">en chiffres.</span>
          </>
        }
        description="Les relevés d’usage et de disponibilité publiés pour STRATA ESG et IROKO Software Group. Chaque valeur est accompagnée de sa source et de sa date."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">ACCÈS PUBLIC</span>
            <p>
              Consultez les chiffres, puis retrouvez les produits auxquels ils
              se rapportent.
            </p>
            <Link href="/ecosysteme">Explorer l’écosystème ↗</Link>
          </div>
        }
      />
      {headline.length === 0 ? (
        <section className="metrics-empty">
          <p className="portfolio-label">LES RELEVÉS</p>
          <h2>
            Pas encore de <span className="serif">données publiées.</span>
          </h2>
          <p>
            Les relevés ne sont pas disponibles pour le moment. Vous pourrez
            retrouver ici les valeurs mesurées et leur historique lorsqu’ils
            seront accessibles.
          </p>
          <Link className="portfolio-text-link" href="/ecosysteme">
            Consulter les projets <span aria-hidden="true">→</span>
          </Link>
        </section>
      ) : (
        <section
          className="metric-grid"
          aria-label="Dernières valeurs publiées"
        >
          {headline.map((row) => (
            <article className="metric-tile" key={row.metric}>
              <p className="portfolio-label">{metricLabel(row.metric)}</p>
              <AnimatedNumber
                value={row.value}
                decimals={metricDecimals(row.value)}
                suffix={metricSuffix(row.metric)}
                className="metric-value"
              />
              {row.period && <p className="metric-period">{row.period}</p>}
              <div className="metric-provenance">
                <p>{row.product_slug ?? "Écosystème"}</p>
                <p>Source : {row.source ?? "Non renseignée"}</p>
                <time dateTime={row.created_at}>
                  {formatDate(row.created_at)}
                </time>
              </div>
            </article>
          ))}
        </section>
      )}
      {history.length > 0 && (
        <section className="metrics-history">
          <div className="section-heading">
            <h2>
              Derniers <span className="serif">relevés.</span>
            </h2>
            <span>{history.length} relevés</span>
          </div>
          <div
            className="data-table-scroll"
            role="region"
            aria-label="Historique des relevés"
            tabIndex={0}
          >
            <table className="data-table">
              <caption className="sr-only">
                Valeurs publiées avec leur produit, source et date
              </caption>
              <thead>
                <tr>
                  <th scope="col">Indicateur</th>
                  <th scope="col">Produit</th>
                  <th scope="col">Valeur</th>
                  <th scope="col">Source</th>
                  <th scope="col">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <tr key={row.metric + row.created_at + i}>
                    <th scope="row">{metricLabel(row.metric)}</th>
                    <td>{row.product_slug ?? "Écosystème"}</td>
                    <td className="table-value">
                      {formatMetric(row.value, row.metric)}
                    </td>
                    <td>{row.source ?? "Non renseignée"}</td>
                    <td>
                      <time dateTime={row.created_at}>
                        {formatDate(row.created_at)}
                      </time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <section className="metrics-reading">
        <p className="portfolio-label">COMMENT LIRE CES CHIFFRES</p>
        <div>
          <article>
            <span>01</span>
            <h2>La valeur</h2>
            <p>
              La dernière mesure publiée pour chaque indicateur. La période est
              précisée lorsqu’elle est renseignée.
            </p>
          </article>
          <article>
            <span>02</span>
            <h2>La source</h2>
            <p>
              L’origine du relevé figure sous la valeur et dans l’historique,
              quand elle a été fournie.
            </p>
          </article>
          <article>
            <span>03</span>
            <h2>La date</h2>
            <p>
              La date indique quand le relevé a été enregistré. Elle ne
              correspond pas à une mesure en temps réel.
            </p>
          </article>
        </div>
      </section>
      <section className="page-next">
        <div>
          <p className="portfolio-label">CÔTÉ DÉVELOPPEMENT</p>
          <h2>
            Le journal de <span className="serif">l’atelier.</span>
          </h2>
          <p>
            Retrouvez les dernières contributions et les décisions de
            développement.
          </p>
        </div>
        <Link href="/#atelier" className="portfolio-button primary">
          Ouvrir l’atelier <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </PageShell>
  );
}
