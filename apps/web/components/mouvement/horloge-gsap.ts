/**
 * LENIS SUR L'HORLOGE DE GSAP.
 *
 * Porté du kit STRATA ESG (horlogeGsap.ts). Appelé par les scènes, qui
 * chargent déjà GSAP : Lenis avance alors au pas de `gsap.ticker` (sans
 * lissage des retards, qui le ferait sauter) et prévient ScrollTrigger à
 * chaque pas, même s'il est créé après les scènes. La fonction rendue
 * défait tout et rend à Lenis sa propre horloge.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";
import { confieHorloge, suisLenis } from "./lenis-partage";

export function brancheLenisSurGsap() {
  let suivie: Lenis | null = null;
  confieHorloge({
    prendre: (avance) => {
      const tic = (secondes: number) => avance(secondes * 1000);
      gsap.ticker.add(tic);
      gsap.ticker.lagSmoothing(0);
      return () => {
        gsap.ticker.remove(tic);
        gsap.ticker.lagSmoothing(500, 33);
      };
    },
  });
  const quitter = suisLenis((instance) => {
    suivie?.off("scroll", ScrollTrigger.update);
    suivie = instance;
    suivie?.on("scroll", ScrollTrigger.update);
  });
  return () => {
    quitter();
    suivie?.off("scroll", ScrollTrigger.update);
    suivie = null;
    confieHorloge(null);
  };
}
