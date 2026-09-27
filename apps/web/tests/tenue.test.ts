import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ERREURS } from "../content/erreurs";
import { METHODES } from "../content/methodes";
import {
  INDICATEURS_ES0,
  premierDimancheApres,
  releverTenue,
} from "../content/tenue";

// =====================================================================
// ES0, le tableau de bord privé à huit indicateurs.
//
// Violation volontaire à faire une fois : importer content/tenue dans
// app/erreurs/page.tsx. Le dernier test doit passer au rouge.
// =====================================================================

const APP = fileURLToPath(new URL("../app", import.meta.url));

function pages(dossier: string): string[] {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) return pages(chemin);
    return /\.(tsx?|mjs)$/.test(nom) ? [chemin] : [];
  });
}

describe("ES0, huit indicateurs et pas un de plus", () => {
  it("porte les huit d'AXP-271, dans leur ordre", () => {
    expect(INDICATEURS_ES0.map((i) => i.code)).toEqual([
      "adresses",
      "ventes",
      "encaisse",
      "objets_publies",
      "objets_perimes",
      "erreurs_ouvertes",
      "methodes_prouvees",
      "heures",
    ]);
  });

  it("nomme pour chacun ce qu'on compte, la source, le geste et la fréquence", () => {
    for (const i of INDICATEURS_ES0) {
      expect(i.compte.length, i.code).toBeGreaterThan(20);
      expect(i.source.length, i.code).toBeGreaterThan(10);
      expect(i.geste.length, i.code).toBeGreaterThan(10);
      expect(i.frequence).toMatch(/dimanche/);
    }
  });

  it("compte des adresses confirmées, jamais des demandes", () => {
    const adresses = INDICATEURS_ES0.find((i) => i.code === "adresses");
    expect(adresses?.compte).toMatch(/confirmées/);
    expect(adresses?.source).toMatch(/adama-lettre/);
  });
});

describe("ES0, aucune valeur estimée (XINV-56)", () => {
  const releve = releverTenue({}, new Date("2026-09-27T10:00:00Z"));

  it("laisse vide, avec sa raison, toute case sans source lue", () => {
    for (const v of releve) {
      if (v.valeur === null) {
        expect(v.raison, v.code).toBeTruthy();
        expect(v.releveLe).toBeNull();
      } else {
        expect(v.releveLe).toBeTruthy();
      }
    }
    for (const code of [
      "adresses",
      "ventes",
      "encaisse",
      "objets_publies",
      "objets_perimes",
      "heures",
    ]) {
      expect(releve.find((v) => v.code === code)?.valeur, code).toBeNull();
    }
  });

  it("lit les erreurs ouvertes et les méthodes dans leurs registres", () => {
    const erreurs = releve.find((v) => v.code === "erreurs_ouvertes");
    expect(erreurs?.valeur).toBe(
      String(ERREURS.filter((e) => e.statut === "ouverte").length),
    );
    expect(releve.find((v) => v.code === "methodes_prouvees")?.valeur).toBe(
      `${METHODES.filter((m) => m.etat === "PROUVÉ").length} sur ${METHODES.length}`,
    );
  });

  it("date le relevé du premier dimanche du mois suivant", () => {
    expect(
      premierDimancheApres(new Date("2026-09-27T10:00:00Z"))
        .toISOString()
        .slice(0, 10),
    ).toBe("2026-10-04");
    expect(
      premierDimancheApres(new Date("2026-10-04T10:00:00Z"))
        .toISOString()
        .slice(0, 10),
    ).toBe("2026-11-01");
  });
});

describe("ES0, un instrument privé (XINV-11, XINV-21)", () => {
  it("n'est pas indexé et vit sous /admin", () => {
    const page = readFileSync(join(APP, "admin", "tenue", "page.tsx"), "utf8");
    expect(page).toMatch(/index: false/);
    expect(page).toMatch(/redirect\("\/login\?redirect=\/admin\/tenue"\)/);
    const sitemap = readFileSync(join(APP, "sitemap.ts"), "utf8");
    expect(sitemap).not.toContain("/admin");
  });

  it("n'est importé par aucune page publique", () => {
    const fautifs = pages(APP)
      .filter((f) => !f.includes(`${join("app", "admin")}`))
      .filter((f) => /content\/tenue["']/.test(readFileSync(f, "utf8")));
    expect(fautifs).toEqual([]);
  });
});
