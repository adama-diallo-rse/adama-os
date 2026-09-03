import { describe, expect, it } from "vitest";
import { EVENEMENTS } from "../lib/analytics-events";
import { evenementsAnalytiques } from "../lib/inventory";
import { CAPABILITY_IDS } from "../lib/health/types";
import { buildCapabilities } from "../lib/health/criteria";
import type { HealthObservations } from "../lib/health/observations";

// =====================================================================
// C13-T2, le nom des evenements.
//
// Un entonnoir se configure a la main, en recopiant un nom d'evenement dans
// une interface. Une faute de frappe produit un entonnoir VIDE, qui ressemble
// exactement a un parcours que personne n'emprunte. C'est la pire erreur de
// mesure possible, parce qu'elle se conclut au lieu de s'apercevoir.
//
// Ce test compare trois listes qui doivent coincider : les constantes
// declarees, les noms reellement emis dans le code (releves par l'inventaire)
// et la documentation des entonnoirs.
// =====================================================================

describe("C13-T2, les evenements declares et les evenements emis", () => {
  it("aucun evenement n'est emis sans figurer dans la liste declaree", () => {
    const emis = evenementsAnalytiques();
    const declares = new Set<string>(EVENEMENTS);
    const inconnus = emis.filter((e) => !declares.has(e));
    expect(inconnus).toEqual([]);
  });

  it("chaque nom declare suit la convention de nommage", () => {
    for (const e of EVENEMENTS) {
      expect(e, `${e} doit etre en minuscules avec des soulignes`).toMatch(
        /^[a-z][a-z0-9_]+$/,
      );
    }
  });

  // Les trois cas suivants ferment un defaut trouve le 2 septembre 2026. Le
  // releve de l'inventaire ne cherchait qu'un litteral de chaine au point
  // d'appel, alors que la couche C13 avait justement deplace les noms dans une
  // source unique et fait passer des CONSTANTES. Le releve rendait donc une
  // liste vide, l'inventaire publiait « Aucun », et le cas ci-dessus comparait
  // deux listes vides : il ne pouvait plus rien attraper. Une mesure qui ne
  // mesure rien est pire qu'une mesure absente, parce qu'elle rassure.
  it("le releve de l'inventaire n'est pas vide", () => {
    expect(
      evenementsAnalytiques().length,
      "aucun evenement releve dans le code alors que la liste declaree n'est pas vide : " +
        "le releve de scripts/inventory.mjs ne voit plus les points d'emission, " +
        "et la comparaison ci-dessus est devenue une comparaison de deux listes vides",
    ).toBeGreaterThan(0);
  });

  it("aucune constante d'evenement ne reste non resolue", () => {
    const nonResolues = evenementsAnalytiques().filter((e) =>
      e.startsWith("NON_RESOLU:"),
    );
    expect(
      nonResolues,
      "une constante est passee a un point d'emission sans que sa valeur soit " +
        "retrouvable : le nom reellement envoye a l'outil de mesure est inconnu",
    ).toEqual([]);
  });

  it("chaque evenement declare est reellement emis quelque part", () => {
    const emis = new Set(evenementsAnalytiques());
    const jamaisEmis = EVENEMENTS.filter((e) => !emis.has(e));
    expect(
      jamaisEmis,
      "un evenement declare mais jamais emis produit un entonnoir vide, " +
        "qui ressemble exactement a un parcours que personne n'emprunte",
    ).toEqual([]);
  });

  it("aucun doublon dans la liste declaree", () => {
    expect(new Set(EVENEMENTS).size).toBe(EVENEMENTS.length);
  });

  it("porte l'evenement de verification, specifique a ce site", () => {
    // Il mesure combien de visiteurs prennent la peine de verifier une
    // affirmation. Aucun portfolio ne mesure cela, parce qu'aucun ne propose
    // de le faire.
    expect(EVENEMENTS).toContain("proof_verify_opened");
  });
});

// =====================================================================
// C3-T1, la matrice sert exactement les sept capacites declarees.
// Ni une de moins quand ca va mal, ni une de plus quand ca va bien.
// =====================================================================

const OBSERVATIONS: HealthObservations = {
  base: { configured: true, readOk: true, dataClassReady: true },
  github: { source: "registre", expected: 8, read: 8, missing: [], commits: 3 },
  rag: {
    documents: 2,
    chunks: 173,
    lastIngestionAt: "2026-08-31T10:00:00.000Z",
    verification: null,
  },
  passerelles: { configured: 2, healthy: 2, unhealthy: [], unreachable: [] },
  analytique: {
    keyConfigured: true,
    region: "UE",
    regionAnnoncee: "UE",
    consentGate: true,
  },
  assistant: { modelKeyConfigured: true, refuseSansSource: true },
  sauvegarde: { procedure: true, restauration: null, fraicheurJours: 180 },
};

describe("C3-T1, les sept capacites", () => {
  it("rend exactement les capacites declarees, dans l'ordre", () => {
    const rendues = buildCapabilities(OBSERVATIONS, new Date()).map(
      (c) => c.id,
    );
    expect(rendues).toEqual([...CAPABILITY_IDS]);
  });

  it("chaque capacite porte au moins un critere et une phrase de role", () => {
    for (const c of buildCapabilities(OBSERVATIONS, new Date())) {
      expect(c.criteria.length).toBeGreaterThan(0);
      expect(c.purpose.trim().length).toBeGreaterThan(20);
      for (const critere of c.criteria) {
        expect(critere.observed.trim().length).toBeGreaterThan(10);
      }
    }
  });
});
