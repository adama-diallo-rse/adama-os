"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { RecruiterEntry } from "./recruiter-entry";

export function SiteHeader({
  home = false,
  onContact,
}: {
  home?: boolean;
  onContact?: () => void;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  // C2 : /preuves figure dans les deux barres. Une page qui dit « ne me
  // croyez pas, verifiez » et qu'on ne peut atteindre qu'en la connaissant
  // deja ne sert a personne.
  // Cinq entrees au maximum, et c'est une contrainte de place mesuree : au
  // dela, la barre deborde a 1100 pixels, ou l'acces recruteur se fait
  // ecraser. Les pages qui n'y figurent pas sont atteintes par les enchainements
  // de fin de page, qui sont concus pour cela.
  const links: [string, string][] = home
    ? [
        ["#explorer", "Commencer"],
        ["/methode", "Méthode"],
        ["/decisions", "Travaux"],
        ["/preuves", "Preuves"],
        ["#parcours", "Adama"],
      ]
    : [
        ["/", "Portfolio"],
        ["/ecosysteme", "Écosystème"],
        ["/decisions", "Décisions"],
        ["/preuves", "Preuves"],
        ["/metrics", "Métriques"],
      ];
  return (
    <>
      <a href="#contenu" className="portfolio-skip">
        Aller au contenu
      </a>
      <header className="portfolio-header">
        <Link
          className="portfolio-brand"
          href={home ? "#top" : "/"}
          aria-label="ADAMA OS, accueil"
        >
          <span className="brand-symbol" aria-hidden="true">
            <svg viewBox="0 0 64 64" focusable="false">
              <path d="M32 8 51 27" />
              <path d="M56 32 32 56 8 32 32 8" />
              <path d="M32 19 44 31" />
              <path d="M45 35 32 48 16 32 32 16" />
              <circle cx="53" cy="29" r="3.5" />
            </svg>
          </span>
          <span>
            ADAMA OS
            <span className="brand-caption">ESG · DATA · SYSTEMS</span>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Navigation principale">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={!home && pathname === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          {/* C9-T4 : presente sur chaque page, jamais enfouie dans un menu. */}
          <RecruiterEntry />
          {onContact ? (
            <button className="header-contact" onClick={onContact}>
              Échangeons <span aria-hidden="true">↗</span>
            </button>
          ) : (
            <Link href="/#contact" className="header-contact">
              Échangeons <span aria-hidden="true">↗</span>
            </Link>
          )}
          <button
            ref={toggle}
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
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setMenuOpen(false);
                toggle.current?.focus();
              }
            }}
          >
            <RecruiterEntry
              variant="mobile"
              onNavigate={() => setMenuOpen(false)}
            />
            {links.map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
                {label}
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
