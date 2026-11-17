import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteTools } from "./site-tools";
import { ConsentLink } from "./consent-banner";
import { Signature } from "./signature";
import { Symbole } from "./marque/symbole";
import { SurTitre } from "./kit/elements";
import { Sommaire } from "./kit/sommaire";
import { FilAriane } from "./fil-ariane";
import { MAISONS } from "../lib/entites";
import { IleMouvement } from "./mouvement/ile-mouvement";
import {
  CV_PATH,
  CV_DOWNLOAD_NAME,
  GITHUB_PROFILE_URL,
  LINKEDIN_PROFILE_URL,
} from "./types";
import { ACTIVITE } from "../content/profil";

// =====================================================================
// Le kit de page intérieure (refonte du 30 octobre 2026).
//
// Toute page publique passe par ici : même en-tête, même sur-titre, même
// titre qui monte ligne par ligne, même sommaire collant, même pied. Les
// pages ne recomposent jamais ces blocs à la main : une page laissée à
// l'ancien style se verrait au premier coup d'œil.
// =====================================================================

export function PageShell({
  children,
  tools = true,
  className = "",
  sommaire = true,
  sobre = false,
}: {
  children: ReactNode;
  tools?: boolean;
  className?: string;
  /** Le sommaire collant se construit depuis les titres de section. */
  sommaire?: boolean;
  /** Surface recruteur : aucun catalogue dans l'en-tête. */
  sobre?: boolean;
}) {
  return (
    <div id="top" className={`portfolio subpage page-kit ${className}`}>
      <FilAriane />
      <SiteHeader sobre={sobre} />
      <div className="page-kit-corps">
        <main id="contenu" className="portfolio-wrap subpage-main">
          {children}
        </main>
        {sommaire ? <Sommaire /> : null}
      </div>
      <PiedDePage />
      {tools && <SiteTools />}
      <IleMouvement />
    </div>
  );
}

/**
 * Le pied commun à toutes les surfaces, accueil compris. La signature
 * vérifiable y figure toujours (EC3).
 */
export function PiedDePage({ retour = "#top" }: { retour?: string }) {
  return (
    <footer className="portfolio-footer pied">
      <div className="portfolio-wrap">
        <div className="footer-top pied-haut">
          <Link href="/" className="footer-signature pied-marque">
            <span className="pied-symbole" aria-hidden="true">
              <Symbole />
            </span>
            ADAMA OS
          </Link>
          <nav className="pied-colonnes" aria-label="Pied de page">
            <div>
              <p>Découvrir</p>
              <Link href="/projets">Réalisations</Link>
              <Link href="/comment-je-travaille">Comment je travaille</Link>
              <Link href="/travaillez-avec-moi">Accompagnement et revues</Link>
              <Link href="/travaillez-avec-moi#formules">Les formats</Link>
              <Link href="/travaillez-avec-moi#rendez-vous">
                Prendre rendez-vous
              </Link>
              <Link href="/a-propos">À propos</Link>
            </div>
            <div>
              <p>Vérifier</p>
              <Link href="/os">L’état du système</Link>
              <Link href="/preuves">Les preuves</Link>
              <Link href="/decisions">Les décisions</Link>
              <Link href="/erreurs">Registre des erreurs</Link>
            </div>
            <div>
              <p>Catalogue</p>
              <Link href="/catalogue">Toutes les rubriques</Link>
              <Link href="/outils">Outils</Link>
              <Link href="/bibliotheque">Bibliothèque</Link>
              <Link href="/methodes">Méthodes</Link>
            </div>
            <div>
              <p>Suivre</p>
              <Link href="/lettre">Lettre SIGNAL</Link>
              <Link href="/changelog">Journal des versions</Link>
              <Link href="/ecriture">Écriture et assistance</Link>
              <a
                href={LINKEDIN_PROFILE_URL}
                target="_blank"
                rel="me noopener noreferrer"
              >
                LinkedIn <span aria-hidden="true">↗</span>
              </a>
              <a
                href={GITHUB_PROFILE_URL}
                target="_blank"
                rel="me noopener noreferrer"
              >
                GitHub <span aria-hidden="true">↗</span>
              </a>
              <a href={CV_PATH} download={CV_DOWNLOAD_NAME}>
                Mon CV <span aria-hidden="true">↓</span>
              </a>
            </div>
          </nav>
        </div>
        {/* 14 novembre 2026 : les maisons, en pied de chaque page. Un lien
            qui nomme la maison et dit ce qu'elle fait, depuis toutes les
            pages du site : c'est ce qui relie, pour un lecteur comme pour
            un moteur, le laboratoire et les produits qui en sortent. */}
        <nav className="pied-maisons" aria-label="Les maisons d’Adama Diallo">
          <p>Les maisons</p>
          <ul>
            {MAISONS.map((m) => (
              <li key={m.ancre}>
                {/* Adresse nue et référent transmis : le lien pointe la page
                    canonique de la maison, et sa mesure d'audience voit d'où
                    vient la visite sans paramètre ajouté à l'adresse. */}
                <a href={m.url} target="_blank" rel="noopener">
                  {m.nom} <span aria-hidden="true">↗</span>
                </a>
                <span className="pied-maison-detail">{m.description}</span>
              </li>
            ))}
          </ul>
        </nav>
        <div className="footer-bottom pied-bas">
          <Signature className="footer-signature-verifiable" />
          <div>
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/confidentialite">Confidentialité</Link>
            <Link href="/confiance">Frontières de données</Link>
            <ConsentLink className="portfolio-cookie-link" />
            <a href={retour} aria-label="Retour en haut de page">
              ↑
            </a>
          </div>
          <span>{ACTIVITE.villes.join(" / ").toUpperCase()}</span>
        </div>
      </div>
      {/* Le mot-symbole géant est un ornement : écrit en CSS (attr), il
          n'entre ni dans le texte de la page ni dans le contrôle de
          contraste, et ne se lit pas deux fois. */}
      <div
        className="pied-mot-symbole"
        data-mot="ADAMA OS"
        aria-hidden="true"
      />
    </footer>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  aside,
  numero,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  description: string;
  aside?: ReactNode;
  numero?: string;
}) {
  return (
    <header className="page-intro">
      <div>
        <SurTitre numero={numero} className="portfolio-label">
          {eyebrow}
        </SurTitre>
        <h1 data-titre>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {aside && <div className="page-intro-aside">{aside}</div>}
    </header>
  );
}
