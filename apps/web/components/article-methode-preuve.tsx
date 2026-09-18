import Link from "next/link";
import type { ArticleMethodePreuve } from "../content/article-methode-preuve";
import { PageShell } from "./page-shell";

function SectionTexte({
  section,
}: {
  section: ArticleMethodePreuve["sectionsAvantDecisions"][number];
}) {
  return (
    <section className="evidence-article-section" id={section.id}>
      <header>
        <p className="portfolio-label">{section.repere}</p>
        <h2>{section.titre}</h2>
      </header>
      <div className="evidence-article-copy">
        {section.paragraphes.map((paragraphe) => (
          <p key={paragraphe}>{paragraphe}</p>
        ))}
      </div>
    </section>
  );
}

export function ArticleMethodePreuvePage({
  article,
}: {
  article: ArticleMethodePreuve;
}) {
  return (
    <PageShell className="evidence-article-page">
      <article lang={article.codeLangue}>
        <header className="evidence-article-hero">
          <div className="evidence-article-heading">
            <p className="portfolio-label">{article.surtitre}</p>
            <h1>{article.titre}</h1>
            <p className="evidence-article-deck">{article.sousTitre}</p>
          </div>
          <aside className="evidence-article-meta">
            <time dateTime={article.dateIso}>{article.date}</time>
            <span>{article.dureeLecture}</span>
            <Link
              href={article.autreLangue.href}
              hrefLang={article.autreLangue.hreflang}
            >
              {article.autreLangue.libelle} ↗
            </Link>
          </aside>
        </header>

        <div className="evidence-article-lead">
          {article.introduction.map((paragraphe) => (
            <p key={paragraphe}>{paragraphe}</p>
          ))}
        </div>

        {article.sectionsAvantDecisions.map((section) => (
          <SectionTexte key={section.id} section={section} />
        ))}

        <section className="evidence-article-feature" id="decisions-rejetees">
          <header>
            <p className="portfolio-label">
              {article.langue === "fr"
                ? "05 / DÉCISIONS REJETÉES"
                : "05 / REJECTED DECISIONS"}
            </p>
            <h2>{article.titreDecisions}</h2>
            {article.introductionDecisions.map((paragraphe) => (
              <p key={paragraphe}>{paragraphe}</p>
            ))}
          </header>
          <div className="evidence-decision-list">
            {article.decisions.map((decision, index) => (
              <article key={decision.titre}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{decision.titre}</h3>
                <dl>
                  <div>
                    <dt>{article.libellesDecision.croyance}</dt>
                    <dd>{decision.croyance}</dd>
                  </div>
                  <div>
                    <dt>{article.libellesDecision.rupture}</dt>
                    <dd>{decision.rupture}</dd>
                  </div>
                  <div>
                    <dt>{article.libellesDecision.suite}</dt>
                    <dd>{decision.suite}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="evidence-article-feature" id="preuves-cassees">
          <header>
            <p className="portfolio-label">
              {article.langue === "fr"
                ? "06 / PREUVES CASSÉES"
                : "06 / BROKEN EVIDENCE"}
            </p>
            <h2>{article.titrePreuves}</h2>
            {article.introductionPreuves.map((paragraphe) => (
              <p key={paragraphe}>{paragraphe}</p>
            ))}
          </header>
          <blockquote>{article.verdict}</blockquote>
          <div className="evidence-broken-grid">
            {article.preuves.map((preuve) => (
              <article key={preuve.code}>
                <div>
                  <span>{preuve.code}</span>
                  <h3>{preuve.methode}</h3>
                </div>
                <dl>
                  <div>
                    <dt>{article.libellesPreuve.retenu}</dt>
                    <dd>{preuve.retenu}</dd>
                  </div>
                  <div>
                    <dt>{article.libellesPreuve.rupture}</dt>
                    <dd>{preuve.rupture}</dd>
                  </div>
                  <div>
                    <dt>{article.libellesPreuve.manque}</dt>
                    <dd>{preuve.manque}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        {article.sectionsApresPreuves.map((section) => (
          <SectionTexte key={section.id} section={section} />
        ))}

        <section className="evidence-article-sources" id="sources">
          <div>
            <p className="portfolio-label">
              {article.langue === "fr" ? "SOURCES PUBLIQUES" : "PUBLIC SOURCES"}
            </p>
            <h2>{article.titreSources}</h2>
            <p>{article.introductionSources}</p>
          </div>
          <nav aria-label={article.titreSources}>
            {article.sources.map((source) => (
              <Link href={source.href} key={source.href}>
                {source.libelle} <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </nav>
        </section>

        <section className="page-next evidence-article-next">
          <div>
            <p className="portfolio-label">{article.appel.repere}</p>
            <h2>{article.appel.titre}</h2>
            <p>{article.appel.texte}</p>
          </div>
          <Link href={article.appel.href} className="portfolio-button primary">
            {article.appel.lien} <span aria-hidden="true">→</span>
          </Link>
        </section>
      </article>
    </PageShell>
  );
}
