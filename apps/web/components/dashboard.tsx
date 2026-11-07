"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useThemeBoot } from "../lib/theme";
import { IlotOutils } from "./outils-differes-ilot";
import { SiteHeader } from "./site-header";
import { ProjectGrid } from "./project-grid";
import { SignalSignup } from "./signal-signup";
import { PiedDePage } from "./page-shell";
import { Accent, Fleche, SurTitre, TraitMain } from "./kit/elements";
import { Rideau } from "./accueil/rideau";
import { NavigationAncres, type Ancre } from "./accueil/navigation-ancres";
import { LogosConfiance } from "./accueil/logos-confiance";
import { Ancrage } from "./accueil/ancrage";
import { Piliers } from "./accueil/piliers";
import { BandeMethodes, Branches } from "./accueil/branches";
import { VoletAccompagnement } from "./accueil/volet-accompagnement";
import { PhotoCadre } from "./accueil/offre";
import { SceneMaillons } from "./kit/illustrations-maison";
import { IleMouvement } from "./mouvement/ile-mouvement";
import { IleSymbole3D } from "./mouvement/ile-symbole-3d";
import { CONTACT_EMAIL, type DashboardData } from "./types";
import { IDENTITE, POSITIONNEMENT, TITRE_COURT } from "../content/profil";
import { PHOTOS } from "../content/accompagnement";
import {
  CONVICTION,
  MAILLONS,
  QUESTIONS_ACCUEIL,
  TITRE_HERO,
} from "../content/accueil";
import { HeroStrates } from "./accueil/hero-art";
import { METHODES } from "../content/methodes";
import type { CarteProjet } from "../content/projets";

// =====================================================================
// L'accueil d'ADAMA OS, seconde passe du 7 novembre 2026.
//
// ADAMA OS est le système de travail d'Adama rendu public : des logiciels
// en service, des méthodes qui en sortent, des formats pour travailler
// ensemble, et la preuve de chaque affirmation. L'accompagnement de projets
// est un format parmi d'autres, pas le centre. L'ordre de la page suit les
// questions d'un visiteur qui ne connaît rien du vocabulaire :
//
//   00 qui, et ce qu'il fait, en une phrase ; un seul appel ;
//      les structures qui accompagnent, les organisations passées ;
//   01 ce que je fais : construire, publier, accompagner ;
//   02 les réalisations, les quatre maisons ;
//   03 la méthode, de l'idée à l'actif, illustrée étape par étape dans la
//      scène collante ;
//   04 la conviction ;
//   05 les six branches et la bibliothèque des méthodes ;
//   06 l'accompagnement, un des formats ;
//   07 Paris et Dakar ;
//   08 les questions ;
//   09 le rendez-vous.
//
// Aucun prix n'est publié. La carte et la scène isométrique sont rendues
// par la page serveur et passées en propriétés : leurs tracés n'entrent pas
// dans le paquet JavaScript de l'accueil.
// =====================================================================

const ANCRES: readonly Ancre[] = [
  { id: "top", numero: "00", libelle: "Accueil" },
  { id: "ce-que-je-fais", numero: "01", libelle: "Ce que je fais" },
  { id: "realisations", numero: "02", libelle: "Réalisations" },
  { id: "methode", numero: "03", libelle: "La méthode" },
  { id: "conviction", numero: "04", libelle: "Conviction" },
  { id: "branches", numero: "05", libelle: "Les branches" },
  { id: "accompagnement", numero: "06", libelle: "Accompagnement" },
  { id: "ancrage", numero: "07", libelle: "Paris et Dakar" },
  { id: "questions", numero: "08", libelle: "Questions" },
  { id: "contact", numero: "09", libelle: "Rendez-vous" },
];

/** Les anciennes ancres de l'accueil, et où elles mènent désormais. */
const ANCIENNES_ANCRES: Record<string, string> = {
  atelier: "/os",
  approche: "#methode",
  pensee: "#methode",
  actes: "#methode",
  parcours: "#confiance",
  organisations: "#confiance",
  manifeste: "#conviction",
  moteur: "/os#moteur",
  "preuves-citables": "/os#preuves-citables",
  projets: "#realisations",
  regimes: "/catalogue#regimes",
  "pour-qui": "#accompagnement",
  formules: "/travaillez-avec-moi#formules",
};

