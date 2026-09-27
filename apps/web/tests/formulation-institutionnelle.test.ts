import { describe, expect, it } from "vitest";
import {
  VOIES_INSTITUTIONNELLES,
  controlerFormulation,
  formulationAdmise,
} from "../content/formulation-institutionnelle";

// =====================================================================
// ER1, une phrase autorisée et une phrase interdite pour chacune des neuf
// voies. Le contrôle est vérifié dans les deux sens : une règle qui refuse
// tout est aussi fausse qu'une règle qui laisse tout passer.
//
// Violation volontaire à faire une fois : remplacer une phrase autorisée par
// « Partenaire officiel de l'école ». Le test doit passer au rouge.
// =====================================================================

describe("ER1, la règle de formulation institutionnelle", () => {
  it("porte exactement neuf voies, AXP-246 à AXP-254, sans dixième", () => {
    expect(VOIES_INSTITUTIONNELLES.map((v) => v.code)).toEqual([
      "AXP-246",
      "AXP-247",
      "AXP-248",
      "AXP-249",
      "AXP-250",
      "AXP-251",
      "AXP-252",
      "AXP-253",
      "AXP-254",
    ]);
  });

  for (const voie of VOIES_INSTITUTIONNELLES) {
    it(`${voie.code}, admet la phrase autorisée en français et en anglais`, () => {
      expect(controlerFormulation(voie.autoriseeFr), voie.autoriseeFr).toEqual(
        [],
      );
      expect(controlerFormulation(voie.autoriseeEn), voie.autoriseeEn).toEqual(
        [],
      );
    });

    it(`${voie.code}, refuse la phrase interdite`, () => {
      expect(formulationAdmise(voie.interditeFr), voie.interditeFr).toBe(false);
    });

    it(`${voie.code}, écrit l'accord que XINV-52 exige avant toute mention`, () => {
      expect(voie.accord).toMatch(/[Aa]ccord écrit|[Rr]èglement/);
    });
  }

  it("refuse les équivalents anglais des tournures d'adoubement", () => {
    for (const phrase of [
      "An official partner of the school",
      "Method endorsed by the federation",
      "Recognised by the State",
      "Accredited trainer",
    ]) {
      expect(formulationAdmise(phrase), phrase).toBe(false);
    }
  });
});
