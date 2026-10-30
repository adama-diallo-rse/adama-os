import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import {
  CHAMPS_FICHE,
  ETATS_METHODE,
  METHODES,
  methodesProuvees,
} from "../../content/methodes";

// EM0 et EM1 : la bibliothèque des sept méthodes, leur état exact et la
// fiche type à dix-sept champs. Aucun état n'est affiché sans sa preuve
// publique datée, et PROUVÉ ne s'affiche que porté par une mesure publiée.

const CHEMIN = "/methodes";
const compte = methodesProuvees();

export const metadata: Metadata = {
  title: "Bibliothèque des méthodes",
  description:
    "Sept méthodes, leur état de maturité exact, la preuve qui le justifie et ce qu'il faut pour monter.",
  alternates: { canonical: CHEMIN },
  openGraph: {
    title: "Bibliothèque des méthodes",
    description:
      "M-001 à M-007 : l'état de chaque méthode, sa preuve publique et sa prochaine condition.",
    url: CHEMIN,
    siteName: "ADAMA OS",
    locale: "fr_FR",
    type: "website",
  },
};

const parEtat = ETATS_METHODE.map((etat) => ({
  etat,
  nombre: METHODES.filter((m) => m.etat === etat).length,
}));

export default function MethodesPage() {
  return (
    <PageShell className="methodes-page strates-page">
      <PageIntro
        eyebrow="M-001 À M-007 / BIBLIOTHÈQUE DES MÉTHODES"
        title={
          <>
            Sept méthodes,
            <br />
            <span className="serif">et l’état exact de chacune.</span>
          </>
        }
        description="Une méthode livre une manière de faire, jamais un logiciel. Chacune porte ici son état de maturité, la preuve publique qui le justifie, ses limites et la condition qui la ferait monter. Aucun état ne monte sans mesure publiée."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">MÉTHODES À L’ÉTAT PROUVÉ</span>
            <strong>
              {compte.prouvees}/{compte.total}
            </strong>
            <p>
              lu dans les fiches. Le label se gagne en publiant une mesure, pas
              en ayant construit quelque chose qui marche.
            </p>
          </div>
        }
      />

      <section className="strates-echelle" aria-labelledby="echelle-etats">
        <div>
          <p className="portfolio-label">ÉCHELLE / CINQ ÉTATS</p>
          <h2 id="echelle-etats">
            Rien ne saute d’état,
            <span className="serif"> rien ne monte sans preuve.</span>
          </h2>
        </div>
        <ol tabIndex={0} aria-label="Les cinq états, défilables">
          {parEtat.map(({ etat, nombre }, index) => (
            <li key={etat} data-etat={etat} data-vide={nombre === 0}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{etat}</strong>
              <em>{nombre}</em>
              <i
                aria-hidden="true"
                style={{ ["--part" as string]: nombre / METHODES.length }}
              />
            </li>
          ))}
        </ol>
      </section>

      <section className="strates-cartes" aria-labelledby="sept-methodes">
        <div className="strates-titre">
          <p className="portfolio-label">REGISTRE / SEPT FICHES</p>
          <h2 id="sept-methodes">Chaque état avec sa prochaine condition.</h2>
        </div>
        <ul>
          {METHODES.map((methode, index) => (
            <li
              key={methode.identifiant}
              style={{ ["--rang" as string]: index }}
            >
              <Link href={`/methodes/${methode.identifiant.toLowerCase()}`}>
                <header>
                  <code>{methode.identifiant}</code>
                  <span className="strates-etat" data-etat={methode.etat}>
                    {methode.etat}
                  </span>
                </header>
                <h3>{methode.nomAffiche}</h3>
                <p>{methode.composants[0]}</p>
                <footer>
                  <span>Pour monter</span>
                  <p>{methode.pourMonter}</p>
                </footer>
                <span className="strates-lien">
                  Lire la fiche <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="strates-fiche-type" aria-labelledby="fiche-type">
        <div className="strates-titre">
          <p className="portfolio-label">FICHE TYPE / DIX-SEPT CHAMPS</p>
          <h2 id="fiche-type">
            Un champ vide s’affiche comme un manque,
            <span className="serif"> jamais rempli pour la forme.</span>
          </h2>
          <p>
            Seize champs viennent des sources additionnées sans doublon. Le
            dix-septième, la mesure publiée, est celui sans lequel rien ne
            refuserait un PROUVÉ sans mesure.
          </p>
        </div>
        <ol>
          {CHAMPS_FICHE.map((champ, index) => (
            <li key={champ.champ}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{champ.champ}</strong>
                <small>{champ.source}</small>
              </div>
              <p>{champ.valeur}</p>
              <p>{champ.vide}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="page-next">
        <div>
          <p className="portfolio-label">M-001 / MESURE PUBLIÉE</p>
          <h2>
            La première mesure de résultat,
            <span className="serif"> défavorable comprise.</span>
          </h2>
          <p>
            Un tiers sans compte a relu les preuves publiques du site. Le
            chiffre, sa méthode et ce qu’il ne prouve pas sont publiés avec lui.
          </p>
        </div>
        <Link
          href="/methodes/m-001#mesure"
          className="portfolio-button primary"
        >
          Lire la mesure <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}
