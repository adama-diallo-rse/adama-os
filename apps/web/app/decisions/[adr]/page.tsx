import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TrackView } from "../../../components/analytics-tracker";
import { EVENT_ADR_OPENED } from "../../../lib/analytics-events";
import { PageShell } from "../../../components/page-shell";
import { AdrChain } from "../../../components/adr-chain";
import { formatDate } from "../../../components/proof/data-class";
import { principeDe } from "../../../content/principes";
import {
  IMPACT_LABEL,
  PORTEE_LABEL,
  REVERSIBILITE_LABEL,
  STATUT_DESCRIPTION,
  STATUT_LABEL,
  getAdr,
  listAdr,
} from "../../../lib/adr";
import { absoluteUrl } from "../../../lib/site";

// =====================================================================
// C6-T4, une decision d'architecture.
//
// Sept blocs, plus la chaine decision, code, resultat. Le bloc COMPROMIS est
// le plus important de la page : c'est lui qui separe un ingenieur d'un
// executant. Il se voit, sans etre alarmiste et sans etre rouge.
//
// C14-T5, maillage : la page renvoie vers le principe qu'elle gouverne, et
// la page des principes renvoie ici. Le maillage fonctionne dans les deux
// sens ou il ne sert a rien.
// =====================================================================

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ adr: string }>;
}): Promise<Metadata> {
  const { adr } = await params;
  const decision = await getAdr(adr);
  if (!decision) {
    return { title: "Décision introuvable" };
  }
  return {
    title: `${decision.adr_id}, ${decision.title}`,
    description: decision.decision ?? decision.title,
    alternates: { canonical: `/decisions/${decision.adr_id}` },
    openGraph: {
      title: `${decision.adr_id} · ${decision.title}`,
      description: decision.decision ?? decision.title,
      url: `/decisions/${decision.adr_id}`,
      siteName: "Adama OS",
      locale: "fr_FR",
      type: "article",
    },
  };
}

