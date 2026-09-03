import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../../components/page-shell";
import { HealthMatrix } from "../../../components/health-matrix";
import { KnownLimits } from "../../../components/known-limits";
import { fetchHealthMatrix } from "../../../lib/health/collect";
import { DOCTRINE_PANNE, MODES_PANNE } from "../../../content/pannes";
import { LIMITES } from "../../../content/limites";

// =====================================================================
// C3-T1, C3-T4 et C3-T6, la page de sante et de modes de panne.
//
// Trois blocs, dans cet ordre, et l'ordre est l'argument :
//   1. la matrice de sante, calculee maintenant. Elle montre l'etat reel,
//      y compris quand il n'est pas bon ;
//   2. les huit modes de panne, avec pour chacun ce qui n'est jamais fait ;
//   3. le registre des limites connues, qui dit ce qui ne marche pas encore.
//
// Un lecteur technique qui arrive ici doit repartir avec une conviction :
// ce systeme sait ce qu'il ne sait pas, et il le dit avant qu'on le lui
// demande.
// =====================================================================

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Santé et modes de panne",
  description:
    "L’état réel de sept capacités, les huit façons dont ce site peut tomber, et ce qu’il ne fait jamais pour se rattraper. Aucun état global, aucun vert de synthèse.",
  alternates: { canonical: "/systeme/pannes" },
  openGraph: {
    title: "Santé et modes de panne",
    description:
      "Sept capacités, trois états, huit modes de panne documentés et rejouables.",
    url: "/systeme/pannes",
    siteName: "Adama OS",
    locale: "fr_FR",
    type: "website",
  },
};

export default async function PannesPage() {
  const matrix = await fetchHealthMatrix();
  const degradees = matrix.capabilities.filter(
    (c) => c.state !== "operationnel",
  );

  return (
    <PageShell className="systeme-page">
      <PageIntro
        eyebrow="SYSTÈME / SANTÉ ET PANNES"
        title={
          <>
            Ce qui tombe,
            <br />
            <span className="serif">et ce qu’on ne fait jamais.</span>
          </>
        }
        description="Un service qui répond avec un corpus vide n’est pas en bonne santé, il est disponible et inutile. Cette page sépare les deux. Elle donne l’état réel de sept capacités, les huit façons dont ce site peut tomber, et surtout ce qu’il refuse de faire pour masquer une panne."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">ÉTAT DU MOMENT</span>
            <strong>{degradees.length}</strong>
            <p>
              {degradees.length > 1
                ? `capacités qui ne sont pas pleinement opérationnelles, sur ${matrix.capabilities.length}.`
                : `capacité qui n’est pas pleinement opérationnelle, sur ${matrix.capabilities.length}.`}{" "}
              La raison est donnée pour chacune.
            </p>
            <Link href="/technique">Voir la vue technique ↗</Link>
          </div>
        }
      />

      <HealthMatrix matrix={matrix} />

      <section className="panne-section" aria-labelledby="pannes-title">
        <div className="panne-intro">
          <p className="portfolio-label">LES HUIT MODES DE PANNE</p>
          <h2 id="pannes-title">
            Ce qui se passe, ce que vous voyez,{" "}
            <span className="serif">ce qui n’est jamais fait.</span>
          </h2>
          <p>
            La troisième colonne est la seule qui compte vraiment. Les deux
            premières décrivent une dégradation, la troisième décrit une
            discipline. Chaque mode est rejouable en local par une commande, il
            n’est donc pas une promesse.
          </p>
        </div>

        <ol className="panne-list">
          {MODES_PANNE.map((mode, i) => (
            <li key={mode.id} className="panne-card" id={mode.id}>
              <div className="panne-card-head">
                <span className="panne-num" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{mode.titre}</h3>
              </div>
              <dl className="panne-grid">
                <div>
                  <dt>Ce qui se passe</dt>
                  <dd>{mode.effet}</dd>
                </div>
                <div>
                  <dt>Ce que le visiteur voit</dt>
                  <dd>{mode.visible}</dd>
                </div>
                <div className="panne-jamais">
                  <dt>Ce qui n’est jamais fait</dt>
                  <dd>{mode.jamais}</dd>
                </div>
              </dl>
              <p className="panne-drill">
                <span>Rejouer ce mode</span>
                <code>node scripts/failure-drill.mjs {mode.simulation}</code>
              </p>
            </li>
          ))}
        </ol>

        <blockquote className="panne-doctrine">
          <p>{DOCTRINE_PANNE}</p>
        </blockquote>
      </section>

      <KnownLimits limites={LIMITES} />

      <section className="page-next">
        <div>
          <p className="portfolio-label">POUR ALLER PLUS LOIN</p>
          <h2>
            L’inspection <span className="serif">complète.</span>
          </h2>
          <p>
            L’inventaire du dépôt, les contrats des interfaces publiques, les
            frontières de données et les dix contrôles d’intégrité.
          </p>
        </div>
        <Link href="/technique" className="portfolio-button primary">
          Ouvrir la vue technique <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}
