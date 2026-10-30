import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CRITERES_REGIME,
  REGIMES,
  RUBRIQUES,
  tousLesObjets,
} from "../content/catalogue";
import { controlerTexte } from "../lib/vocabulaire";
import { INDEX_RUBRIQUES } from "../content/catalogue-index";

// =====================================================================
// AXP-106 et AXP-107, le catalogue et ses régimes (refonte du 30 octobre
// 2026). Le catalogue range, il ne fabrique pas : chaque objet mène à une
// page ou à une route qui existe, aucun prix n'apparaît, et la preuve reste
// vérifiable sans payer dans tous les régimes.
// =====================================================================

const APP = join(__dirname, "..", "app");

function routeExiste(href: string): boolean {
  const chemin = href.split("#")[0]?.split("?")[0] ?? "";
  if (chemin === "/") return existsSync(join(APP, "page.tsx"));
  const morceaux = chemin.split("/").filter(Boolean);
  const dossier = join(APP, ...morceaux);
  if (existsSync(join(dossier, "page.tsx"))) return true;
  if (existsSync(join(dossier, "route.ts"))) return true;
  // Route dynamique : /verifier/[id], /methodes/[code], /decisions/[adr].
  const parent = join(APP, ...morceaux.slice(0, -1));
  return ["[id]", "[code]", "[adr]", "[slug]"].some((d) =>
    existsSync(join(parent, d, "page.tsx")),
  );
}

describe("le catalogue", () => {
  it("compte sept rubriques, sans rubrique publique consacrée au moteur", () => {
    expect(RUBRIQUES.map((r) => r.code)).toEqual([
      "savoir",
      "construire",
      "outils",
      "architecture",
      "activite",
      "atelier",
      "ecosysteme",
    ]);
  });

  it("garde l'index léger de l'en-tête identique aux rubriques réelles", () => {
    expect(INDEX_RUBRIQUES.map((r) => `${r.code}:${r.titre}`)).toEqual(
      RUBRIQUES.map((r) => `${r.code}:${r.titre}`),
    );
  });

  it("mène chaque objet interne à une page ou une route qui existe", () => {
    for (const o of tousLesObjets().filter((o) => !o.externe)) {
      expect(routeExiste(o.href), `${o.titre} vers ${o.href}`).toBe(true);
    }
  });

  it("ne sort du site que vers STRATA ESG", () => {
    const sorties = tousLesObjets().filter((o) => o.externe);
    expect(sorties.map((o) => o.href)).toEqual(["https://www.strata-esg.fr/"]);
  });

  it("n'affiche aucun prix, aucune date d'ouverture", () => {
    const texte = JSON.stringify([RUBRIQUES, REGIMES]);
    expect(texte).not.toMatch(/€|euros?\b|\d+\s*%|bientôt|prochainement/i);
  });

  it("passe le vocabulaire fermé", () => {
    for (const o of tousLesObjets()) {
      expect(
        controlerTexte(`${o.titre} ${o.resume}`).filter(
          (c) => c.niveau !== "relire",
        ),
        o.titre,
      ).toEqual([]);
    }
  });
});

describe("les régimes", () => {
  it("compare quatre régimes sur cinq critères", () => {
    expect(REGIMES.map((r) => r.code)).toEqual([
      "OPEN",
      "PRO",
      "ATELIER",
      "CONSEIL",
    ]);
    expect(CRITERES_REGIME).toHaveLength(5);
  });

  it("garde la preuve vérifiable sans payer dans les quatre", () => {
    expect(REGIMES.every((r) => r.preuveLibre)).toBe(true);
  });

  it("garde le régime OPEN gratuit et sans compte", () => {
    const open = REGIMES.find((r) => r.code === "OPEN");
    expect(open?.sansCompte).toBe(true);
    expect(open?.acces).toMatch(/gratuit/i);
  });

  it("dit en clair qu'un régime fermé n'est pas ouvert", () => {
    for (const r of REGIMES.filter((r) => !r.ouvert)) {
      expect(r.etat).toMatch(/pas encore ouvert/i);
    }
  });

  it("mène chaque régime à une page qui existe", () => {
    for (const r of REGIMES) {
      expect(routeExiste(r.href), r.code).toBe(true);
    }
  });
});
