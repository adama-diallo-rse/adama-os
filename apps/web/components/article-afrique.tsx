import Link from "next/link";
import type { ArticleAfrique } from "../content/articles-afrique";
import { PageShell } from "./page-shell";

function Contrainte({
  article,
  contrainte,
  index,
}: {
  article: ArticleAfrique;
  contrainte: ArticleAfrique["contraintes"][number];
  index: number;
}) {
  return (
    <section
      className="evidence-article-section africa-constraint"
      id={contrainte.id}
    >
      <header>
        <p className="portfolio-label">
          {String(index + 1).padStart(2, "0")} / 07
        </p>
        <h2>{contrainte.titre}</h2>
      </header>
      <div className="evidence-article-copy">
        <div className="africa-source-note">
          <p className="portfolio-label">{article.libelles.source}</p>
          <h3>{contrainte.nom}</h3>
          <p>{contrainte.consequence}</p>
        </div>

        <div className="africa-company-voice">
          <p className="portfolio-label">{article.libelles.voix}</p>
          <blockquote>{contrainte.voix}</blockquote>
        </div>

        {contrainte.paragraphes.map((paragraphe) => (
          <p key={paragraphe}>{paragraphe}</p>
        ))}

        <dl className="africa-decision-pair">
          <div>
            <dt>{article.libelles.decision}</dt>
            <dd>{contrainte.decision}</dd>
          </div>
          <div>
            <dt>{article.libelles.limite}</dt>
            <dd>{contrainte.limite}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

export function ArticleAfriquePage({ article }: { article: ArticleAfrique }) {
  const registreTitre =
    article.langue === "fr" ? "Registre privé" : "Private register";
  const compteTitre = article.langue === "fr" ? "Ce qui compte" : "Counts";
  const exclutTitre =
    article.langue === "fr" ? "Ce qui ne compte pas" : "Does not count";

  return (
    <PageShell className="evidence-article-page africa-article-page">
      <article lang={article.codeLangue}>
        <header className="evidence-article-hero">
          <div className="evidence-article-heading">
            <p className="portfolio-label">{article.code}</p>
            <h1>{article.titre}</h1>
            <p className="evidence-article-deck">{article.sousTitre}</p>
          </div>
          <aside className="evidence-article-meta">
            <time dateTime={article.dateIso}>{article.date}</time>
            <span>{article.lecture}</span>
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

        <section className="evidence-article-feature africa-index">
          <header>
            <p className="portfolio-label">
              {article.langue === "fr"
                ? "01 À 07 / TERRAIN ET SYSTÈME"
                : "01 TO 07 / FIELD AND SYSTEM"}
            </p>
            <h2>{article.titreContraintes}</h2>
            {article.introductionContraintes.map((paragraphe) => (
              <p key={paragraphe}>{paragraphe}</p>
            ))}
          </header>
          <nav aria-label={article.titreContraintes}>
            {article.contraintes.map((contrainte, index) => (
              <a href={`#${contrainte.id}`} key={contrainte.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {contrainte.nom}
              </a>
            ))}
          </nav>
        </section>

        {article.contraintes.map((contrainte, index) => (
          <Contrainte
            article={article}
            contrainte={contrainte}
            index={index}
            key={contrainte.id}
          />
        ))}

        <section className="evidence-article-feature" id="methode">
          <header>
            <p className="portfolio-label">{article.methode.repere}</p>
            <h2>{article.methode.titre}</h2>
            {article.methode.introduction.map((paragraphe) => (
              <p key={paragraphe}>{paragraphe}</p>
            ))}
          </header>
          <ol className="africa-method-grid">
            {article.methode.etapes.map((etape, index) => (
              <li key={etape.titre}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{etape.titre}</h3>
                <p>{etape.texte}</p>
              </li>
            ))}
          </ol>
        </section>

        {article.traduction ? (
          <section className="evidence-article-feature" id="traduction">
            <header>
              <p className="portfolio-label">{article.traduction.repere}</p>
              <h2>{article.traduction.titre}</h2>
              <p>{article.traduction.introduction}</p>
            </header>
            <div className="africa-translation-grid">
              {article.traduction.choix.map((choix) => (
                <article key={choix.terme}>
                  <p>{choix.terme}</p>
                  <h3>{choix.choix}</h3>
                  <span>{choix.raison}</span>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="evidence-article-feature" id="resonance">
          <header>
            <p className="portfolio-label">{article.resonance.repere}</p>
            <h2>{article.resonance.titre}</h2>
            {article.resonance.introduction.map((paragraphe) => (
              <p key={paragraphe}>{paragraphe}</p>
            ))}
          </header>
          <div className="africa-signal-list">
            {article.resonance.signaux.map((signal, index) => (
              <article key={signal.nom}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{signal.nom}</h3>
                <dl>
                  <div>
                    <dt>{compteTitre}</dt>
                    <dd>{signal.compte}</dd>
                  </div>
                  <div>
                    <dt>{exclutTitre}</dt>
                    <dd>{signal.exclut}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
          <div className="africa-register">
            <div>
              <p className="portfolio-label">{registreTitre}</p>
              <ul>
                {article.resonance.registre.map((champ) => (
                  <li key={champ}>{champ}</li>
                ))}
              </ul>
            </div>
            <p>{article.resonance.decision}</p>
          </div>
        </section>

        <section
          className="evidence-article-feature africa-referral"
          id="frontiere"
        >
          <header>
            <p className="portfolio-label">{article.clause.repere}</p>
            <h2>{article.clause.titre}</h2>
          </header>
          <blockquote>{article.clause.texte}</blockquote>
          <p>{article.clause.note}</p>
        </section>

        <section className="evidence-article-section" id="conclusion">
          <header>
            <p className="portfolio-label">{article.conclusion.repere}</p>
            <h2>{article.conclusion.titre}</h2>
          </header>
          <div className="evidence-article-copy">
            {article.conclusion.paragraphes.map((paragraphe) => (
              <p key={paragraphe}>{paragraphe}</p>
            ))}
          </div>
        </section>

        <section className="page-next evidence-article-next">
          <div>
            <p className="portfolio-label">
              {article.langue === "fr"
                ? "PUBLICATION SUIVANTE"
                : "COMPANION PUBLICATION"}
            </p>
            <h2>{article.autrePublication.libelle}</h2>
          </div>
          <Link
            href={article.autrePublication.href}
            className="portfolio-button primary"
          >
            {article.langue === "fr" ? "Continuer" : "Continue"}{" "}
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </article>
    </PageShell>
  );
}
