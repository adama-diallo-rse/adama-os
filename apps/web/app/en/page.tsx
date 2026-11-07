import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../../components/page-shell";
import { Fleche, SurTitre } from "../../components/kit/elements";
import { HeroStrates } from "../../components/accueil/hero-art";
import { Piliers } from "../../components/accueil/piliers";
import { CONTACT_EMAIL } from "../../components/types";
import { ARTICLES } from "../../content/articles";
import { PILIERS_EN, TITRE_HERO_EN } from "../../content/accueil";
import { POSITIONNEMENT, ACTIVITE } from "../../content/profil";
import { URL_STRATA } from "../../content/parcours";

// La racine anglaise (AXP-91), réalignée le 7 novembre 2026 sur l'accueil
// de la seconde passe : les trois verbes, la figure en strates, les trois
// métiers, puis les notes de fond dans leur version anglaise. Les registres
// et le cockpit restent en français ; la page le dit plutôt que de les
// traduire à moitié.
export const metadata: Metadata = {
  title: "ADAMA OS in English",
  description: POSITIONNEMENT.en,
  alternates: {
    canonical: "/en",
    languages: { "fr-FR": "/", "en-GB": "/en" },
  },
  openGraph: {
    title: "ADAMA OS | Build. Prove. Pass on.",
    description: POSITIONNEMENT.en,
    url: "/en",
    locale: "en_GB",
  },
};

const PREMIER_ECHANGE = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("First call with ADAMA OS")}`;

export default function PageEnglish() {
  return (
    <PageShell className="page-en" sommaire={false}>
      <div lang="en" className="accueil">
        <section
          className="accueil-hero en-hero"
          aria-labelledby="en-hero-titre"
        >
          <div className="accueil-hero-grille">
            <div className="hero-copy">
              <SurTitre numero="EN">ADAMA OS · Paris and Dakar</SurTitre>
              <h1 id="en-hero-titre" className="hero-trois-verbes" data-titre>
                {TITRE_HERO_EN.map((verbe, i) => (
                  <span key={verbe} style={{ ["--i" as string]: i }}>
                    {verbe}
                    <b aria-hidden="true">.</b>
                    {i < TITRE_HERO_EN.length - 1 ? " " : null}
                  </span>
                ))}
              </h1>
              <div className="hero-copy-lines">
                <p className="hero-description">{POSITIONNEMENT.en}</p>
                <p className="hero-situation">
                  Founder of STRATA ESG and Conhama, co-founder of Pharivo,
                  between {ACTIVITE.villes.join(" and ")}.
                </p>
              </div>
              <div className="hero-actions">
                <a
                  href={PREMIER_ECHANGE}
                  className="portfolio-button primary bouton-magnetique"
                >
                  Book a first call <Fleche />
                </a>
                <a href="#en-notes" className="portfolio-button ghost">
                  Read the notes <Fleche />
                </a>
              </div>
            </div>
            <div className="hero-art">
              <HeroStrates langue="en" />
            </div>
          </div>
        </section>

        <section className="section-catalogue" aria-labelledby="en-metiers">
          <div className="section-tete">
            <SurTitre numero="01">What I do</SurTitre>
            <h2 id="en-metiers">Three crafts, one method.</h2>
            <p>
              I build software, I turn what works into methods, and I apply them
              to projects other than my own. Each craft feeds the next.
            </p>
          </div>
          <Piliers piliers={PILIERS_EN} />
        </section>

        <section className="section-catalogue" aria-labelledby="en-notes">
          <div className="section-tete">
            <SurTitre numero="02">Read</SurTitre>
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
            <SurTitre numero="03">Go further</SurTitre>
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
