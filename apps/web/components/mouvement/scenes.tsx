"use client";

/**
 * LES SCÈNES DE MOUVEMENT D'ADAMA OS, CHARGÉES À LA DEMANDE PAR L'ÎLOT.
 *
 * Portées du kit STRATA ESG puis élargies. Elles n'écrivent aucun contenu :
 * elles animent ce qui est déjà rendu et déjà lisible. Repères, posés par
 * les composants serveur :
 *
 *   [data-titre]           le titre monte ligne par ligne, sous masque ;
 *   .sur-titre             le sur-titre arrive juste avant son titre, sa
 *                          cote se trace ;
 *   [data-trait-main]      le trait tracé à la main sous un mot se dessine ;
 *   [data-mots]            le manifeste s'éclaire mot par mot au défilement ;
 *   [data-pile]            la feuille recouverte recule quand la suivante
 *                          monte (bureau) ;
 *   [data-revele-media]    un cadre s'ouvre comme un rideau, et se resserre ;
 *   [data-parallaxe]       un déplacement discret, 10 % au plus (bureau) ;
 *   [data-actes]           le récit collant des cinq actes : l'acte actif
 *                          pilote le symbole de la scène collante ;
 *   [data-route]           la route de la preuve se remplit, étape par étape ;
 *   [data-carrousel]       les étapes entrent de côté ;
 *   [data-flotte]          les pièces de la scène isométrique flottent à des
 *                          vitesses différentes (bureau) ;
 *   [data-compteur]        un nombre vrai, lu en base, se compte à l'entrée ;
 *   [data-cartes] > *      les cartes montent par vagues ;
 *   .bouton-magnetique     bouton magnétique, au pointeur fin seulement.
 *
 * RÈGLES TENUES.
 *  1. Un état de départ n'est posé que sur un élément HORS DE L'ÉCRAN :
 *     rien de ce qui est déjà affiché ne disparaît.
 *  2. `gsap.matchMedia` sépare le bureau (épinglage, défilement lié), le
 *     téléphone (suite verticale) et la réduction de mouvement (rien : ce
 *     module n'est même pas importé).
 *  3. Les courbes sont lues dans les jetons d'identite.css.
 *  4. ScrollTrigger est rafraîchi après les polices et les images.
 *  5. `useGSAP` : tout est annulé au démontage de la page.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { brancheLenisSurGsap } from "./horloge-gsap";
import { EVENEMENT_ACTE } from "./evenements";

gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase, SplitText);

function courbe(nom: string, jeton: string, repli: string) {
  const brut = getComputedStyle(document.documentElement).getPropertyValue(
    jeton,
  );
  const n = brut.match(/-?\d*\.?\d+/g)?.map(Number);
  const [a, b, c, d] = n && n.length === 4 ? n : repli.split(",").map(Number);
  return CustomEase.create(nom, `M0,0 C${a},${b} ${c},${d} 1,1`);
}

function duree(jeton: string, repli: number) {
  const v = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(jeton),
  );
  return Number.isFinite(v) ? v / 1000 : repli;
}

/** Convertit une couleur calculée (oklch compris) en rgb() lisible par GSAP. */
function enRgb(couleur: string): string {
  const toile = document.createElement("canvas");
  toile.width = 1;
  toile.height = 1;
  const ctx = toile.getContext("2d");
  if (!ctx) return couleur;
  ctx.fillStyle = couleur;
  ctx.fillRect(0, 0, 1, 1);
  const [r, v, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${v}, ${b})`;
}

/** Seul un élément hors de l'écran reçoit un état de départ. */
function horsEcran(el: Element) {
  const r = el.getBoundingClientRect();
  return r.top > window.innerHeight || r.bottom < 0;
}

export default function Scenes() {
  useGSAP(
    () => {
      const racine = document.querySelector<HTMLElement>("main");
      if (!racine) return;
      const quitterLenis = brancheLenisSurGsap();
      const expo = courbe("adama-expo", "--ease-out-expo", "0.16,1,0.3,1");
      const quart = courbe("adama-quart", "--ease-out-quart", "0.25,1,0.5,1");
      const tSignature = duree("--t-signature", 0.9);
      const tReveal = duree("--t-reveal", 0.64);

      const mm = gsap.matchMedia();
      mm.add(
        {
          bureau:
            "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
          mobile:
            "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
          pointeurFin:
            "(pointer: fine) and (prefers-reduced-motion: no-preference)",
        },
        (contexte) => {
          const { bureau, mobile, pointeurFin } = contexte.conditions as Record<
            string,
            boolean
          >;
          if (!bureau && !mobile) return;
          const nettoyages: (() => void)[] = [];

          /* --- Titres, ligne par ligne sous masque --------------------- */
          racine
            .querySelectorAll<HTMLElement>("[data-titre], h2")
            .forEach((titre) => {
              // Un titre qui porte un lien ou un bouton n'est pas découpé :
              // ses lignes masquées aux lecteurs d'écran cacheraient un
              // élément focalisable.
              if (
                !horsEcran(titre) ||
                titre.closest("[data-sans-scene]") ||
                titre.querySelector("a, button, [tabindex]")
              )
                return;
              const decoupe = SplitText.create(titre, {
                type: "lines",
                mask: "lines",
              });
              gsap.from(decoupe.lines, {
                yPercent: 112,
                duration: tSignature,
                ease: expo,
                stagger: 0.08,
                scrollTrigger: {
                  trigger: titre,
                  start: "top 88%",
                  toggleActions: "play none none none",
                },
                onComplete: () => decoupe.revert(),
              });
              nettoyages.push(() => decoupe.revert());
            });

          /* --- Sur-titres et leur cote --------------------------------- */
          racine.querySelectorAll<HTMLElement>(".sur-titre").forEach((s) => {
            const cote = s.querySelector("[data-cote]");
            if (cote) {
              // La cote est un filet décoratif : elle se trace même à l'écran.
              gsap.fromTo(
                cote,
                { scaleX: 0, transformOrigin: "0% 50%" },
                {
                  scaleX: 1,
                  duration: tSignature,
                  ease: expo,
                  clearProps: "transform",
                  scrollTrigger: { trigger: s, start: "top 92%" },
                },
              );
            }
            if (!horsEcran(s)) return;
            gsap.fromTo(
              s,
              { autoAlpha: 0, x: -12 },
              {
                autoAlpha: 1,
                x: 0,
                duration: tReveal,
                ease: expo,
                scrollTrigger: { trigger: s, start: "top 90%" },
              },
            );
          });

          /* --- Le trait tracé à la main -------------------------------- */
          racine
            .querySelectorAll<SVGPathElement>("[data-trait-main] path")
            .forEach((trait) => {
              const longueur = trait.getTotalLength();
              gsap.fromTo(
                trait,
                { strokeDasharray: longueur, strokeDashoffset: longueur },
                {
                  strokeDashoffset: 0,
                  duration: 1.1,
                  delay: horsEcran(trait) ? 0 : 0.5,
                  ease: quart,
                  clearProps: "strokeDasharray,strokeDashoffset",
                  scrollTrigger: { trigger: trait, start: "top 90%" },
                },
              );
            });

          /* --- Le manifeste, mot par mot ------------------------------- */
          // Chaque mot passe du texte secondaire de la feuille au texte
          // principal : deux teintes qui passent toutes deux le seuil de
          // contraste, pour qu'un lecteur arrêté en cours de défilement lise
          // toujours. Jamais un mot à demi transparent.
          racine
            .querySelectorAll<HTMLElement>("[data-mots]")
            .forEach((bloc) => {
              if (!horsEcran(bloc)) return;
              const sonde = document.createElement("span");
              sonde.style.color = "var(--sur-feuille-2)";
              bloc.appendChild(sonde);
              const pale = enRgb(getComputedStyle(sonde).color);
              sonde.remove();
              const plein = enRgb(getComputedStyle(bloc).color);
              // aria « none » : le paragraphe reste un paragraphe, sans
              // aria-label interdit sur un <p>, et se lit d'un seul tenant.
              const decoupe = SplitText.create(bloc, {
                type: "words",
                aria: "none",
              });
              gsap.fromTo(
                decoupe.words,
                { color: pale },
                {
                  color: plein,
                  ease: "none",
                  stagger: 0.1,
                  scrollTrigger: {
                    trigger: bloc,
                    start: "top 80%",
                    end: "bottom 45%",
                    scrub: 0.6,
                  },
                },
              );
              nettoyages.push(() => decoupe.revert());
            });

          /* --- Les feuilles qui se recouvrent (bureau) ----------------- */
          if (bureau) {
            racine
              .querySelectorAll<HTMLElement>("[data-pile]")
              .forEach((feuille) => {
                const avant =
                  feuille.previousElementSibling as HTMLElement | null;
                if (!avant || avant.hasAttribute("data-hero")) return;
                gsap.fromTo(
                  avant,
                  { scale: 1, transformOrigin: "50% 100%" },
                  {
                    scale: 0.96,
                    ease: "none",
                    scrollTrigger: {
                      trigger: feuille,
                      start: "top bottom",
                      end: "top 25%",
                      scrub: true,
                    },
                  },
                );
                nettoyages.push(() =>
                  gsap.set(avant, { clearProps: "transform" }),
                );
              });
          }

          /* --- Le rideau des cadres ------------------------------------ */
          racine
            .querySelectorAll<HTMLElement>("[data-revele-media]")
            .forEach((cadre) => {
              if (!horsEcran(cadre)) return;
              const dessin = cadre.firstElementChild;
              const tl = gsap.timeline({
                scrollTrigger: {
                  trigger: cadre,
                  start: "top 86%",
                  toggleActions: "play none none none",
                },
              });
              tl.fromTo(
                cadre,
                { clipPath: "inset(10% 7% 10% 7% round 18px)" },
                {
                  clipPath: "inset(0% 0% 0% 0% round 12px)",
                  duration: 1.1,
                  ease: expo,
                  clearProps: "clipPath",
                },
                0,
              );
              if (dessin)
                tl.fromTo(
                  dessin,
                  { scale: 1.06 },
                  {
                    scale: 1,
                    duration: 1.2,
                    ease: expo,
                    clearProps: "transform",
                  },
                  0,
                );
            });

          /* --- Parallaxe discrète (bureau) ----------------------------- */
          if (bureau) {
            racine
              .querySelectorAll<HTMLElement>("[data-parallaxe]")
              .forEach((el) => {
                gsap.fromTo(
                  el,
                  { yPercent: 5 },
                  {
                    yPercent: -5,
                    ease: "none",
                    scrollTrigger: {
                      trigger: el,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: true,
                    },
                  },
                );
              });
            racine
              .querySelectorAll<HTMLElement>("[data-flotte]")
              .forEach((el) => {
                const f = Number(el.dataset.flotte) || 0.5;
                gsap.fromTo(
                  el,
                  { y: 40 * f },
                  {
                    y: -40 * f,
                    ease: "none",
                    scrollTrigger: {
                      trigger: el.closest("section") ?? el,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: true,
                    },
                  },
                );
              });
          }

          /* --- Le récit collant des cinq actes ------------------------- */
          racine
            .querySelectorAll<HTMLElement>("[data-actes]")
            .forEach((recit) => {
              const scene =
                recit.querySelector<HTMLElement>("[data-scene-acte]");
              const actes = recit.querySelectorAll<HTMLElement>("[data-acte]");
              const activer = (rang: string) => {
                if (scene) scene.dataset.acteActif = rang;
                actes.forEach(
                  (a) =>
                    (a.dataset.actif =
                      a.dataset.acte === rang ? "true" : "false"),
                );
                window.dispatchEvent(
                  new CustomEvent(EVENEMENT_ACTE, { detail: Number(rang) }),
                );
              };
              actes.forEach((acte, i) => {
                const rang = acte.dataset.acte ?? String(i);
                ScrollTrigger.create({
                  trigger: acte,
                  start: "top 58%",
                  end: "bottom 58%",
                  onEnter: () => activer(rang),
                  onEnterBack: () => activer(rang),
                  onLeaveBack: i === 0 ? () => activer("0") : undefined,
                });
              });
              recit.dataset.mode = "recit";
              nettoyages.push(() => {
                delete recit.dataset.mode;
                actes.forEach((a) => delete a.dataset.actif);
              });
            });

          /* --- La route de la preuve ----------------------------------- */
          racine
            .querySelectorAll<HTMLElement>("[data-route]")
            .forEach((route) => {
              const rempli = route.querySelector("[data-route-rempli]");
              const etapes = route.querySelectorAll("[data-route-etape]");
              const tl = gsap.timeline({
                scrollTrigger: {
                  trigger: route,
                  start: "top 80%",
                  end: "bottom 50%",
                  scrub: 0.6,
                },
              });
              if (rempli)
                tl.fromTo(
                  rempli,
                  { scaleX: 0, transformOrigin: "0% 50%" },
                  { scaleX: 1, ease: "none" },
                  0,
                );
              // Les étapes ne pâlissent jamais : un texte lié au défilement
              // resterait sous le seuil de contraste si le lecteur s'arrête.
              // Elles glissent seulement en place.
              if (horsEcran(route)) {
                etapes.forEach((e, i) => {
                  tl.fromTo(
                    e,
                    { y: 10 },
                    { y: 0, ease: "power2.out", duration: 0.25 },
                    i * 0.16,
                  );
                });
              }
            });

          /* --- Le carrousel des étapes --------------------------------- */
          racine
            .querySelectorAll<HTMLElement>("[data-carrousel]")
            .forEach((liste) => {
              if (!horsEcran(liste)) return;
              gsap.fromTo(
                liste.children,
                { x: 80, autoAlpha: 0 },
                {
                  x: 0,
                  autoAlpha: 1,
                  duration: 1,
                  ease: expo,
                  stagger: 0.08,
                  scrollTrigger: { trigger: liste, start: "top 85%" },
                },
              );
            });

          /* --- Les cartes, par vagues ---------------------------------- */
          const cartes = Array.from(
            racine.querySelectorAll<HTMLElement>("[data-cartes] > *"),
          ).filter((c) => horsEcran(c));
          if (cartes.length) {
            gsap.set(cartes, { autoAlpha: 0, y: 36 });
            ScrollTrigger.batch(cartes, {
              start: "top 92%",
              once: true,
              onEnter: (lot) =>
                gsap.to(lot, {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.8,
                  ease: expo,
                  stagger: 0.07,
                  overwrite: true,
                }),
            });
            nettoyages.push(() =>
              gsap.set(cartes, { clearProps: "opacity,visibility,transform" }),
            );
          }

          /* --- Les compteurs de nombres vrais -------------------------- */
          racine
            .querySelectorAll<HTMLElement>("[data-compteur]")
            .forEach((el) => {
              const fin = Number(el.dataset.compteur);
              if (!Number.isFinite(fin) || !horsEcran(el)) return;
              const texte = el.textContent;
              const objet = { v: 0 };
              el.textContent = "0";
              nettoyages.push(() => {
                el.textContent = texte;
              });
              gsap.to(objet, {
                v: fin,
                duration: 1.3,
                ease: quart,
                snap: { v: 1 },
                onUpdate: () => {
                  el.textContent = String(objet.v);
                },
                onComplete: () => {
                  el.textContent = texte;
                },
                scrollTrigger: { trigger: el, start: "top 90%", once: true },
              });
            });

          /* --- Boutons magnétiques ------------------------------------- */
          if (pointeurFin) {
            racine
              .querySelectorAll<HTMLElement>(".bouton-magnetique")
              .forEach((bouton) => {
                const versX = gsap.quickTo(bouton, "x", {
                  duration: 0.4,
                  ease: quart,
                });
                const versY = gsap.quickTo(bouton, "y", {
                  duration: 0.4,
                  ease: quart,
                });
                const bouger = (e: PointerEvent) => {
                  const r = bouton.getBoundingClientRect();
                  versX(((e.clientX - r.left) / r.width - 0.5) * 10);
                  versY(((e.clientY - r.top) / r.height - 0.5) * 8);
                };
                const sortir = () => {
                  versX(0);
                  versY(0);
                };
                bouton.addEventListener("pointermove", bouger);
                bouton.addEventListener("pointerleave", sortir);
                nettoyages.push(() => {
                  bouton.removeEventListener("pointermove", bouger);
                  bouton.removeEventListener("pointerleave", sortir);
                  gsap.set(bouton, { clearProps: "transform" });
                });
              });
          }

          return () => nettoyages.forEach((n) => n());
        },
      );

      let actif = true;
      const rafraichir = () => {
        if (actif) ScrollTrigger.refresh();
      };
      document.fonts?.ready.then(rafraichir).catch(() => {});
      requestAnimationFrame(rafraichir);
      window.addEventListener("load", rafraichir, { once: true });

      return () => {
        actif = false;
        window.removeEventListener("load", rafraichir);
        quitterLenis();
        mm.revert();
      };
    },
    { dependencies: [] },
  );

  return null;
}
