import Link from "next/link";
import { PageIntro, PageShell } from "../../../components/page-shell";
import { createClient } from "../../../lib/supabase/server";
import { marquerRelu } from "./actions";
import { PROPOSITIONS } from "../../../content/decisions";
import { formatDate } from "../../../components/proof/data-class";
import { IMPACT_LABEL, PORTEE_LABEL, STATUT_LABEL } from "../../../lib/adr";
import type {
  AdrImpact,
  AdrPortee,
  AdrPreuve,
  AdrStatut,
} from "../../../lib/adr";

// =====================================================================
// C6-T8 et C7-T4, la relecture.
//
// Pourquoi cette page existe. Un ADR affirme des choses sur le travail
// d'Adama : les options qu'il a envisagees, ce qu'il a accepte de perdre, ce
// qu'une correction lui a coute. Personne d'autre que lui ne peut valider
// ces phrases, et un agent qui les ecrirait a sa place produirait une
// biographie, pas un journal.
//
// La regle est donc tenue par la base : la politique de la migration 0005
// interdit a la cle anonyme de lire un ADR non relu. Cette page est le seul
// endroit ou il se lit avant publication, et elle exige une session.
// =====================================================================

export const dynamic = "force-dynamic";

type LigneRelecture = {
  adr_id: string;
  title: string;
  date: string;
  status: AdrStatut;
  scope: AdrPortee;
  impact: AdrImpact;
  decision: string | null;
  tradeoff: string | null;
  consequence: string | null;
  context: string[] | null;
  open_questions: string[] | null;
  evidence_refs: AdrPreuve[] | null;
  reconstructed: boolean;
  reviewed_by_adama: boolean;
  revirement: { cout: string; regle: string } | null;
};

const COLONNES =
  "adr_id, title, date, status, scope, impact, decision, tradeoff, consequence, context, open_questions, evidence_refs, reconstructed, reviewed_by_adama, revirement";

export default async function RelecturePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  if (!supabase) {
    return (
      <PageShell tools={false}>
        <PageIntro
          eyebrow="ESPACE PRIVÉ / RELECTURE"
          title="Relecture des décisions"
          description="La connexion au service de données n’est pas configurée pour cet environnement."
        />
      </PageShell>
    );
  }

  const { data, error } = await supabase
    .from("decisions_log")
    .select(COLONNES)
    .not("adr_id", "is", null)
    .order("reviewed_by_adama", { ascending: true })
    .order("adr_id", { ascending: true });

  const lignes = (data as LigneRelecture[]) ?? [];
  const aRelire = lignes.filter((l) => !l.reviewed_by_adama);
  const relues = lignes.filter((l) => l.reviewed_by_adama);

  return (
    <PageShell tools={false} className="relecture-page">
      <PageIntro
        eyebrow="ESPACE PRIVÉ / RELECTURE"
        title={
          <>
            À relire <span className="serif">avant publication.</span>
          </>
        }
        description="Ces entrées affirment des choses sur ton travail : les options que tu as envisagées, ce que tu as accepté de perdre, ce qu’une correction t’a coûté. Tant qu’elles ne sont pas relues, la base interdit à la clé anonyme de les lire. Personne d’autre que toi ne peut les valider."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">EN ATTENTE</span>
            <strong>{aRelire.length}</strong>
            <p>
              entrée{aRelire.length > 1 ? "s" : ""} à relire, {relues.length}{" "}
              déjà publiée{relues.length > 1 ? "s" : ""}.
            </p>
            <Link href="/decisions">Voir le journal public ↗</Link>
          </div>
        }
      />

      {params.error ? (
        <p role="alert" className="form-error">
          {String(params.error)}
        </p>
      ) : null}
      {params.ok ? (
        <p className="relecture-ok" role="status">
          {String(params.ok)} mis à jour.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="form-error">
          Le journal n’a pas pu être chargé. Cause probable : la migration 0005
          n’est pas encore passée sur cet environnement.
        </p>
      ) : null}

      <div className="private-content relecture-liste">
        {lignes.length === 0 && !error ? (
          <p>
            Aucune entrée au format ADR en base. Passer les migrations 0005 et
            0006, puis semer le catalogue.
          </p>
        ) : null}

        {lignes.map((ligne) => (
          <article
            key={ligne.adr_id}
            className="relecture-entry"
            data-relu={ligne.reviewed_by_adama}
          >
            <header>
              <span className="adr-id">{ligne.adr_id}</span>
              <h2>{ligne.title}</h2>
              <span className="relecture-meta">
                {STATUT_LABEL[ligne.status]} · {PORTEE_LABEL[ligne.scope]} ·{" "}
                {IMPACT_LABEL[ligne.impact]} ·{" "}
                <time dateTime={ligne.date}>{formatDate(ligne.date)}</time>
              </span>
            </header>

            {ligne.reconstructed ? (
              <p className="relecture-alerte">
                Entrée reconstruite depuis le dépôt. Les options listées sont
                celles que le code démontre, pas celles que tu as forcément
                envisagées.
              </p>
            ) : null}

            <dl>
              <dt>Contexte</dt>
              <dd>{(ligne.context ?? []).join(" ")}</dd>
              <dt>Décision</dt>
              <dd>{ligne.decision}</dd>
              <dt>Compromis</dt>
              <dd>{ligne.tradeoff}</dd>
              <dt>Conséquence observée</dt>
              <dd>{ligne.consequence}</dd>
              {ligne.revirement ? (
                <>
                  <dt>Coût de la correction</dt>
                  <dd>{ligne.revirement.cout}</dd>
                  <dt>Règle qui en sort</dt>
                  <dd>{ligne.revirement.regle}</dd>
                </>
              ) : null}
              <dt>Traces</dt>
              <dd>
                {(ligne.evidence_refs ?? [])
                  .map((p) => `${p.libelle} (${p.locator})`)
                  .join(" · ")}
              </dd>
            </dl>

            {(ligne.open_questions ?? []).length > 0 ? (
              <div className="relecture-questions">
                <p className="portfolio-label">QUESTIONS À TRANCHER</p>
                <ul>
                  {(ligne.open_questions ?? []).map((q) => (
                    <li key={q.slice(0, 40)}>{q}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <form action={marquerRelu}>
              <input type="hidden" name="adr_id" value={ligne.adr_id} />
              <input
                type="hidden"
                name="vers"
                value={ligne.reviewed_by_adama ? "false" : "true"}
              />
              <button type="submit" className="portfolio-button primary">
                {ligne.reviewed_by_adama
                  ? "Retirer de la publication"
                  : "Je l’ai relue, publier"}
              </button>
            </form>
          </article>
        ))}
      </div>

      {/* C6, point 3. Quatre décisions réelles qui méritent un ADR et que
          seul Adama peut trancher. Elles ne sont pas rédigées : les rédiger
          reviendrait à décider à sa place. Elles sont posées ici pour
          qu'elles ne se perdent pas, et elles ne sont pas écrites en base. */}
      <section className="relecture-propositions">
        <p className="portfolio-label">À ARBITRER, NON RÉDIGÉES</p>
        <ul>
          {PROPOSITIONS.map((proposition) => (
            <li key={proposition.titre}>
              <h2>{proposition.titre}</h2>
              <p>{proposition.pourquoi}</p>
              <p className="relecture-question">{proposition.question}</p>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
