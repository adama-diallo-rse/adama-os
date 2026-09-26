import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteTools } from "./site-tools";
import { ConsentLink } from "./consent-banner";
import { Signature } from "./signature";
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
            ADAMA OS<span>.</span>
          </Link>
          <div>
            <a
              href={GITHUB_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub ↗
            </a>
            <a href={CV_PATH} download={CV_DOWNLOAD_NAME}>
              Mon CV ↓
            </a>
            <a href="#top" aria-label="Retour en haut de page">
              ↑
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <Signature className="footer-signature-verifiable" />
          <div>
            <Link href="/lettre">Lettre SIGNAL</Link>
            <Link href="/changelog">Journal des versions</Link>
            <Link href="/erreurs">Registre des erreurs</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/confidentialite">Confidentialité</Link>
            <Link href="/confiance">Frontières de données</Link>
            <ConsentLink className="portfolio-cookie-link" />
          </div>
          <span>FR / ÎLE-DE-FRANCE</span>
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
