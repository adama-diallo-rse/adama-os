import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { PRINCIPES } from "../../content/principes";
import { entreeRegistre } from "../../content/decisions";
import { SIGNATURE } from "../../content/systeme";
import { titresAdr } from "../../lib/adr";

// =====================================================================
// C14-T1, les principes.
//
// Le pari editorial : ces principes ne sont pas declares, ils sont DERIVES.
// Chacun porte deux choses qu'un manifeste n'a jamais, son origine tracee et
// son cout. Si la page se lit comme une liste de valeurs d'entreprise, elle
// a rate. Si elle se lit comme les notes d'un ingenieur qui a paye pour
// apprendre quelque chose, elle a reussi.
//
// Cinq, pas six.
//
// Le titre de chaque decision citee est lu dans le journal quand il est
// servi. Quand il ne l'est pas, le titre du registre versionne prend le
// relais : c'est un titre relu, pas une invention, et le lien reste
// annonce pour ce qu'il est.
// =====================================================================

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Les principes",
  description:
    "Cinq principes d’ingénierie, chacun dérivé d’une décision ou d’une erreur réelle, chacun avec son coût. Aucun n’est déclaré : tous sont tracés.",
  alternates: { canonical: "/principes" },
  openGraph: {
    title: "Cinq principes, dérivés d’erreurs réelles",
    description: "Chacun avec son origine tracée et ce qu’il coûte.",
    url: "/principes",
    siteName: "Adama OS",
    locale: "fr_FR",
    type: "website",
  },
};

export default async function PrincipesPage() {
  const titres = await titresAdr();

  return (
    <PageShell className="dna-page">
      <PageIntro
        eyebrow="PRINCIPES / DÉRIVÉS, NON DÉCLARÉS"
        title={
          <>
            Cinq règles,
            <br />
            <span className="serif">et leur prix.</span>
          </>
        }
        description="Aucun de ces principes n’a été écrit avant l’erreur qui l’a produit. Chacun nomme la décision ou la correction dont il vient, et chacun dit ce qu’il coûte. Un principe dont on ne peut pas nommer le coût n’est pas un principe, c’est un slogan."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">RÈGLES EN VIGUEUR</span>
            <strong>{PRINCIPES.length}</strong>
            <p>
              chacune tracée vers une décision publiée. Un principe orphelin
              fait échouer la construction du site.
            </p>
            <Link href="/revirements">D’où elles viennent ↗</Link>
          </div>
        }
      />

      <ol className="dna-principes">
        {PRINCIPES.map((principe) => (
          <li key={principe.numero} className="dna-principe">
            <span className="dna-numero" aria-hidden="true">
              {principe.numero}
            </span>
            <h2>{principe.phrase}</h2>

            <div className="dna-produit">
              <span className="portfolio-label">CE QUI L’A PRODUIT</span>
              <p>{principe.produit}</p>
            </div>

            <div className="dna-cout">
              <span className="portfolio-label">CE QU’IL COÛTE</span>
              <p>{principe.cout}</p>
            </div>

            <ul className="dna-origines">
              {principe.origines.map((origine) => {
                const entree = entreeRegistre(origine.adrId);
                const titre = titres.get(origine.adrId) ?? entree?.titre;
                const servi = titres.has(origine.adrId);
                return (
                  <li key={origine.adrId} data-role={origine.role}>
                    <span className="dna-origine-role">
                      {origine.role === "revirement"
                        ? "Correction"
                        : "Décision"}
                    </span>
                    {servi ? (
                      <Link href={`/decisions/${origine.adrId}`}>
                        <span className="dna-origine-id">{origine.adrId}</span>
                        <span>{titre}</span>
                        <span aria-hidden="true">→</span>
                      </Link>
                    ) : (
                      <span className="dna-origine-absente">
                        <span className="dna-origine-id">{origine.adrId}</span>
                        <span>{titre}</span>
                        <em>en relecture, pas encore publiée</em>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>

      <section className="dna-signature">
        <blockquote>
          <p>{SIGNATURE}</p>
        </blockquote>
      </section>

      <section className="page-next">
        <div>
          <p className="portfolio-label">LA MÉCANIQUE</p>
          <h2>
            Et concrètement, <span className="serif">comment ça tient ?</span>
          </h2>
          <p>
            La chaîne complète, des sources au lecteur, avec pour chaque étape
            le fichier ou la table qui l’implémente.
          </p>
        </div>
        <Link href="/systeme" className="portfolio-button primary">
          Voir comment ce site fonctionne <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}
