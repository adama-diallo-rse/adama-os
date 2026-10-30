"use client";

/**
 * LE SYMBOLE EN TROIS DIMENSIONS, PROTAGONISTE DE L'ACCUEIL.
 *
 * Un seul canvas, posé en couche fixe et sans pointeur, qui suit l'un des
 * emplacements réservés par la page (`[data-emplacement-3d]`) : celui du
 * premier écran, puis la scène collante des cinq actes. Quand l'emplacement
 * actif change, le canvas glisse de l'un à l'autre : le symbole traverse
 * la page. Chaque acte le transforme (`EVENEMENT_ACTE`) :
 *
 *   premier écran   assemblé, il se balance doucement ;
 *   0 Explorer      le sceau avance : une affirmation reçoit sa preuve ;
 *   1 Apprendre     il pivote de trois quarts, on lit sa tranche ;
 *   2 Construire    il se décompose, chaque bande s'écarte ;
 *   3 Ensemble      il se recompose, face au lecteur ;
 *   4 STRATA        il se couche et se branche, comme une pièce sur un port.
 *
 * Règles : chargé au repos, sur grand écran, hors réduction de mouvement
 * (voir l'îlot) ; rendu à la demande, jamais en boucle quand rien ne bouge ;
 * coupé dès qu'aucun emplacement n'est à l'écran ou que l'onglet est caché.
 * Le symbole SVG de chaque emplacement reste le repli : il n'est masqué que
 * lorsque le canvas a réellement rendu sa première image.
 */

import { useEffect } from "react";
import { Box, Camera, Mesh, Program, Renderer, Transform } from "ogl";
import { GEOMETRIE, GRILLE } from "../marque/symbole";
import { EVENEMENT_ACTE } from "./evenements";

