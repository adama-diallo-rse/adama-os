import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { ARTICLES } from "../../content/articles";

// =====================================================================
// EC4, le temps « Apprendre ».
//
// Ce qui se comprend ici sans rien acheter : les notes de fond publiees,
// dans les deux langues, avec leur date. La page n'annonce aucune note a
// venir et aucune date : une liste de promesses n'apprend rien a personne.
// La base de savoir /savoir est un chantier de la vague X3 (EC11), et
// cette page ne la simule pas.
// =====================================================================

export const metadata: Metadata = {
  title: "Apprendre, les notes de fond",
  description:
    "Les notes de fond d’ADAMA OS sur la construction de systèmes pour la donnée de durabilité, publiées en français et en anglais, avec leurs décisions rejetées et leurs preuves cassées.",
  alternates: { canonical: "/articles" },
};

export default function ArticlesPage() {
  return (
    <PageShell className="articles-index-page">
      <PageIntro
        eyebrow="APPRENDRE / NOTES DE FOND"
        title={
          <>
            Ce qui se comprend ici
            <br />
            <span className="serif">sans rien acheter.</span>
          </>
        }
        description="Des notes longues sur la construction de systèmes pour la donnée de durabilité. Chacune garde ses sources, ses décisions rejetées et ce qui n’a pas tenu. Chacune existe en français et en anglais, publiées le même jour."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">PUBLIÉES</span>
            <strong>{ARTICLES.length}</strong>
            <p>
              notes, en deux langues. Aucune n’est annoncée avant d’exister.
            </p>
          </div>
        }
      />

      <ol className="articles-index">
        {ARTICLES.map((a, i) => (
          <li key={a.href}>
            <article>
              <div className="articles-index-meta">
                <span className="articles-index-numero">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{a.code}</span>
                <span>{a.serie}</span>
                <time dateTime={a.dateIso}>{a.date}</time>
              </div>
              <h2>
                <Link href={a.href}>{a.titre}</Link>
              </h2>
              <p>{a.sousTitre}</p>
              <div className="articles-index-actions">
                <Link href={a.href} className="articles-index-lire">
                  {a.lecture} <span aria-hidden="true">→</span>
                </Link>
                <Link href={a.en.href} hrefLang="en" lang="en">
                  Read in English
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ol>

      <section className="page-next">
        <div>
          <p className="portfolio-label">ENSUITE</p>
          <h2>
            Passer de la lecture <span className="serif">à la méthode.</span>
          </h2>
          <p>
            La méthode publique relie une idée, une décision, une preuve et un
            actif réutilisable.
          </p>
        </div>
        <Link href="/methode" className="portfolio-button primary">
          Construire <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}