export function Dashboard({
  data,
  cartes,
  categories,
  carte,
  scene,
}: {
  data: DashboardData;
  cartes: CarteProjet[];
  categories: string[];
  /** La carte de Dakar à Paris, rendue côté serveur. */
  carte: ReactNode;
  /** La scène isométrique, des idées au système, rendue côté serveur. */
  scene: ReactNode;
}) {
  useThemeBoot();
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [recruitOpen, setRecruitOpen] = useState(false);
  const [adamaOpen, setAdamaOpen] = useState(false);

  // Un lien envoyé avant la refonte ne meurt pas : il mène à la section
  // qui remplace la sienne, ou à la page où elle vit désormais.
  useEffect(() => {
    const cible = ANCIENNES_ANCRES[window.location.hash.slice(1)];
    if (!cible) return;
    if (cible.startsWith("/")) window.location.replace(cible);
    else document.getElementById(cible.slice(1))?.scrollIntoView();
  }, []);

  const rendezVous = () => setRecruitOpen(true);
  const derniereDecision = data.decisions[0];
  const prouvees = METHODES.filter((m) => m.etat === "PROUVÉ").length;
  // Le relevé de chaque étape : seulement ce qui est servi à ce rendu.
  const releve: Record<string, string | null> = {
    decision: derniereDecision
      ? `Dernière décision publiée : ${derniereDecision.title}, ${derniereDecision.date}.`
      : null,
    methode: `${METHODES.length} méthodes à ce jour, dont ${prouvees} prouvée${prouvees > 1 ? "s" : ""}.`,
    actif: data.proofs.length
      ? `${data.proofs.length} affirmations vérifiables servies par le registre.`
      : null,
  };

  return (
    <>
      <div id="top" className="portfolio accueil">
        <Rideau />
        <SiteHeader home onContact={rendezVous} />
        <NavigationAncres ancres={ANCRES} />
        <main id="contenu">
          {/* ------------------------------------------------------------
              00. Le premier écran. L'ordre de ce bloc est mesuré par
              docs/budget.json (ancres hero-copy, hero-copy-lines,
              hero-actions et hero-art) : un titre, deux lignes, deux
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
                <h1 id="hero-title" className="hero-trois-verbes">
                  {TITRE_HERO.map((verbe, i) => (
                    <span key={verbe} style={{ ["--i" as string]: i }}>
                      {verbe}
                      <b aria-hidden="true">.</b>
                      {i < TITRE_HERO.length - 1 ? " " : null}
                    </span>
                  ))}
                </h1>
                <div className="hero-copy-lines">
                  <p className="hero-description">{POSITIONNEMENT.fr}</p>
                  <p className="hero-situation">{IDENTITE.situation}</p>
                </div>
                <div className="hero-actions">
                  <button
                    type="button"
                    className="portfolio-button primary bouton-magnetique"
                    onClick={rendezVous}
                  >
                    Parlons de votre projet <Fleche />
                  </button>
                  <Link href="#methode" className="portfolio-button ghost">
                    Voir comment ça marche <Fleche />
                  </Link>
                </div>
              </div>
              <div className="hero-art">
                <HeroStrates />
              </div>
            </div>
          </section>

          {/* La bande de confiance, immobile et lisible dans les deux modes. */}
          <LogosConfiance />

          {/* 01. Ce que je fais. */}
          <section
            id="ce-que-je-fais"
            className="ce-que-je-fais"
            aria-labelledby="ce-que-je-fais-titre"
          >
            <div className="portfolio-wrap ce-que-je-fais-grille">
              <div className="ce-que-je-fais-tete">
                <SurTitre numero="01">Ce que je fais</SurTitre>
                <h2 id="ce-que-je-fais-titre">
                  Trois métiers, <Accent>une seule méthode.</Accent>
                </h2>
                <p>
                  Je construis des logiciels, j’en tire des méthodes, et je les
                  applique à d’autres projets que les miens. Chaque métier
                  nourrit le suivant.
                </p>
                <PhotoCadre
                  photo={PHOTOS.equipe}
                  sizes="(max-width: 1023px) 100vw, 38vw"
                  className="ce-que-je-fais-photo"
                />
              </div>
              <Piliers />
            </div>
          </section>

          {/* 02. Les réalisations. */}
          <section
            id="realisations"
            className="feuille feuille-creux accueil-section"
            aria-labelledby="realisations-titre"
          >
            <div className="portfolio-wrap">
              <div className="section-tete">
                <SurTitre numero="02">Réalisations</SurTitre>
                <h2 id="realisations-titre">
                  Quatre maisons, <Accent>en service.</Accent>
                </h2>
                <p>
                  Des produits en ligne, construits avec la même méthode : une
                  idée, des priorités écrites, des décisions datées, puis une
                  mise en service. Chaque fiche dit ce que j’y ai fait.
                </p>
              </div>
              <ProjectGrid
                cartes={cartes}
                categories={categories}
                proofStates={data.proofStates}
              />
              <div className="realisations-pied">
                <Link href="/ecosysteme" className="portfolio-text-link">
                  Le registre de l’écosystème <Fleche />
                </Link>
                <Link href="/preuves" className="portfolio-text-link-discret">
                  Chaque affirmation de ce site se vérifie <Fleche />
                </Link>
                <Link href="/changelog" className="portfolio-text-link-discret">
                  Journal des versions <Fleche />
                </Link>
              </div>
            </div>
          </section>

          {/* ------------------------------------------------------------
              03. La méthode, de l'idée à l'actif. La scène collante de
              droite montre, à chaque étape, ce que l'étape fait.
              ------------------------------------------------------------ */}
          <section
            id="methode"
            className="actes actes--maillons"
            data-actes
            aria-labelledby="methode-titre"
          >
            <div className="portfolio-wrap actes-grille">
              <div className="actes-texte">
                <header className="actes-tete">
                  <SurTitre numero="03">La méthode</SurTitre>
                  <h2 id="methode-titre">
                    De l’idée à l’actif, <Accent>cinq étapes.</Accent>
                  </h2>
                  <p>
                    Tout ce que je construis passe par la même chaîne, et chaque
                    étape laisse une trace publique. C’est elle qui rend une
                    méthode transmissible.
                  </p>
                </header>

                {MAILLONS.map((m, i) => (
                  <article
                    key={m.code}
                    className="acte acte--maillon"
                    data-acte={String(i)}
                    id={`etape-${m.code}`}
                  >
                    <p className="acte-numero">Étape {i + 1}</p>
                    <h3>{m.libelle}</h3>
                    <p className="acte-question">{m.question}</p>
                    <p className="acte-texte">{m.texte}</p>
                    {releve[m.code] ? (
                      <p className="acte-releve-ligne">
                        <span aria-hidden="true" />
                        {releve[m.code]}
                      </p>
                    ) : null}
                    <Link href={m.lien.href} className="acte-lien">
                      {m.lien.libelle} <Fleche />
                    </Link>
                  </article>
                ))}
              </div>

              <div className="actes-scene" aria-hidden="true">
                <div
                  className="actes-scene-cadre actes-scene-cadre--maillons"
                  data-scene-acte
                  data-acte-actif="0"
                >
                  <SceneMaillons codes={MAILLONS.map((m) => m.code)} />
                  <ol className="actes-scene-legendes">
                    {MAILLONS.map((m, i) => (
                      <li key={m.code} data-legende={i}>
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        {m.libelle}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* 04. La conviction, sur feuille encre. */}
          <section
            id="conviction"
            className="feuille feuille-encre manifeste"
            data-pile
            aria-labelledby="conviction-titre"
          >
            <div className="portfolio-wrap conviction-grille">
              <div>
                <SurTitre numero="04">
                  <span id="conviction-titre">Conviction</span>
                </SurTitre>
                <p className="manifeste-texte" data-mots>
                  {CONVICTION}
                </p>
              </div>
              <div className="conviction-scene">{scene}</div>
            </div>
          </section>

          {/* 05. Les six branches et la bibliothèque des méthodes. */}
          <section
            id="branches"
            className="feuille feuille-ivoire accueil-section"
            aria-labelledby="branches-titre"
          >
            <div className="portfolio-wrap">
              <div className="section-tete">
                <SurTitre numero="05">Les branches</SurTitre>
                <h2 id="branches-titre">
                  Ce qui sort de la méthode,{" "}
                  <Accent>branche par branche.</Accent>
                </h2>
                <p>
                  Six façons de s’en servir, du laboratoire gratuit à
                  l’accompagnement. Chaque branche dit où elle en est, et rien
                  n’est annoncé avant d’être en ligne.
                </p>
              </div>
              <Branches />
              <div className="branches-methodes">
                <PhotoCadre
                  photo={PHOTOS.atelier}
                  sizes="(max-width: 1023px) 100vw, 44vw"
                  className="branches-photo"
                />
                <BandeMethodes />
              </div>
            </div>
          </section>

          {/* 06. L'accompagnement, un des formats de CONSEIL. */}
          <VoletAccompagnement
            numero="06"
            action={
              <button
                type="button"
                className="bouton bouton-plein bouton-magnetique"
                onClick={rendezVous}
              >
                Réserver un premier échange <Fleche />
              </button>
            }
          />

          {/* 07. L'ancrage, de Dakar à Paris. */}
          <Ancrage carte={carte} numero="07" />

          {/* 08. Les questions. */}
          <section
            id="questions"
            className="feuille feuille-ivoire accueil-section"
            aria-labelledby="questions-titre"
          >
            <div className="portfolio-wrap questions-grille">
              <div className="section-tete section-tete--colonne">
                <SurTitre numero="08">Questions</SurTitre>
                <h2 id="questions-titre">
                  Avant de nous <Accent>parler.</Accent>
                </h2>
                <p>
                  Une question qui n’est pas ici ? Écrivez-moi à{" "}
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                </p>
              </div>
              <div className="faq questions">
                {QUESTIONS_ACCUEIL.map((q) => (
                  <details key={q.q}>
                    <summary>{q.q}</summary>
                    <div>
                      <p>{q.r}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          {/* 09. Le rendez-vous, puis la lettre. */}
          <section
            id="contact"
            className="feuille feuille-encre appel-final"
            aria-labelledby="contact-title"
          >
            <div className="portfolio-wrap appel-final-grille appel-final-grille--photo">
              <div className="appel-final-corps">
                <SurTitre numero="09">Rendez-vous</SurTitre>
                <h2 id="contact-title">
                  Parlons de votre{" "}
                  <TraitMain>
                    <Accent>projet.</Accent>
                  </TraitMain>
                </h2>
                <p className="appel-final-texte">
                  Un logiciel, une méthode, une revue ou un accompagnement :
                  dites-moi où vous en êtes. Trente minutes, gratuites et sans
                  engagement, pour savoir honnêtement ce qui peut vous aider.
                </p>
                <div className="appel-final-actions">
                  <button
                    type="button"
                    className="bouton bouton-plein bouton-magnetique"
                    onClick={rendezVous}
                  >
                    Réserver un échange <Fleche />
                  </button>
                  <a
                    href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                      "Premier échange avec ADAMA OS",
                    )}`}
                    className="bouton bouton-contour bouton-magnetique"
                  >
                    Écrire un e-mail <Fleche />
                  </a>
                </div>
              </div>
              <div className="appel-final-photo" data-parallaxe>
                <PhotoCadre
                  photo={PHOTOS.dakar}
                  sizes="(max-width: 1023px) 100vw, 40vw"
                />
              </div>
            </div>
            <div className="portfolio-wrap">
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