const VERTEX = /* glsl */ `
attribute vec3 position;
attribute vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
varying vec3 vNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAGMENT = /* glsl */ `
precision highp float;
uniform vec3 uCouleur;
varying vec3 vNormal;
void main() {
  vec3 lumiere = normalize(vec3(0.45, 0.6, 0.85));
  float diffus = max(dot(vNormal, lumiere), 0.0);
  vec3 c = uCouleur * (0.42 + 0.68 * diffus);
  gl_FragColor = vec4(c, 1.0);
}`;

type Etat = {
  rx: number;
  ry: number;
  ecartX: number;
  ecartZ: number;
  sceauZ: number;
  y: number;
};

const REPOS: Etat = {
  rx: -0.18,
  ry: -0.42,
  ecartX: 0,
  ecartZ: 0,
  sceauZ: 0.04,
  y: 0,
};

const ETATS: Record<number, Etat> = {
  0: { rx: -0.1, ry: -0.2, ecartX: 0, ecartZ: 0, sceauZ: 0.55, y: 0 },
  1: { rx: -0.25, ry: -0.95, ecartX: 0.04, ecartZ: 0, sceauZ: 0.1, y: 0 },
  2: { rx: -0.3, ry: -0.6, ecartX: 0.28, ecartZ: 0.35, sceauZ: 0.2, y: 0 },
  3: { rx: 0, ry: 0, ecartX: 0, ecartZ: 0, sceauZ: 0.12, y: 0 },
  4: { rx: -1.05, ry: -0.3, ecartX: 0.02, ecartZ: 0, sceauZ: 0.04, y: -0.18 },
};

function etatDe(acte: number): Etat {
  return ETATS[acte] ?? REPOS;
}

/**
 * Lit une couleur CSS calculée (quelle que soit sa notation, oklch compris)
 * en la peignant sur un pixel de canvas 2D, puis la rend en vecteur 0..1.
 */
function couleurCss(nom: string, repli: [number, number, number]) {
  const sonde = document.createElement("span");
  sonde.style.color = `var(${nom})`;
  sonde.style.display = "none";
  document.body.appendChild(sonde);
  const calculee = getComputedStyle(sonde).color;
  sonde.remove();
  const toile = document.createElement("canvas");
  toile.width = 1;
  toile.height = 1;
  const ctx = toile.getContext("2d");
  if (!ctx) return repli;
  ctx.fillStyle = calculee;
  ctx.fillRect(0, 0, 1, 1);
  const [r, v, b] = ctx.getImageData(0, 0, 1, 1).data;
  if (r === undefined || v === undefined || b === undefined) return repli;
  return [r / 255, v / 255, b / 255] as [number, number, number];
}

export default function Symbole3D() {
  useEffect(() => {
    const emplacements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-emplacement-3d]"),
    );
    const premier0 = emplacements[0];
    if (!premier0) return;
    const premierEmplacement: HTMLElement = premier0;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: true,
        antialias: true,
        dpr: Math.min(window.devicePixelRatio, 2),
      });
    } catch {
      return; // Pas de WebGL : le symbole SVG reste en place.
    }
    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.className = "symbole-3d-toile";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);

    const sombre = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const teinteBande = couleurCss(
      "--texte",
      sombre ? [0.95, 0.93, 0.88] : [0.06, 0.08, 0.14],
    );
    const teinteJour = couleurCss(
      "--fond",
      sombre ? [0.04, 0.06, 0.1] : [0.97, 0.95, 0.91],
    );
    const teinteSceau: [number, number, number] = [0.78, 0.36, 0.2];

    const camera = new Camera(gl, { fov: 30 });
    camera.position.set(0, 0, 4.2);
    const scene = new Transform();
    const pivot = new Transform();
    pivot.setParent(scene);

    const echelle = 1.6 / GRILLE;
    const programme = (c: [number, number, number]) =>
      new Program(gl, {
        vertex: VERTEX,
        fragment: FRAGMENT,
        uniforms: { uCouleur: { value: c } },
      });

    const bandes = GEOMETRIE.map((b) => {
      const groupe = new Transform();
      groupe.setParent(pivot);
      const corps = new Mesh(gl, {
        geometry: new Box(gl, {
          width: b.l * echelle,
          height: b.h * echelle,
          depth: 3 * echelle,
        }),
        program: programme(teinteBande),
      });
      corps.setParent(groupe);
      const cx = (b.x + b.l / 2 - GRILLE / 2) * echelle;
      const cy = -(b.y + b.h / 2 - GRILLE / 2) * echelle;
      groupe.position.set(cx, cy, 0);
      const motif = new Mesh(gl, {
        geometry: new Box(gl, {
          width: b.motif.c * echelle,
          height: b.motif.c * echelle,
          depth: 3.4 * echelle,
        }),
        program: programme(b.motif.sceau ? teinteSceau : teinteJour),
      });
      motif.setParent(groupe);
      motif.position.set(
        (b.motif.x + b.motif.c / 2 - (b.x + b.l / 2)) * echelle,
        -(b.motif.y + b.motif.c / 2 - (b.y + b.h / 2)) * echelle,
        0,
      );
      return { groupe, motif, cx, sceau: b.motif.sceau };
    });

    // État courant et état visé, interpolés à chaque image.
    const courant: Etat = { ...REPOS };
    let vise: Etat = { ...REPOS };
    let acte = -1;
    const rect = { x: 0, y: 0, l: 0, h: 0 };
    let premier = true;
    let redessiner = false;
    let image = 0;
    let t0 = performance.now();

    // Relus à chaque image : un rendu de React peut remplacer un nœud, et
    // une référence figée viserait alors un élément détaché.
    function emplacementActif(): HTMLElement {
      const presents = Array.from(
        document.querySelectorAll<HTMLElement>("[data-emplacement-3d]"),
      );
      const scene = presents.find(
        (e) => e.getAttribute("data-emplacement-3d") === "scene",
      );
      if (scene) {
        const r = scene.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.7 && r.bottom > 0) return scene;
      }
      return (
        presents.find(
          (e) => e.getAttribute("data-emplacement-3d") === "hero",
        ) ??
        presents[0] ??
        premierEmplacement
      );
    }

    function dimensionner(l: number, h: number) {
      renderer.setSize(Math.max(1, l), Math.max(1, h));
      camera.perspective({ aspect: Math.max(1, l) / Math.max(1, h) });
    }

    function boucle(maintenant: number) {
      image = 0;
      if (document.hidden) return;
      const cible = emplacementActif();
      const r = cible.getBoundingClientRect();
      const hors = r.bottom < 0 || r.top > window.innerHeight;
      const etaitCache = canvas.style.visibility === "hidden";
      canvas.style.visibility = hors ? "hidden" : "visible";
      if (hors) return; // Coupé hors écran : plus aucune image.
      if (etaitCache) redessiner = true;

      const k = premier ? 1 : 0.14;
      rect.x += (r.left - rect.x) * k;
      rect.y += (r.top - rect.y) * k;
      const l = rect.l + (r.width - rect.l) * k;
      const h = rect.h + (r.height - rect.h) * k;
      if (Math.abs(l - rect.l) > 0.5 || Math.abs(h - rect.h) > 0.5 || premier)
        dimensionner(l, h);
      rect.l = l;
      rect.h = h;
      canvas.style.transform = `translate3d(${rect.x}px, ${rect.y}px, 0)`;

      vise = etatDe(
        cible.getAttribute("data-emplacement-3d") === "scene" ? acte : -1,
      );
      let mouvement = 0;
      for (const cle of Object.keys(courant) as (keyof Etat)[]) {
        const d = vise[cle] - courant[cle];
        courant[cle] += d * 0.08;
        mouvement += Math.abs(d);
      }
      const balancement =
        cible.getAttribute("data-emplacement-3d") === "scene" && acte !== -1
          ? 0
          : Math.sin((maintenant - t0) / 2400) * 0.12;
      const bouge =
        mouvement > 0.002 ||
        Math.abs(r.left - rect.x) > 0.5 ||
        Math.abs(r.top - rect.y) > 0.5 ||
        balancement !== 0;
      // Rien n'a bougé depuis la dernière image : aucun rendu.
      if (!bouge && !premier && !redessiner) return;
      redessiner = false;
      pivot.rotation.x = courant.rx;
      pivot.rotation.y = courant.ry + balancement;
      pivot.position.y = courant.y;
      bandes.forEach((b, i) => {
        b.groupe.position.x = b.cx * (1 + courant.ecartX * 2.4);
        b.groupe.position.z = (i - 1) * courant.ecartZ;
        if (b.sceau) b.motif.position.z = courant.sceauZ * 0.6;
      });
      renderer.render({ scene, camera });

      if (premier) {
        premier = false;
        document.documentElement.dataset.symbole3d = "actif";
      }
      if (bouge) demander();
    }

    function demander() {
      if (!image) image = requestAnimationFrame(boucle);
    }

    const surActe = (e: Event) => {
      acte = (e as CustomEvent<number>).detail;
      demander();
    };
    // L'observateur ne décide rien : il réveille la boucle, qui relit les
    // emplacements elle-même. Une scène collante ne change pas d'état
    // d'intersection en défilant ; seule la mesure directe est fiable.
    const observateur = new IntersectionObserver(() => demander(), {
      rootMargin: "10% 0px",
    });
    emplacements.forEach((e) => observateur.observe(e));
    window.addEventListener(EVENEMENT_ACTE, surActe);
    // Le défilement doux ne garantit pas un événement « scroll » sur la
    // fenêtre à chaque pas : on écoute en capture sur le document, et une
    // vérification légère, sans rendu si rien ne bouge, rattrape le reste.
    document.addEventListener("scroll", demander, {
      passive: true,
      capture: true,
    });
    const veille = window.setInterval(demander, 250);
    window.addEventListener("resize", demander);
    document.addEventListener("visibilitychange", demander);
    t0 = performance.now();
    demander();

    return () => {
      cancelAnimationFrame(image);
      observateur.disconnect();
      window.removeEventListener(EVENEMENT_ACTE, surActe);
      document.removeEventListener("scroll", demander, { capture: true });
      window.clearInterval(veille);
      window.removeEventListener("resize", demander);
      document.removeEventListener("visibilitychange", demander);
      delete document.documentElement.dataset.symbole3d;
      canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return null;
}
