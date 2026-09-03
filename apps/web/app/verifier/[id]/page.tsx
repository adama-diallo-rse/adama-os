import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TrackView } from "../../../components/analytics-tracker";
import { EVENT_PROOF_VERIFY } from "../../../lib/analytics-events";
import { PageShell } from "../../../components/page-shell";
import {
  DataClassMark,
  formatDate,
  formatDateTime,
} from "../../../components/proof/data-class";
import { ProofLineage } from "../../../components/proof/lineage";
import {
  EVIDENCE_KIND_LABEL,
  SUBJECT_LABEL,
  VERIFIABLE_LABEL,
  getClaim,
  listClaims,
} from "../../../lib/proof/claims";
import {
  CLAIM_STATE_DESCRIPTION,
  formatDuration,
  timeToStale,
} from "../../../lib/proof/types";

// =====================================================================
// C2-T3, la page de vérification d'une affirmation.
//
// URL permanente, citable dans un CV ou dans un message. L'identifiant n'est
// jamais réattribué : une adresse partagée aujourd'hui doit répondre la même
// chose dans deux ans.
//
// Elle répond, dans cet ordre, aux questions qu'un lecteur sceptique se pose
// vraiment : qu'est-ce qui est affirmé, de quelle nature est cette
// information, sur quoi elle repose, quand ça a été constaté, qui peut le
// refaire. La posture n'est pas de convaincre, c'est de dire : ne me croyez
// pas, vérifiez.
//
// Un identifiant inconnu répond 404, jamais une page vide. Une affirmation
// sans preuve n'existe pas ici non plus : lib/proof/claims.ts l'écarte avant
// que cette page ne la voie.
// =====================================================================

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const proof = await getClaim(id);
  if (!proof) {
    return { title: "Affirmation inconnue", robots: { index: false } };
  }
  return {
    title: `Vérifier : ${proof.row.statement}`,
    description: `Provenance, preuves, méthode et date d’observation de l’affirmation « ${proof.row.statement} ».`,
    alternates: { canonical: `/verifier/${proof.row.id}` },
    robots: { index: proof.row.visibility === "public", follow: true },
  };
}

