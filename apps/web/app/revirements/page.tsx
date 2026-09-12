import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { adresseDePreuve } from "../../components/adr-chain";
import { formatDate } from "../../components/proof/data-class";
import { listRevirements } from "../../lib/adr";

// =====================================================================
// C7, ce sur quoi je suis revenu.
//
// Le pari editorial de la page, et il ne faut pas le perdre : ce n'est PAS
// une page d'humilite ni un mea culpa. C'est une demonstration de methode.
// Savoir revenir sur une decision est presente ici comme une competence.
// Si la page se lit comme une liste d'erreurs, elle a rate. Si elle se lit
// comme le carnet de revision d'un ingenieur, elle a reussi.
//
// La page ne s'appelle donc jamais « echecs ».
//
// Le champ cout est ce qui rend le reste credible : sans lui, un revirement
// se lit comme de l'amelioration continue. La contrainte de la migration
// 0006 le rend obligatoire en base, pas seulement a l'affichage.
// =====================================================================

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ce sur quoi je suis revenu",
  description:
    "Cinq décisions prises, puis corrigées, avec la trace de la correction dans le code, ce qu’elle a coûté, et la règle générale qui en est sortie.",
  alternates: { canonical: "/revirements" },
  openGraph: {
    title: "Ce sur quoi je suis revenu",
    description:
      "Des décisions corrigées, tracées dans le dépôt, avec leur coût et la règle qui en est sortie.",
    url: "/revirements",
    siteName: "ADAMA OS",
    locale: "fr_FR",
    type: "website",
  },
};

export default async function RevirementsPage() {
  const revirements = await listRevirements();

  return (
    <PageShell className="turn-page">
      <PageIntro
        eyebrow="MÉTHODE / CORRECTIONS TRACÉES"
        title={
          <>
            Ce sur quoi
            <br />
            <span className="serif">je suis revenu.</span>
          </>
        }
        description="Chacune de ces décisions était défendable au moment où je l’ai prise. Chacune a été invalidée par une observation, pas par un changement d’avis. Ce qui est publié ici, ce n’est pas la liste des erreurs : c’est la trace de la correction, ce qu’elle a coûté, et la règle que j’en ai tirée."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">CORRECTIONS PUBLIÉES</span>
            <strong>{revirements.length}</strong>
            <p>
              chacune avec sa trace dans le dépôt et son coût. Les règles qui en
              sortent gouvernent le site entier.
            </p>
            <Link href="/principes">Voir les principes ↗</Link>
          </div>
        }
      />

      {revirements.length === 0 ? (
        <section className="metrics-empty">
          <p className="portfolio-label">LES CORRECTIONS</p>
          <h2>
            Aucune correction <span className="serif">servie.</span>
          </h2>
          <p>
            Le journal est vide, injoignable, ou ses entrées attendent d’être
            relues. Une correction affirme des choses sur mon propre travail :
            elle ne se publie pas avant que je l’aie relue.
          </p>
          <Link className="portfolio-text-link" href="/decisions">
            Ouvrir le journal des décisions <span aria-hidden="true">→</span>
          </Link>
        </section>
      ) : (
        <ol className="turn-list">
          {revirements.map((r) => {
            const revirement = r.revirement;
            if (!revirement) {
              return null;
            }
            const trace = (r.evidence_refs ?? []).find(
              (p) => adresseDePreuve(p) !== null,
            );
            const adresse = trace ? adresseDePreuve(trace) : null;
            return (
              <li key={r.adr_id} className="turn-entry">
                <div className="turn-entry-head">
                  <span className="turn-id">{r.adr_id}</span>
                  <h2>{r.title}</h2>
                  <time dateTime={r.date}>{formatDate(r.date)}</time>
                </div>

                <div className="turn-grid">
                  <div className="turn-field">
                    <span className="portfolio-label">CE QUE JE CROYAIS</span>
                    <p>{revirement.croyais}</p>
                  </div>
                  <div className="turn-field">
                    <span className="portfolio-label">
                      CE QUI L’A INVALIDÉE
                    </span>
                    <p>{revirement.invalide}</p>
                  </div>
                  <div className="turn-field">
                    <span className="portfolio-label">CE QUE J’AI FAIT</span>
                    <p>{revirement.fait}</p>
                  </div>
                </div>

                <div className="turn-cout">
                  <span className="portfolio-label">CE QUE CELA M’A COÛTÉ</span>
                  <p>{revirement.cout}</p>
                  {revirement.coutEstime ? (
                    <p className="turn-cout-note">
                      Coût mesuré sur le diff, pas chronométré. Le dépôt dit
                      combien de lignes ont été jetées ; il ne dit pas combien
                      d’heures elles avaient coûté.
                    </p>
                  ) : null}
                </div>

                <p className="turn-regle">{revirement.regle}</p>

                <div className="turn-liens">
                  <Link href={`/decisions/${r.adr_id}`}>
                    La décision d’origine, {r.adr_id}{" "}
                    <span aria-hidden="true">→</span>
                  </Link>
                  {r.remplacePar ? (
                    <Link href={`/decisions/${r.remplacePar}`}>
                      Celle qui la remplace, {r.remplacePar}{" "}
                      <span aria-hidden="true">→</span>
                    </Link>
                  ) : null}
                  {adresse ? (
                    <a href={adresse} target="_blank" rel="noopener noreferrer">
                      La trace dans le dépôt, {trace?.locator}{" "}
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <section className="page-next">
        <div>
          <p className="portfolio-label">CE QUI EN SORT</p>
          <h2>
            Cinq règles, <span className="serif">payées comptant.</span>
          </h2>
          <p>
            Chaque correction produit une règle générale. Ces règles ne sont pas
            déclarées : elles sont dérivées de ce qui précède, et chacune porte
            le prix qu’elle fait payer.
          </p>
        </div>
        <Link href="/principes" className="portfolio-button primary">
          Lire les principes <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}
