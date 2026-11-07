"use client";

/**
 * LE DÉFILEMENT DOUX, UNE SEULE INSTANCE POUR TOUT LE SITE.
 *
 * Lenis lisse la molette et le pavé tactile ; le toucher reste natif. Ce
 * morceau n'importe pas GSAP : une page sans moment signature ne charge que
 * Lenis. Sur un écran à moment signature, les scènes se branchent sur cette
 * instance (`lenis-partage.ts`) pour que ScrollTrigger suive chaque pas.
 *
 *  - `anchors` : les liens internes (sommaire, navigation latérale, lien
 *    d'évitement) glissent jusqu'à leur cible, en tenant compte de
 *    `scroll-padding-top`.
 *  - `allowNestedScroll` : un panneau qui défile lui-même (terminal,
 *    tableaux larges, modales) garde sa molette.
 *  - Arrêté tant qu'une modale est ouverte (`[aria-modal="true"]` dans le
 *    document), pour que la molette serve la modale et non la page.
 *  - Lenis n'avance qu'avec une horloge : `poseLenis` lui en donne une dès
 *    sa création, sinon la molette reste retenue.
 *
 * 7 novembre 2026, le changement de page. Lenis garde sa position cible
 * d'une page à l'autre : un clic dans le pied de page ouvrait la page
 * suivante tout en bas, et le bouton retour ramenait à une position fausse
 * qui dérivait encore. La position se tient donc ici, page par page :
 *  - un lien ouvre la page suivante en haut (ou sur son ancre) ;
 *  - le retour et l'avance du navigateur rendent la position où la page
 *    avait été quittée ;
 *  - la position est réappliquée quelques images de suite, le temps que la
 *    page atteigne sa hauteur, et cède dès que la personne fait défiler.
 */

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Lenis from "lenis";
import { lenisCourante, poseLenis } from "./lenis-partage";

const CLE_MEMOIRE = "adama-defilement";
const DUREE_CALAGE_MS = 900;

function adresse() {
  return window.location.pathname + window.location.search;
}

function lireMemoire(): Record<string, number> {
  try {
    return JSON.parse(sessionStorage.getItem(CLE_MEMOIRE) ?? "{}");
  } catch {
    return {};
  }
}

function ecrireMemoire(memoire: Record<string, number>) {
  try {
    sessionStorage.setItem(CLE_MEMOIRE, JSON.stringify(memoire));
  } catch {
    // Navigation privée ou stockage plein : la mémoire reste en page.
  }
}

