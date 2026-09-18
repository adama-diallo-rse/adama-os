import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import {
  ADAMA_OS,
  CHAINE_PREUVE,
  ETATS_CONNAISSANCE,
} from "../../content/adama-os";

export const metadata: Metadata = {
  title: "Méthode de provenance intellectuelle",
  description:
    "Une méthode gratuite pour relier une idée, une expérience, une décision, une méthode et un actif vérifiable.",
  alternates: { canonical: "/methode" },
};

export default function MethodePage() {
  return (
    <PageShell className="method-page">
      <PageIntro
        eyebrow="M-001 / MÉTHODE OUVERTE"
        title={
          <>
            De l’idée à l’actif,
            <br />
            <span className="serif">sans perdre la preuve.</span>
          </>
        }
        description="Cette méthode transforme un travail réel en connaissance réutilisable. Chaque étape conserve sa date, sa source, son niveau de maturité et ce qui pourrait la contredire."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">LICENCE D’USAGE</span>
            <strong>0 €</strong>
            <p>Lire, adapter et utiliser. La connaissance reste ouverte.</p>
          </div>
        }
      />

      <ol className="method-chain" aria-label="Chaîne de provenance">
        {CHAINE_PREUVE.map((etape, index) => (
          <li key={etape.code}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <code>{etape.code}</code>
            <div>
              <h2>{etape.libelle}</h2>
              <p>{etape.question}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="method-rules">
        <div>
          <p className="portfolio-label">RÈGLE DE PUBLICATION</p>
          <h2>Une affirmation doit pouvoir être remontée.</h2>
        </div>
        <div className="method-rule-list">
          <p>Une date dit quand le fait a été observé.</p>
          <p>Une source dit où le vérifier.</p>
          <p>Une limite dit dans quel cas il ne tient plus.</p>
          <p>Un statut dit ce qui est encore une hypothèse.</p>
        </div>
      </section>

      <section className="method-states">
        <p className="portfolio-label">NIVEAU DE MATURITÉ</p>
        <div>
          {ETATS_CONNAISSANCE.map((etat) => (
            <span key={etat}>{etat}</span>
          ))}
        </div>
      </section>

      <section className="page-next">
        <div>
          <p className="portfolio-label">ARTICLE LONG / AXP-71</p>
          <h2>La preuve commence quand le système accepte d’avoir tort.</h2>
          <p>
            Quatre méthodes ont perdu leur état après vérification. L’article
            publie les décisions rejetées, les preuves cassées et ce que cette
            correction change dans la méthode.
          </p>
        </div>
        <Link
          href="/articles/methode-de-preuve"
          className="portfolio-button primary"
        >
          Lire l’article <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="page-next">
        <div>
          <p className="portfolio-label">APPLICATION</p>
          <h2>
            Un problème d’architecture à <span className="serif">relire ?</span>
          </h2>
          <p>
            La revue d’architecture applique cette chaîne à une situation
            concrète, puis rend les décisions et leurs limites explicites.
          </p>
        </div>
        <Link href="/revue-architecture" className="portfolio-button primary">
          Voir la revue d’architecture <span aria-hidden="true">→</span>
        </Link>
      </section>

      <p className="method-signature">{ADAMA_OS.signature}</p>
    </PageShell>
  );
}
