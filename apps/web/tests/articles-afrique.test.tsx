import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ARTICLE_ARCHITECTURE_EN,
  ARTICLE_ARCHITECTURE_FR,
  ARTICLE_CONTRAINTES_EN,
  ARTICLE_CONTRAINTES_FR,
  ARTICLES_AFRIQUE,
  CLAUSE_RENVOI_EN,
  CLAUSE_RENVOI_FR,
  texteArticleAfrique,
} from "../content/articles-afrique";
import { controlerTexte } from "../lib/vocabulaire";

const APP = join(process.cwd(), "app");

function compterMots(texte: string): number {
  return texte.match(/[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

const NOMS_SOURCE = [
  "Absence de base nationale de facteurs d’émission",
  "Donnée rare, incomplète, parfois papier",
  "Électricité intermittente, groupes électrogènes",
  "Connectivité coûteuse et discontinue",
  "Secteur informel dans la chaîne d’approvisionnement",
  "Multi-devises et paiement mobile",
  "Plusieurs langues de travail, dont des langues orales",
];

const CONSEQUENCES_SOURCE = [
  "Une méthode de choix, de justification et de versionnage des facteurs étrangers, avec la traçabilité de ce choix",
  "Un modèle qui traite l’absence comme une valeur, et une chaîne de preuve qui accepte la photo d’un registre",
  "Des postes d’émission que les modèles européens traitent mal, et qui pèsent lourd localement",
  "Une architecture qui fonctionne hors ligne et se synchronise, ce qui change le modèle de donnée, pas seulement l’interface",
  "Une méthode de collecte auprès de fournisseurs sans comptabilité formelle, et une honnêteté sur ce qui n’est pas prouvable",
  "Des flux dont la conversion et la période sont tracées dans le lignage",
  "Une collecte conçue pour être menée à l’oral et saisie ensuite",
];

describe("EJ0, deux publications bilingues sur les sept contraintes", () => {
  it("reprend les sept contraintes et leurs conséquences à l’identique", () => {
    for (const article of [ARTICLE_CONTRAINTES_FR, ARTICLE_ARCHITECTURE_FR]) {
      expect(article.contraintes.map((contrainte) => contrainte.nom)).toEqual(
        NOMS_SOURCE,
      );
      expect(
        article.contraintes.map((contrainte) => contrainte.consequence),
      ).toEqual(CONSEQUENCES_SOURCE);
    }
  });

  it("garde sept entrées dans chaque langue et chaque publication", () => {
    for (const article of ARTICLES_AFRIQUE) {
      expect(article.contraintes).toHaveLength(7);
      expect(
        new Set(article.contraintes.map((contrainte) => contrainte.id)).size,
      ).toBe(7);
    }
  });

  it("reste une publication approfondie dans les quatre versions", () => {
    for (const article of ARTICLES_AFRIQUE) {
      expect(compterMots(texteArticleAfrique(article))).toBeGreaterThanOrEqual(
        1800,
      );
    }
  });

  it("respecte le vocabulaire fermé dans les quatre versions", () => {
    for (const article of ARTICLES_AFRIQUE) {
      expect(controlerTexte(texteArticleAfrique(article))).toEqual([]);
    }
  });

  it("place la clause de renvoi dans chaque version", () => {
    expect(ARTICLE_CONTRAINTES_FR.clause.texte).toBe(CLAUSE_RENVOI_FR);
    expect(ARTICLE_ARCHITECTURE_FR.clause.texte).toBe(CLAUSE_RENVOI_FR);
    expect(ARTICLE_CONTRAINTES_EN.clause.texte).toBe(CLAUSE_RENVOI_EN);
    expect(ARTICLE_ARCHITECTURE_EN.clause.texte).toBe(CLAUSE_RENVOI_EN);
  });

  it("sert quatre routes reliées par langue et par publication", () => {
    const routes = [
      ["articles", "sept-contraintes-donnee-esg-afrique-ouest", "page.tsx"],
      ["articles", "architecture-donnee-esg-afrique-ouest", "page.tsx"],
      ["en", "articles", "seven-constraints-west-african-esg-data", "page.tsx"],
      ["en", "articles", "west-african-esg-data-architecture", "page.tsx"],
    ];

    for (const route of routes) {
      expect(existsSync(join(APP, ...route))).toBe(true);
    }

    expect(ARTICLE_CONTRAINTES_FR.autreLangue.href).toBe(
      "/en/articles/seven-constraints-west-african-esg-data",
    );
    expect(ARTICLE_ARCHITECTURE_EN.autrePublication.href).toBe(
      "/en/articles/seven-constraints-west-african-esg-data",
    );
  });

  it("contrôle les choix de traduction qui changent de charge", () => {
    expect(
      ARTICLE_CONTRAINTES_EN.traduction?.choix.length,
    ).toBeGreaterThanOrEqual(6);
    expect(
      ARTICLE_ARCHITECTURE_EN.traduction?.choix.length,
    ).toBeGreaterThanOrEqual(4);
  });
});
