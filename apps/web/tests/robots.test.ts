import { describe, expect, it } from "vitest";
import robots from "../app/robots";

// 9 novembre 2026 : Search Console signalait 36 variantes filtrées de /journal
// en « Autre page avec balise canonique correcte ». Ces variantes ont toutes
// /journal pour canonique : on les retire de l'exploration, pas de l'index.

describe("robots.txt", () => {
  const resultat = robots();
  const regles = Array.isArray(resultat.rules)
    ? resultat.rules
    : [resultat.rules];
  const regle = regles.find((r) => r.userAgent === "*");
  const disallow = ([] as string[]).concat(regle?.disallow ?? []);

  it("bloque les variantes filtrées du journal", () => {
    expect(disallow).toContain("/journal?*");
  });

  it("laisse la page /journal explorable", () => {
    expect(disallow).not.toContain("/journal");
    expect(disallow).not.toContain("/");
  });

  it("garde les blocages des pages privées", () => {
    for (const chemin of [
      "/admin",
      "/checkin",
      "/login",
      "/mot-de-passe",
      "/auth/",
      "/api/",
    ]) {
      expect(disallow).toContain(chemin);
    }
  });

  // 14 novembre 2026 : les robots des assistants de recherche sont nommés.
  // Un groupe nommé remplace la règle générale pour ce robot : s'il ne
  // portait pas les mêmes interdits, il ouvrirait les pages privées.
  it("nomme les robots des assistants, avec les mêmes interdits", () => {
    const assistants = regles.find((r) => Array.isArray(r.userAgent));
    expect(assistants?.allow).toBe("/");
    expect(assistants?.disallow).toEqual(regle?.disallow);
    for (const robot of ["GPTBot", "ClaudeBot", "PerplexityBot"]) {
      expect(assistants?.userAgent).toContain(robot);
    }
  });

  it("déclare le sitemap", () => {
    expect(resultat.sitemap).toContain("/sitemap.xml");
  });
});
