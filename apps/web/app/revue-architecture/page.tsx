import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import {
  CLAUSE_RENVOI,
  FORMATS_REVUE,
  RAPPORT_REVUE,
  VERROUS,
} from "../../content/conseil";
import { URL_STRATA } from "../../content/parcours";

// =====================================================================
// EG2, AXP-60, la revue d'architecture.
//
// Le rapport en sept parties et les trois formats viennent de la branche
// EG. Aucun prix ici : il est ecrit dans la proposition, apres
// qualification, et la proposition ne part qu'une fois l'assurance EK2
// souscrite. Avant, une demande se date, elle ne se vend pas.
// =====================================================================

export const metadata: Metadata = {
  title: "Revue d’architecture",
  description:
    "Relecture structurée d’un système de donnée, de preuve, d’automatisation ou d’intelligence artificielle appliqué à l’ESG.",
  alternates: { canonical: "/revue-architecture" },
};

export default function RevueArchitecturePage() {
  const assurance = VERROUS.assurance;
  return (
    <PageShell className="review-page conseil-page">
      <PageIntro
        eyebrow="TRAVAILLER ENSEMBLE / REVUE D’ARCHITECTURE"
        title={
          <>
            Voir le système
            <br />
            <span className="serif">avant d’ajouter un outil.</span>
          </>
        }
        description="Une lecture structurée de votre architecture de donnée, de preuve ou d’automatisation. La revue cherche les frontières floues, les dépendances cachées et les affirmations impossibles à vérifier, puis dit dans quel ordre agir."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">LE RAPPORT</span>
            <strong>7</strong>
            <p>
              parties, dont la première dit ce qui n’a pas été lu. Sans elle, le
              premier angle mort devient une faute.
            </p>
          </div>
        }
      />

      <section className="review-fit">
        <div>
          <p className="portfolio-label">C’EST UTILE SI</p>
          <h2>
            Le système fonctionne, mais personne ne peut l’expliquer simplement.
          </h2>
        </div>
        <ul>
          <li>Les données circulent sans propriétaire clair.</li>
          <li>Les réponses générées ne remontent pas jusqu’à leurs sources.</li>
          <li>Les outils se multiplient plus vite que les décisions.</li>
          <li>Une exigence ESG se transforme en travail manuel permanent.</li>
        </ul>
      </section>

      <section className="review-output revue-rapport">
        <p className="portfolio-label">CE QUE VOUS RECEVEZ, EN SEPT PARTIES</p>
        <ol>
          {RAPPORT_REVUE.map((partie, index) => (
            <li key={partie.titre}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{partie.titre}</h3>
                <p>{partie.raison}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="revue-formats" aria-labelledby="formats-titre">
        <div className="revue-formats-tete">
          <p className="portfolio-label">TROIS FORMATS</p>
          <h2 id="formats-titre">
            Le périmètre d’abord,{" "}
            <span className="serif">la durée ensuite.</span>
          </h2>
          <p>
            Le prix est écrit dans la proposition, avec le périmètre exact, ce
            qui en est exclu et le livrable. Il ne se négocie pas en séance.
          </p>
        </div>
        <ol>
          {FORMATS_REVUE.map((f) => (
            <li key={f.code}>
              <span className="revue-format-duree">{f.duree}</span>
              <h3>{f.titre}</h3>
              <p>{f.perimetre}</p>
              <small>{f.ouvre}</small>
            </li>
          ))}
        </ol>
      </section>

      {!assurance.leve ? (
        <section className="conseil-verrou-bloc" aria-labelledby="verrou-titre">
          <span className="conseil-verrou-code">{assurance.code}</span>
          <div>
            <h2 id="verrou-titre">
              On ne vend pas encore. <span className="serif">On date.</span>
            </h2>
            <p>
              Aucune revue n’est proposée avant la souscription de{" "}
              {assurance.objet} qui la couvre. Un avis d’architecte suivi par un
              client engage la responsabilité de celui qui le donne. Une demande
              reçue maintenant est lue, qualifiée et datée, et sa réponse écrite
              dit à partir de quand une proposition peut partir.
            </p>
          </div>
        </section>
      ) : null}

      <section className="review-boundary">
        <div>
          <p className="portfolio-label">FRONTIÈRE</p>
          <h2>
            ADAMA OS explique la construction. STRATA ESG livre le logiciel.
          </h2>
        </div>
        <p>
          {CLAUSE_RENVOI} Si votre besoin est déjà couvert par un logiciel
          existant, la conclusion peut être de ne rien construire ici.
        </p>
        <a href={URL_STRATA} target="_blank" rel="noopener noreferrer">
          Voir STRATA ESG ↗
        </a>
      </section>

      <section className="page-next">
        <div>
          <p className="portfolio-label">PREMIER ÉCHANGE</p>
          <h2>
            Décrivez le problème,{" "}
            <span className="serif">pas la solution.</span>
          </h2>
          <p>
            Le formulaire commun vous range en quatre questions, applique la
            règle d’acceptation sous vos yeux, et date votre demande.
          </p>
        </div>
        <Link
          href="/travaillez-avec-moi?porte=donnee#demande"
          className="portfolio-button primary"
        >
          Soumettre un problème <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}
