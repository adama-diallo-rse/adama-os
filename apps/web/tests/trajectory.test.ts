import { describe, expect, it } from "vitest";
import { incoherences, parseEta, resolveTrajectory } from "../lib/trajectory";
import type { TrajectoryRow } from "../components/types";

// =====================================================================
// C1-T8. Une roadmap périmée est une donnée fausse comme une autre.
//
// Le défaut d'origine : une entrée « Phase 0, Fondations », datée du
// 6 juillet 2026, encore au statut `now` deux mois plus tard. Ces tests
// verrouillent la détection, pour que le cas ne puisse pas revenir en
// silence avec une autre entrée.
// =====================================================================

const MAINTENANT = new Date("2026-09-01T12:00:00.000Z");

function entree(partiel: Partial<TrajectoryRow>): TrajectoryRow {
  return {
    id: "t1",
    title: "Phase 0, Fondations",
    status: "now",
    type: "feature",
    eta: "6 juillet 2026",
    notes: null,
    ...partiel,
  };
}

describe("lecture d'une échéance", () => {
  it("lit un jour, un mois et une année en français", () => {
    expect(parseEta("6 juillet 2026")?.toISOString()).toBe(
      "2026-07-06T23:59:59.000Z",
    );
  });

  it("lit un mois et une année, et retient la fin du mois", () => {
    expect(parseEta("Septembre 2026")?.toISOString()).toBe(
      "2026-09-30T23:59:59.000Z",
    );
  });

  it("lit une date ISO", () => {
    expect(parseEta("2026-10-31")?.toISOString()).toBe(
      "2026-10-31T23:59:59.000Z",
    );
  });

  it("gère les accents des mois", () => {
    expect(parseEta("15 février 2026")).not.toBeNull();
    expect(parseEta("2 août 2026")).not.toBeNull();
  });

  it("ne devine rien quand il n'y a pas de date", () => {
    // Rendre null plutôt que d'inventer : une échéance devinée ferait
    // basculer une entrée pour rien, ce qui est le défaut qu'on corrige.
    expect(parseEta("Phase 2")).toBeNull();
    expect(parseEta("")).toBeNull();
    expect(parseEta(null)).toBeNull();
    expect(parseEta("Trimestre prochain")).toBeNull();
  });

  it("ne prend pas un mois inconnu pour un mois", () => {
    expect(parseEta("12 brumaire 2026")).toBeNull();
  });
});

describe("état dérivé d'une entrée", () => {
  it("signale une entrée en cours dont l'échéance est passée", () => {
    const [vue] = resolveTrajectory([entree({})], MAINTENANT);
    expect(vue?.overdue).toBe(true);
    expect(vue?.dueAt).toBe("2026-07-06T23:59:59.000Z");
  });

  it("ne signale rien quand l'échéance est encore devant", () => {
    const [vue] = resolveTrajectory(
      [entree({ eta: "Décembre 2026" })],
      MAINTENANT,
    );
    expect(vue?.overdue).toBe(false);
  });

  it("ne met jamais en retard une entrée livrée", () => {
    const [vue] = resolveTrajectory([entree({ status: "done" })], MAINTENANT);
    expect(vue?.overdue).toBe(false);
    expect(vue?.colonne).toBe("done");
  });

  it("ne met pas en retard une entrée sans échéance", () => {
    const [vue] = resolveTrajectory(
      [entree({ eta: "Phase 2", status: "next" })],
      MAINTENANT,
    );
    expect(vue?.overdue).toBe(false);
  });

  it("liste les incohérences pour qu'elles soient traitées, pas cachées", () => {
    const vues = resolveTrajectory(
      [
        entree({ id: "a" }),
        entree({ id: "b", eta: "Décembre 2026" }),
        entree({ id: "c", status: "done" }),
      ],
      MAINTENANT,
    );
    expect(incoherences(vues).map((v) => v.id)).toEqual(["a"]);
  });
});
