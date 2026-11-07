import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { BoutonRendezVous, PhotoCadre } from "../../components/accueil/offre";
import {
  CarteParisDakar,
  IllustrationSemaine,
} from "../../components/kit/illustrations-offre";
import { PHOTOS } from "../../content/accompagnement";
import {
  ETAPES_TRAVAIL,
  REGLES_TRAVAIL,
  VERIFICATIONS,
} from "../../content/comment-je-travaille";

// =====================================================================
// Comment je travaille, 7 novembre 2026.
//
// La page qu'un visiteur lit avant d'écrire : ce qui se passe, dans quel
// ordre, selon quelles règles, et comment il peut tout vérifier sans me
// croire sur parole. Elle compose des contenus déjà tenus ailleurs.
// =====================================================================

export const metadata: Metadata = {
  title: "Comment je travaille",
  description:
    "Du premier échange au bilan : les étapes d’une collaboration, les six règles que je tiens, et tout ce que vous pouvez vérifier vous-même avant de m’écrire.",
  alternates: { canonical: "/comment-je-travaille" },
  openGraph: {
    title: "Comment je travaille",
    url: "/comment-je-travaille",
    siteName: "ADAMA OS",
    locale: "fr_FR",
    type: "website",
  },
};

export default function CommentJeTravaillePage() {
  return (
    <PageShell className="comment-page offre-page">
      <PageIntro
        eyebrow="MÉTHODES / COMMENT JE TRAVAILLE"
        title={
          <>
            Écrit, daté,
            <br />
            <span className="serif">et vérifiable.</span>
          </>
        }
        description="Avant de m’écrire, vous pouvez savoir exactement ce qui va se passer : les étapes, les règles que je tiens, et où vérifier chacune d’elles sans me croire sur parole."
        aside={
          <PhotoCadre
            photo={PHOTOS.seance}
            sizes="(max-width: 960px) 100vw, 30vw"
            priorite
            className="offre-intro-photo"
          />
        }
      />

      <section
        className="offre-bloc"
        id="etapes"
        aria-labelledby="etapes-titre"
      >
        <div className="offre-bloc-tete">
          <div>
            <p className="portfolio-label">LES ÉTAPES</p>
            <h2 id="etapes-titre">
              Du premier échange <span className="serif">au bilan.</span>
            </h2>
          </div>
          <p>
            Quatre temps, toujours dans cet ordre. Rien ne commence sans une
            proposition écrite, et rien ne se termine sans un bilan.
          </p>
        </div>
        <ol className="etapes-travail">
          {ETAPES_TRAVAIL.map((e, i) => (
            <li key={e.titre} className="etape-travail" data-revele>
              <div className="etape-travail-vignette" aria-hidden="true">
                <IllustrationSemaine numero={e.vignette} />
              </div>
              <p className="etape-travail-tete">
                <span>0{i + 1}</span> {e.duree}
              </p>
              <h3>{e.titre}</h3>
              <p>{e.texte}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="offre-bloc feuille-encre regles-bloc"
        id="regles"
        aria-labelledby="regles-titre"
      >
        <div className="offre-bloc-tete">
          <div>
            <p className="portfolio-label">LES RÈGLES</p>
            <h2 id="regles-titre">
              Six règles, <span className="serif">tenues en public.</span>
            </h2>
          </div>
          <p>
            Ce sont les règles qui ont construit STRATA ESG, Pharivo et Conhama.
            Elles s’appliquent à votre projet comme aux miens.
          </p>
        </div>
        <ol className="regles">
          {REGLES_TRAVAIL.map((r, i) => (
            <li key={r.titre} className="regle" data-revele>
              <span className="regle-numero">0{i + 1}</span>
              <h3>{r.titre}</h3>
              <p>{r.texte}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="offre-bloc"
        id="verifier"
        aria-labelledby="verifier-titre"
      >
        <div className="offre-bloc-tete">
          <div>
            <p className="portfolio-label">VÉRIFIER</p>
            <h2 id="verifier-titre">
              Ne me croyez pas <span className="serif">sur parole.</span>
            </h2>
          </div>
          <p>
            Tout ce que j’affirme ici se vérifie sur le site lui-même, sans
            compte et sans m’écrire.
          </p>
        </div>
        <ul className="verifier-liens">
          {VERIFICATIONS.map((v) => (
            <li key={v.href}>
              <Link href={v.href}>
                <strong>{v.titre}</strong>
                <span>{v.texte}</span>
                <span className="verifier-fleche" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="offre-bloc offre-ancrage feuille-indigo"
        id="ou"
        aria-labelledby="ou-titre"
      >
        <div>
          <p className="portfolio-label">OÙ ET EN QUELLE LANGUE</p>
          <h2 id="ou-titre">
            Paris, Dakar, <span className="serif">ou à distance.</span>
          </h2>
          <p>
            Je travaille entre Paris et Dakar, avec des porteurs de projets en
            France et en Afrique de l’Ouest. En français, et l’échange peut
            commencer en wolof ou en pular.
          </p>
          <div className="sante-actions">
            <BoutonRendezVous>
              Réserver un premier échange <span aria-hidden="true">→</span>
            </BoutonRendezVous>
            <Link href="/travaillez-avec-moi" className="bouton bouton-contour">
              Les formats
            </Link>
          </div>
        </div>
        <div className="ancrage-carte">
          <CarteParisDakar titre="Carte de l’Afrique et de l’Europe de l’Ouest : le Sénégal en latérite, Dakar relié à Paris." />
        </div>
      </section>
    </PageShell>
  );
}
