import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { ProjectGrid } from "../../components/project-grid";
import { BoutonRendezVous } from "../../components/accueil/offre";
import { CarteParisDakar } from "../../components/kit/illustrations-offre";
import { HeroStrates } from "../../components/accueil/hero-art";
import { cartesProjet, categoriesProjet, FICHES } from "../../content/projets";
import {
  AXES_SANTE,
  PHRASE_PHARIVO,
  TERRAINS,
} from "../../content/realisations";
import { listClaims } from "../../lib/proof/claims";
import type { ClaimState } from "../../lib/proof/types";

// =====================================================================
// Les réalisations, 7 novembre 2026.
//
// Les fiches existaient une par une (/projets/[slug]) sans page qui les
// rassemble : « Réalisations » menait à une ancre de l'accueil. Cette page
// dit les quatre maisons, le terrain de chacune, la santé en Afrique de
// l'Ouest telle que Pharivo la construit, et ce qui relie le tout.
// =====================================================================

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Réalisations",
  description:
    "Quatre maisons en service : STRATA ESG pour la durabilité, Pharivo pour la santé en Afrique de l’Ouest, Conhama pour l’économie durable, et ADAMA OS, le laboratoire qui les relie.",
  alternates: { canonical: "/projets" },
  openGraph: {
    title: "Réalisations, quatre maisons en service",
    url: "/projets",
    siteName: "ADAMA OS",
    locale: "fr_FR",
    type: "website",
  },
};

export default async function RealisationsPage() {
  const claims = await listClaims({ visibility: ["public"], now: new Date() });
  const proofStates: Record<string, ClaimState> = {};
  for (const c of claims) proofStates[c.row.id] = c.state;
  const enProduction = FICHES.filter(
    (f) => f.etat.valeur === "production",
  ).length;
  const produits = FICHES.reduce((n, f) => n + (f.produits?.length ?? 1), 0);

  return (
    <PageShell className="realisations-page offre-page">
      <PageIntro
        eyebrow="RÉALISATIONS / LES MAISONS"
        title={
          <>
            Quatre maisons,
            <br />
            <span className="serif">un même système.</span>
          </>
        }
        description="Trois entreprises sur trois terrains, la durabilité, la santé et l’économie durable, et un laboratoire public qui les relie. Chacune est en ligne, chacune a sa fiche, et chaque affirmation renvoie à sa preuve."
        aside={
          <dl className="realisations-chiffres">
            <div>
              <dt>Maisons en production</dt>
              <dd>{enProduction}</dd>
            </div>
            <div>
              <dt>Produits et services</dt>
              <dd>{produits}</dd>
            </div>
            <div>
              <dt>Villes</dt>
              <dd>2</dd>
            </div>
          </dl>
        }
      />

      <section
        className="offre-bloc"
        id="terrains"
        aria-labelledby="terrains-titre"
      >
        <div className="offre-bloc-tete">
          <div>
            <p className="portfolio-label">LES TERRAINS</p>
            <h2 id="terrains-titre">
              Trois terrains, <span className="serif">un laboratoire.</span>
            </h2>
          </div>
          <p>
            Chaque maison répond à un problème que j’ai vu de près, en France ou
            au Sénégal. Elles ne vendent pas la même chose, mais elles sont
            construites de la même façon.
          </p>
        </div>
        <ol className="terrains">
          {TERRAINS.map((t, i) => {
            const fiche = FICHES.find((f) => f.slug === t.slug);
            if (!fiche) return null;
            return (
              <li key={t.slug} className="terrain" data-revele>
                <p className="terrain-tete">
                  <span>0{i + 1}</span> {t.terrain} · {t.ville}
                </p>
                <h3>{fiche.titre}</h3>
                <p>{t.phrase}</p>
                <Link href={`/projets/${t.slug}`} className="terrain-lien">
                  La fiche complète <span aria-hidden="true">→</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section
        className="offre-bloc"
        id="maisons"
        aria-labelledby="maisons-titre"
      >
        <div className="offre-bloc-tete">
          <div>
            <p className="portfolio-label">LES FICHES</p>
            <h2 id="maisons-titre">
              En ligne, <span className="serif">et vérifiable.</span>
            </h2>
          </div>
          <p>
            Chaque carte ouvre une fiche au même gabarit : le problème, mon
            rôle, l’architecture, les décisions, les preuves, les compromis,
            l’état réel et la suite.
          </p>
        </div>
        <div className="portfolio realisations-grille">
          <ProjectGrid
            cartes={cartesProjet()}
            categories={categoriesProjet()}
            proofStates={proofStates}
          />
        </div>
      </section>

      <section
        className="offre-bloc sante feuille-indigo"
        id="sante"
        aria-labelledby="sante-titre"
      >
        <div className="sante-tete">
          <div>
            <p className="portfolio-label">PHARIVO · LA SANTÉ</p>
            <h2 id="sante-titre">
              La santé en Afrique de l’Ouest,{" "}
              <span className="serif">en commençant par l’officine.</span>
            </h2>
            <p>
              L’officine, la clinique, le grossiste et l’assureur travaillent
              ensemble, mais leurs outils ne se parlent pas. Pharivo construit
              les logiciels qui les relient, pensés au Sénégal et non adaptés
              après coup. « {PHRASE_PHARIVO} »
            </p>
            <div className="sante-actions">
              <Link href="/projets/pharivo" className="bouton bouton-contour">
                La fiche Pharivo
              </Link>
              <a
                href="https://pharivo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="sante-externe"
              >
                pharivo.com <span aria-hidden="true">↗</span>
                <span className="sr-only"> (nouvel onglet)</span>
              </a>
            </div>
          </div>
          <div className="sante-carte">
            <CarteParisDakar titre="Carte de l’Afrique de l’Ouest et de l’Europe : le Sénégal en latérite, Dakar relié à Paris." />
          </div>
        </div>
        <ol className="sante-axes">
          {AXES_SANTE.map((a, i) => (
            <li
              key={a.nom}
              className={a.ouvert ? "sante-axe sante-axe--ouvert" : "sante-axe"}
            >
              <span className="sante-axe-etat">
                <i aria-hidden="true" />
                {a.ouvert ? "En production" : "Pas encore ouvert"}
              </span>
              <h3>
                <span>0{i + 1}</span> {a.nom}
              </h3>
              <p className="sante-axe-pour">{a.pour}</p>
              <p>{a.texte}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="offre-bloc realisations-lien"
        id="systeme"
        aria-labelledby="systeme-titre"
      >
        <div>
          <p className="portfolio-label">CE QUI LES RELIE</p>
          <h2 id="systeme-titre">
            Une même méthode, <span className="serif">quatre étages.</span>
          </h2>
          <p>
            Les logiciels tournent en bas. Chaque décision qui les a construits
            est datée, chaque affirmation est reliée à sa preuve, et ce qui a
            tenu devient une méthode publiée. C’est la méthode que j’applique
            ensuite aux projets que j’accompagne.
          </p>
          <div className="sante-actions">
            <Link
              href="/comment-je-travaille"
              className="bouton bouton-contour"
            >
              Comment je travaille
            </Link>
            <BoutonRendezVous>
              Parlons de votre projet <span aria-hidden="true">→</span>
            </BoutonRendezVous>
          </div>
        </div>
        <HeroStrates />
      </section>
    </PageShell>
  );
}
