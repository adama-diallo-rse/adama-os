import type { Metadata } from "next";
import Link from "next/link";
import { IllustrationPorte } from "../../components/kit/illustrations-portes";
import { PageIntro, PageShell } from "../../components/page-shell";
import {
  BoutonRendezVous,
  Formules,
  PhotoCadre,
  Questions,
  Resultats,
  RouteSemaines,
  Situations,
} from "../../components/accueil/offre";
import { LogosConfiance } from "../../components/accueil/logos-confiance";
import {
  CarteParisDakar,
  SceneTransformation,
} from "../../components/kit/illustrations-offre";
import { CONTACT_EMAIL } from "../../components/types";
import { absoluteUrl } from "../../lib/site";
import { IDENTITE } from "../../content/profil";
import {
  ETAT_OFFRE,
  FORMULES,
  HORS_PERIMETRE,
  PHOTOS,
  PROMESSE,
  RENVOI_DURABILITE,
} from "../../content/accompagnement";
import {
  CAPACITE,
  CLAUSE_RENVOI,
  CONDITIONS,
  INTERDITS,
  MENTION_DEMANDE,
  PORTES,
  VERROUS,
  periodeCourante,
  type CodePorte,
} from "../../content/conseil";
import { URL_STRATA } from "../../content/parcours";
import { EDITEUR } from "../../lib/legal";
import { lireConfigLettre } from "../../lib/lettre/config";
import { CODES_PORTE } from "../../lib/conseil/qualification";
import { demandesOuvertes } from "../../lib/conseil/registre";
import { FormulaireDemande } from "./formulaire";

// =====================================================================
// EG0, AXP-59, la page « travaillez avec moi ».
//
// Une page, quatre chemins, un formulaire commun. Le visiteur se range
// lui-meme, ce qui qualifie la demande avant le premier echange.
//
// Aucun prix sur cette page (EG0) : le prix vient apres la qualification,
// dans la proposition ecrite, ou sur la page du format quand il sert de
// filtre (le diagnostic court). Le plafond de capacite est affiche comme
// une regle tenue, pas comme une excuse (EG9).
// =====================================================================

