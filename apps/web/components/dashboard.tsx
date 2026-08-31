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
import { ArchitectureArt, ProjectArt } from "./portfolio-art";
import {
  CONTACT_EMAIL,
  CV_DOWNLOAD_NAME,
  CV_PATH,
  GITHUB_PROFILE_URL,
  type DashboardData,
} from "./types";
import { captureEvent as capture } from "../lib/analytics";

const projects = [
  {
    id: "strata",
    category: "Durabilité",
    number: "01",
    name: "STRATA",
    subtitle: "Des outils pour le reporting ESG.",
    description:
      "Je développe notamment STRATA Scope, pour le calcul carbone, et STRATA Watch, pour suivre les publications réglementaires ESG.",
    tags: ["RSE & ESG", "Architecture produit", "Europe"],
    href: "/ecosysteme#strata",
    link: "Voir les projets STRATA",
  },
  {
    id: "iroko",
    category: "Afrique",
    number: "02",
    name: "IROKO",
    subtitle: "La gestion d’entreprise en Afrique.",
    description:
      "Avec IROKO Business OS, je travaille sur la facturation et les encaissements, avec des intégrations Wave et Orange Money.",
    tags: ["Business OS", "Systèmes de gestion", "Afrique"],
    href: "/ecosysteme#iroko",
    link: "Voir les projets IROKO",
  },
  {
    id: "adama",
    category: "Exploration",
    number: "03",
    name: "Adama OS",
    subtitle: "Le site que vous avez sous les yeux.",
    description:
      "J’y rassemble mon parcours, mes projets et un journal de développement. Le code est disponible sur GitHub.",
    tags: ["Next.js", "Open source", "Build in public"],
    href: "#atelier",
    link: "Entrer dans l’atelier",
  },
] as const;
const filters = ["Tout", "Durabilité", "Afrique", "Exploration"] as const;

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
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

