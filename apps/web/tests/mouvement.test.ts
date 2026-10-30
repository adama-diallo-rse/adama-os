import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// Le moteur de mouvement, porté du kit STRATA ESG le 30 octobre 2026.
//
// Les règles se lisent dans le code source : GSAP, Lenis et OGL ne sont
// importés que dans les modules chargés à la demande par un îlot ; aucun
// îlot n'importe statiquement ce qu'il charge ; les scènes et le défilement
// ne se chargent jamais sous réduction de mouvement ; Lenis a toujours une
// horloge (le défaut du 30 octobre 2026 sur le site STRATA).
// =====================================================================

const WEB = join(__dirname, "..");

function lister(dossier: string): string[] {
  return readdirSync(dossier).flatMap((nom) => {
    if (["node_modules", ".next"].includes(nom)) return [];
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) return lister(chemin);
    return /\.(ts|tsx)$/.test(nom) ? [chemin] : [];
  });
}

const SOURCES = ["app", "components", "lib", "content"].flatMap((d) =>
  lister(join(WEB, d)),
);
const lire = (rel: string) => readFileSync(join(WEB, rel), "utf8");

/** Modules autorisés à importer une bibliothèque de mouvement. */
const CHARGES_A_LA_DEMANDE = new Set([
  "components/mouvement/scenes.tsx",
  "components/mouvement/horloge-gsap.ts",
  "components/mouvement/defilement.tsx",
  "components/mouvement/symbole-3d.tsx",
  "components/mouvement/lenis-partage.ts",
]);

describe("le mouvement reste hors du chemin critique", () => {
  it("n'importe GSAP, Lenis ou OGL que dans les modules chargés à la demande", () => {
    const coupables = SOURCES.filter((f) => {
      const rel = relative(WEB, f).replace(/\\/g, "/");
      if (CHARGES_A_LA_DEMANDE.has(rel)) return false;
      return /from\s+["'](gsap|gsap\/[^"']+|@gsap\/react|lenis|ogl)["']/.test(
        readFileSync(f, "utf8"),
      );
    }).map((f) => relative(WEB, f));
    expect(coupables).toEqual([]);
  });

  it("charge chaque module lourd par un import dynamique, depuis son îlot", () => {
    expect(lire("components/mouvement/ile-mouvement.tsx")).toMatch(
      /lazy\(\(\) => import\("\.\/scenes"\)\)/,
    );
    expect(lire("components/mouvement/ile-defilement.tsx")).toMatch(
      /lazy\(\(\) => import\("\.\/defilement"\)\)/,
    );
    expect(lire("components/mouvement/ile-symbole-3d.tsx")).toMatch(
      /lazy\(\(\) => import\("\.\/symbole-3d"\)\)/,
    );
  });

  it("n'importe rien sous réduction de mouvement", () => {
    const repos = lire("components/mouvement/repos.ts");
    expect(repos).toContain("prefers-reduced-motion: reduce");
    expect(repos).toContain("requestIdleCallback");
  });

  it("donne toujours une horloge à Lenis", () => {
    const partage = lire("components/mouvement/lenis-partage.ts");
    expect(partage).toContain("requestAnimationFrame(tourner)");
    expect(partage).toContain("courante?.raf(ms)");
    const gsapHorloge = lire("components/mouvement/horloge-gsap.ts");
    expect(gsapHorloge).toContain("gsap.ticker.add(tic)");
    expect(gsapHorloge).toContain("gsap.ticker.lagSmoothing(0)");
    expect(gsapHorloge).toContain('on("scroll", ScrollTrigger.update)');
  });

  it("sépare bureau, téléphone et pointeur fin dans les scènes", () => {
    const scenes = lire("components/mouvement/scenes.tsx");
    expect(scenes).toContain("gsap.matchMedia()");
    expect(scenes).toContain("pointer: fine");
    expect(scenes).toContain("horsEcran");
    expect(scenes).toContain("mm.revert()");
  });

  it("coupe le canvas en trois dimensions hors de l'écran", () => {
    const toile = lire("components/mouvement/symbole-3d.tsx");
    expect(toile).toContain("IntersectionObserver");
    expect(toile).toContain("visibilitychange");
    expect(toile).toContain("loseContext");
  });

  it("ne cache aucun titre au rendu serveur", () => {
    const accueil = lire("components/dashboard.tsx");
    const premierEcran = accueil.slice(
      accueil.indexOf('className="hero-copy"'),
      accueil.indexOf('className="hero-art"'),
    );
    expect(premierEcran).not.toMatch(/opacity:\s*0|visibility:\s*hidden/);
    const css = lire("app/refonte.css");
    expect(css).toMatch(/\.rideau \{\s*display: none;/);
    expect(css).toContain("html[data-rideau] .rideau");
  });
});
