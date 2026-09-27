import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import {
  MARQUAGES,
  POSITION_DATEE,
  POSITION_EN,
  POSITION_FR,
} from "../../content/assistance";

// ET0, XDEC-28 : la position publique sur l'écriture avec assistance, dite
// une fois, à un seul endroit, puis le registre des mentions par objet.

const CHEMIN = "/ecriture";

export const metadata: Metadata = {
  title: "Écriture et assistance",
  description:
    "Ce qui est écrit avec assistance sur ce site, ce qui ne l'est jamais, qui relit et comment chaque objet le signale.",
  alternates: { canonical: CHEMIN },
  openGraph: {
    title: "Écriture et assistance",
    description:
      "Une position dite une fois, et le registre des mentions de chaque objet publié.",
    url: CHEMIN,
    siteName: "ADAMA OS",
    locale: "fr_FR",
    type: "website",
  },
};

const dateLongue = (date: string, langue = "fr-FR") =>
  new Intl.DateTimeFormat(langue, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(new Date(`${date}T12:00:00+02:00`));

export default function EcriturePage() {
  return (
    <PageShell className="ecriture-page strates-page">
      <PageIntro
        eyebrow="ET0 / POSITION PUBLIQUE"
        title={
          <>
            Écrit avec assistance,
            <br />
            <span className="serif">ou pas. Dit une fois.</span>
          </>
        }
        description="Ce qui est écrit avec assistance sur ce site et ce qui ne l’est jamais, qui relit, et comment chaque objet publié le signale. La position porte sa date et sa date de revue."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">POSITION DATÉE</span>
            <strong>
              <time dateTime={POSITION_DATEE.ecriteLe}>
                {dateLongue(POSITION_DATEE.ecriteLe)}
              </time>
            </strong>
            <p>
              Revue au plus tard le{" "}
              <time dateTime={POSITION_DATEE.revueAuPlusTardLe}>
                {dateLongue(POSITION_DATEE.revueAuPlusTardLe)}
              </time>
              , ou plus tôt si la pratique change.
            </p>
          </div>
        }
      />

      <section className="strates-position" aria-labelledby="position-fr">
        <article lang="fr">
          <p className="portfolio-label">FRANÇAIS</p>
          <h2 id="position-fr">{POSITION_FR.titre}</h2>
          {POSITION_FR.paragraphes.map((p, i) => (
            <p key={p} style={{ ["--rang" as string]: i }}>
              {p}
            </p>
          ))}
        </article>
        <article lang="en">
          <p className="portfolio-label">ENGLISH</p>
          <h2>{POSITION_EN.titre}</h2>
          {POSITION_EN.paragraphes.map((p, i) => (
            <p key={p} style={{ ["--rang" as string]: i }}>
              {p}
            </p>
          ))}
        </article>
      </section>

      <section className="strates-marquage" aria-labelledby="registre-mentions">
        <div className="strates-titre">
          <p className="portfolio-label">REGISTRE / MENTION PAR OBJET</p>
          <h2 id="registre-mentions">
            Chaque objet publié dit ce qui l’a produit,
            <span className="serif"> et qui l’a relu.</span>
          </h2>
        </div>
        <div
          className="strates-table"
          role="region"
          aria-label="Registre des mentions"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th scope="col">Objet</th>
                <th scope="col">Référence</th>
                <th scope="col">Mention</th>
                <th scope="col">Relu par</th>
                <th scope="col">Relu le</th>
              </tr>
            </thead>
            <tbody>
              {MARQUAGES.map((m) => (
                <tr key={m.href}>
                  <td>{m.objet}</td>
                  <td>
                    <Link href={m.href}>{m.reference}</Link>
                  </td>
                  <td>{m.part}</td>
                  <td>{m.relecteur}</td>
                  <td>
                    <time dateTime={m.reluLe}>{dateLongue(m.reluLe)}</time>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="page-next">
        <div>
          <p className="portfolio-label">ERREURS / CORRECTIONS PUBLIQUES</p>
          <h2>
            Une erreur publiée se corrige
            <span className="serif"> à côté de l’ancien texte.</span>
          </h2>
          <p>
            Relire ligne à ligne ne rend pas infaillible. Ce qui s’avère faux
            est corrigé publiquement, daté, avec ce qui était écrit.
          </p>
        </div>
        <Link href="/erreurs" className="portfolio-button primary">
          Ouvrir le registre des erreurs <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}
