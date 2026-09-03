import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import { SystemeChain } from "../../components/systeme-chain";
import { PARALLELE, SIGNATURE } from "../../content/systeme";

// =====================================================================
// C14-T2 et C14-T3, comment ce site fonctionne.
//
// L'autoreference. Le site explique sa propre chaine de preuve, avec le
// vocabulaire exact que les produits du groupe emploient pour la donnee de
// durabilite. Le lecteur comprend alors que ce portfolio n'est pas une
// vitrine du travail d'Adama : c'est une execution en conditions reelles de
// sa methode.
//
// Interdit tenu ici : la chaine n'est PAS appliquee a une donnee de
// durabilite reelle sur ce site. La colonne de gauche decrit une methode,
// elle ne montre aucun chiffre. Confondre les deux couterait cher.
// =====================================================================

export const metadata: Metadata = {
  title: "Comment ce site fonctionne",
  description:
    "La chaîne complète, des sources au lecteur, avec pour chaque étape le fichier ou la table qui l’implémente. Et la même chaîne, appliquée à une donnée de durabilité puis à une affirmation professionnelle.",
  alternates: { canonical: "/systeme" },
  openGraph: {
    title: "Comment ce site fonctionne",
    description:
      "La chaîne de preuve du site, étape par étape, avec son implémentation réelle.",
    url: "/systeme",
    siteName: "Adama OS",
    locale: "fr_FR",
    type: "website",
  },
};

export default function SystemePage() {
  return (
    <PageShell className="dna-page">
      <PageIntro
        eyebrow="SYSTÈME / AUTORÉFÉRENCE"
        title={
          <>
            Comment ce site
            <br />
            <span className="serif">fonctionne.</span>
          </>
        }
        description="Ce site ne se contente pas de décrire une méthode, il en est une exécution. Voici sa chaîne complète, des sources au lecteur, avec pour chaque étape le fichier ou la table qui l’implémente réellement. Une étape qui ne peut pas nommer son implémentation n’est pas une étape, c’est une case de schéma."
        aside={
          <div className="intro-note">
            <span className="intro-note-label">LA CHAÎNE</span>
            <strong>7</strong>
            <p>
              étapes, chacune nommant le code qui la tient. Rien ne traverse
              sans être qualifié.
            </p>
            <Link href="/preuves">Voir le registre ↗</Link>
          </div>
        }
      />

      <SystemeChain />

      <section className="dna-parallele" aria-labelledby="parallele-title">
        <div className="dna-parallele-intro">
          <p className="portfolio-label">LA MÊME CHAÎNE, DEUX FOIS</p>
          <h2 id="parallele-title">
            Une donnée de durabilité,
            <br />
            <span className="serif">une affirmation professionnelle.</span>
          </h2>
          <p>
            À gauche, ce qu’un produit du groupe exige d’une donnée de
            durabilité. À droite, ce que ce site exige de chaque phrase qu’il
            publie sur mon travail. C’est la même discipline, appliquée à deux
            matières différentes.
          </p>
          <p className="dna-parallele-garde">
            Aucune donnée de durabilité réelle n’est traitée ici. La colonne de
            gauche décrit une méthode, elle ne montre aucun chiffre : confondre
            les deux coûterait cher.
          </p>
        </div>

        <div className="data-table-scroll">
          <table className="data-table dna-table">
            <thead>
              <tr>
                <th scope="col">Maillon</th>
                <th scope="col">Sur une donnée de durabilité</th>
                <th scope="col">Sur une affirmation de ce site</th>
              </tr>
            </thead>
            <tbody>
              {PARALLELE.map((ligne) => (
                <tr key={ligne.maillon}>
                  <th scope="row">{ligne.maillon}</th>
                  <td>{ligne.durabilite}</td>
                  <td>{ligne.portfolio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dna-signature">
        <blockquote>
          <p>{SIGNATURE}</p>
        </blockquote>
      </section>

      <section className="page-next">
        <div>
          <p className="portfolio-label">QUAND LA CHAÎNE CASSE</p>
          <h2>
            Sept capacités, <span className="serif">trois états.</span>
          </h2>
          <p>
            L’état réel de chaque capacité, les huit façons dont ce site peut
            tomber, et ce qu’il ne fait jamais pour masquer une panne.
          </p>
        </div>
        <Link href="/systeme/pannes" className="portfolio-button primary">
          Voir la santé du système <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="page-next">
        <div>
          <p className="portfolio-label">LES RÈGLES</p>
          <h2>
            Cinq principes, <span className="serif">tous dérivés.</span>
          </h2>
          <p>
            Aucun n’a été écrit avant l’erreur qui l’a produit, et chacun porte
            son coût.
          </p>
        </div>
        <Link href="/principes" className="portfolio-button primary">
          Lire les principes <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}
