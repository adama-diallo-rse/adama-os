import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AFFIRMATIONS_CV, CV } from "../content/cv";
import { COMPETENCES, IDENTITE, RECHERCHE } from "../content/profil";

// =====================================================================
// C12-T8, la coherence du CV.
//
// Ce test lit le catalogue de semis du registre de preuve pour connaitre les
// affirmations existantes. C'est volontaire : une requete en base rendrait le
// test dependant d'une connexion et il finirait desactive, alors que le
// catalogue de semis EST la definition versionnee de ce que la table
// contient. Un identifiant qui n'y figure pas ne sera jamais en base.
// =====================================================================

const SEED = readFileSync(
  join(process.cwd(), "../../packages/db/src/seed-proof.ts"),
  "utf8",
);

/** Identifiants d'affirmation reellement definis par le catalogue de semis. */
const IDS_REGISTRE = new Set(
  Array.from(SEED.matchAll(/^\s{4}id:\s*"([a-z0-9-]+)",$/gm)).map((m) => m[1]),
);

describe("C12-T8, chaque affirmation du CV a sa preuve", () => {
  it("le catalogue de semis est bien lu", () => {
    expect(IDS_REGISTRE.size).toBeGreaterThan(5);
  });

  it("aucune affirmation du CV ne pointe vers une preuve inexistante", () => {
    const orphelines = AFFIRMATIONS_CV.filter(
      (a) => !IDS_REGISTRE.has(a.preuveId),
    ).map((a) => `${a.id} pointe vers ${a.preuveId}`);
    expect(orphelines).toEqual([]);
  });

  it("chaque carte de competence pointe elle aussi vers une preuve reelle", () => {
    const orphelines = COMPETENCES.filter(
      (c) => !IDS_REGISTRE.has(c.preuveId),
    ).map((c) => `${c.id} pointe vers ${c.preuveId}`);
    expect(orphelines).toEqual([]);
  });

  it("aucune affirmation n'est vide ni dupliquee", () => {
    const ids = AFFIRMATIONS_CV.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of AFFIRMATIONS_CV) {
      expect(a.phrase.trim().length).toBeGreaterThan(15);
    }
  });
});

describe("C12-T8, le CV ne duplique pas la source de profil", () => {
  it("lit l'identite et la recherche depuis la source unique", () => {
    expect(CV.identite).toBe(IDENTITE);
    expect(CV.recherche).toBe(RECHERCHE);
  });

  it("ne recopie aucun intitule de poste en clair", () => {
    const source = readFileSync(join(process.cwd(), "content/cv.ts"), "utf8");
    for (const poste of RECHERCHE.postes) {
      expect(
        source,
        `« ${poste} » doit venir de content/profil.ts, pas etre recopie`,
      ).not.toContain(poste);
    }
    expect(source).not.toContain(RECHERCHE.zone);
    expect(source).not.toContain(IDENTITE.capacite);
  });

  it("couvre les quatre experiences et la formation sans les reecrire", () => {
    expect(CV.experiences.length).toBeGreaterThan(0);
    expect(CV.formation.length).toBeGreaterThan(0);
    const source = readFileSync(join(process.cwd(), "content/cv.ts"), "utf8");
    for (const f of CV.formation) {
      expect(source).not.toContain(f.precision);
    }
  });
});
