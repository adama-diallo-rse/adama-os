import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { FlowDiagram } from "../../components/flow-diagram";
import { KnownLimits } from "../../components/known-limits";
import { FLUX, INTERDITS, TRANSPARENCE_IA } from "../../content/frontieres";
import { LIMITES } from "../../content/limites";
import { SOUS_TRAITANTS, ECHEANCE_MARQUAGE } from "../../lib/legal";
import { regionAnalytique } from "../../lib/health/collect";

// =====================================================================
// C11, les frontieres de donnees.
//
// Ce n'est pas une page marketing de conformite. Pas de cadenas, pas de
// bouclier, pas de coche verte, pas de badge. C'est un document technique
// qui repond a trois questions, dans cet ordre : qu'est-ce qui entre,
// qu'est-ce qui sort, qu'est-ce qui n'entre jamais.
//
// Elle COMPLETE /confidentialite, elle ne la remplace pas. La page de
// confidentialite dit ce que le droit exige ; celle-ci dit ce que le code
// fait, avec le test qui le verrouille quand il y en a un.
//
// Une contradiction y est affichee franchement : la region reelle de la
// mesure d'audience n'est pas celle qui est annoncee. Elle reste affichee
// tant qu'elle n'est pas tranchee.
// =====================================================================

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Frontières de données",
  description:
    "Ce qui entre dans ce site, ce qui en sort, et surtout ce qui n’y entre jamais. Le schéma des flux, la liste des interdits avec les tests qui les verrouillent, et les sous-traitants un par un.",
  alternates: { canonical: "/confiance" },
  openGraph: {
    title: "Frontières de données",
    description:
      "Ce qui entre, ce qui sort, ce qui n’entre jamais. Avec les tests qui le verrouillent.",
    url: "/confiance",
    siteName: "Adama OS",
    locale: "fr_FR",
    type: "website",
  },
};