export default async function DecisionPage({
  params,
}: {
  params: Promise<{ adr: string }>;
}) {
  const { adr } = await params;

  // Une seule lecture du journal : la decision et ses deux voisines viennent
  // de la meme liste. Passer par getAdr ferait une seconde requete pour
  // retrouver ce que celle-ci contient deja.
  const toutes = await listAdr();
  const decision = toutes.find((d) => d.adr_id === adr);
  if (!decision) {
    notFound();
  }

  const remplacee = decision.supersedes
    ? (toutes.find((d) => d.adr_id === decision.supersedes) ?? null)
    : null;
  const successeur = decision.remplacePar
    ? (toutes.find((d) => d.adr_id === decision.remplacePar) ?? null)
    : null;
  const principe = principeDe(decision.adr_id);

  const retenues = (decision.options ?? []).filter(
    (o) => o.verdict === "retenue",
  );
  const ecartees = (decision.options ?? []).filter(
    (o) => o.verdict === "ecartee",
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${decision.adr_id}, ${decision.title}`,
    datePublished: decision.date,
    dateModified: decision.updated_at,
    url: absoluteUrl(`/decisions/${decision.adr_id}`),
    inLanguage: "fr-FR",
    author: { "@type": "Person", name: "Adama Diallo" },
    abstract: decision.decision ?? undefined,
  };

  return (
    <PageShell className="adr-page">
      <TrackView
        event={EVENT_ADR_OPENED}
        properties={{ adr: decision.adr_id }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <header className="adr-head">
        <p className="portfolio-label">
          <Link href="/decisions">JOURNAL DES DÉCISIONS</Link>{" "}
          <span aria-hidden="true">/</span> {decision.adr_id}
        </p>
        <h1>{decision.title}</h1>
        <dl className="adr-meta" data-statut={decision.status}>
          <div>
            <dt>Statut</dt>
            <dd>
              {STATUT_LABEL[decision.status]}
              <span>{STATUT_DESCRIPTION[decision.status]}</span>
            </dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>
              <time dateTime={decision.date}>{formatDate(decision.date)}</time>
            </dd>
          </div>
          <div>
            <dt>Portée</dt>
            <dd>{PORTEE_LABEL[decision.scope]}</dd>
          </div>
          <div>
            <dt>Impact</dt>
            <dd>{IMPACT_LABEL[decision.impact]}</dd>
          </div>
          <div>
            <dt>Réversibilité</dt>
            <dd>{REVERSIBILITE_LABEL[decision.reversibility]}</dd>
          </div>
        </dl>

        {decision.status === "remplace" && successeur ? (
          <p className="adr-remplace" role="note">
            <strong>Cette décision a été remplacée.</strong> Elle reste en ligne
            et datée : c’est la trace du raisonnement qui a mené ailleurs.{" "}
            <Link href={`/decisions/${successeur.adr_id}`}>
              Lire {successeur.adr_id}, {successeur.title}{" "}
              <span aria-hidden="true">→</span>
            </Link>
          </p>
        ) : null}

        {remplacee ? (
          <p className="adr-succede" role="note">
            Cette décision en remplace une autre.{" "}
            <Link href={`/decisions/${remplacee.adr_id}`}>
              Lire {remplacee.adr_id}, {remplacee.title}{" "}
              <span aria-hidden="true">→</span>
            </Link>
          </p>
        ) : null}

        {decision.reconstructed ? (
          <p className="adr-reconstruit" role="note">
            <strong>Entrée reconstruite à partir du dépôt.</strong> Les options
            listées ci-dessous sont celles que le code démontre. Elles ne
            prétendent pas décrire ce qui a été envisagé à l’époque, et les
            questions restées ouvertes sont écrites en fin de page.
          </p>
        ) : null}
      </header>

      <div className="adr-corps">
        <section className="adr-bloc">
          <h2>Contexte</h2>
          {(decision.context ?? []).map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </section>

        <section className="adr-bloc">
          <h2>Options envisagées</h2>
          <ul className="adr-options">
            {retenues.map((o) => (
              <li key={o.option} data-verdict="retenue">
                <span className="adr-verdict">Retenue</span>
                <p className="adr-option">{o.option}</p>
                <p>{o.motif}</p>
              </li>
            ))}
            {ecartees.map((o) => (
              <li key={o.option} data-verdict="ecartee">
                <span className="adr-verdict">Écartée</span>
                <p className="adr-option">{o.option}</p>
                <p>{o.motif}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="adr-bloc adr-bloc--decision">
          <h2>Décision</h2>
          <p className="adr-decision">{decision.decision}</p>
        </section>

        <section className="adr-bloc">
          <h2>Raisonnement</h2>
          {decision.rationale ? (
            <dl className="adr-axes">
              <div>
                <dt>Technique</dt>
                <dd>{decision.rationale.technique}</dd>
              </div>
              <div>
                <dt>Réglementaire</dt>
                <dd>{decision.rationale.reglementaire}</dd>
              </div>
              <div>
                <dt>Économique</dt>
                <dd>{decision.rationale.economique}</dd>
              </div>
            </dl>
          ) : (
            <p className="adr-raisonnement">{decision.reasoning}</p>
          )}
        </section>

        {/* Le bloc le plus important de la page. */}
        <section className="adr-bloc adr-bloc--compromis">
          <h2>Compromis accepté</h2>
          <p className="adr-compromis">{decision.tradeoff}</p>
        </section>

        <AdrChain
          decision={decision.decision ?? decision.title}
          preuves={decision.evidence_refs ?? []}
          consequence={decision.consequence ?? ""}
        />

        {decision.revirement ? (
          <section className="adr-bloc adr-bloc--revirement">
            <h2>Ce sur quoi je suis revenu</h2>
            <p>{decision.revirement.croyais}</p>
            <p>{decision.revirement.invalide}</p>
            <p className="turn-regle">{decision.revirement.regle}</p>
            <Link className="portfolio-text-link" href="/revirements">
              Lire les revirements en entier <span aria-hidden="true">→</span>
            </Link>
          </section>
        ) : null}

        {principe ? (
          <section className="adr-bloc adr-bloc--principe">
            <h2>Le principe que cette décision gouverne</h2>
            <p className="turn-regle">{principe.phrase}</p>
            <Link className="portfolio-text-link" href="/principes">
              Voir d’où viennent les six principes{" "}
              <span aria-hidden="true">→</span>
            </Link>
          </section>
        ) : null}

        {(decision.open_questions ?? []).length > 0 ? (
          <section className="adr-bloc adr-bloc--questions">
            <h2>Questions ouvertes</h2>
            <p className="case-bloc-intro">
              Ce que le dépôt ne démontre pas, et que seul Adama peut trancher.
              Elles sont écrites plutôt que comblées.
            </p>
            <ul>
              {(decision.open_questions ?? []).map((q) => (
                <li key={q.slice(0, 40)}>{q}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <section className="page-next">
        <div>
          <p className="portfolio-label">LE JOURNAL COMPLET</p>
          <h2>
            Toutes les décisions, <span className="serif">au même format.</span>
          </h2>
          <p>
            Elles se comparent : même gabarit, même vocabulaire, même exigence
            de trace.
          </p>
        </div>
        <Link href="/decisions" className="portfolio-button primary">
          Revenir au journal <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}
