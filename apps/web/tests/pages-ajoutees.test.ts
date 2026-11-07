import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FICHES } from "../content/projets";
import { AXES_SANTE, TERRAINS } from "../content/realisations";
import {
  ETAPES_TRAVAIL,
  REGLES_TRAVAIL,
  VERIFICATIONS,
} from "../content/comment-je-travaille";
import { PRINCIPES, NOMBRE_PRINCIPES } from "../content/principes";

// 7 novembre 2026 : les pages ajoutées (réalisations, comment je
// travaille, à propos) et ce qu'elles ne doivent jamais dire.

const lire = (relatif: string) =>
  readFileSync(join(process.cwd(), relatif), "utf8");

/** Le texte publié, sans les commentaires qui gardent l'historique. */
const publie = (relatif: string) =>
  lire(relatif)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

const PAGES = [
  "app/projets/page.tsx",
  "app/comment-je-travaille/page.tsx",
  "app/a-propos/page.tsx",
  "app/en/page.tsx",
];

describe("les réalisations", () => {
  it("donne un terrain à chaque fiche, et aucun terrain sans fiche", () => {
    const slugs = FICHES.map((f) => f.slug).sort();
    expect(TERRAINS.map((t) => t.slug).sort()).toEqual(slugs);
  });

  it("n'annonce ouvert que Pharivo Officine, comme pharivo.com", () => {
    const ouverts = AXES_SANTE.filter((a) => a.ouvert);
    expect(ouverts.map((a) => a.nom)).toEqual(["Pharivo Officine"]);
  });

  it("ne date aucun axe de santé encore fermé", () => {
    for (const a of AXES_SANTE) {
      expect(a.texte).not.toMatch(/\b20\d\d\b|janvier|trimestre|bientôt/i);
    }
  });
});

describe("comment je travaille", () => {
  it("garde quatre étapes et six règles", () => {
    expect(ETAPES_TRAVAIL).toHaveLength(4);
    expect(REGLES_TRAVAIL).toHaveLength(6);
  });

  it("ne renvoie que vers des pages qui existent", () => {
    for (const v of VERIFICATIONS) {
      expect(
        existsSync(join(process.cwd(), "app", v.href, "page.tsx")),
        v.href,
      ).toBe(true);
    }
  });
});

describe("ce que les pages ajoutées ne disent jamais", () => {
  it("aucun prix, aucun lancement, aucune recherche de poste", () => {
    for (const p of PAGES) {
      const source = publie(p);
      expect(source, p).not.toMatch(/€|euros?\b|F CFA|lancement/i);
      expect(source, p).not.toMatch(/recherche de poste|recrut/i);
    }
  });

  it("aucun tiret long", () => {
    for (const p of [
      ...PAGES,
      "content/realisations.ts",
      "content/comment-je-travaille.ts",
    ]) {
      expect(lire(p), p).not.toContain("—");
    }
  });
});

describe("l'adresse À propos", () => {
  it("redirige /recruteur vers /a-propos de façon permanente", () => {
    const config = lire("next.config.ts");
    expect(config).toMatch(
      /source: "\/recruteur",\s*destination: "\/a-propos",\s*permanent: true/,
    );
    expect(existsSync(join(process.cwd(), "app/recruteur"))).toBe(false);
  });
});

describe("le nombre de principes", () => {
  it("se lit dans la liste, jamais en dur dans un titre", () => {
    expect(NOMBRE_PRINCIPES).toBe(
      ["Aucune", "Une", "Deux", "Trois", "Quatre", "Cinq", "Six"][
        PRINCIPES.length
      ],
    );
    for (const p of [
      "app/principes/page.tsx",
      "app/revirements/page.tsx",
      "app/decisions/page.tsx",
    ]) {
      expect(lire(p), p).not.toMatch(/Cinq règles/);
    }
  });
});
