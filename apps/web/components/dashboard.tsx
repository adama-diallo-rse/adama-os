"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MotionConfig } from "framer-motion";
import { AdamaAi } from "./adama-ai";
import { LayerA } from "./layer-a";
import { LayerB } from "./layer-b";
import { LayerC } from "./layer-c";
import { LayerD } from "./layer-d";
import { ConsentLink } from "./consent-banner";
import { LegalFooterLinks } from "./legal-links";
import { RecruitModal } from "./recruit-modal";
import { ShippedFeed } from "./shipped-feed";
import { VsmeSimulator } from "./vsme-simulator";
import { Terminal, useThemeBoot } from "./terminal";
import { ArchitectureArt } from "./portfolio-art";
import { SiteHeader } from "./site-header";
import { ProjectGrid } from "./project-grid";
import { SkillCards } from "./skill-cards";
import { JourneyGateway } from "./journey-gateway";
import { SignalSignup } from "./signal-signup";
import { OrgLogo, marqueDe } from "./org-logo";
import {
  CONTACT_EMAIL,
  CV_DOWNLOAD_NAME,
  CV_PATH,
  GITHUB_PROFILE_URL,
  type DashboardData,
} from "./types";
import { captureEvent as capture } from "../lib/analytics";
import { EVENT_RECRUITER_CV } from "../lib/analytics-events";
import {
  DISPONIBILITE,
  EXPERIENCES,
  FORMATION,
  IDENTITE,
} from "../content/profil";
import type { CarteProjet } from "../content/projets";
import { ADAMA_OS } from "../content/adama-os";

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h16m-6-6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SectionLabel({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <p className="portfolio-label">
      <span>{number} /</span> {children}
    </p>
  );
}

