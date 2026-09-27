import { describe, expect, it } from "vitest";
import { EXPANSION_VISIBILITY } from "../content/expansion";
import { RELEVES_M001, totauxDe } from "../content/mesures";
import {
  CHAMPS_FICHE,
  METHODES,
  NIVEAUX_VISIBILITE,
  controlerFiche,
  methodesProuvees,
  texteClauseRenvoi,
  type FicheMethode,
} from "../content/methodes";
import { controlerTexte } from "../lib/vocabulaire";

// =====================================================================
// EM0, EM1 et EM2 : la fiche type, les sept méthodes et la mesure de M-001.
//
// Violation volontaire à faire une fois : passer l'état de M-002 à
// « PROUVÉ » dans content/methodes.ts. La vérification de types refuse la
// fiche (mesure absente), et le test « zéro PROUVÉ » passe au rouge.
// =====================================================================

const NOMS_INTERDITS_EA6 = [
  "ESG Optimizer",
  "STRATA Scope",
  "STRATA Watch",
  "STRATA Foundation",
  "STRATA Academy",
  "STRATA Supplier",
  "STRATA Carbon",
  "STRATA Compliance",
  "IROKO",
  "Business OS",
];

describe("EM0, la fiche type", () => {
  it("compte dix-sept champs, chacun avec sa source écrite", () => {
    expect(CHAMPS_FICHE).toHaveLength(17);
    for (const champ of CHAMPS_FICHE) {
      expect(champ.source.length, champ.champ).toBeGreaterThan(4);
      expect(champ.vide.length, champ.champ).toBeGreaterThan(4);
    }
  });

  it("refuse une fiche construite pour passer à PROUVÉ sans mesure", () => {
    const base = METHODES[1];
    expect(base).toBeDefined();
    if (!base) return;
    const fraude = {
      ...base,
      etat: "PROUVÉ",
      mesure: null,
    } as unknown as FicheMethode;
    const manques = controlerFiche(fraude);
    expect(manques).toContainEqual(
      expect.objectContaining({
        champ: "Mesure de résultat publiée",
        bloquant: true,
      }),
    );
  });

  it("refuse une fiche sans limite connue", () => {
    const base = METHODES[0];
    if (!base) return;
    const sansLimite = { ...base, limitesConnues: [] } as FicheMethode;
    expect(controlerFiche(sansLimite).some((m) => m.bloquant)).toBe(true);
  });
});

describe("EM1, les sept méthodes", () => {
  it("garde les sept codes et noms arrêtés, sans huitième", () => {
    expect(METHODES.map((m) => `${m.identifiant} ${m.nom}`)).toEqual([
      "M-001 Evidence-First ESG Architecture",
      "M-002 Solo SaaS Build System",
      "M-003 ESG Canonicalization",
      "M-004 AI Decision Boundary",
      "M-005 Proof-Oriented Product Architecture",
      "M-006 Public Build System",
      "M-007 ESG Systems Mapping",
    ]);
  });

  it("porte les états qui font foi : M-001 PROUVÉ (XDEC-61), cinq TESTÉ, un RECHERCHE", () => {
    expect(METHODES.map((m) => m.etat)).toEqual([
      "PROUVÉ",
      "TESTÉ",
      "TESTÉ",
      "TESTÉ",
      "TESTÉ",
      "TESTÉ",
      "RECHERCHE",
    ]);
    expect(methodesProuvees()).toEqual({ prouvees: 1, total: 7 });
  });

  it("relie AXP-192 à AXP-198 aux sept méthodes, code par code", () => {
    expect(METHODES.map((m) => m.codeAxp)).toEqual([
      "AXP-192",
      "AXP-193",
      "AXP-194",
      "AXP-195",
      "AXP-196",
      "AXP-197",
      "AXP-198",
    ]);
  });

  it("valide chaque fiche sans manque bloquant", () => {
    for (const m of METHODES) {
      expect(
        controlerFiche(m).filter((x) => x.bloquant),
        m.identifiant,
      ).toEqual([]);
    }
  });

  it("garde chaque nom affiché libre des noms réservés d'EA6", () => {
    for (const m of METHODES) {
      for (const nom of NOMS_INTERDITS_EA6) {
        expect(
          m.nom.includes(nom) || m.nomAffiche.includes(nom),
          m.identifiant,
        ).toBe(false);
      }
    }
  });

  it("affiche M-004 par le moteur, sans toucher à son identifiant (XDEC-52)", () => {
    const m004 = METHODES.find((m) => m.identifiant === "M-004");
    expect(m004?.nom).toBe("AI Decision Boundary");
    expect(m004?.nomAffiche).toMatch(/moteur/);
    expect(m004?.nomAffiche).not.toMatch(/\bAI\b|\bIA\b/);
  });

  it("chiffre la clause de renvoi ou motive l'absence de produit", () => {
    for (const m of METHODES) {
      const texte = texteClauseRenvoi(m.clauseRenvoi);
      if (m.clauseRenvoi.produit !== null) {
        expect(texte).toMatch(/\d+ euros par mois/);
        expect(texte).toMatch(/\d+ semaines-personne/);
        expect(m.clauseRenvoi.grille).toMatch(/^https:\/\//);
      } else {
        expect(texte).toMatch(/Aucun produit STRATA ne correspond/);
      }
    }
  });

  it("n'écrit aucun mot fermé dans les fiches", () => {
    for (const m of METHODES) {
      const texte = [
        m.nomAffiche,
        ...m.composants,
        ...m.limitesConnues,
        m.pourMonter,
        texteClauseRenvoi(m.clauseRenvoi),
      ].join(" ");
      expect(
        controlerTexte(texte).filter((c) => c.niveau === "interdit"),
        m.identifiant,
      ).toEqual([]);
    }
  });

  it("publie les niveaux de visibilité de l'arbitrage 3 sur /expansion (FAIL-004)", () => {
    for (const niveau of EXPANSION_VISIBILITY) {
      expect(niveau.label).toBe(
        NIVEAUX_VISIBILITE[niveau.code as keyof typeof NIVEAUX_VISIBILITE],
      );
    }
  });
});

describe("EM2, la mesure de résultat de M-001", () => {
  const releve = RELEVES_M001[0];

  it("recalcule les totaux depuis les preuves du relevé publié", () => {
    expect(releve).toBeDefined();
    if (!releve) return;
    const t = totauxDe(releve);
    expect(t.preuves).toBe(releve.totaux.preuves);
    expect(t.concordant).toBe(releve.totaux.concordant);
    expect(t.discordant).toBe(releve.totaux.discordant);
  });

  it("énonce dans la fiche le chiffre que le relevé donne", () => {
    if (!releve) return;
    const t = totauxDe(releve);
    const m001 = METHODES[0];
    expect(m001?.mesure?.resultat).toContain(
      `${t.concordant} preuves publiques sur ${t.preuves}`,
    );
    expect(m001?.mesure?.releveLe).toBe(releve.releveLe.slice(0, 10));
  });

  it("n'est PROUVÉ que porté par un relevé sans discordance, postérieur au défavorable", () => {
    const m001 = METHODES[0];
    expect(m001?.etat).toBe("PROUVÉ");
    if (!releve) return;
    expect(totauxDe(releve).discordant).toBe(0);
    expect(RELEVES_M001.some((r) => totauxDe(r).discordant > 0)).toBe(true);
    expect(m001 && controlerFiche(m001).filter((x) => x.bloquant)).toEqual([]);
  });
});
