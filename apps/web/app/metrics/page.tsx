import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { ClaimNumber, ClaimTile } from "../../components/proof/claim-value";
import { DataClassMark, formatDate } from "../../components/proof/data-class";
import { createPublicClient } from "../../lib/supabase/public";
import { metricLabel } from "../../lib/metrics";
import {
  ANALYTIC_COLUMNS,
  claimFromAnalytic,
  type AnalyticRow,
} from "../../lib/proof/metrics";
import { filtrerDemo, hideDemo } from "../../lib/proof/demo";
import { resolveClaimState } from "../../lib/proof/types";

// L4-T13, Page Open Metrics publique, reprise par la couche C1.
//
// La page promettait source et date pour chaque valeur, et affichait trois
// chiffres de démonstration sans les distinguer d'un relevé réel. Depuis C1,
// la classe de la donnée est inséparable de la donnée : aucune valeur ne
// s'affiche sans son marqueur, et une valeur de démonstration porte un
// cartouche plus visible qu'elle-même.
//
// Server component : le SEO voit le contenu, et si Supabase est indisponible
// la page ne casse jamais. Aucun repli chiffré, ici comme ailleurs.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Métriques publiques, écosystème",
  description:
    "Métriques produit du groupe en accès public : relevés d'usage et de disponibilité, avec leur classe de donnée, leur source et leur date.",
  alternates: { canonical: "/metrics" },
};

async function loadMetrics(): Promise<AnalyticRow[]> {
  // Aucun repli chiffré : sans relevé, la page affiche son état vide.
  const supabase = createPublicClient();
  if (!supabase) {
    return [];
  }
  const { data, error } = await supabase
    .from("ecosystem_analytics")
    .select(ANALYTIC_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(120);

  // Une lecture qui echoue et une base vide donnent le meme ecran. Ce ne sont
  // pas la meme chose : la premiere est une panne, la seconde un etat. Le
  // journal serveur les distingue, meme quand la page ne le peut pas.
  // Cas le plus probable : le code est deploye avant que la migration 0003
  // ne soit passee, et les colonnes de classe n'existent pas encore.
  if (error) {
    console.error("[metriques] lecture impossible :", error.message);
  }

  return filtrerDemo((data as AnalyticRow[]) ?? []);
}

export default async function MetricsPage() {
  const rows = await loadMetrics();
  const maintenant = new Date();

  // Une carte par métrique : la valeur la plus récente (rows déjà triées).
  const latest = new Map<string, AnalyticRow>();
  for (const row of rows) {
    if (!latest.has(row.metric)) {
      latest.set(row.metric, row);
    }
  }
  const headline = Array.from(latest.values());
  const history = rows.slice(0, 24);
  const demoMasquee = hideDemo();

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
        description="Les relevés d’usage et de disponibilité publiés pour STRATA ESG et IROKO Software Group. Chaque valeur porte sa classe, sa source et sa date. Une valeur de démonstration le dit avant de se laisser lire."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">ACCÈS PUBLIC</span>
            <p>
              Consultez les chiffres, puis retrouvez les produits auxquels ils
              se rapportent.
            </p>
            <Link href="/preuves">Voir toutes les preuves ↗</Link>
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
            {demoMasquee
              ? "Les valeurs de démonstration sont masquées sur cette version du site, et aucun relevé réel n’est disponible pour le moment."
              : "Les relevés ne sont pas disponibles pour le moment. Vous pourrez retrouver ici les valeurs mesurées et leur historique lorsqu’ils seront accessibles."}
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
              <ClaimTile
                label={metricLabel(row.metric)}
                claim={claimFromAnalytic(row)}
                valueClassName="metric-value"
                provenanceClassName="metric-provenance"
                now={maintenant}
                extra={
                  <div>
                    <dt>Produit</dt>
                    <dd>{row.product_slug ?? "Écosystème"}</dd>
                  </div>
                }
              />
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
                Valeurs publiées avec leur classe de donnée, leur produit, leur
                source et leur date
              </caption>
              <thead>
                <tr>
                  <th scope="col">Indicateur</th>
                  <th scope="col">Classe</th>
                  <th scope="col">Produit</th>
                  <th scope="col">Valeur</th>
                  <th scope="col">Source</th>
                  <th scope="col">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => {
                  const claim = claimFromAnalytic(row);
                  const state = resolveClaimState(claim, maintenant);
                  return (
                    <tr key={row.metric + row.created_at + i}>
                      <th scope="row">{metricLabel(row.metric)}</th>
                      <td>
                        <DataClassMark
                          claim={claim}
                          state={state}
                          detail={false}
                        />
                      </td>
                      <td>{row.product_slug ?? "Écosystème"}</td>
                      <td className="table-value">
                        <ClaimNumber
                          claim={claim}
                          animate={false}
                          now={maintenant}
                        />
                      </td>
                      <td>{claim.source}</td>
                      <td>
                        <time dateTime={row.created_at}>
                          {formatDate(row.created_at)}
                        </time>
                      </td>
                    </tr>
                  );
                })}
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
            <h2>La classe</h2>
            <p>
              Chaque valeur dit d’abord ce qu’elle est. <strong>Source</strong>{" "}
              pour un relevé réel, <strong>Valeur au</strong> pour un chiffre
              publié à une date passée, <strong>Démonstration</strong> pour un
              jeu d’illustration qui ne décrit rien de réel.
            </p>
          </article>
          <article>
            <span>02</span>
            <h2>La provenance</h2>
            <p>
              Sous la valeur figurent la source qui l’a servie et la méthode
              d’obtention, en une phrase. Une valeur de démonstration n’entre
              dans aucun total.
            </p>
          </article>
          <article>
            <span>03</span>
            <h2>La fraîcheur</h2>
            <p>
              La date indique quand le relevé a été enregistré. Passé sa durée
              de validité, une valeur reste lisible mais porte la mention{" "}
              <strong>Périmée</strong>. Sans relevé, rien ne s’affiche : jamais
              un zéro de remplacement.
            </p>
          </article>
        </div>
      </section>
      <section className="page-next">
        <div>
          <p className="portfolio-label">ALLER PLUS LOIN</p>
          <h2>
            Chaque affirmation, <span className="serif">vérifiable.</span>
          </h2>
          <p>
            Les chiffres ne sont qu’une partie. Les affirmations du site portent
            elles aussi leur provenance, et chacune a sa page de vérification.
          </p>
        </div>
        <Link href="/preuves" className="portfolio-button primary">
          Ouvrir l’index des preuves <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </PageShell>
  );
}
