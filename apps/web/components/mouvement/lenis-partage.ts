/**
 * L'INSTANCE DE DÉFILEMENT DOUX, PARTAGÉE, ET SON HORLOGE.
 *
 * Porté du kit STRATA ESG (lenisPartage.ts), sans changement de règle.
 * `defilement.tsx` crée l'instance ; les scènes s'y branchent pour prévenir
 * ScrollTrigger à chaque pas. Aucun des deux n'importe l'autre : ce module
 * de quelques octets est leur seul point commun.
 *
 * Lenis 1.3 n'avance que si on l'appelle à chaque image (`raf`). Sans
 * horloge, il retient la molette et la page ne bouge plus : c'était le
 * défilement bloqué du 30 octobre 2026 sur le site STRATA. Ce module tient
 * donc TOUJOURS une horloge : la sienne (requestAnimationFrame) tant que
 * GSAP n'est pas là, puis celle de `gsap.ticker` quand les scènes la
 * prennent, pour que Lenis et ScrollTrigger lisent la même image.
 */

import type Lenis from "lenis";

/** Une horloge extérieure : elle appelle `avance(ms)` à chaque image et rend la main par la fonction retournée. */
export type Horloge = { prendre: (avance: (ms: number) => void) => () => void };

let courante: Lenis | null = null;
let boucle = 0;
let horloge: Horloge | null = null;
let rendre: (() => void) | null = null;
const abonnes = new Set<(instance: Lenis | null) => void>();

function avance(ms: number) {
  courante?.raf(ms);
}

function tourner(ms: number) {
  avance(ms);
  boucle = requestAnimationFrame(tourner);
}

function brancher() {
  if (boucle) cancelAnimationFrame(boucle);
  boucle = 0;
  rendre?.();
  rendre = null;
  if (!courante) return;
  if (horloge) rendre = horloge.prendre(avance);
  else boucle = requestAnimationFrame(tourner);
}

export function poseLenis(instance: Lenis | null) {
  courante = instance;
  brancher();
  abonnes.forEach((a) => a(instance));
}

export function lenisCourante() {
  return courante;
}

/** Confie l'horloge de Lenis (null : il reprend la sienne). */
export function confieHorloge(h: Horloge | null) {
  horloge = h;
  brancher();
}

/** Suit l'instance, même créée après l'abonné ; rend la fonction de désabonnement. */
export function suisLenis(rappel: (instance: Lenis | null) => void) {
  abonnes.add(rappel);
  rappel(courante);
  return () => {
    abonnes.delete(rappel);
  };
}