export function Dashboard({ data }: { data: DashboardData }) {
  useThemeBoot();
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [recruitOpen, setRecruitOpen] = useState(false);
  const [adamaOpen, setAdamaOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<(typeof filters)[number]>("Tout");
  const visibleProjects = projects.filter(
    (p) => filter === "Tout" || p.category === filter,
  );
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
        <a href="#contenu" className="portfolio-skip">
          Aller au contenu
        </a>
        <header className="portfolio-header">
          <a
            className="portfolio-brand"
            href="#top"
            aria-label="Adama Diallo, accueil"
          >
            <span className="brand-symbol" aria-hidden="true">
              a<span>.</span>
            </span>
            <span>
              Adama Diallo
              <span className="brand-caption">RSE · DATA · SYSTÈMES</span>
            </span>
          </a>
          <nav className="desktop-nav" aria-label="Navigation principale">
            <a href="#projets">Projets</a>
            <a href="#approche">Approche</a>
            <a href="#parcours">Parcours</a>
            <a href="#atelier">
              L’atelier <span className="nav-dot" />
            </a>
          </nav>
          <div className="header-actions">
            <button
              type="button"
              className="header-contact"
              onClick={() => setRecruitOpen(true)}
            >
              Échangeons <Arrow diagonal />
            </button>
            <button
              type="button"
              className="menu-toggle"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span aria-hidden="true">{menuOpen ? "−" : "+"}</span>
            </button>
          </div>
          {menuOpen && (
            <nav
              id="mobile-navigation"
              className="mobile-nav"
              aria-label="Navigation mobile"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setMenuOpen(false);
                  document
                    .querySelector<HTMLButtonElement>(".menu-toggle")
                    ?.focus();
                }
              }}
            >
              {[
                ["#projets", "Projets"],
                ["#approche", "Approche"],
                ["#parcours", "Parcours"],
                ["#atelier", "L’atelier"],
              ].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)}>
                  {label}
                  <Arrow diagonal />
                </a>
              ))}
            </nav>
          )}
        </header>
        <main id="contenu">
          <section
            className="portfolio-hero portfolio-wrap"
            aria-labelledby="hero-title"
          >
            <div className="hero-copy">
              <p className="hero-eyebrow">
                <span className="status-dot" /> RSE, DATA & DÉVELOPPEMENT
              </p>
              <h1 id="hero-title">
                Adama
                <br />
                <span className="hero-serif">Diallo.</span>
              </h1>
              <p className="hero-description">
                Je suis en stage Data ESG chez <strong>AG2R LA MONDIALE</strong>
                . En parallèle, je développe mes propres outils :{" "}
                <strong>STRATA</strong> pour la RSE, <strong>IROKO</strong> pour
                la gestion d’entreprise.
              </p>
              <div className="hero-actions">
                <a href="#projets" className="portfolio-button primary">
                  Découvrir mes projets <Arrow diagonal />
                </a>
                <a
                  href={CV_PATH}
                  download={CV_DOWNLOAD_NAME}
                  className="portfolio-text-link"
                  onClick={() =>
                    capture("recruiter_cv_download", {
                      source: "portfolio-hero",
                    })
                  }
                >
                  Mon CV <span aria-hidden="true">↓</span>
                </a>
              </div>
              <div className="hero-note">
                <span className="note-line" />
                <span>
                  Basé en Île-de-France.
                  <br />
                  <strong>Recherche CDI / CDD dès novembre 2026.</strong>
                </span>
              </div>
            </div>
            <div className="hero-art">
              <div className="art-topline">
                <span>ADAMA OS / PORTFOLIO</span>
                <span>FIG. 001</span>
              </div>
              <ArchitectureArt />
              <div className="art-bottomline">
                <span>ÉTUDE DE STRATES</span>
                <span className="art-cross" aria-hidden="true">
                  +
                </span>
              </div>
              <span className="art-side-label" aria-hidden="true">
                ASSEMBLAGE / 001
              </span>
            </div>
            <div className="hero-bottom">
              <span>PROJETS PERSONNELS ET PARCOURS PROFESSIONNEL</span>
              <a href="#projets">
                Explorer la suite <span aria-hidden="true">↓</span>
              </a>
            </div>
          </section>
          <section
            className="experience-strip"
            aria-label="Expériences professionnelles et engagement"
          >
            <div className="portfolio-wrap experience-inner">
              <p>
                Expériences
                <br />
                <span>et engagement associatif</span>
              </p>
              <span className="experience-name ag2r">
                AG2R <small>LA MONDIALE</small>
              </span>
              <span className="experience-name younivibe">
                Younivibe<span aria-hidden="true">✳</span>
              </span>
              <span className="experience-name afev">
                afev<span aria-hidden="true">.</span>
              </span>
              <span className="experience-name ministry">
                Ministère des Finances<small>SÉNÉGAL</small>
              </span>
            </div>
          </section>
          <section
            id="projets"
            className="portfolio-wrap portfolio-section"
            aria-labelledby="projects-title"
          >
            <SectionLabel number="01">PROJETS PERSONNELS</SectionLabel>
            <div className="section-heading">
              <h2 id="projects-title">
                Ce que je
                <br />
                <span className="serif">développe.</span>
              </h2>
              <p>
                STRATA, IROKO et ce portfolio. Chaque projet a son propre dépôt
                et avance à son rythme.
              </p>
            </div>
            <div
              className="project-filter"
              role="group"
              aria-label="Filtrer les projets"
            >
              {filters.map((value) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {value}
                  {value === "Tout" && <span>03</span>}
                </button>
              ))}
              <span className="filter-caption" aria-live="polite">
                {visibleProjects.length} projet
                {visibleProjects.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="projects-grid">
              {visibleProjects.map((project) => (
                <article
                  className={`project-card project-${project.id}`}
                  key={project.id}
                >
                  <Link
                    href={project.href}
                    className="project-image-link"
                    aria-label={project.link}
                  >
                    <div className="project-art">
                      <span className="project-art-label">
                        {project.category} / {project.number}
                      </span>
                      <ProjectArt kind={project.id} />
                      <span className="project-art-name">
                        {project.name}
                        <span>PROJET PERSONNEL</span>
                      </span>
                      <span className="project-arrow">
                        <Arrow diagonal />
                      </span>
                    </div>
                  </Link>
                  <div className="project-tags">
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <h3>{project.subtitle}</h3>
                  <p>{project.description}</p>
                  <Link href={project.href} className="project-link">
                    {project.link}
                    <Arrow />
                  </Link>
                </article>
              ))}
            </div>
            <p className="projects-note">
              Les liens et l’avancement de chaque produit sont indiqués dans le{" "}
              <Link href="/ecosysteme">
                registre de l’écosystème <span aria-hidden="true">↗</span>
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
          <section
            id="parcours"
            className="portfolio-wrap portfolio-section about-section"
            aria-labelledby="about-title"
          >
            <div className="about-copy">
              <SectionLabel number="03">EXPÉRIENCES</SectionLabel>
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
              <Link href="/?for=recruiter" className="portfolio-text-link">
                Voir mon profil professionnel <Arrow diagonal />
              </Link>
            </div>
            <div className="journey-list">
              <article>
                <span className="journey-mark" aria-hidden="true">
                  A.
                </span>
                <div>
                  <span className="journey-category">RSE × DATA</span>
                  <h3>AG2R LA MONDIALE</h3>
                  <p>
                    Stage Data ESG & Solutions IA
                    <br />
                    Direction RSE
                  </p>
                </div>
                <span className="journey-index">01</span>
              </article>
              <article>
                <span className="journey-mark" aria-hidden="true">
                  Y.
                </span>
                <div>
                  <span className="journey-category">
                    COORDINATION × IMPACT
                  </span>
                  <h3>Younivibe</h3>
                  <p>Coordination RSE & reporting</p>
                </div>
                <span className="journey-index">02</span>
              </article>
              <article>
                <span className="journey-mark" aria-hidden="true">
                  a.
                </span>
                <div>
                  <span className="journey-category">
                    ENGAGEMENT × TRANSMISSION
                  </span>
                  <h3>AFEV</h3>
                  <p>Engagement & mentorat étudiant</p>
                </div>
                <span className="journey-index">03</span>
              </article>
              <article>
                <span className="journey-mark" aria-hidden="true">
                  M.
                </span>
                <div>
                  <span className="journey-category">
                    SECTEUR PUBLIC × DONNÉES
                  </span>
                  <h3>Ministère des Finances</h3>
                  <p>Sénégal · Reporting & data</p>
                </div>
                <span className="journey-index">04</span>
              </article>
            </div>
          </section>
          <section
            id="atelier"
            className="atelier-section"
            aria-labelledby="atelier-title"
          >
            <div className="portfolio-wrap portfolio-section">
              <SectionLabel number="04">JOURNAL DE DÉVELOPPEMENT</SectionLabel>
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
                <button type="button" onClick={() => setAdamaOpen(true)}>
                  Une question sur mon travail ? adama.ai <Arrow diagonal />
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
        </main>
        <footer className="portfolio-footer portfolio-wrap">
          <div className="footer-top">
            <a href="#top" className="footer-signature">
              Adama Diallo<span>.</span>
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
                  capture("recruiter_cv_download", {
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
            <span>ADAMA DIALLO · PORTFOLIO</span>
            <div>
              <LegalFooterLinks />
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
          onRecruit={() => setRecruitOpen(true)}
          onAskAdama={() => setAdamaOpen(true)}
        />
        <AdamaAi open={adamaOpen} onOpenChange={setAdamaOpen} />
      </div>
    </MotionConfig>
  );
}