export default function ConfiancePage() {
  const region = regionAnalytique(
    process.env.NEXT_PUBLIC_POSTHOG_HOST,
    process.env.NEXT_PUBLIC_POSTHOG_KEY,
  );
  const testes = INTERDITS.filter((i) => i.test !== null).length;
  const limiteRegion = LIMITES.filter((l) => l.id === "region-analytique");

  return (
    <PageShell className="confiance-page">
      <PageIntro
        eyebrow="FRONTIÈRES / CONFIANCE"
        title={
          <>
            Ce qui entre, ce qui sort,
            <br />
            <span className="serif">et ce qui n’entre jamais.</span>
          </>
        }
        description="Savoir poser une frontière de données est une compétence, et elle s’évalue. Ce site en démontre une dans son code depuis le premier jour, sans l’avoir jamais montrée. Voici le schéma, les interdits, et pour chacun le test qui le verrouille quand il existe."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">INTERDITS VERROUILLÉS</span>
            <strong>
              {testes} / {INTERDITS.length}
            </strong>
            <p>
              règles tenues par un test automatique. Les autres sont tenues par
              la discipline, et c’est dit.
            </p>
            <Link href="/confidentialite">Lire la confidentialité ↗</Link>
          </div>
        }
      />

      {/* 1. LE SCHEMA */}
      <section className="trust-section" id="flux">
        <h2>Le schéma des flux</h2>
        <p className="trust-lede">
          Trois sources entrent en lecture. Une requête sort vers le fournisseur
          de modèle. Et la flèche vers les produits du groupe est barrée : le
          cockpit consomme, il ne recalcule pas, il n’écrit jamais.
        </p>
        <FlowDiagram />
        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">De</th>
                <th scope="col">Vers</th>
                <th scope="col">Ce qui transite</th>
              </tr>
            </thead>
            <tbody>
              {FLUX.map((f) => (
                <tr key={f.id} data-sens={f.sens}>
                  <th scope="row">{f.de}</th>
                  <td>{f.vers}</td>
                  <td>{f.quoi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. CE QUI N'ENTRE JAMAIS */}
      <section className="trust-section" id="interdits">
        <h2>Ce qui n’entre jamais</h2>
        <p className="trust-lede">
          Une règle tenue par un test et une règle tenue par la discipline n’ont
          pas la même valeur. La distinction est portée ligne par ligne, parce
          que les confondre reviendrait à emprunter la crédibilité de la
          première pour la seconde.
        </p>
        <ul className="trust-interdits">
          {INTERDITS.map((i) => (
            <li key={i.id} data-teste={i.test ? "oui" : "non"}>
              <h3>{i.regle}</h3>
              <p>{i.raison}</p>
              <p className="trust-preuve">
                {i.test ? (
                  <>
                    <span className="trust-preuve-mark" aria-hidden="true">
                      ✓
                    </span>
                    Verrouillé par un test automatique, <code>{i.test}</code>
                  </>
                ) : (
                  <>
                    <span className="trust-preuve-mark" aria-hidden="true">
                      ·
                    </span>
                    Aucun test ne verrouille cette règle. Elle est tenue par la
                    discipline d’ingestion, et je préfère le dire.
                  </>
                )}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. TRANSPARENCE SUR L'IA */}
      <section className="trust-section" id="ia">
        <h2>Où un modèle intervient</h2>
        <dl className="trust-ia">
          <div>
            <dt>Où</dt>
            <dd>{TRANSPARENCE_IA.ou}</dd>
          </div>
          <div>
            <dt>Ce qu’il reçoit</dt>
            <dd>{TRANSPARENCE_IA.recoit}</dd>
          </div>
          <div>
            <dt>Ce qu’il ne reçoit pas</dt>
            <dd>{TRANSPARENCE_IA.neRecoitPas}</dd>
          </div>
          <div>
            <dt>Ce qu’il ne décide pas</dt>
            <dd>{TRANSPARENCE_IA.neDecidePas}</dd>
          </div>
        </dl>
        <blockquote className="trust-principe">
          <p>{TRANSPARENCE_IA.principe}</p>
        </blockquote>
        <p>
          Une mention de traitement automatisé apparaît au premier contact avec
          l’assistant, et reste visible dans son en-tête. Elle est verrouillée
          par un test. Les réponses de l’assistant portent en outre un en-tête
          de provenance lisible par un programme, posé au niveau de la réponse.
        </p>
        <p className="trust-note">
          Les images de partage de ce site sont composées de rectangles et de
          texte, pas générées par un modèle. Elles ne sont donc pas marquées, et
          ce raisonnement est écrit plutôt que sous-entendu. Échéance de
          réexamen : {ECHEANCE_MARQUAGE}. Le jour où une image produite par un
          modèle entre sur ce site, elle est marquée à l’endroit unique où les
          images sont composées.
        </p>
      </section>

      {/* 4. LES SOUS-TRAITANTS */}
      <section className="trust-section" id="sous-traitants">
        <h2>Les sous-traitants, un par un</h2>
        <p className="trust-lede">
          Chacun avec ce qui transite et la région où il le traite. Une ligne
          est actuellement hors de la région annoncée, et elle le dit.
        </p>
        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Sous-traitant</th>
                <th scope="col">Ce qui transite</th>
                <th scope="col">Région</th>
              </tr>
            </thead>
            <tbody>
              {SOUS_TRAITANTS.map((s) => {
                const horsRegion =
                  s.id === "analytique" && region === "hors UE";
                return (
                  <tr key={s.id} data-hors-region={horsRegion || undefined}>
                    <th scope="row">{s.nom}</th>
                    <td>{s.donnees}</td>
                    <td>
                      {horsRegion ? (
                        <>
                          <strong>Hors Union européenne</strong>, alors que la
                          page de confidentialité annonce l’Union européenne.
                        </>
                      ) : (
                        s.region
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {region === "hors UE" ? (
          <p className="trust-contradiction">
            Cette contradiction est ouverte. Tant qu’elle dure, aucune mesure
            d’audience n’est configurée, elle figure au registre des limites
            connues ci-dessous, et les deux correctifs possibles sont préparés
            dans le dépôt. Elle sera tranchée dans un sens ou dans l’autre, pas
            effacée.
          </p>
        ) : null}
      </section>

      {/* 5. LA BASE PARTAGEE */}
      <section className="trust-section" id="base-partagee">
        <h2>La base est partagée avec deux produits</h2>
        <p>
          Le projet de base de données de ce site n’est pas dédié : il est
          partagé avec deux produits du groupe. Ce n’est pas un choix
          d’architecture, c’est une contrainte relevée après coup, et je ne vais
          pas la présenter comme une décision.
        </p>
        <p>
          Sa conséquence est traitée. La séparation entre les tables de ce site
          et celles des produits est tenue par les règles de sécurité au niveau
          des lignes, et non par une convention de nommage. Surtout, toute
          restauration est sélective, table par table : une restauration globale
          au niveau du projet écraserait les données des produits voisins, et
          c’est précisément ce que la procédure interdit.
        </p>
        <p className="trust-note">
          Ce que cela coûte : il n’existe pas de sauvegarde propre à ce site que
          l’hébergeur saurait restaurer seule. L’export logique du dépôt ne
          prend nommément que les tables de ce site, et c’est la seule
          granularité sûre.
        </p>
      </section>

      <KnownLimits
        limites={
          region === "hors UE"
            ? LIMITES
            : LIMITES.filter((l) => l.id !== "region-analytique")
        }
        titre="Ce qui reste ouvert"
      />

      {limiteRegion.length > 0 && region !== "hors UE" ? (
        <p className="trust-note">
          La contradiction de région a été tranchée : elle ne figure plus au
          registre des limites connues.
        </p>
      ) : null}

      <section className="page-next">
        <div>
          <p className="portfolio-label">L’INSPECTION COMPLÈTE</p>
          <h2>
            Les mêmes frontières, <span className="serif">côté code.</span>
          </h2>
          <p>
            L’inventaire généré, les contrats des interfaces publiques, les
            réglages de la recherche documentaire et les dix contrôles
            d’intégrité.
          </p>
        </div>
        <Link href="/technique" className="portfolio-button primary">
          Ouvrir la vue technique <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}
