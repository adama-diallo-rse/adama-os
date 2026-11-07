import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PARCOURS_VISITEUR, URL_STRATA } from "../content/parcours";
import { controlerTexte } from "../lib/vocabulaire";

// =====================================================================
// EC4, AXP-158, la navigation suit les cinq temps du visiteur, dans les
// mots d'un acheteur depuis le 7 novembre 2026.
// =====================================================================

const RACINE = join(__dirname, "..");

describe("EC4, le parcours visiteur en cinq temps", () => {
  it("suit réalisations, méthodes, ressources, travailler ensemble, à propos, puis STRATA ESG", () => {
    expect(PARCOURS_VISITEUR.map((t) => t.libelle)).toEqual([
      "Réalisations",
      "Méthodes",
      "Ressources",
      "Travailler ensemble",
      "À propos",
      "STRATA ESG",
    ]);
    expect(PARCOURS_VISITEUR.map((t) => t.libelleEn)).toEqual([
      "Work",
      "Methods",
      "Resources",
      "Work with me",
      "About",
      "STRATA ESG",
    ]);
  });

  it("mene chaque temps interne a une page qui existe aujourd'hui", () => {
    for (const t of PARCOURS_VISITEUR.filter((t) => !t.sortie)) {
      // Une ancre de l'accueil mène à la page d'accueil elle-même.
      const chemin = t.href.split("#")[0] ?? "/";
      expect(
        existsSync(join(RACINE, "app", chemin, "page.tsx")),
        `${t.libelle} vers ${t.href}`,
      ).toBe(true);
    }
  });

  it("ne renvoie a aucune page de la vague X3", () => {
    const cibles = PARCOURS_VISITEUR.map((t) => t.href);
    for (const x3 of ["/os", "/savoir", "/idees", "/lab"]) {
      expect(cibles).not.toContain(x3);
    }
  });

  it("n'a qu'une sortie, la derniere, vers le site de STRATA ESG", () => {
    const sorties = PARCOURS_VISITEUR.filter((t) => t.sortie);
    expect(sorties).toHaveLength(1);
    expect(PARCOURS_VISITEUR.at(-1)?.sortie).toBe(true);
    expect(sorties[0]?.href).toBe(URL_STRATA);
    expect(URL_STRATA).toMatch(/^https:\/\/www\.strata-esg\.fr\/$/);
  });

  it("nomme pour chaque temps sa question et le signal qui le retirerait", () => {
    for (const t of PARCOURS_VISITEUR) {
      expect(t.question.endsWith("?"), t.libelle).toBe(true);
      expect(t.signalInutile.length, t.libelle).toBeGreaterThan(30);
      expect(
        controlerTexte(`${t.question} ${t.signalInutile}`).filter(
          (c) => c.niveau !== "relire",
        ),
      ).toEqual([]);
    }
  });

  it("est la seule source de la barre, sur toutes les pages", () => {
    const entete = readFileSync(
      join(RACINE, "components/site-header.tsx"),
      "utf8",
    );
    expect(entete).toContain("PARCOURS_VISITEUR");
    expect(entete).not.toMatch(/\["\/[a-z-]*", "[A-Z]/);
    // La sortie passe par le lien mesure, jamais par un lien nu.
    expect(entete).toContain("<OutboundLink");
  });
});
