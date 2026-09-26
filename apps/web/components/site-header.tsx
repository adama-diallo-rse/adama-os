"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { OpenStrataSymbol } from "./open-strata-symbol";
import { OutboundLink } from "./outbound-link";
import { RecruiterEntry } from "./recruiter-entry";
import { PARCOURS_VISITEUR, type TempsParcours } from "../content/parcours";
import { TITRE_COURT } from "../content/profil";

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
  // EC4, AXP-158 : la navigation suit les cinq temps du visiteur, dans cet
  // ordre, sur toutes les pages. Explorer, apprendre, construire,
  // travailler ensemble, puis la seule sortie du site, vers le logiciel.
  // Cinq entrees au maximum reste une contrainte de place mesuree : au dela,
  // la barre deborde a 1100 pixels, ou l'acces recruteur se fait ecraser.
  // /preuves quitte la barre (XDEC-47) : la signature de chaque pied de
  // page renvoie a ses preuves, et Explorer y mene en un clic.
  const liens = PARCOURS_VISITEUR;
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
            <OpenStrataSymbol />
          </span>
          <span>
            ADAMA OS
            <span className="brand-caption">{TITRE_COURT.affiche}</span>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Navigation principale">
          {liens.map((temps) => (
            <LienParcours
              key={temps.href}
              temps={temps}
              courant={!home && estCourant(pathname, temps)}
            />
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
            {liens.map((temps) => (
              <LienParcours
                key={temps.href}
                temps={temps}
                courant={estCourant(pathname, temps)}
                onNavigate={() => setMenuOpen(false)}
                mobile
              />
            ))}
          </nav>
        )}
      </header>
    </>
  );
}

function estCourant(pathname: string | null, temps: TempsParcours): boolean {
  if (!pathname || temps.sortie) return false;
  return temps.actifSur.some(
    (racine) => pathname === racine || pathname.startsWith(`${racine}/`),
  );
}

/**
 * Un temps du parcours. Le cinquieme quitte le site : il s'ouvre dans un
 * nouvel onglet, porte la fleche sortante et le dit au lecteur d'ecran,
 * sans jamais ressembler a un bouton d'achat.
 */
function LienParcours({
  temps,
  courant,
  onNavigate,
  mobile = false,
}: {
  temps: TempsParcours;
  courant: boolean;
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  if (temps.sortie) {
    // La seule sortie du site. OutboundLink pose les parametres de campagne
    // et mesure le clic apres consentement, comme toute sortie vers un
    // produit du groupe. Elle ne ressemble jamais a un bouton d'achat.
    return (
      <OutboundLink
        href={temps.href}
        product="strata-esg"
        division="STRATA"
        source={mobile ? "nav-mobile" : "nav"}
        className="nav-sortie"
        onNavigate={onNavigate}
      >
        {temps.libelle}
        <span aria-hidden="true"> ↗</span>
        <span className="sr-only"> (site de STRATA ESG, nouvel onglet)</span>
      </OutboundLink>
    );
  }
  return (
    <Link
      href={temps.href}
      data-temps={temps.code}
      aria-current={courant ? "page" : undefined}
      onClick={onNavigate}
    >
      {temps.libelle}
      {mobile ? <span aria-hidden="true">↗</span> : null}
    </Link>
  );
}
