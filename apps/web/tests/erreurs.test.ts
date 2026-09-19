import { describe, expect, it } from "vitest";
import {
  CATEGORIES_ERREUR,
  ERREURS,
  mesurerConversion,
} from "../content/erreurs";

describe("EW3, registre public des erreurs", () => {
  it("porte exactement les onze catégories prévues", () => {
    expect(CATEGORIES_ERREUR).toHaveLength(11);
    expect(new Set(CATEGORIES_ERREUR).size).toBe(11);
  });

  it("sert des entrées réelles dans l’ordre antéchronologique", () => {
    expect(ERREURS.length).toBeGreaterThan(0);
    expect(ERREURS.map((erreur) => erreur.date)).toEqual(
      [...ERREURS.map((erreur) => erreur.date)].sort().reverse(),
    );
  });

  it("verrouille les cinq blocs et une source vérifiable par entrée", () => {
    for (const erreur of ERREURS) {
      expect(erreur.id).toMatch(/^FAIL-\d{3}$/);
      expect(CATEGORIES_ERREUR).toContain(erreur.categorie);
      expect(erreur.pense.length).toBeGreaterThan(60);
      expect(erreur.faits.length).toBeGreaterThan(60);
      expect(erreur.cause.length).toBeGreaterThan(60);
      expect(erreur.changement.length).toBeGreaterThan(60);
      expect(erreur.implication.length).toBeGreaterThan(60);
      expect(erreur.sources.length).toBeGreaterThan(0);
      for (const source of erreur.sources) {
        expect(source.href).toMatch(/^https:\/\//);
      }
    }
  });

  it("calcule la conversion depuis les entrées au lieu de l’écrire en dur", () => {
    const mesure = mesurerConversion();
    expect(mesure.publiees).toBe(ERREURS.length);
    expect(mesure.converties).toBe(
      ERREURS.filter(
        (erreur) => erreur.statut === "convertie" && erreur.methode,
      ).length,
    );
    expect(mesure.taux).toBe(100);
  });

  it("fait baisser la mesure quand une erreur reste ouverte", () => {
    const base = ERREURS[0];
    expect(base).toBeDefined();
    if (!base) return;

    const ouverte = {
      ...base,
      id: "FAIL-999" as const,
      statut: "ouverte" as const,
      methode: undefined,
    };
    const mesure = mesurerConversion([...ERREURS, ouverte]);
    expect(mesure.publiees).toBe(3);
    expect(mesure.converties).toBe(2);
    expect(mesure.taux).toBe(67);
  });
});
