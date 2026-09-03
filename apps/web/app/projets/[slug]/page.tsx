import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro, PageShell } from "../../../components/page-shell";
import { ProjectSheet } from "../../../components/project-sheet";
import { ProductMark } from "../../../components/product-mark";
import { ETAT_LABEL, FICHES, ficheParSlug } from "../../../content/projets";
import { listAdr } from "../../../lib/adr";
import { listClaims } from "../../../lib/proof/claims";
import { absoluteUrl } from "../../../lib/site";

// =====================================================================
// C5-T4, la route d'une fiche projet.
//
// Rendue a la demande : le bloc 04 lit le journal d'architecture et le bloc
// 05 le registre de preuve. Une fiche figee au moment de la construction
// annoncerait les preuves du jour du deploiement, pas celles du jour de la
// lecture.
// =====================================================================

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const fiche = ficheParSlug(slug);
  if (!fiche) {
    return { title: "Fiche introuvable" };
  }
  return {
    title: `${fiche.titre}, fiche projet`,
    description: fiche.resume,
    alternates: { canonical: `/projets/${fiche.slug}` },
    openGraph: {
      title: `${fiche.titre}, fiche projet`,
      description: fiche.resume,
      url: `/projets/${fiche.slug}`,
      siteName: "Adama OS",
      locale: "fr_FR",
      type: "article",
    },
  };
}

export default async function FicheProjetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fiche = ficheParSlug(slug);
  if (!fiche) {
    notFound();
  }

  const [claims, adrs] = await Promise.all([listClaims(), listAdr()]);

  // Le renvoi lateral pointe vers une AUTRE fiche : proposer de comparer une
  // fiche avec elle-meme serait un lien mort deguise en invitation.
  const suivante =
    FICHES[
      (FICHES.findIndex((f) => f.slug === fiche.slug) + 1) % FICHES.length
    ];

  // Le bloc 05 lit le registre par sujet, il ne recopie aucune preuve.
  const sujets = new Set(fiche.sujetsPreuve);
  const preuves = claims.filter(
    (c) => c.row.subject_ref !== null && sujets.has(c.row.subject_ref),
  );

  // Le bloc 04 lit le journal par identifiant declare dans la fiche. Un ADR
  // qui n'est pas servi, parce qu'il n'est pas relu, n'apparait simplement
  // pas : la fiche ne le remplace par rien.
  const declares = new Set(fiche.adrIds);
  const decisions = adrs.filter((a) => declares.has(a.adr_id));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: fiche.titre,
    abstract: fiche.resume,
    url: absoluteUrl(`/projets/${fiche.slug}`),
    inLanguage: "fr-FR",
    creator: { "@type": "Person", name: "Adama Diallo" },
    creativeWorkStatus: ETAT_LABEL[fiche.etat.valeur],
  };

  return (
    <PageShell className="case-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <PageIntro
        eyebrow={
          <>
            <ProductMark slug={fiche.slug} taille={20} />
            {`FICHE PROJET / ${fiche.division.toUpperCase()}`}
          </>
        }
        title={
          <>
            {fiche.titre}
            <span className="serif">.</span>
          </>
        }
        description={fiche.resume}
        aside={
          <div className="intro-note">
            <span className="intro-note-label">MON RÔLE</span>
            <strong className="case-role-mot">{fiche.roleEnUnMot}</strong>
            <p>
              {ETAT_LABEL[fiche.etat.valeur]}. Huit blocs, le même gabarit que
              les deux autres fiches.
            </p>
            <Link href={`/projets/${suivante?.slug ?? fiche.slug}`}>
              Comparer avec {suivante?.titre} ↗
            </Link>
          </div>
        }
      />

      <ProjectSheet fiche={fiche} claims={preuves} decisions={decisions} />

      <nav className="case-autres" aria-label="Les autres fiches">
        <p className="portfolio-label">LES AUTRES FICHES</p>
        <div>
          {FICHES.filter((f) => f.slug !== fiche.slug).map((autre) => (
            <Link key={autre.slug} href={`/projets/${autre.slug}`}>
              <span>{autre.titre}</span>
              <span>{autre.resume}</span>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </nav>

      <section className="page-next">
        <div>
          <p className="portfolio-label">LES ARBITRAGES</p>
          <h2>
            Pourquoi c’est construit <span className="serif">comme ça.</span>
          </h2>
          <p>
            Chaque décision structurante de ce projet est publiée avec les
            options écartées, le compromis accepté et ce qu’elle a changé dans
            le code.
          </p>
        </div>
        <Link href="/decisions" className="portfolio-button primary">
          Ouvrir le journal <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}
