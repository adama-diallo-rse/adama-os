import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// =====================================================================
// C9-T7, le budget de surface du premier ecran, verrouille par test.
//
// Le budget est deja mesure par `pnpm inventory`. Ce test existe parce que
// l'inventaire se lance a la main : une commande qu'on oublie de lancer ne
// protege rien le jour ou on est presse, et c'est precisement ce jour la
// qu'on ajoute un quatrieme bouton.
//
// A partir de la vague V2, un depassement est une ERREUR et non un
// avertissement. Ce fichier verifie les deux choses : que la severite est
// bien passee a l'erreur, et que les trois plafonds N1 sont tenus, y compris
// quand leur mesure devient impossible.
//
// Une mesure impossible compte comme un depassement : un plafond qu'on ne
// sait plus mesurer n'est pas un plafond tenu, c'est un plafond perdu.
// =====================================================================

type Mesure = {
  kind: string;
  file: string;
  from: string;
  to: string;
  pattern: string;
};

type Budget = {
  id: string;
  level: string;
  label: string;
  max: number;
  measure: Mesure | Record<string, unknown>;
};

const BUDGET = JSON.parse(
  readFileSync(new URL("../../../docs/budget.json", import.meta.url), "utf8"),
) as { severity: string; budgets: Budget[] };

/** Meme mesure que scripts/inventory-analyse.mjs, refaite ici sans lui pour
 *  que le test ne dependre pas de l'outillage qu'il verifie. */
function mesurer(m: Mesure): number {
  // Trois niveaux : tests -> apps/web -> apps -> racine du depot.
  const chemin = new URL(`../../../${m.file}`, import.meta.url);
  let texte: string;
  try {
    texte = readFileSync(chemin, "utf8");
  } catch {
    return -1;
  }
  const debut = texte.indexOf(m.from);
  const fin = texte.indexOf(m.to, debut + 1);
  if (debut === -1 || fin === -1) {
    return -1;
  }
  return (texte.slice(debut, fin).match(new RegExp(m.pattern, "gm")) ?? [])
    .length;
}

describe("C9-T7, le budget du premier ecran", () => {
  it("est passe en erreur, il n'avertit plus", () => {
    expect(
      BUDGET.severity,
      "Le budget doit echouer, pas avertir, a partir de la vague V2.",
    ).toBe("error");
  });

  const n1 = BUDGET.budgets.filter((b) => b.level === "N1");

  it("couvre le titre, les lignes, les actions et les cartes", () => {
    expect(n1.map((b) => b.id).sort()).toEqual([
      "n1_actions_home",
      "n1_cartes_competence",
      "n1_lignes_home",
      "n1_titre_home",
    ]);
  });

  for (const budget of n1) {
    it(`tient le plafond « ${budget.label} »`, () => {
      const mesure = budget.measure as Mesure;
      expect(mesure.kind).toBe("count_in_region");
      const valeur = mesurer(mesure);
      expect(
        valeur,
        `La mesure de ${budget.id} est cassee : l'ancre « ${mesure.from} » ou « ${mesure.to} » ne correspond plus dans ${mesure.file}. Un plafond qu'on ne sait plus mesurer n'est pas un plafond tenu.`,
      ).toBeGreaterThanOrEqual(0);
      expect(
        valeur,
        `${budget.label} : ${valeur} pour un plafond de ${budget.max}. Un plafond se releve par ecrit dans docs/BUDGET.md, jamais en silence.`,
      ).toBeLessThanOrEqual(budget.max);
    });
  }
});
