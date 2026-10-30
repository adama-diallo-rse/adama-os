"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useThemeBoot } from "../lib/theme";
import { IlotOutils } from "./outils-differes-ilot";
import { SiteHeader } from "./site-header";
import { ProjectGrid } from "./project-grid";
import { SkillCards } from "./skill-cards";
import { SignalSignup } from "./signal-signup";
import { Signature } from "./signature";
import { OutboundLink } from "./outbound-link";
import { OrgMark, aUneMarque } from "./org-logo";
import { PiedDePage } from "./page-shell";
import { Symbole } from "./marque/symbole";
import { SceneIsometrique } from "./kit/scene-isometrique";
import { Accent, Fleche, SurTitre, TraitMain } from "./kit/elements";
import { Rideau } from "./accueil/rideau";
import { DemonstrationMoteur } from "./accueil/demonstration-moteur";
import { BlocCitation } from "./accueil/bloc-citation";
import { TableauRegimes } from "./accueil/tableau-regimes";
import { Defile } from "./accueil/defile";
import { NavigationAncres, type Ancre } from "./accueil/navigation-ancres";
import { IleMouvement } from "./mouvement/ile-mouvement";
import { IleSymbole3D } from "./mouvement/ile-symbole-3d";
import { CONTACT_EMAIL, type DashboardData } from "./types";
import type { CitationPreuve } from "../lib/accueil";
import {
  EXPERIENCES,
  FORMATION,
  IDENTITE,
  POSITIONNEMENT,
  TITRE_COURT,
} from "../content/profil";
import { PARCOURS_VISITEUR, URL_STRATA } from "../content/parcours";
import { CHAINE_PREUVE } from "../content/adama-os";
import type { CarteProjet } from "../content/projets";

/** Ce que l'accueil lit des registres, réduit au rendu serveur. */
export type ResumeAccueil = {
  articles: { href: string; code: string; titre: string }[];
  methodes: { total: number; essayees: number };
  portes: { code: string; titre: string }[];
};

// =====================================================================
// L'accueil d'ADAMA OS, refonte du 30 octobre 2026.
//
// Un premier écran, puis cinq actes calés sur le parcours visiteur
// (Explorer, Apprendre, Construire, Travailler ensemble, Utiliser STRATA ESG),
// pendant lesquels le symbole traverse la page dans sa scène collante.
// Viennent ensuite le manifeste, la démonstration du moteur, les preuves
// citables, ce qui a été construit, les régimes, les organisations et les
// livraisons, la lettre et l'appel final.
//
// Le cockpit (couches A à D, intégrité, passerelles, livraisons, terminal)
// n'est pas supprimé : il devient la page /os, avec toutes ses données. Le
// terminal Ctrl+K reste ouvert depuis toutes les sections de l'accueil.
//
// Aucun nombre n'est écrit ici : chaque compteur lit une ligne servie au
// rendu, et une donnée absente n'affiche rien plutôt qu'un zéro inventé.
// =====================================================================

const ANCRES: readonly Ancre[] = [
  { id: "top", numero: "00", libelle: "Ouverture" },
  { id: "actes", numero: "01", libelle: "Le parcours" },
  { id: "manifeste", numero: "02", libelle: "Manifeste" },
  { id: "moteur", numero: "03", libelle: "Le moteur" },
  { id: "preuves-citables", numero: "04", libelle: "Preuves" },
  { id: "projets", numero: "05", libelle: "Construit" },
  { id: "regimes", numero: "06", libelle: "Régimes" },
  { id: "organisations", numero: "07", libelle: "Organisations" },
  { id: "contact", numero: "08", libelle: "Échanger" },
];

/** Le manifeste, lu mot par mot au défilement. */
const MANIFESTE =
  "ADAMA OS est un carnet de construction tenu en public. Chaque décision y porte sa date, chaque affirmation sa source, chaque erreur sa correction. Ce qui se vérifie se montre, ce qui ne se vérifie pas se dit.";

