import { describe, expect, it } from "vitest";
import {
  LEXIQUE_ANGLAIS_PROVISOIRE_EH1,
  controlerTexte,
  texteAdmis,
} from "../lib/vocabulaire";

// =====================================================================
// ADEC-19 et XDEC-05 : le controle executable du vocabulaire ferme.
//
// Chaque mot de la liste est essaye, dans sa forme accentuee et dans ses
// equivalents etrangers, et les trois formes du mot certificat que
// l'interdiction ne couvre pas sont essayees aussi. Un controle qui refuse
// tout est aussi faux qu'un controle qui laisse tout passer.
// =====================================================================

const niveaux = (texte: string, sansDate = false) =>
  controlerTexte(texte, { sansDate }).map((c) => c.niveau);

describe("ADEC-19, les douze mots fermés", () => {
  const FERMES = [
    "Une certification reconnue",
    "un parcours certifiant",
    "un programme certifié",
    "certifier une compétence",
    "financé par Qualiopi",
    "pris en charge par l’OPCO",
    "inscrit au RNCP",
    "un diplôme délivré",
    "un titre professionnel",
    "une accréditation",
    "éligible au dispositif",
    "le référentiel officiel",
  ];
  for (const phrase of FERMES) {
    it(`refuse « ${phrase} »`, () => {
      expect(niveaux(phrase)).toContain("interdit");
      expect(texteAdmis(phrase)).toBe(false);
    });
  }

  it("refuse les équivalents étrangers, certified compris", () => {
    for (const phrase of [
      "a certified program",
      "zertifizierte Methode",
      "programa certificado",
      "an official standard",
      "accredited training",
      "eligible companies",
    ]) {
      expect(niveaux(phrase), phrase).toContain("interdit");
    }
  });

  it("porte les douze entrées provisoires EH1 et bloque chaque équivalent anglais", () => {
    expect(LEXIQUE_ANGLAIS_PROVISOIRE_EH1).toHaveLength(12);
    for (const entree of LEXIQUE_ANGLAIS_PROVISOIRE_EH1) {
      for (const equivalent of entree.anglais) {
        expect(niveaux(equivalent.terme), equivalent.terme).toContain(
          "interdit",
        );
      }
    }
  });

  it("classe certified, eligible et official comme banals mais interdits", () => {
    const banals = LEXIQUE_ANGLAIS_PROVISOIRE_EH1.flatMap((entree) =>
      entree.anglais
        .filter((equivalent) => equivalent.usage === "banal")
        .map((equivalent) => equivalent.terme),
    );
    expect(banals).toEqual([
      "certified",
      "French skills operator",
      "eligible",
      "official",
    ]);
    for (const terme of banals) expect(texteAdmis(terme)).toBe(false);
  });

  it("laisse passer les trois formes non couvertes du mot certificat", () => {
    for (const phrase of [
      "Un certificat de réalisation est remis.",
      "Un certificat de fin de parcours vérifiable en ligne.",
      "Le certificat délivré porte la date.",
    ]) {
      expect(niveaux(phrase), phrase).not.toContain("interdit");
    }
  });

  it("refuse le mot certificat hors de ces trois formes", () => {
    expect(niveaux("Un certificat de compétence ESG")).toContain("interdit");
  });

  it("refuse les tirets longs", () => {
    expect(niveaux("La lettre — et rien d’autre")).toContain("interdit");
    expect(niveaux("La lettre – et rien d’autre")).toContain("interdit");
  });
});

describe("ADEC-19, les mots relus au cas par cas", () => {
  it("signale sans bloquer", () => {
    for (const phrase of [
      "un résultat garanti",
      "un modèle conforme",
      "un regard expert",
      "reconnu par l’État",
      "le financement de la formation",
      "le meilleur outil",
    ]) {
      expect(niveaux(phrase), phrase).toContain("relire");
      expect(texteAdmis(phrase), phrase).toBe(true);
    }
  });
});

describe("sans date ni délai", () => {
  it("refuse années, mois, jours, dates et échéances relatives", () => {
    for (const phrase of [
      "La lettre paraîtra en 2028.",
      "Rendez-vous en mai.",
      "Envoi prévu lundi.",
      "Le 12/10, première édition.",
      "Dans trois mois, la première lettre.",
      "D’ici quelques semaines.",
      "La lettre arrive bientôt.",
      "Le trimestre prochain.",
    ]) {
      expect(niveaux(phrase, true), phrase).toContain("date");
    }
  });

  it("accepte une cadence sans échéance", () => {
    const phrase =
      "Une note courte vous parviendra une fois par trimestre, en trois paragraphes.";
    expect(controlerTexte(phrase, { sansDate: true })).toEqual([]);
  });

  it("ne cherche pas les dates quand le texte n’y est pas soumis", () => {
    expect(niveaux("Le lien reste valable sept jours, en 2026.")).toEqual([]);
  });
});
