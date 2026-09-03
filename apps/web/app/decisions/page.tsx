import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { AdrList } from "../../components/adr-list";
import { listAdr } from "../../lib/adr";

// =====================================================================
// C6-T3, le journal d'architecture.
//
// Ce que la page doit produire chez le lecteur, dans cet ordre : combien de
// decisions structurantes cette personne a prises et sur quels axes ; puis,
// en ouvrant l'une d'elles, qu'elle a envisage des options et qu'elle assume
// un cout ; puis que la decision a produit du code reel.
//
// Un ADR que Adama n'a pas relu n'est pas servi ici : la politique de
// securite de la migration 0005 l'interdit a la cle anonyme. Ce n'est pas
// une precaution d'affichage, c'est une regle de la base.
// =====================================================================

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Journal des décisions",
  description:
    "Les décisions d’architecture d’Adama Diallo, au format ADR : le contexte, les options écartées, le compromis accepté, ce que la décision a changé dans le code, et sa réversibilité.",
  alternates: { canonical: "/decisions" },
  openGraph: {
    title: "Journal des décisions d’architecture",
    description:
      "Chaque décision structurante, avec ses options écartées et son coût.",
    url: "/decisions",
    siteName: "Adama OS",
    locale: "fr_FR",
    type: "website",
  },
};

export default async function DecisionsPage() {
  const decisions = await listAdr();
  const revirements = decisions.filter((d) => d.revirement !== null).length;
  const enVigueur = decisions.filter((d) => d.status === "accepte").length;

  return (
    <PageShell>
      <PageIntro
        eyebrow="DÉCISIONS / JOURNAL D’ARCHITECTURE"
        title={
          <>
            Ce que j’ai tranché,
            <br />
            <span className="serif">et ce que ça coûte.</span>
          </>
        }
        description="Une décision d’architecture ne se juge pas sur son résultat mais sur ce qu’elle a pesé. Chaque entrée porte donc le problème réel, les options sérieusement envisagées, ce qui les a disqualifiées, le compromis accepté, et ce que la décision a changé dans le code. Une décision revenue reste en ligne, datée, et pointe vers celle qui la remplace."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">ÉTAT DU JOURNAL</span>
            <strong>{decisions.length}</strong>
            <p>
              décision{decisions.length > 1 ? "s" : ""} publiée
              {decisions.length > 1 ? "s" : ""}, dont {enVigueur} en vigueur et{" "}
              {revirements} sur {revirements > 1 ? "lesquelles" : "laquelle"} je
              suis revenu.
            </p>
            <Link href="/revirements">Voir les revirements ↗</Link>
          </div>
        }
      />

      {decisions.length === 0 ? (
        <section className="metrics-empty">
          <p className="portfolio-label">LE JOURNAL</p>
          <h2>
            Aucune décision <span className="serif">servie.</span>
          </h2>
          <p>
            Le journal est vide, injoignable, ou ses entrées attendent d’être
            relues. Rien n’est affiché en attendant : une décision
            d’architecture affirme des choses sur mon propre travail, et elle ne
            se publie pas avant que je l’aie relue.
          </p>
          <Link className="portfolio-text-link" href="/principes">
            Voir les principes qui en sont dérivés{" "}
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      ) : (
        <AdrList decisions={decisions} />
      )}

      <section className="adr-legende" aria-label="Lecture des statuts">
        <p className="portfolio-label">COMMENT LIRE UNE LIGNE</p>
        <div>
          <span>
            <strong>Acceptée</strong>
          </span>
          <span>En vigueur aujourd’hui.</span>
        </div>
        <div>
          <span>
            <strong>Remplacée</strong>
          </span>
          <span>
            Une décision ultérieure l’a remplacée. Elle reste en ligne et pointe
            vers celle qui la remplace. Revenir sur une décision est ici une
            qualité, pas un aveu.
          </span>
        </div>
        <div>
          <span>
            <strong>Réversibilité</strong>
          </span>
          <span>
            Le coût du retour en arrière, du plus simple au plus lourd. Une
            décision difficilement réversible se prend plus lentement.
          </span>
        </div>
        <div>
          <span>
            <strong>Reconstruite</strong>
          </span>
          <span>
            L’entrée a été rédigée après coup, à partir du dépôt. Les options
            listées sont celles que le code démontre, elles ne prétendent pas
            décrire ce qui a été envisagé à l’époque.
          </span>
        </div>
      </section>

      <section className="page-next">
        <div>
          <p className="portfolio-label">CE QUI EN DÉCOULE</p>
          <h2>
            Des principes, <span className="serif">pas un manifeste.</span>
          </h2>
          <p>
            Cinq règles, chacune dérivée d’une décision ou d’une erreur réelle,
            et chacune avec le prix qu’elle fait payer.
          </p>
        </div>
        <Link href="/principes" className="portfolio-button primary">
          Lire les principes <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}