export default function Defilement() {
  const chemin = usePathname();
  const recherche = useSearchParams();
  const memoire = useRef<Record<string, number>>({});
  // Position à rendre après un retour ou une avance du navigateur, avec
  // l'adresse à laquelle elle s'applique (null : navigation par lien).
  const aRendre = useRef<{ adresse: string; y: number } | null>(null);
  // L'adresse dont on suit la position, et un drapeau qui gèle la mémoire
  // pendant le changement de page.
  const suivie = useRef<string>("");
  const enTransition = useRef(false);
  const premier = useRef(true);

  useEffect(() => {
    const lenis = new Lenis({ anchors: true, allowNestedScroll: true });
    poseLenis(lenis);

    memoire.current = lireMemoire();
    suivie.current = adresse();
    const restauration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    // L'adresse change avant que la nouvelle page ne soit calée : tant
    // qu'elle diffère de l'adresse suivie, la position lue n'appartient à
    // aucune des deux pages et ne s'écrit pas.
    const noter = () => {
      if (enTransition.current || adresse() !== suivie.current) return;
      memoire.current[suivie.current] = Math.round(window.scrollY);
    };
    let minuterie = 0;
    const surDefilement = () => {
      noter();
      window.clearTimeout(minuterie);
      minuterie = window.setTimeout(() => ecrireMemoire(memoire.current), 200);
    };
    window.addEventListener("scroll", surDefilement, { passive: true });

    // Un lien : la position de la page quittée s'écrit avant le départ. Un
    // lien vers la page déjà ouverte (le logo sur l'accueil) remonte en haut.
    const surClic = (e: MouseEvent) => {
      const lien = (e.target as Element | null)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!lien) return;
      noter();
      ecrireMemoire(memoire.current);
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        (lien.target && lien.target !== "_self") ||
        lien.hasAttribute("download")
      ) {
        return;
      }
      const vers = new URL(lien.href, window.location.href);
      if (
        vers.origin === window.location.origin &&
        vers.pathname + vers.search === adresse() &&
        !vers.hash
      ) {
        lenis.scrollTo(0);
      }
    };
    document.addEventListener("click", surClic, true);

    const surRetour = () => {
      // Le navigateur a déjà changé d'adresse : la page quittée est celle
      // qu'on suivait, la page rendue est la nouvelle adresse.
      // Le routeur de Next écoute aussi popstate et rend parfois la page
      // dans son propre écouteur, avant celui-ci : la position est donc
      // laissée ici et lue une image plus tard par le calage.
      ecrireMemoire(memoire.current);
      window.history.scrollRestoration = "manual";
      aRendre.current = { adresse: adresse(), y: memoire.current[adresse()] ?? 0 };
    };
    window.addEventListener("popstate", surRetour, { capture: true });

    const surveiller = new MutationObserver(() => {
      const modale = document.querySelector('[aria-modal="true"]');
      if (modale) lenis.stop();
      else lenis.start();
    });
    surveiller.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-modal", "open"],
    });

    return () => {
      ecrireMemoire(memoire.current);
      window.history.scrollRestoration = restauration;
      window.removeEventListener("scroll", surDefilement);
      window.removeEventListener("popstate", surRetour, { capture: true });
      document.removeEventListener("click", surClic, true);
      window.clearTimeout(minuterie);
      surveiller.disconnect();
      poseLenis(null);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    // Le premier rendu n'est pas un changement de page : Lenis arrive après
    // l'hydratation, la personne a peut-être déjà fait défiler.
    if (premier.current) {
      premier.current = false;
      return;
    }
    // ScrollTrigger rend au navigateur la restauration qu'il avait trouvée
    // en se retirant d'une page : on la reprend à chaque changement.
    window.history.scrollRestoration = "manual";
    const lenis = lenisCourante();
    enTransition.current = true;
    suivie.current = adresse();
    // Décidé à la première image, une fois tous les écouteurs de popstate
    // passés : retour (position gardée) ou lien (haut de page, ou ancre).
    let parRetour: number | null | undefined;

    const cible = (): number | HTMLElement => {
      if (parRetour === undefined) {
        const retour = aRendre.current;
        aRendre.current = null;
        parRetour = retour && retour.adresse === adresse() ? retour.y : null;
      }
      if (parRetour !== null) return parRetour;
      const ancre = window.location.hash.slice(1);
      if (ancre) {
        const element = document.getElementById(decodeURIComponent(ancre));
        if (element) return element;
      }
      return 0;
    };

    const caler = () => {
      const but = cible();
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(but, { immediate: true, force: true, lock: false });
      } else if (typeof but === "number") {
        window.scrollTo(0, but);
      } else {
        but.scrollIntoView();
      }
    };

    // La page arrive par morceaux : on recale à chaque image pendant un
    // court moment, sauf si la personne reprend la main.
    let image = 0;
    let fini = false;
    const debut = performance.now();
    const terminer = () => {
      if (fini) return;
      fini = true;
      cancelAnimationFrame(image);
      enTransition.current = false;
      if (adresse() === suivie.current) {
        memoire.current[suivie.current] = Math.round(window.scrollY);
      }
      for (const type of ["wheel", "touchstart", "keydown", "pointerdown"]) {
        window.removeEventListener(type, terminer);
      }
    };
    for (const type of ["wheel", "touchstart", "keydown", "pointerdown"]) {
      window.addEventListener(type, terminer, { passive: true, once: true });
    }
    const boucle = () => {
      if (fini) return;
      caler();
      if (performance.now() - debut < DUREE_CALAGE_MS) {
        image = requestAnimationFrame(boucle);
      } else {
        terminer();
      }
    };
    image = requestAnimationFrame(boucle);

    return terminer;
  }, [chemin, recherche]);

  return null;
}
