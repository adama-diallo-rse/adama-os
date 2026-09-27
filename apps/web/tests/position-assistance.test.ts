import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  MARQUAGES,
  PARTS_ASSISTEES,
  PHRASE_LIVRABLE_CONSEIL,
  POSITION_DATEE,
  POSITION_EN,
  POSITION_FR,
} from "../content/assistance";
import { ARTICLES } from "../content/articles";
import { controlerTexte } from "../lib/vocabulaire";

// =====================================================================
// ET0, la position publique sur l'écriture avec assistance.
//
// Violation volontaire à faire une fois : ajouter « certifié » à un
// paragraphe de POSITION_FR, ou retirer une ligne de MARQUAGES. Le test doit
// passer au rouge, puis revenir au vert une fois la ligne remise.
// =====================================================================

const racine = (chemin: string) =>
  fileURLToPath(new URL(`../${chemin}`, import.meta.url));

const TEXTES = [
  POSITION_FR.titre,
  ...POSITION_FR.paragraphes,
  POSITION_EN.titre,
  ...POSITION_EN.paragraphes,
  PHRASE_LIVRABLE_CONSEIL,
];

describe("ET0, une position dite une fois, à un seul endroit", () => {
  it("vit sur la page /ecriture, qui la lit dans sa source unique", () => {
    const page = racine("app/ecriture/page.tsx");
    expect(existsSync(page)).toBe(true);
    const code = readFileSync(page, "utf8");
    expect(code).toContain("POSITION_FR");
    expect(code).toContain("POSITION_EN");
    expect(code).toContain("MARQUAGES");
  });

  it("passe le contrôle du vocabulaire fermé, français et anglais", () => {
    for (const texte of TEXTES) {
      const bloquants = controlerTexte(texte).filter(
        (c) => c.niveau !== "relire",
      );
      expect(bloquants, texte).toEqual([]);
    }
  });

  it("parle d'assistance et du moteur, jamais d'argument", () => {
    const tout = TEXTES.join(" ");
    expect(tout).not.toMatch(/\bIA\b|\bAI\b|intelligence artificielle/i);
    expect(tout).not.toMatch(
      /plus rapide|plus fiable|grâce à|faster|thanks to/i,
    );
    expect(POSITION_FR.paragraphes.join(" ")).toContain("moteur");
    expect(POSITION_EN.paragraphes.join(" ")).toContain("engine");
    expect(POSITION_FR.paragraphes.join(" ")).toContain("relu ligne à ligne");
  });

  it("porte une date d'écriture et une date de revue postérieure", () => {
    expect(POSITION_DATEE.revueAuPlusTardLe > POSITION_DATEE.ecriteLe).toBe(
      true,
    );
  });
});

describe("ET0, la règle de marquage par objet", () => {
  it("marque chaque article publié, en français et en anglais", () => {
    const marques = new Set(MARQUAGES.map((m) => m.href));
    for (const article of ARTICLES) {
      expect(marques.has(article.href), article.href).toBe(true);
      expect(marques.has(article.en.href), article.en.href).toBe(true);
    }
  });

  it("dit la part assistée, le relecteur et une date de relecture valide", () => {
    for (const m of MARQUAGES) {
      expect(PARTS_ASSISTEES).toContain(m.part);
      expect(m.relecteur).toBe("Adama Diallo");
      expect(m.reluLe).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(
        m.reluLe <= POSITION_DATEE.ecriteLe || m.href === "/ecriture",
      ).toBe(true);
    }
  });

  it("n'inscrit chaque objet qu'une fois", () => {
    const hrefs = MARQUAGES.map((m) => m.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