export default async function VerifierPage({ params }: Params) {
  const { id } = await params;
  const maintenant = new Date();
  const proof = await getClaim(id, maintenant);

  if (!proof) {
    notFound();
  }

  const { row, evidence, claim, state } = proof;
  const restant = timeToStale(claim, maintenant);
  const validite = claim.maxAgeSeconds ?? null;
  const partVerte =
    validite && restant !== null
      ? Math.max(0, Math.min(1, restant / validite))
      : null;

  const autres = (await listClaims({ now: maintenant }))
    .filter((c) => c.row.id !== row.id)
    .slice(0, 3);

  return (
    <PageShell>
      {/* C13-T1. Mesure combien de visiteurs prennent la peine de verifier
          une affirmation. Emis a l'affichage, pas au clic : ce qu'on veut
          savoir, c'est qui est ALLE verifier. */}
      <TrackView event={EVENT_PROOF_VERIFY} properties={{ claim: row.id }} />
      <header className="page-intro">
        <div>
          <p className="portfolio-label">
            VÉRIFICATION / {SUBJECT_LABEL[row.subject_type].toUpperCase()}
            {row.subject_ref ? ` · ${row.subject_ref}` : ""}
          </p>
          <blockquote className="proof-quote">
            <p>{row.statement}</p>
            <footer>
              <DataClassMark claim={claim} state={state} />
            </footer>
          </blockquote>
          <p className="page-description">
            {CLAIM_STATE_DESCRIPTION[state]} Cette page montre comment
            l’information a été obtenue, quand elle a été constatée pour la
            dernière fois, et qui peut refaire la vérification.
          </p>
        </div>
      </header>

      <div className="proof-page">
        <div className="proof-page-main">
          <section aria-labelledby="preuves-titre">
            <div className="proof-section-title">
              <h2 id="preuves-titre">Les preuves</h2>
              <span>
                {evidence.length} élément{evidence.length > 1 ? "s" : ""}
              </span>
            </div>
            <ol className="proof-evidence-list">
              {evidence.map((e) => (
                <li className="proof-evidence" key={e.id}>
                  <div className="proof-evidence-kind">
                    <strong>{EVIDENCE_KIND_LABEL[e.kind]}</strong>
                    {e.source}
                  </div>
                  <div className="proof-evidence-body">
                    <p className="proof-evidence-method">{e.method}</p>
                    {e.locator ? (
                      /^https?:\/\//.test(e.locator) ? (
                        <a
                          className="proof-evidence-locator"
                          href={e.locator}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {e.locator} <span aria-hidden="true">↗</span>
                        </a>
                      ) : (
                        <span className="proof-evidence-locator">
                          {e.locator}
                        </span>
                      )
                    ) : null}
                    {e.observed_at && e.observed_result ? (
                      <>
                        <code className="proof-evidence-result">
                          {e.observed_result}
                        </code>
                        <p className="proof-evidence-method">
                          Constaté le{" "}
                          <time dateTime={e.observed_at}>
                            {formatDateTime(e.observed_at)}
                          </time>
                          . Vérifiable par {VERIFIABLE_LABEL[e.verifiable_by]}.
                        </p>
                      </>
                    ) : (
                      <p className="proof-evidence-method">
                        Preuve déclarée, jamais observée à ce jour. Rien n’est
                        affiché à la place d’une observation qui n’a pas eu
                        lieu. Vérifiable par {VERIFIABLE_LABEL[e.verifiable_by]}
                        .
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="lignage-titre">
            <div className="proof-section-title">
              <h2 id="lignage-titre">De la source à l’affirmation</h2>
              <span>aucun nœud fictif</span>
            </div>
            <ProofLineage proof={proof} now={maintenant} />
          </section>

          {autres.length > 0 ? (
            <section aria-labelledby="autres-titre">
              <div className="proof-section-title">
                <h2 id="autres-titre">Autres affirmations vérifiables</h2>
                <span>
                  <Link className="proof-verify-link" href="/preuves">
                    tout voir <span aria-hidden="true">→</span>
                  </Link>
                </span>
              </div>
              <ul className="proof-index">
                {autres.map((c) => (
                  <li className="proof-index-row" key={c.row.id}>
                    <Link
                      className="proof-index-statement"
                      href={`/verifier/${c.row.id}`}
                    >
                      {c.row.statement}
                    </Link>
                    <span className="proof-index-subject">
                      {SUBJECT_LABEL[c.row.subject_type]}
                    </span>
                    <DataClassMark
                      claim={c.claim}
                      state={c.state}
                      detail={false}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="proof-aside">
          <div>
            <h2>Fraîcheur</h2>
            <div className="proof-freshness">
              <strong>
                {claim.fetchedAt
                  ? `Observée le ${formatDate(claim.fetchedAt)}`
                  : "Jamais observée"}
              </strong>
              {validite ? (
                <>
                  <span>
                    Durée de validité déclarée : {formatDuration(validite)}.
                  </span>
                  {partVerte !== null ? (
                    <span
                      className={`proof-gauge${
                        restant !== null && restant <= 0
                          ? " proof-gauge--stale"
                          : ""
                      }`}
                      aria-hidden="true"
                    >
                      <span
                        style={{ width: `${Math.round(partVerte * 100)}%` }}
                      />
                    </span>
                  ) : null}
                  <span>
                    {restant === null
                      ? "Fraîcheur non calculable sans observation."
                      : restant > 0
                        ? `Encore valable ${formatDuration(restant)}.`
                        : `Périmée depuis ${formatDuration(-restant)}.`}
                  </span>
                </>
              ) : (
                <span>
                  Aucune durée de validité déclarée : cette affirmation ne
                  périme pas d’elle-même.
                </span>
              )}
            </div>
          </div>

          <div>
            <h2>Qui peut vérifier</h2>
            <div className="proof-freshness">
              {Array.from(new Set(evidence.map((e) => e.verifiable_by))).map(
                (v) => (
                  <span key={v}>Par {VERIFIABLE_LABEL[v]}.</span>
                ),
              )}
            </div>
          </div>

          <div>
            <h2>Adresse permanente</h2>
            <div className="proof-freshness">
              <span>
                <code>/verifier/{row.id}</code>
              </span>
              <span>
                Cet identifiant n’est jamais réattribué. Une adresse citée dans
                un CV ou un message reste valable.
              </span>
            </div>
          </div>

          <div>
            <h2>Aller plus loin</h2>
            <div className="proof-freshness">
              <Link className="proof-verify-link" href="/preuves">
                Index des preuves <span aria-hidden="true">→</span>
              </Link>
              <Link className="proof-verify-link" href="/metrics">
                Métriques publiques <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