export function Dashboard({
  data,
  cartes,
  categories,
  citations,
  resume,
}: {
  data: DashboardData;
  cartes: CarteProjet[];
  categories: string[];
  citations: CitationPreuve[];
  resume: ResumeAccueil;
}) {
  useThemeBoot();
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [recruitOpen, setRecruitOpen] = useState(false);
  const [adamaOpen, setAdamaOpen] = useState(false);

  // Les ancres de l'ancien accueil ne meurent pas : un lien envoyé avant
  // le 30 octobre 2026 vers /#atelier mène au cockpit, désormais sur /os,
  // et les autres à la section qui les remplace.
  useEffect(() => {
    const anciennes: Record<string, string> = {
      atelier: "/os",
      approche: "#actes",
      pensee: "#actes",
      parcours: "#organisations",
    };
    const cible = anciennes[window.location.hash.slice(1)];
    if (!cible) return;
    if (cible.startsWith("/")) window.location.replace(cible);
    else document.getElementById(cible.slice(1))?.scrollIntoView();
  }, []);

  const integrite = data.integrity;
  // Les compteurs de fin de page : seulement des nombres servis à ce rendu,
  // et rien du tout quand la source manque.
  const compteurs = [
    {
      libelle: "Affirmations servies par le registre",
      valeur: data.proofs.length,
    },
    {
      libelle: "Produits au registre de l’écosystème",
      valeur: data.products.length,
    },
    { libelle: "Livraisons lues dans les dépôts", valeur: data.commits.length },
  ].filter((c) => c.valeur > 0);
  const derniereDecision = data.decisions[0];
  const derniereLivraison = data.commits[0];
  const temps = (code: string) =>
    PARCOURS_VISITEUR.find((t) => t.code === code);

  return (
    <>
      <div id="top" className="portfolio accueil">
        <Rideau />
        <SiteHeader home onContact={() => setRecruitOpen(true)} />
        <NavigationAncres ancres={ANCRES} />
        <main id="contenu">
          {/* ------------------------------------------------------------
              00. Le premier écran. L'ordre de ce bloc est mesuré par
              docs/budget.json (ancres hero-copy, hero-copy-lines,
              hero-actions et hero-art) : un titre, trois lignes, trois
              actions. Le titre est du vrai texte, visible sans script.
              ------------------------------------------------------------ */}
          <section
            className="accueil-hero"
            data-hero
            aria-labelledby="hero-title"
          >
            <p className="mot-symbole" aria-hidden="true">
              ADAMA OS
            </p>
            <div className="portfolio-wrap accueil-hero-grille">
              <div className="hero-copy">
                <SurTitre numero="00">{TITRE_COURT.affiche}</SurTitre>
                <h1 id="hero-title">
                  L’économie réelle, rendue{" "}
                  <TraitMain>
                    <Accent>mesurable.</Accent>
                  </TraitMain>
                </h1>
                <div className="hero-copy-lines">
                  <p className="hero-description">{POSITIONNEMENT.fr}</p>
                  <p className="hero-situation">{IDENTITE.situation}</p>
                  <p className="hero-availability">
                    <span className="note-line" aria-hidden="true" />
                    <strong>
                      <Signature as="span" />
                    </strong>
                  </p>
                </div>
                <div className="hero-actions">
                  <button
                    type="button"
                    className="portfolio-button primary bouton-magnetique"
                    onClick={() => setRecruitOpen(true)}
                  >
                    Échanger <Fleche />
                  </button>
                  <Link
                    href="/catalogue"
                    className="portfolio-button ghost bouton-magnetique"
                  >
                    Explorer le catalogue <Fleche />
                  </Link>
                  <Link href="/os" className="portfolio-text-link">
                    L’état du système <Fleche diagonale />
                  </Link>
                </div>
              </div>
              <div className="hero-art" data-emplacement-3d="hero">
                <div className="plan-travail" aria-hidden="true">
                  <span className="plan-cote plan-cote-h">48</span>
                  <span className="plan-cote plan-cote-v">32</span>
                  <Symbole className="hero-symbole" />
                </div>
                <p className="hero-legende">
                  <span>Fig. 1</span> Le symbole, trois bandes cousues et un
                  sceau : la donnée assemblée, puis prouvée.
                </p>
              </div>
            </div>
          </section>

          {/* ------------------------------------------------------------
              01. Les cinq actes. La scène collante de droite porte le
              symbole ; chaque acte le transforme.
              ------------------------------------------------------------ */}
          <section
            id="actes"
            className="actes"
            data-actes
            aria-labelledby="actes-titre"
          >
            <div className="portfolio-wrap actes-grille">
              <div className="actes-texte">
                <header className="actes-tete">
                  <SurTitre numero="01">Le parcours</SurTitre>
                  <h2 id="actes-titre">
                    Cinq façons <Accent>d’entrer.</Accent>
                  </h2>
                  <p>
                    Chacune répond à une question, et mène à une page qui existe
                    aujourd’hui.
                  </p>
                </header>

                <article className="acte" data-acte="0" id="explorer">
                  <p className="acte-numero">Acte 1</p>
                  <h3>Explorer</h3>
                  <p className="acte-question">{temps("explorer")?.question}</p>
                  <dl className="acte-releve">
                    <div>
                      <dt>Contrôles d’intégrité réussis</dt>
                      <dd>
                        {integrite ? (
                          <>
                            <span data-compteur={integrite.reussis}>
                              {integrite.reussis}
                            </span>
                            <small>
                              {" "}
                              sur{" "}
                              {integrite.reussis +
                                integrite.echoues +
                                integrite.nonExecutes}
                              , calcul du {integrite.executedAt.slice(0, 10)}
                            </small>
                          </>
                        ) : (
                          <small>rapport absent</small>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Dernière décision publiée</dt>
                      <dd>
                        {derniereDecision ? (
                          <small>
                            {derniereDecision.title}, {derniereDecision.date}
                          </small>
                        ) : (
                          <small>journal injoignable à ce rendu</small>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Dernière livraison</dt>
                      <dd>
                        {derniereLivraison ? (
                          <small>{derniereLivraison.message}</small>
                        ) : (
                          <small>dépôt injoignable à ce rendu</small>
                        )}
                      </dd>
                    </div>
                  </dl>
                  <div className="acte-liens">
                    <Link href="/os" className="acte-lien">
                      Ouvrir le cockpit <Fleche />
                    </Link>
                    <Link href="/decisions" className="acte-lien-discret">
                      Les décisions
                    </Link>
                    <button
                      type="button"
                      className="acte-lien-discret"
                      onClick={() => setTerminalOpen(true)}
                    >
                      Le terminal <kbd>Ctrl K</kbd>
                    </button>
                  </div>
                </article>

                <article className="acte" data-acte="1" id="apprendre">
                  <p className="acte-numero">Acte 2</p>
                  <h3>Apprendre</h3>
                  <p className="acte-question">
                    {temps("apprendre")?.question}
                  </p>
                  <ul className="acte-liste">
                    {resume.articles.map((a) => (
                      <li key={a.href}>
                        <Link href={a.href}>
                          <span className="acte-liste-code">{a.code}</span>
                          {a.titre}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link href="/articles" className="acte-lien">
                    Toutes les notes de fond <Fleche />
                  </Link>
                </article>

                <article className="acte" data-acte="2" id="construire">
                  <p className="acte-numero">Acte 3</p>
                  <h3>Construire</h3>
                  <p className="acte-question">
                    {temps("construire")?.question}
                  </p>
                  <ol className="route" data-route>
                    <span className="route-rail" aria-hidden="true">
                      <span className="route-rempli" data-route-rempli />
                    </span>
                    {CHAINE_PREUVE.map((maillon) => (
                      <li key={maillon.code} data-route-etape>
                        <span className="route-code">{maillon.code}</span>
                        <span className="route-libelle">{maillon.libelle}</span>
                        <span className="route-question">
                          {maillon.question}
                        </span>
                      </li>
                    ))}
                  </ol>
                  <p className="acte-note">
                    {resume.methodes.essayees} méthodes sur{" "}
                    {resume.methodes.total} ont été essayées en vrai, et chacune
                    affiche son état.
                  </p>
                  <Link href="/methode" className="acte-lien">
                    Utiliser la méthode <Fleche />
                  </Link>
                </article>

                <article className="acte" data-acte="3" id="ensemble">
                  <p className="acte-numero">Acte 4</p>
                  <h3>Travailler ensemble</h3>
                  <p className="acte-question">{temps("ensemble")?.question}</p>
                  <ul className="acte-portes">
                    {resume.portes.map((p) => (
                      <li key={p.code}>{p.titre}</li>
                    ))}
                  </ul>
                  <Link href="/travaillez-avec-moi" className="acte-lien">
                    Choisir une porte <Fleche />
                  </Link>
                </article>

                <article className="acte" data-acte="4" id="utiliser-strata">
                  <p className="acte-numero">Acte 5</p>
                  <h3>Utiliser STRATA ESG</h3>
                  <p className="acte-question">{temps("strata")?.question}</p>
                  <p>
                    ADAMA OS montre comment construire. STRATA ESG livre le
                    logiciel, et c’est la seule sortie de ce site.
                  </p>
                  <OutboundLink
                    href={URL_STRATA}
                    product="strata-esg"
                    division="STRATA"
                    source="accueil-acte"
                    className="acte-lien"
                  >
                    Ouvrir STRATA ESG <Fleche diagonale />
                    <span className="sr-only"> (nouvel onglet)</span>
                  </OutboundLink>
                </article>
              </div>

              <div className="actes-scene" aria-hidden="true">
                <div
                  className="actes-scene-cadre"
                  data-scene-acte
                  data-acte-actif="0"
                  data-emplacement-3d="scene"
                >
                  <span className="plan-cote plan-cote-h">ÉCH. 1:1</span>
                  <Symbole className="scene-symbole" />
                  <ol className="actes-scene-legendes">
                    {PARCOURS_VISITEUR.map((t, i) => (
                      <li key={t.code} data-legende={i}>
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        {t.libelle}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* 02. Le manifeste, sur feuille encre. */}
          <section
            id="manifeste"
            className="feuille feuille-encre manifeste"
            data-pile
            aria-labelledby="manifeste-titre"
          >
            <div className="portfolio-wrap">
              <SurTitre numero="02">
                <span id="manifeste-titre">Manifeste</span>
              </SurTitre>
              <p className="manifeste-texte" data-mots>
                {MANIFESTE}
              </p>
            </div>
          </section>

          {/* 03. La démonstration du moteur. */}
          <section
            id="moteur"
            className="feuille feuille-ivoire accueil-section"
            data-pile
            aria-labelledby="moteur-titre"
          >
            <div className="portfolio-wrap">
              <div className="section-tete">
                <SurTitre numero="03">Le moteur</SurTitre>
                <h2 id="moteur-titre">
                  Une pièce entre, une preuve <Accent>sort.</Accent>
                </h2>
                <p>
                  Le moteur classe, rattache et scelle chaque pièce avant qu’une
                  affirmation ait le droit de s’afficher. Ce qui suit se déroule
                  sur une affirmation réellement servie.
                </p>
              </div>
              <div data-revele-media>
                <DemonstrationMoteur citation={citations[0] ?? null} />
              </div>
            </div>
          </section>

          {/* 04. Les preuves citables. */}
          <section
            id="preuves-citables"
            className="feuille feuille-creux accueil-section"
            aria-labelledby="preuves-titre"
          >
            <div className="portfolio-wrap">
              <div className="section-tete">
                <SurTitre numero="04">Preuves citables</SurTitre>
                <h2 id="preuves-titre">
                  Chaque affirmation se <Accent>cite.</Accent>
                </h2>
                <p>
                  Résumé, source, date de lecture et empreinte : de quoi
                  reprendre une affirmation ailleurs sans la déformer.
                </p>
              </div>
              {citations.length ? (
                <div className="citations" data-cartes>
                  {citations.map((c) => (
                    <BlocCitation
                      key={c.id}
                      c={{ ...c, href: `/verifier/${c.id}` }}
                    />
                  ))}
                </div>
              ) : (
                <p className="etat-vide">
                  Le registre de preuve ne répond pas à ce rendu : aucune
                  citation n’est affichée plutôt qu’une citation inventée.{" "}
                  <Link href="/preuves">Ouvrir le registre</Link>.
                </p>
              )}
            </div>
          </section>

          {/* 05. Ce qui a été construit. */}
          <section
            id="projets"
            className="feuille feuille-ivoire accueil-section"
            aria-labelledby="projects-title"
          >
            <div className="portfolio-wrap">
              <div className="section-tete">
                <SurTitre numero="05">Fiches projet</SurTitre>
                <h2 id="projects-title">
                  Ce que j’ai <Accent>construit.</Accent>
                </h2>
                <p>
                  Le même gabarit pour chaque fiche, dont un bloc entier sur ce
                  que j’ai personnellement conçu, arbitré et livré.
                </p>
              </div>
              <SkillCards proofStates={data.proofStates} />
              <ProjectGrid
                cartes={cartes}
                categories={categories}
                proofStates={data.proofStates}
              />
            </div>
          </section>

          {/* 06. Les régimes, en colonnes comparées. */}
          <section
            id="regimes"
            className="feuille feuille-indigo accueil-section"
            data-pile
            aria-labelledby="regimes-titre"
          >
            <div className="portfolio-wrap">
              <div className="section-tete">
                <SurTitre numero="06">Régimes</SurTitre>
                <h2 id="regimes-titre">
                  Le gratuit ne recule <Accent>jamais.</Accent>
                </h2>
                <p>
                  Quatre régimes, la même règle : une preuve reste vérifiable
                  sans payer. Un régime fermé le dit, sans date promise.
                </p>
              </div>
              <TableauRegimes />
            </div>
          </section>

          {/* 07. Les organisations réelles, puis les livraisons réelles. */}
          <section
            id="organisations"
            className="feuille feuille-ivoire organisations"
            aria-labelledby="organisations-titre"
          >
            <div className="portfolio-wrap">
              <SurTitre numero="07">
                <span id="organisations-titre">
                  Organisations, engagement associatif et formation
                </span>
              </SurTitre>
            </div>
            <Defile libelle="organisations">
              <ul className="defile-liste">
                {EXPERIENCES.map((exp) => (
                  <li key={exp.id}>
                    {aUneMarque(exp.id) ? (
                      <OrgMark id={exp.id} nom={exp.organisation} />
                    ) : (
                      <span className={`experience-name ${exp.id}`}>
                        {exp.organisation}
                        {exp.precision && <small>{exp.precision}</small>}
                      </span>
                    )}
                  </li>
                ))}
                {FORMATION.map((f) => (
                  <li className="experience-formation" key={f.id}>
                    {aUneMarque(f.id) ? (
                      <OrgMark id={f.id} nom={f.precision} />
                    ) : (
                      <span className={`experience-name ${f.id}`}>
                        {f.organisation}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <ul className="defile-liste" aria-hidden="true">
                {EXPERIENCES.map((exp) => (
                  <li key={exp.id}>
                    {aUneMarque(exp.id) ? (
                      <OrgMark id={exp.id} nom={exp.organisation} decoratif />
                    ) : (
                      <span className={`experience-name ${exp.id}`}>
                        {exp.organisation}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Defile>
            {data.proofs.length ? (
              <Defile libelle="preuves vérifiables" vitesse={80}>
                <ul className="defile-liste defile-livraisons">
                  {data.proofs.slice(0, 8).map((p) => (
                    <li key={p.id}>
                      <span className="defile-date">{p.id}</span>
                      {p.statement}
                    </li>
                  ))}
                </ul>
                <ul
                  className="defile-liste defile-livraisons"
                  aria-hidden="true"
                >
                  {data.proofs.slice(0, 8).map((p) => (
                    <li key={p.id}>
                      <span className="defile-date">{p.id}</span>
                      {p.statement}
                    </li>
                  ))}
                </ul>
              </Defile>
            ) : null}
            {data.commits.length ? (
              <Defile libelle="livraisons" vitesse={70}>
                <ul className="defile-liste defile-livraisons">
                  {data.commits.slice(0, 8).map((c) => (
                    <li key={c.sha}>
                      <span className="defile-date">{c.date.slice(0, 10)}</span>
                      {c.message}
                    </li>
                  ))}
                </ul>
                <ul
                  className="defile-liste defile-livraisons"
                  aria-hidden="true"
                >
                  {data.commits.slice(0, 8).map((c) => (
                    <li key={c.sha}>
                      <span className="defile-date">{c.date.slice(0, 10)}</span>
                      {c.message}
                    </li>
                  ))}
                </ul>
              </Defile>
            ) : null}
            {compteurs.length ? (
              <dl className="portfolio-wrap compteurs compteurs-accueil">
                {compteurs.map((c) => (
                  <div key={c.libelle}>
                    <dt>{c.libelle}</dt>
                    <dd data-compteur={c.valeur}>{c.valeur}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <div className="portfolio-wrap organisations-pied">
              <Link href="/recruteur" className="portfolio-text-link-discret">
                Voir mon profil professionnel <Fleche diagonale />
              </Link>
              <Link href="/changelog" className="portfolio-text-link-discret">
                Journal des versions <Fleche />
              </Link>
            </div>
          </section>

          {/* 08. La lettre, puis l'appel final. */}
          <section
            id="contact"
            className="feuille feuille-encre appel-final"
            aria-labelledby="contact-title"
          >
            <div className="portfolio-wrap appel-final-grille">
              <div
                className="appel-final-scene"
                data-parallaxe
                aria-hidden="true"
              >
                <SceneIsometrique titre="Strates de données, registre, sceau, et la ligne de provenance entre Dakar et Paris" />
              </div>
              <SurTitre numero="08">Échanger</SurTitre>
              <h2 id="contact-title">
                On en <Accent>parle ?</Accent>
              </h2>
              <p className="appel-final-texte">
                Pour un projet avec STRATA ESG, une officine Pharivo, une place
                sur la carte Conhama, un partenariat ou une question sur ces
                travaux.
              </p>
              <div className="appel-final-actions">
                <button
                  type="button"
                  className="bouton bouton-plein bouton-magnetique"
                  onClick={() => setRecruitOpen(true)}
                >
                  Échanger <Fleche />
                </button>
                <Link
                  href="/catalogue"
                  className="bouton bouton-contour bouton-magnetique"
                >
                  Explorer le catalogue <Fleche />
                </Link>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="appel-final-mail"
                >
                  {CONTACT_EMAIL}
                </a>
              </div>
              <div className="appel-final-lettre">
                <SignalSignup />
              </div>
              <p className="appel-final-moteur">
                <button type="button" onClick={() => setAdamaOpen(true)}>
                  Une question sur ces travaux ? Interroger le moteur{" "}
                  <Fleche diagonale />
                </button>
              </p>
            </div>
          </section>
        </main>
        <PiedDePage />
        <IlotOutils
          recruitOpen={recruitOpen}
          setRecruitOpen={setRecruitOpen}
          terminalOpen={terminalOpen}
          setTerminalOpen={setTerminalOpen}
          adamaOpen={adamaOpen}
          setAdamaOpen={setAdamaOpen}
          terminal={{ data, cartes }}
        />
        <IleMouvement />
        <IleSymbole3D />
      </div>
    </>
  );
}
