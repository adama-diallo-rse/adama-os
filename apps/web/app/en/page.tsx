import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../../components/page-shell";
import { Accent, Fleche, SurTitre } from "../../components/kit/elements";
import { Symbole } from "../../components/marque/symbole";
import { ARTICLES } from "../../content/articles";
import { POSITIONNEMENT, ACTIVITE } from "../../content/profil";
import { URL_STRATA } from "../../content/parcours";

// La racine anglaise (AXP-91), alignée sur l'accueil refondu le 30 octobre
// 2026 : la même promesse, les mêmes notes de fond dans leur version
// anglaise, la même sortie vers STRATA ESG. Les registres et le cockpit
// restent en français ; la page le dit plutôt que de les traduire à moitié.
export const metadata: Metadata = {
  title: "ADAMA OS in English",
  description: POSITIONNEMENT.en,
  alternates: {
    canonical: "/en",
    languages: { "fr-FR": "/", "en-GB": "/en" },
  },
  openGraph: {
    title: "ADAMA OS in English",
    description: POSITIONNEMENT.en,
    url: "/en",
    locale: "en_GB",
  },
};

export default function PageEnglish() {
  return (
    <PageShell className="page-en" sommaire={false}>
      <div lang="en">
        <header className="page-intro en-intro">
          <div>
            <SurTitre numero="EN">A public lab and a proof cockpit</SurTitre>
            <h1 data-titre>
              The real economy, made <Accent>measurable.</Accent>
            </h1>
            <p className="page-description">{POSITIONNEMENT.en}</p>
            <p className="en-situation">
              Founder of STRATA ESG and Conhama, co-founder of Pharivo, between{" "}
              {ACTIVITE.villes.join(" and ")}.
            </p>
          </div>
          <div className="page-intro-aside en-symbole" aria-hidden="true">
            <Symbole />
          </div>
        </header>

        <section className="section-catalogue" aria-labelledby="en-notes">
          <div className="section-tete">
            <SurTitre numero="01">Read</SurTitre>
            <h2 id="en-notes">Long-form notes, in English.</h2>
            <p>Each one keeps its date, its sources and its broken proofs.</p>
          </div>
          <ul className="rubrique-objets" data-cartes>
            {ARTICLES.map((a) => (
              <li key={a.en.href} className="objet">
                <Link href={a.en.href}>
                  <span className="objet-tete">
                    <span>{a.code}</span>
                    <span>{a.lecture}</span>
                  </span>
                  <h3>{a.en.titre}</h3>
                  <Fleche />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="section-catalogue" aria-labelledby="en-suite">
          <div className="section-tete">
            <SurTitre numero="02">Go further</SurTitre>
            <h2 id="en-suite">The rest of the lab is in French.</h2>
            <p>
              Decisions, proofs, errors and the live cockpit are written and
              kept in French. They are not half translated.
            </p>
          </div>
          <div className="appel-page-actions en-actions">
            <Link href="/" className="bouton bouton-plein" lang="fr">
              Accueil en français <Fleche />
            </Link>
            <a
              href={URL_STRATA}
              target="_blank"
              rel="noopener noreferrer"
              className="bouton bouton-contour"
            >
              Use STRATA ESG <Fleche diagonale />
              <span className="sr-only"> (new tab)</span>
            </a>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