export const metadata: Metadata = {
  title: "Travailler ensemble",
  description:
    "La méthode d’ADAMA OS appliquée à votre projet : accompagnement de six semaines, revue d’architecture, second avis. Déroulé semaine par semaine, formats et premier échange gratuit.",
  alternates: { canonical: "/travaillez-avec-moi" },
  openGraph: {
    title: "Travailler ensemble, la méthode appliquée à votre projet",
    description: PROMESSE.phrase,
    url: "/travaillez-avec-moi",
    siteName: "ADAMA OS",
    locale: "fr_FR",
    type: "website",
  },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function lirePorte(brut: string | string[] | undefined): CodePorte | null {
  return typeof brut === "string" &&
    (CODES_PORTE as readonly string[]).includes(brut)
    ? (brut as CodePorte)
    : null;
}

export default async function TravaillezAvecMoiPage({ searchParams }: Props) {
  const porteInitiale = lirePorte((await searchParams).porte);
  const periode = periodeCourante();
  const relie = lireConfigLettre().ok && demandesOuvertes();
  const verrouAssurance = VERROUS.assurance;

  // 7 novembre 2026 : l'offre déclarée aux moteurs de recherche, en
  // Service schema.org, depuis la même source que la page. Aucun prix
  // n'est publié : la grille reste interne (décision du 7 novembre 2026).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Travailler ensemble : accompagnement, revue et second avis",
    serviceType: "Accompagnement et structuration de projets",
    description: PROMESSE.phrase,
    url: absoluteUrl("/travaillez-avec-moi"),
    provider: {
      "@type": "Person",
      name: IDENTITE.nom,
      url: absoluteUrl("/a-propos"),
    },
    areaServed: [
      { "@type": "Country", name: "France" },
      { "@type": "Country", name: "Sénégal" },
    ],
    availableLanguage: ["fr"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Formules",
      itemListElement: FORMULES.map((f) => ({
        "@type": "Offer",
        name: f.titre,
        description: f.pourQuoi,
      })),
    },
  };

  return (
    <PageShell className="conseil-page offre-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <PageIntro
        eyebrow="TRAVAILLER ENSEMBLE / CONSEIL"
        title={
          <>
            La même méthode,
            <br />
            <span className="serif">appliquée à votre projet.</span>
          </>
        }
        description={`Trois formats selon votre besoin : un accompagnement de six semaines pour structurer et lancer, une revue pour faire relire un système, un second avis ponctuel. ${ETAT_OFFRE.texte}`}
        aside={
          <PhotoCadre
            photo={PHOTOS.equipe}
            sizes="(max-width: 960px) 100vw, 30vw"
            priorite
            className="offre-intro-photo"
          />
        }
      />

      <div className="offre-actions-intro">
        <BoutonRendezVous>
          Réserver un premier échange <span aria-hidden="true">→</span>
        </BoutonRendezVous>
        <a href="#programme" className="bouton bouton-contour">
          Voir le programme
        </a>
      </div>

      <LogosConfiance id="confiance" compact />

      <section
        className="offre-bloc offre-pour-qui"
        aria-labelledby="offre-pour-qui-titre"
      >
        <div>
          <p className="portfolio-label">L’ACCOMPAGNEMENT, POUR QUI</p>
          <h2 id="offre-pour-qui-titre">
            Vous avez le projet.{" "}
            <span className="serif">Il vous manque le plan.</span>
          </h2>
          <Situations />
        </div>
        <div className="offre-resultats">
          <p className="portfolio-label">CE QUI VOUS RESTE À LA FIN</p>
          <Resultats />
          <p className="offre-hors-perimetre">
            Ce que je ne fais pas : {HORS_PERIMETRE.join(", ")}. Si votre besoin
            en relève, je vous le dis au premier appel.
          </p>
        </div>
      </section>

      <section
        className="offre-bloc"
        id="programme"
        aria-labelledby="programme-titre"
      >
        <div className="offre-bloc-tete">
          <div>
            <p className="portfolio-label">LE PROGRAMME DE SIX SEMAINES</p>
            <h2 id="programme-titre">
              Une séance par semaine,{" "}
              <span className="serif">un livrable à chaque fois.</span>
            </h2>
          </div>
          <p>
            Si le diagnostic montre qu’aucun besoin utilisateur n’est encore
            vérifié, la validation passe en premier. Si la demande est déjà là,
            l’effort porte sur l’exécution. Le programme s’adapte, la règle
            reste : chaque séance se termine par une décision.
          </p>
        </div>
        <div className="offre-scene feuille-encre" data-revele-media>
          <SceneTransformation titre="À gauche, des idées éparses, certaines en pointillé. Une ligne de six étapes les mène à droite vers un système posé : trois strates, un sceau, un tableau de pilotage et un baobab." />
        </div>
        <RouteSemaines />
      </section>

      <section
        className="offre-bloc offre-ancrage feuille-indigo"
        id="paris-dakar"
        aria-labelledby="paris-dakar-titre"
      >
        <div>
          <p className="portfolio-label">PARIS ET DAKAR</p>
          <h2 id="paris-dakar-titre">
            Deux villes, <span className="serif">un même terrain.</span>
          </h2>
          <p>
            Sénégalais, installé entre Paris et Dakar, j’accompagne des porteurs
            de projets des deux côtés. Je parle français et je comprends le
            wolof et le pular : l’échange peut commencer dans votre langue.
          </p>
        </div>
        <div className="ancrage-carte">
          <CarteParisDakar titre="Carte de l’Afrique et de l’Europe de l’Ouest : le Sénégal en latérite, Dakar relié à Paris par une ligne pointillée de 4 200 kilomètres." />
        </div>
      </section>

      <section
        className="offre-bloc"
        id="formules"
        aria-labelledby="formules-titre"
      >
        <div className="offre-bloc-tete">
          <div>
            <p className="portfolio-label">LES FORMATS</p>
            <h2 id="formules-titre">
              Un format principal,{" "}
              <span className="serif">trois plus courts.</span>
            </h2>
          </div>
          <p>
            L’accompagnement de six semaines, et trois formats pour un besoin
            précis. Tout commence par le même premier échange, et chaque format
            se fixe par écrit.
          </p>
        </div>
        <Formules
          action={
            <BoutonRendezVous>
              Réserver un premier échange <span aria-hidden="true">→</span>
            </BoutonRendezVous>
          }
        />
      </section>

      <section
        className="offre-bloc offre-rendez-vous"
        id="rendez-vous"
        aria-labelledby="rendez-vous-titre"
      >
        <div>
          <h2 id="rendez-vous-titre">
            Trente minutes, gratuites,{" "}
            <span className="serif">sans engagement.</span>
          </h2>
          <p>
            Vous me racontez votre projet, je vous dis honnêtement si je peux
            vous aider, et comment. Si ce n’est pas le cas, je vous oriente.
          </p>
        </div>
        <div className="offre-rendez-vous-actions">
          <BoutonRendezVous>
            Réserver un appel <span aria-hidden="true">→</span>
          </BoutonRendezVous>
          <a href={`mailto:${CONTACT_EMAIL}`} className="bouton bouton-contour">
            {CONTACT_EMAIL}
          </a>
        </div>
      </section>

      <section
        className="offre-bloc offre-questions"
        id="questions"
        aria-labelledby="questions-titre"
      >
        <div className="offre-bloc-tete">
          <div>
            <p className="portfolio-label">QUESTIONS</p>
            <h2 id="questions-titre">
              Avant de <span className="serif">réserver.</span>
            </h2>
          </div>
          <p>{RENVOI_DURABILITE}</p>
        </div>
        <Questions />
      </section>

      <div className="offre-esg" id="revues-esg">
        <div className="offre-esg-tete">
          <p className="portfolio-label">REVUES DE SYSTÈMES ESG</p>
          <h2>
            Vous concevez un système de donnée ESG ?{" "}
            <span className="serif">
              Choisissez la porte qui ressemble à votre problème.
            </span>
          </h2>
          <p>
            Une offre distincte de l’accompagnement : une relecture du système
            qui produit vos chiffres de durabilité, pas la production de vos
            chiffres. Chaque porte part d’un problème dit avec les mots de
            celles et ceux qui le vivent, et chaque demande reçoit une réponse
            écrite. Capacité, {periode.libelle.toLowerCase()} :{" "}
            {periode.plafond.toLowerCase()}
          </p>
        </div>

        <section className="conseil-portes" aria-labelledby="portes-titre">
          <h2 id="portes-titre" className="sr-only">
            Les quatre portes
          </h2>
          <ol>
            {PORTES.map((porte) => (
              <li key={porte.code} id={`porte-${porte.code}`}>
                <article className="conseil-porte porte-illustree">
                  <IllustrationPorte code={porte.code} />
                  <header>
                    <span className="conseil-porte-numero">{porte.numero}</span>
                    <h3>{porte.titre}</h3>
                  </header>
                  <blockquote>« {porte.probleme} »</blockquote>
                  <dl>
                    <div>
                      <dt>En premier</dt>
                      <dd>{porte.premierPas}</dd>
                    </div>
                    <div>
                      <dt>Ce que vous recevez</dt>
                      <dd>
                        <ul>
                          {porte.livre.map((l) => (
                            <li key={l}>{l}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                    <div>
                      <dt>Ce que vous ne recevez pas</dt>
                      <dd>{porte.neLivrePas}</dd>
                    </div>
                    <div>
                      <dt>Ordre de grandeur</dt>
                      <dd className="conseil-duree">{porte.duree}</dd>
                    </div>
                  </dl>
                  {porte.ouverture ? (
                    <p className="conseil-porte-ouverture">{porte.ouverture}</p>
                  ) : null}
                  <footer>
                    <Link
                      href={`?porte=${porte.code}#demande`}
                      scroll={false}
                      className="conseil-porte-choisir"
                    >
                      Entrer par cette porte <span aria-hidden="true">→</span>
                    </Link>
                    <Link
                      href={porte.suite.href}
                      className="conseil-porte-suite"
                    >
                      {porte.suite.libelle}
                    </Link>
                  </footer>
                </article>
              </li>
            ))}
          </ol>
        </section>

        <section className="conseil-regle" aria-labelledby="regle-titre">
          <div className="conseil-regle-tete">
            <p className="portfolio-label">LA RÈGLE D’ACCEPTATION</p>
            <h2 id="regle-titre">
              Une mission se refuse{" "}
              <span className="serif">si une seule condition manque.</span>
            </h2>
            <p>
              Elle est écrite avant la première demande, et elle vaut pour
              chacune. La lire avant d’écrire vous fait gagner du temps.
            </p>
          </div>
          <div className="conseil-regle-colonnes">
            <ol className="conseil-conditions">
              {CONDITIONS.map((c) => (
                <li key={c.code}>
                  <span>{c.numero}</span>
                  <div>
                    <p>{c.texte}</p>
                    <small>{c.verification}</small>
                  </div>
                </li>
              ))}
            </ol>
            <ul className="conseil-interdits" aria-label="Les quatre interdits">
              {INTERDITS.map((i) => (
                <li key={i.code}>
                  <strong>{i.titre}</strong>
                  <p>{i.texte}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="conseil-demande"
          id="demande"
          aria-labelledby="demande-titre"
        >
          <div className="conseil-demande-tete">
            <p className="portfolio-label">LE FORMULAIRE COMMUN</p>
            <h2 id="demande-titre">
              Décrivez le problème,{" "}
              <span className="serif">pas la solution.</span>
            </h2>
            <p>
              Quatre questions pour vous ranger, puis le problème. Si la règle
              ne peut pas être tenue, vous le saurez avant d’avoir écrit une
              ligne, avec l’adresse qui vous servira mieux.
            </p>
          </div>
          <FormulaireDemande
            key={porteInitiale ?? "aucune"}
            portes={PORTES.map((p) => ({
              code: p.code,
              numero: p.numero,
              titre: p.titre,
            }))}
            porteInitiale={porteInitiale}
            conditions={CONDITIONS.map((c) => ({
              numero: c.numero,
              texte: c.texte,
            }))}
            mentionVersion={MENTION_DEMANDE.version}
            texteCase={MENTION_DEMANDE.texteCase}
            relie={relie}
            contact={EDITEUR.contact}
            plafond={periode.plafond}
            mention={
              <>
                <dl>
                  {MENTION_DEMANDE.lignes.map((l) => (
                    <div key={l.label}>
                      <dt>{l.label}</dt>
                      <dd>{l.valeur}</dd>
                    </div>
                  ))}
                </dl>
                <p>
                  Accès, rectification et effacement :{" "}
                  <a href={`mailto:${EDITEUR.contact}`}>{EDITEUR.contact}</a>.
                  La politique du site entier est sur la page{" "}
                  <Link href="/confidentialite">confidentialité</Link>.
                </p>
              </>
            }
          />
        </section>

        <section className="conseil-capacite" aria-labelledby="capacite-titre">
          <div className="conseil-capacite-tete">
            <p className="portfolio-label">LE PLAFOND, PÉRIODE PAR PÉRIODE</p>
            <h2 id="capacite-titre">
              Peu de missions,{" "}
              <span className="serif">et c’est écrit d’avance.</span>
            </h2>
            <p>
              Une revue demande du temps de lecture que rien ne remplace. Le
              plafond se fixe avant la première vente, parce qu’après il se
              négocie avec soi-même.
            </p>
          </div>
          <ol className="conseil-periodes">
            {CAPACITE.map((p) => (
              <li
                key={p.debut}
                data-courante={p.debut === periode.debut ? "oui" : "non"}
              >
                <span className="conseil-periode-libelle">{p.libelle}</span>
                <strong>{p.plafond}</strong>
                {p.debut === periode.debut ? (
                  <span className="conseil-periode-marque">
                    Période en cours
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          {!verrouAssurance.leve ? (
            <p className="conseil-verrou">
              <span>{verrouAssurance.code}</span>
              Aucune revue n’est vendue avant la souscription de{" "}
              {verrouAssurance.objet} qui la couvre. Une demande reçue avant est
              lue, qualifiée et datée : elle n’est pas vendue.
            </p>
          ) : null}
        </section>

        <section className="review-boundary">
          <div>
            <p className="portfolio-label">FRONTIÈRE</p>
            <h2>
              ADAMA OS explique la construction. STRATA ESG livre le logiciel.
            </h2>
          </div>
          <p>{CLAUSE_RENVOI}</p>
          <a href={URL_STRATA} target="_blank" rel="noopener noreferrer">
            Voir STRATA ESG ↗
          </a>
        </section>
      </div>

      <section className="page-next">
        <div>
          <p className="portfolio-label">PAS ENCORE PRÊT</p>
          <h2>
            Lire la méthode <span className="serif">avant d’écrire.</span>
          </h2>
          <p>
            La méthode publique relie une idée, une décision, une preuve et un
            actif réutilisable. Elle suffit parfois à trancher seul.
          </p>
        </div>
        <Link href="/methode" className="portfolio-button primary">
          Lire la méthode <span aria-hidden="true">→</span>
        </Link>
      </section>
    </PageShell>
  );
}
