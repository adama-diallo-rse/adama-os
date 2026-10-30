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
 */

import { useEffect } from "react";
import Lenis from "lenis";
import { poseLenis } from "./lenis-partage";

export default function Defilement() {
  useEffect(() => {
    const lenis = new Lenis({ anchors: true, allowNestedScroll: true });
    poseLenis(lenis);

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
      surveiller.disconnect();
      poseLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
