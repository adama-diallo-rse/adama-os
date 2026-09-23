import { TITRE_COURT, SIGNATURE } from "../content/profil";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteTools } from "./site-tools";
import { ConsentLink } from "./consent-banner";
import { CV_PATH, CV_DOWNLOAD_NAME, GITHUB_PROFILE_URL } from "./types";

export function PageShell({
  children,
  tools = true,
  className = "",
}: {
  children: ReactNode;
  tools?: boolean;
  className?: string;
}) {
  return (
    <div id="top" className={`portfolio subpage ${className}`}>
      <SiteHeader />
      <main id="contenu" className="portfolio-wrap subpage-main">
        {children}
      </main>
      <footer className="portfolio-footer portfolio-wrap">
        <div className="footer-top">
          <Link href="/" className="footer-signature">
            {TITRE_COURT}<span>.</span>
          </Link>
          <div>
            <a
              href={GITHUB_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub â†—
            </a>
            <a href={CV_PATH} download={CV_DOWNLOAD_NAME}>
              Mon CV â†“
            </a>
            <a href="#top" aria-label="Retour en haut de page">
              â†‘
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{TITRE_COURT} Â· LABORATOIRE PUBLIC</span>
          <div className="footer-signature-verifiable"><Link href={SIGNATURE.preuves[0].lien}>{SIGNATURE.preuves[0].texte}</Link>, à partir de <Link href={SIGNATURE.preuves[1].lien}>{SIGNATURE.preuves[1].texte}</Link>.</div>
          <div>
            <Link href="/lettre">Lettre SIGNAL</Link>
            <Link href="/changelog">Journal des versions</Link>
            <Link href="/erreurs">Registre des erreurs</Link>
            <Link href="/mentions-legales">Mentions lÃ©gales</Link>
            <Link href="/confidentialite">ConfidentialitÃ©</Link>
            <Link href="/confiance">FrontiÃ¨res de donnÃ©es</Link>
            <ConsentLink className="portfolio-cookie-link" />
          </div>
          <span>FR / ÃŽLE-DE-FRANCE</span>
        </div>
      </footer>
      {tools && <SiteTools />}
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  description: string;
  aside?: ReactNode;
}) {
  return (
    <header className="page-intro">
      <div>
        <p className="portfolio-label">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {aside && <div className="page-intro-aside">{aside}</div>}
    </header>
  );
}