export function Dashboard({
  data,
  cartes,
  categories,
}: {
  data: DashboardData;
  cartes: CarteProjet[];
  categories: string[];
}) {
  useThemeBoot();
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [recruitOpen, setRecruitOpen] = useState(false);
  const [adamaOpen, setAdamaOpen] = useState(false);
  const currentFocus = data.metrics.find(
    (m) => m.key === "current_focus",
  )?.value_text;

  // Preserve deep links to the original cockpit inside its disclosure.
  useEffect(() => {
    const revealAnchor = () => {
      const target = document.getElementById(window.location.hash.slice(1));
      const disclosure = target?.closest("details");
      if (disclosure && !disclosure.open) {
        disclosure.open = true;
        target?.scrollIntoView({ behavior: "instant" });
      }
    };
    revealAnchor();
    window.addEventListener("hashchange", revealAnchor);
    return () => window.removeEventListener("hashchange", revealAnchor);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div id="top" className="portfolio">
        <SiteHeader home onContact={() => setRecruitOpen(true)} />
        <main id="contenu">
          <section
            className="portfolio-hero portfolio-wrap"
            aria-labelledby="hero-title"
          >
            {/* C9-T1. L'ordre de ce bloc est la couche entiere : nom,
                trois domaines, une phrase qui vend la CAPACITE, une phrase
                qui donne la situation, une ligne de disponibilite autonome,
                puis trois actions et pas quatre.
                Le budget de docs/budget.json mesure ce bloc a l'aide des
                ancres hero-copy, hero-copy-lines, hero-actions et hero-art :
                les renommer sans mettre le budget a jour casse la mesure, et
                une mesure cassee compte comme un depassement. */}
            <div className="hero-copy">
              <p className="hero-eyebrow">
                <span className="status-dot" /> {ADAMA_OS.territoire}
              </p>
              <h1 id="hero-title">
                L’ESG numérique,
                <br />
                <span className="hero-serif">construit en public.</span>
              </h1>
              <div className="hero-copy-lines">
                <p className="hero-description">{ADAMA_OS.proposition}</p>
                <p className="hero-situation">{ADAMA_OS.sousTitre}</p>
                <p className="hero-availability">
                  <span className="note-line" aria-hidden="true" />
                  <strong>{ADAMA_OS.signature}</strong>
                </p>
              </div>
              <div className="hero-actions">
                <a href="#explorer" className="portfolio-button primary">
                  Choisir un parcours <Arrow />
                </a>
                <Link href="/methode" className="portfolio-button ghost">
                  Utiliser la méthode <Arrow diagonal />
                </Link>
                <Link
                  href="/revue-architecture"
                  className="portfolio-text-link"
                >
                  Soumettre un problème <Arrow />
                </Link>
              </div>
            </div>
            <div className="hero-art">
              <div className="art-topline">
                <span>ADAMA OS / SYSTÈME INTELLECTUEL</span>
                <span>AXP.001</span>
              </div>
              <ArchitectureArt />
              <div className="art-bottomline">
                <span>IDÉE · EXPÉRIENCE · DÉCISION · MÉTHODE</span>
                <span className="art-cross" aria-hidden="true">
                  +
                </span>
              </div>
              <span className="art-side-label" aria-hidden="true">
                PROVENANCE / 001
              </span>
            </div>
            <div className="hero-bottom">
              <span>ADAMA DIALLO / LABORATOIRE PUBLIC</span>
              <a href="#explorer">
                Commencer ici <span aria-hidden="true">↓</span>
              </a>
            </div>
          </section>
          <JourneyGateway />
          {/* C9-T2. Visible sans defilement sur un ecran de bureau : c'est
              la reponse a « que sait faire cette personne », posee avant
              tout le reste. */}
          <div className="portfolio-wrap">
            <SkillCards proofStates={data.proofStates} />
          </div>
          {/* La bande de preuve sociale. Elle ne recopie plus les quatre noms :
              elle lit content/profil.ts, comme le hero et le JSON-LD. Une
              experience retiree de la source disparait d'ici sans que
              personne ait a y penser, et le budget compte desormais la
              source plutot que le balisage.

              Une organisation dont la marque est connue s'affiche par sa
              marque, les autres par leur nom compose. Le Ministere des
              Finances du Senegal reste en typographie : personne ne m'a
              fourni son logo, et fabriquer une marque officielle serait
              exactement le genre d'invention que ce site refuse. */}
          <section
            className="experience-strip"
            aria-label="Expériences, engagement associatif et formation"
          >
            <div className="portfolio-wrap experience-inner">
              <p>
                Expériences et engagement
                <br />
                <span>associatif, formation</span>
              </p>
              <ul className="experience-marks">
                {EXPERIENCES.map((exp) => (
                  <li key={exp.id}>
                    {marqueDe(exp.id) ? (
                      <OrgLogo id={exp.id} nom={exp.organisation} />
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
                    {marqueDe(f.id) ? (
                      <OrgLogo id={f.id} nom={f.precision} />
                    ) : (
                      <span className={`experience-name ${f.id}`}>
                        {f.organisation}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </section>
          <section
            id="projets"
            className="portfolio-wrap portfolio-section"
            aria-labelledby="projects-title"
          >
            <SectionLabel number="01">FICHES PROJET</SectionLabel>
            <div className="section-heading">
              <h2 id="projects-title">
                Ce que j’ai
                <br />
                <span className="serif">construit.</span>
              </h2>
              <p>
                Trois fiches, le même gabarit, huit blocs chacune. Un bloc
                entier y est consacré à ce que j’ai personnellement conçu,
                arbitré et livré.
              </p>
            </div>
            <ProjectGrid
              cartes={cartes}
              categories={categories}
              proofStates={data.proofStates}
            />
            <p className="projects-note">
              IROKO Software Group et les autres produits du groupe, leurs liens
              et leur avancement, sont dans le{" "}
              <Link href="/ecosysteme">
                registre de l’écosystème <span aria-hidden="true">↗</span>
              </Link>
              . Les arbitrages qui ont produit ces projets sont dans le{" "}
              <Link href="/decisions">
                journal des décisions <span aria-hidden="true">↗</span>
              </Link>
              .
            </p>
          </section>
          <section
            id="approche"
            className="approach-section"
            aria-labelledby="approach-title"
          >
            <div className="portfolio-wrap portfolio-section">
              <SectionLabel number="02">MA FAÇON DE FAIRE</SectionLabel>
              <div className="section-heading">
                <h2 id="approach-title">
                  Du reporting
                  <br />
                  <span className="serif">au développement.</span>
                </h2>
                <p>
                  Mon travail touche autant aux données et aux exigences RSE
                  qu’aux outils utilisés pour les traiter.
                </p>
              </div>
              <div className="approach-grid">
                <article>
                  <span className="approach-icon" aria-hidden="true">
                    ↗
                  </span>
                  <span className="approach-number">RSE & ESG</span>
                  <h3>Comprendre la demande.</h3>
                  <p>
                    Je commence par les questions métier : quelles informations
                    sont attendues, par qui, et à partir de quelles sources ?
                  </p>
                  <div>
                    RSE & ESG <span>·</span> Analyse métier
                  </div>
                </article>
                <article>
                  <span
                    className="approach-icon icon-connect"
                    aria-hidden="true"
                  >
                    ⌘
                  </span>
                  <span className="approach-number">DATA</span>
                  <h3>Organiser les données.</h3>
                  <p>
                    Je rassemble les sources, vérifie les données et automatise
                    les tâches répétitives quand c’est possible.
                  </p>
                  <div>
                    Data <span>·</span> Automatisation
                  </div>
                </article>
                <article>
                  <span className="approach-icon" aria-hidden="true">
                    ⊞
                  </span>
                  <span className="approach-number">DÉVELOPPEMENT</span>
                  <h3>Coder, puis vérifier.</h3>
                  <p>
                    Je développe les interfaces et les traitements, puis je
                    teste ce qui se passe quand les données manquent ou qu’un
                    service ne répond plus.
                  </p>
                  <div>
                    Développement <span>·</span> Produit
                  </div>
                </article>
              </div>
            </div>
          </section>
          {/* C6, C7 et C14. Le raisonnement est le differenciateur le plus
              rare pour un profil junior : il a besoin d'une entree visible,
              pas d'un lien enfoui en pied de page. */}
          <section
            id="pensee"
            className="portfolio-wrap thinking-band"
            aria-labelledby="thinking-title"
          >
            <div className="thinking-intro">
              <SectionLabel number="03">COMMENT JE DÉCIDE</SectionLabel>
              <h2 id="thinking-title">
                Les arbitrages, <span className="serif">et leur coût.</span>
              </h2>
            </div>
            <nav className="thinking-nav" aria-label="Le raisonnement">
              <Link href="/decisions">
                <span>Journal des décisions</span>
                <span>
                  Chaque décision structurante, avec les options écartées et ce
                  qu’elle coûte.
                </span>
                <Arrow diagonal />
              </Link>
              <Link href="/revirements">
                <span>Ce sur quoi je suis revenu</span>
                <span>
                  Les corrections, leur trace dans le code, et ce qu’elles ont
                  coûté.
                </span>
                <Arrow diagonal />
              </Link>
              <Link href="/principes">
                <span>Les principes</span>
                <span>
                  Cinq règles, dérivées d’erreurs réelles, chacune avec son
                  prix.
                </span>
                <Arrow diagonal />
              </Link>
            </nav>
          </section>
          <section
            id="parcours"
            className="portfolio-wrap portfolio-section about-section"
            aria-labelledby="about-title"
          >
            <div className="about-copy">
              <SectionLabel number="04">EXPÉRIENCES</SectionLabel>
              <h2 id="about-title">
                Mon <span className="serif">parcours.</span>
              </h2>
              <p>
                Chez AG2R LA MONDIALE, mon stage porte sur la data ESG et les
                solutions IA au sein de la direction RSE.
              </p>
              <p>
                J’ai aussi travaillé sur la coordination RSE chez Younivibe et
                sur le reporting au ministère des Finances au Sénégal. À l’AFEV,
                je me suis engagé dans le mentorat étudiant.
              </p>
              <Link href="/recruteur" className="portfolio-text-link">
                Voir mon profil professionnel <Arrow diagonal />
              </Link>
            </div>
            {/* C9-T8 tenu jusqu'au bout. Cette liste recopiait les quatre
                organisations, leurs roles et leurs categories en clair, et
                elle avait deja diverge de la source : « Stage Data ESG &
                Solutions IA » ici, « Data ESG et solutions IA, direction
                RSE » dans content/profil.ts. Deux parcours pour une seule
                personne, sur la meme page. Elle lit desormais la source. */}
            <div className="journey-list">
              {EXPERIENCES.map((exp, rang) => (
                <article key={exp.id}>
                  <span className="journey-mark" aria-hidden="true">
                    {marqueDe(exp.id) ? (
                      <OrgLogo
                        id={exp.id}
                        nom={exp.organisation}
                        decoratif
                        couleurAuSurvol={false}
                        hauteur={30}
                      />
                    ) : (
                      <span className="journey-initiale">
                        {exp.organisation.charAt(0)}.
                      </span>
                    )}
                  </span>
                  <div>
                    <span className="journey-category">{exp.categorie}</span>
                    <h3>{exp.organisation}</h3>
                    <p>
                      {exp.role}
                      {exp.precision ? (
                        <>
                          <br />
                          {exp.precision}
                        </>
                      ) : null}
                    </p>
                  </div>
                  <span className="journey-index">
                    {String(rang + 1).padStart(2, "0")}
                  </span>
                </article>
              ))}
            </div>
          </section>
          <section
            id="atelier"
            className="atelier-section"
            aria-labelledby="atelier-title"
          >
            <div className="portfolio-wrap portfolio-section">
              <SectionLabel number="05">JOURNAL DE DÉVELOPPEMENT</SectionLabel>
              <div className="section-heading">
                <h2 id="atelier-title">
                  Dans <span className="serif">l’atelier.</span>
                </h2>
                <p>
                  Les dernières contributions au code, les décisions publiées et
                  les prochaines étapes des projets.
                </p>
              </div>
              <div className="atelier-tools">
                <div>
                  <span className="atelier-prompt" aria-hidden="true">
                    &gt;_
                  </span>
                  <h3>
                    Adama OS <span>/ l’atelier personnel</span>
                  </h3>
                  <p>
                    {currentFocus ||
                      "Le suivi de mes projets, directement depuis leurs sources."}
                  </p>
                </div>
                <button
                  type="button"
                  className="portfolio-button terminal-button"
                  onClick={() => setTerminalOpen(true)}
                >
                  Ouvrir le terminal <kbd>Ctrl K</kbd>
                </button>
              </div>
              <div className="atelier-feed">
                <ShippedFeed commits={data.commits} />
              </div>
              <details className="cockpit-disclosure">
                <summary>
                  <span>
                    <span className="disclosure-number">+</span> Explorer le
                    cockpit complet
                  </span>
                  <span className="disclosure-caption">
                    Journal · Trajectoire · Écosystème
                  </span>
                </summary>
                <div className="cockpit-content">
                  {/* C9-T5. Les releves personnels, poids, energie et
                      reseaux sociaux verrouilles, vivent dans la Couche A,
                      quatrieme bloc de ce depliant. Ils ne sont pas
                      supprimes : ils font partie de l'esthetique du cockpit.
                      Ils n'ont simplement rien a faire avant que le profil
                      soit compris. */}
                  <LayerB decisions={data.decisions} />
                  <LayerC trajectory={data.trajectory} />
                  <LayerD
                    analytics={data.analytics}
                    products={data.products}
                    gateways={data.gateways}
                  />
                  <LayerA metrics={data.metrics} />
                  <VsmeSimulator />
                </div>
              </details>
              <div className="atelier-bottom">
                <Link href="/metrics">
                  Consulter les métriques publiées <Arrow diagonal />
                </Link>
                <Link href="/systeme">
                  Comment ce site fonctionne <Arrow diagonal />
                </Link>
                <button type="button" onClick={() => setAdamaOpen(true)}>
                  Une question sur mon travail ? Adama AI <Arrow diagonal />
                </button>
              </div>
            </div>
          </section>
          <section
            id="contact"
            className="portfolio-wrap contact-section"
            aria-labelledby="contact-title"
          >
            <p className="portfolio-label">
              <span className="status-dot" /> CONTACT
            </p>
            <div className="contact-heading">
              <h2 id="contact-title">
                On en <span className="serif">parle ?</span>
              </h2>
              <button
                type="button"
                className="contact-circle"
                aria-label="Échanger avec Adama"
                onClick={() => setRecruitOpen(true)}
              >
                <Arrow diagonal />
              </button>
            </div>
            <div className="contact-bottom">
              <p>
                Pour une opportunité en RSE ou en data,
                <br />
                ou une question sur mes projets, écrivez-moi.
              </p>
              <a href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
                <Arrow diagonal />
              </a>
            </div>
          </section>
          <div className="portfolio-wrap">
            <SignalSignup />
          </div>
        </main>
        <footer className="portfolio-footer portfolio-wrap">
          <div className="footer-top">
            <a href="#top" className="footer-signature">
              ADAMA OS<span>.</span>
            </a>
            <div>
              <a
                href={GITHUB_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub <Arrow diagonal />
              </a>
              <a
                href={CV_PATH}
                download={CV_DOWNLOAD_NAME}
                onClick={() =>
                  capture(EVENT_RECRUITER_CV, {
                    source: "portfolio-footer",
                  })
                }
              >
                Télécharger mon CV <Arrow diagonal />
              </a>
              <a href="#top" aria-label="Retour en haut de page">
                ↑
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>ADAMA OS · LABORATOIRE PUBLIC</span>
            <div>
              <LegalFooterLinks />
              <Link href="/confiance">Frontières de données</Link>
              <ConsentLink className="portfolio-cookie-link" />
            </div>
            <span>FR / ÎLE-DE-FRANCE</span>
          </div>
        </footer>
        <RecruitModal open={recruitOpen} onOpenChange={setRecruitOpen} />
        <Terminal
          open={terminalOpen}
          onOpenChange={setTerminalOpen}
          products={data.products}
          gateways={data.gateways}
          cartes={cartes}
          proofs={data.proofs}
          integrity={data.integrity}
          onRecruit={() => setRecruitOpen(true)}
          onAskAdama={() => setAdamaOpen(true)}
        />
        <AdamaAi open={adamaOpen} onOpenChange={setAdamaOpen} />
      </div>
    </MotionConfig>
  );
}
