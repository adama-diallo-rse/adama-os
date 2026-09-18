import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ARTICLE_PREUVE_EN,
  ARTICLE_PREUVE_FR,
  texteArticle,
} from "../content/article-methode-preuve";
import { controlerTexte } from "../lib/vocabulaire";

const APP = join(process.cwd(), "app");

function compterMots(texte: string): number {
  return texte.match(/[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

describe("EH3, article long bilingue", () => {
  for (const article of [ARTICLE_PREUVE_FR, ARTICLE_PREUVE_EN]) {
    it(`${article.langue} reste entre 2 500 et 4 000 mots`, () => {
      expect(compterMots(texteArticle(article))).toBeGreaterThanOrEqual(2500);
      expect(compterMots(texteArticle(article))).toBeLessThanOrEqual(4000);
    });

    it(`${article.langue} publie les décisions rejetées et les preuves cassées`, () => {
      expect(article.decisions.length).toBeGreaterThanOrEqual(3);
      expect(article.preuves).toHaveLength(4);
      expect(texteArticle(article)).toContain(article.verdict);
    });

    it(`${article.langue} respecte le vocabulaire fermé`, () => {
      expect(controlerTexte(texteArticle(article))).toEqual([]);
    });
  }

  it("sert les deux routes et les relie", () => {
    expect(
      existsSync(join(APP, "articles", "methode-de-preuve", "page.tsx")),
    ).toBe(true);
    expect(
      existsSync(join(APP, "en", "articles", "proof-method", "page.tsx")),
    ).toBe(true);
    expect(ARTICLE_PREUVE_FR.autreLangue.href).toBe(
      "/en/articles/proof-method",
    );
    expect(ARTICLE_PREUVE_EN.autreLangue.href).toBe(
      "/articles/methode-de-preuve",
    );
  });

  it("garde les mêmes décisions et méthodes dans les deux langues", () => {
    expect(ARTICLE_PREUVE_FR.decisions).toHaveLength(
      ARTICLE_PREUVE_EN.decisions.length,
    );
    expect(ARTICLE_PREUVE_FR.preuves.map((preuve) => preuve.code)).toEqual(
      ARTICLE_PREUVE_EN.preuves.map((preuve) => preuve.code),
    );
  });
});
