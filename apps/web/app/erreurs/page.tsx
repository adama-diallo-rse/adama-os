import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, PageShell } from "../../components/page-shell";
import {
  CATEGORIES_ERREUR,
  ERREURS,
  mesurerConversion,
} from "../../content/erreurs";
import { absoluteUrl } from "../../lib/site";

const CHEMIN = "/erreurs";
const mesure = mesurerConversion();

export const metadata: Metadata = {
  title: "Registre public des erreurs",
  description:
    "Les erreurs constatées dans ADAMA OS, ce qu’elles ont changé et les méthodes vérifiables qui en sont sorties.",
  alternates: { canonical: CHEMIN },
  openGraph: {
    title: "Registre public des erreurs",
    description:
      "Cinq blocs, onze catégories et une seule mesure : combien d’erreurs sont devenues des méthodes.",
    url: CHEMIN,
    siteName: "ADAMA OS",
    locale: "fr_FR",
    type: "website",
  },
};

const registreJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Registre public des erreurs",
  url: absoluteUrl(CHEMIN),
  inLanguage: "fr-FR",
  numberOfItems: ERREURS.length,
  hasPart: ERREURS.map((erreur) => ({
    "@type": "Article",
    headline: `${erreur.id} · ${erreur.titre}`,
    datePublished: erreur.date,
    url: absoluteUrl(`${CHEMIN}#${erreur.id.toLowerCase()}`),
  })),
};

const BLOCS = [
  ["Ce que je pensais", "pense"],
  ["Ce que les faits ont montré", "faits"],
  ["Pourquoi je me suis trompé", "cause"],
  ["Ce que je change", "changement"],
  ["Ce que ça implique pour STRATA ESG", "implication"],
] as const;

export default function ErreursPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(registreJsonLd) }}
      />
      <PageShell className="erreurs-page">
        <PageIntro
          eyebrow="CORPUS / ERROR LOG"
          title={
            <>
              Les erreurs qui deviennent
              <br />
              <span className="serif">des méthodes.</span>
            </>
          }
          description="Une erreur n’est publiée ni pour se confesser, ni pour meubler un récit. Elle entre ici quand les faits sont établis, que la correction est traçable et qu’une règle réutilisable en est sortie."
          aside={
            <div className="intro-note error-conversion">
              <span className="intro-note-label">CONVERSION DU REGISTRE</span>
              <strong>
                {mesure.converties}/{mesure.publiees}
              </strong>
              <p>
                erreurs publiées converties en méthodes. Le taux est de{" "}
                {mesure.taux ?? 0} %, calculé depuis le registre.
              </p>
            </div>
          }
        />

        <section className="error-doctrine" aria-labelledby="regle-erreurs">
          <p className="portfolio-label">RÈGLE DE PUBLICATION</p>
          <h2 id="regle-erreurs">
            Publier quand la correction est vérifiable,
            <span className="serif"> pas quand l’histoire est flatteuse.</span>
          </h2>
          <div>
            <p>
              Chaque entrée garde le même gabarit en cinq blocs. Une source
              primaire accompagne les faits. Une méthode n’est comptée comme
              conversion que lorsqu’une règle explicite ferme le même défaut.
            </p>
            <p>
              Une erreur ouverte peut donc rester sans méthode. Elle fera
              baisser le compteur, et c’est voulu.
            </p>
          </div>
        </section>

        <section
          className="error-taxonomy"
          aria-labelledby="categories-erreurs"
        >
          <div>
            <p className="portfolio-label">TAXONOMIE / ONZE CATÉGORIES</p>
            <h2 id="categories-erreurs">Nommer le type avant d’expliquer.</h2>
          </div>
          <ol>
            {CATEGORIES_ERREUR.map((categorie, index) => (
              <li key={categorie}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {categorie}
              </li>
            ))}
          </ol>
        </section>

        <section className="error-register" aria-labelledby="entrees-erreurs">
          <div className="error-register-heading">
            <p className="portfolio-label">
              REGISTRE / DU PLUS RÉCENT AU PLUS ANCIEN
            </p>
            <h2 id="entrees-erreurs">Les faits, puis la méthode.</h2>
          </div>

          <div className="error-entries">
            {ERREURS.map((erreur) => (
              <article id={erreur.id.toLowerCase()} key={erreur.id}>
                <header>
                  <div>
                    <code>{erreur.id}</code>
                    <time dateTime={erreur.date}>
                      {new Intl.DateTimeFormat("fr-FR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        timeZone: "Europe/Paris",
                      }).format(new Date(`${erreur.date}T12:00:00+02:00`))}
                    </time>
                  </div>
                  <h3>{erreur.titre}</h3>
                  <p>
                    <span>{erreur.categorie}</span>
                    <span data-status={erreur.statut}>
                      {erreur.statut === "convertie"
                        ? "Convertie en méthode"
                        : "Correction ouverte"}
                    </span>
                  </p>
                </header>

                <dl className="error-five-blocks">
                  {BLOCS.map(([label, champ], index) => (
                    <div key={champ}>
                      <dt>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        {label}
                      </dt>
                      <dd>{erreur[champ]}</dd>
                    </div>
                  ))}
                </dl>

                {erreur.methode && (
                  <aside className="error-method" aria-label="Méthode obtenue">
                    <p className="portfolio-label">MÉTHODE OBTENUE</p>
                    <h4>{erreur.methode.titre}</h4>
                    <p>{erreur.methode.regle}</p>
                  </aside>
                )}

                <footer>
                  <span>Sources de vérification</span>
                  <nav aria-label={`Sources de ${erreur.id}`}>
                    {erreur.sources.map((source) => (
                      <a
                        key={source.href}
                        href={source.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {source.label} <span aria-hidden="true">↗</span>
                      </a>
                    ))}
                  </nav>
                </footer>
              </article>
            ))}
          </div>
        </section>

        <section className="page-next">
          <div>
            <p className="portfolio-label">SYSTÈME / MODES DE PANNE</p>
            <h2>
              Voir ce qui échoue <span className="serif">avant l’erreur.</span>
            </h2>
            <p>
              La page de santé décrit les pannes rejouables et ce que le système
              refuse de fabriquer lorsqu’une source ne répond plus.
            </p>
          </div>
          <Link href="/systeme/pannes" className="portfolio-button primary">
            Ouvrir les modes de panne <span aria-hidden="true">→</span>
          </Link>
        </section>
      </PageShell>
    </>
  );
}
