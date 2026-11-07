"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Symbole } from "./marque/symbole";
import { OutboundLink } from "./outbound-link";
import { PARCOURS_VISITEUR, type TempsParcours } from "../content/parcours";
import { TITRE_COURT } from "../content/profil";
import { INDEX_RUBRIQUES } from "../content/catalogue-index";
// Les six branches, lues dans la même source que l'accueil (AXP-90).
import { BRANCHES } from "../content/accueil";

export function SiteHeader({
  home = false,
  onContact,
  sobre = false,
}: {
  home?: boolean;
  onContact?: () => void;
  /** Surface recruteur : aucun catalogue visible tant qu'AXP-92 est ouverte. */
  sobre?: boolean;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const panneau = useRef<HTMLDivElement>(null);
  // EC4, AXP-158 : la barre suit les temps du visiteur, dans cet ordre,
  // sur toutes les pages : réalisations, méthodes, ressources, travailler
  // ensemble, à propos, puis la seule sortie du site, vers STRATA ESG.
  // Cinq entrées au maximum : le catalogue complet vit dans le grand menu,
  // rangé par rubrique (AXP-106) et par branche (AXP-90).
  const liens = PARCOURS_VISITEUR;

  useEffect(() => {
    if (!menuOpen) return;
    panneau.current?.querySelector<HTMLElement>("a")?.focus();
    const fermer = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", fermer);
    return () => document.removeEventListener("keydown", fermer);
  }, [menuOpen]);

  return (
    <>
      <a href="#contenu" className="portfolio-skip">
        Aller au contenu
      </a>
      <header
        className="portfolio-header entete"
        data-menu={menuOpen ? "ouvert" : "ferme"}
      >
        <Link
          className="portfolio-brand"
          href={home ? "#top" : "/"}
          aria-label="ADAMA OS, accueil"
        >
          <span className="brand-symbol" aria-hidden="true">
            <Symbole />
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
          {/* 7 novembre 2026 : deux commandes, et une seule hauteur. Le
              profil est passé dans la barre (« À propos ») : une troisième
              boîte à deux lignes cassait l'alignement de l'en-tête. */}
          {onContact ? (
            <button
              type="button"
              className="header-contact entete-commande entete-commande-pleine"
              onClick={onContact}
            >
              Prendre rendez-vous <span aria-hidden="true">→</span>
            </button>
          ) : (
            <Link
              href="/travaillez-avec-moi#rendez-vous"
              className="header-contact entete-commande entete-commande-pleine"
            >
              Prendre rendez-vous <span aria-hidden="true">→</span>
            </Link>
          )}
          <button
            ref={toggle}
            type="button"
            className="menu-toggle entete-menu entete-commande"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            aria-controls="grand-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="entete-menu-traits" aria-hidden="true">
              <span />
              <span />
            </span>
            <span className="entete-menu-libelle">Menu</span>
          </button>
        </div>
        <div
          id="grand-menu"
          ref={panneau}
          className="grand-menu"
          hidden={!menuOpen}
        >
          <div className="grand-menu-grille">
            <nav className="grand-menu-temps" aria-label="Le parcours">
              <p className="grand-menu-titre">L’essentiel</p>
              {liens.map((temps) => (
                <LienParcours
                  key={temps.href}
                  temps={temps}
                  courant={estCourant(pathname, temps)}
                  onNavigate={() => setMenuOpen(false)}
                  mobile
                />
              ))}
              <Link href="/os" onClick={() => setMenuOpen(false)}>
                L’état du système
              </Link>
              {onContact ? (
                <button
                  type="button"
                  className="bouton bouton-plein grand-menu-rendez-vous"
                  onClick={() => {
                    setMenuOpen(false);
                    onContact();
                  }}
                >
                  Prendre rendez-vous <span aria-hidden="true">→</span>
                </button>
              ) : (
                <Link
                  href="/travaillez-avec-moi#rendez-vous"
                  className="bouton bouton-plein grand-menu-rendez-vous"
                  onClick={() => setMenuOpen(false)}
                >
                  Prendre rendez-vous <span aria-hidden="true">→</span>
                </Link>
              )}
            </nav>
            {sobre ? null : (
              <>
                <nav
                  className="grand-menu-rubriques"
                  aria-label="Le catalogue par rubrique"
                >
                  <p className="grand-menu-titre">
                    <Link href="/catalogue" onClick={() => setMenuOpen(false)}>
                      Le catalogue
                    </Link>
                  </p>
                  <ul>
                    {INDEX_RUBRIQUES.map((r, i) => (
                      <li key={r.code}>
                        <Link
                          href={`/catalogue#${r.code}`}
                          onClick={() => setMenuOpen(false)}
                        >
                          {r.titre}
                        </Link>
                        <span>{String(i + 1).padStart(2, "0")}</span>
                      </li>
                    ))}
                  </ul>
                </nav>
                <nav
                  className="grand-menu-branches"
                  aria-label="Les branches d’ADAMA OS"
                >
                  <p className="grand-menu-titre">Les branches</p>
                  <ul>
                    {BRANCHES.map((b) => (
                      <li key={b.code}>
                        <Link href={b.href} onClick={() => setMenuOpen(false)}>
                          <span className="grand-menu-code">{b.nom}</span>
                          {b.libelle}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </>
            )}
          </div>
        </div>
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
 * Un temps du parcours. Le cinquième quitte le site : il s'ouvre dans un
 * nouvel onglet, porte la flèche sortante et le dit au lecteur d'écran,
 * sans jamais ressembler à un bouton d'achat.
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
    </Link>
  );
}
