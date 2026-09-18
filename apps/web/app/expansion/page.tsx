import type { Metadata } from "next";
import Link from "next/link";
import { ExpansionDashboard } from "../../components/expansion-dashboard";
import { PageIntro, PageShell } from "../../components/page-shell";
import { ArchitectureArt } from "../../components/portfolio-art";
import {
  EXPANSION_BRANCHES,
  EXPANSION_MATURITY,
  EXPANSION_TOTALS,
  EXPANSION_VISIBILITY,
} from "../../content/expansion";

export const metadata: Metadata = {
  title: "Plan d'expansion",
  description:
    "Le cockpit public du plan d'expansion ADAMA OS, ses branches, ses niveaux de visibilité et ses états de maturité.",
  alternates: { canonical: "/expansion" },
};

export default function ExpansionPage() {
  return (
    <PageShell className="expansion-page" tools={false}>
      <PageIntro
        eyebrow="ADAMA OS / EXPANSION"
        title={
          <>
            Le savoir devient
            <br />
            <span className="serif">un système d’actifs.</span>
          </>
        }
        description="Ce plan organise ce qui peut être publié, transmis, réutilisé ou transformé en logiciel. Il montre aussi ce qui reste fermé, ce qui doit être prouvé et ce qui déclenche l'arrêt."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">PÉRIMÈTRE PUBLIC</span>
            <strong>298</strong>
            <p>
              idées structurées, avec deux identifiants volontairement libres.
            </p>
          </div>
        }
      />

      <ExpansionDashboard />

      <section className="expansion-totals" aria-label="Dimensions du plan">
        {EXPANSION_TOTALS.map((total) => (
          <article key={total.label}>
            <strong>{total.value}</strong>
            <span>{total.label}</span>
            <small>{total.detail}</small>
          </article>
        ))}
      </section>

      <section
        className="expansion-source-system"
        aria-labelledby="source-system-title"
      >
        <div className="expansion-source-art">
          <ArchitectureArt />
        </div>
        <div>
          <p className="portfolio-label">OBJET SOURCE / CINQ STRATES</p>
          <h2 id="source-system-title">
            Une idée garde sa provenance à chaque transformation.
          </h2>
          <p>
            Idée, expérience, décision, méthode et actif forment une seule
            chaîne. Une sortie publique ne peut jamais affirmer plus que ce que
            cette chaîne permet de vérifier.
          </p>
          <Link href="/methode" className="portfolio-text-link">
            Lire la méthode de provenance <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="expansion-section" aria-labelledby="branches-title">
        <div className="expansion-section-heading">
          <div>
            <p className="portfolio-label">ARCHITECTURE / 12 BRANCHES</p>
            <h2 id="branches-title">Le visiteur choisit une intention.</h2>
          </div>
          <p>
            Les branches rangent la production. Elles ne doivent jamais devenir
            un obstacle pour comprendre où commencer.
          </p>
        </div>
        <div className="expansion-branch-grid">
          {EXPANSION_BRANCHES.map((branch, index) => (
            <article key={branch.name}>
              <div>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <em>{branch.status}</em>
              </div>
              <h3>{branch.name}</h3>
              <p>{branch.purpose}</p>
              <small>{branch.audience}</small>
            </article>
          ))}
        </div>
      </section>

      <section
        className="expansion-governance"
        aria-labelledby="governance-title"
      >
        <div className="expansion-section-heading">
          <div>
            <p className="portfolio-label">
              GOUVERNANCE / VISIBILITÉ ET MATURITÉ
            </p>
            <h2 id="governance-title">
              Deux champs empêchent de surpromettre.
            </h2>
          </div>
          <p>
            Un objet porte un niveau d’accès et un état de maturité. Toute
            modification reste traçable. Le niveau PROUVÉ exige un résultat réel
            et publié.
          </p>
        </div>
        <div className="expansion-governance-grid">
          <div className="visibility-scale">
            <p className="portfolio-label">NIVEAU DE VISIBILITÉ</p>
            {EXPANSION_VISIBILITY.map((level) => (
              <div key={level.code}>
                <code>{level.code}</code>
                <strong>{level.label}</strong>
                <span>{level.access}</span>
              </div>
            ))}
          </div>
          <div className="maturity-scale">
            <p className="portfolio-label">ÉTAT DE MATURITÉ</p>
            {EXPANSION_MATURITY.map((state, index) => (
              <div key={state.name}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{state.name}</strong>
                <p>{state.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="expansion-doctrine">
        <p className="portfolio-label">FRONTIÈRE CENTRALE / XDEC-08</p>
        <blockquote>
          ADAMA OS livre une méthode, un gabarit, un parcours ou un avis. STRATA
          ESG livre le logiciel.
        </blockquote>
        <p>
          Un sujet peut se croiser. La forme, le public et le nom restent
          distincts. Tout actif qui touche un produit STRATA ESG renvoie vers
          lui.
        </p>
      </section>

      <section className="page-next">
        <div>
          <p className="portfolio-label">AFRIQUE / EJ0</p>
          <h2>
            Sept contraintes, <span className="serif">deux lectures.</span>
          </h2>
          <p>
            Le volet Afrique part des conditions réelles de collecte. Un texte
            parle depuis l’entreprise qui doit répondre. L’autre transforme
            chaque contrainte en décision d’architecture.
          </p>
        </div>
        <div className="page-next-actions">
          <Link
            href="/articles/sept-contraintes-donnee-esg-afrique-ouest"
            className="portfolio-button primary"
          >
            Lire les contraintes <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/articles/architecture-donnee-esg-afrique-ouest"
            className="portfolio-button"
          >
            Lire l’architecture <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="page-next">
        <div>
          <p className="portfolio-label">PREMIÈRE APPLICATION</p>
          <h2>
            Relier une idée à <span className="serif">sa preuve.</span>
          </h2>
          <p>
            La méthode ouverte montre le chemin le plus court entre une idée,
            une expérience, une décision et un actif réutilisable.
          </p>
        </div>
        <Link href="/methode" className="portfolio-button primary">
          Ouvrir la méthode <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}
