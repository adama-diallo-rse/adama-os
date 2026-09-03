import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  ADR_CATALOGUE,
  adrParId,
  type Adr,
  type AdrOption,
  type AdrPreuve,
  type AdrRevirement,
} from "../../../packages/db/src/adr-catalogue";
import {
  PROPOSITIONS,
  REGISTRE_ADR,
  REVIREMENTS_REGISTRE,
  entreeRegistre,
  type EntreeRegistre,
  type Proposition,
} from "../content/decisions";

// =====================================================================
// C6 et C7, le journal d'architecture tient.
//
// Deux choses sont verrouillees ici.
//
// D'abord le FORMAT : aucun champ optionnel, des options reellement
// envisagees, un compromis nomme, une consequence observee, et au moins une
// trace reelle par decision. Une decision sans trace n'a pas ete prise, elle
// a ete envisagee.
//
// Ensuite la NON DIVERGENCE. Le texte long des ADR vit dans le catalogue de
// packages/db, qui alimente la base. Le registre d'identifiants vit dans
// apps/web/content/decisions.ts, parce que la page des principes doit
// pouvoir nommer une decision sans connexion a la base. Deux fichiers, donc
// un risque de derive, donc un test.
// =====================================================================

const CATALOGUE_SOURCE = readFileSync(
  fileURLToPath(
    new URL("../../../packages/db/src/adr-catalogue.ts", import.meta.url),
  ),
  "utf8",
);

const VOCABULAIRE_INTERDIT = [
  "infalsifiable",
  "inaltérable",
  "inalterable",
  "horodatage certifié",
  "registre qualifié",
  "bilan carbone",
];

function textesDe(adr: Adr): string[] {
  return [
    adr.titre,
    ...adr.contexte,
    ...adr.options.flatMap((o: AdrOption) => [o.option, o.motif]),
    adr.decision,
    adr.raisonnement.technique,
    adr.raisonnement.reglementaire,
    adr.raisonnement.economique,
    adr.compromis,
    adr.consequence,
    ...adr.questions,
    ...(adr.revirement
      ? [
          adr.revirement.croyais,
          adr.revirement.invalide,
          adr.revirement.fait,
          adr.revirement.cout,
          adr.revirement.regle,
        ]
      : []),
  ];
}

describe("C6, le catalogue des decisions", () => {
  it("publie au moins les huit decisions demandees", () => {
    expect(ADR_CATALOGUE.length).toBeGreaterThanOrEqual(8);
  });

  it("porte des identifiants uniques, au format cite dans une URL", () => {
    const ids = ADR_CATALOGUE.map((a) => a.adrId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^DEC-[0-9]{3}$/);
      expect(adrParId(id)?.adrId).toBe(id);
    }
  });

  it("ne renvoie jamais vers un ADR inexistant", () => {
    for (const adr of ADR_CATALOGUE) {
      if (adr.remplace) {
        expect(
          adrParId(adr.remplace),
          `${adr.adrId} remplace ${adr.remplace}, qui n'existe pas`,
        ).not.toBeNull();
        expect(adr.remplace).not.toBe(adr.adrId);
      }
    }
  });

  it("laisse chaque decision remplacee pointee par un successeur", () => {
    const remplaces = new Set(
      ADR_CATALOGUE.map((a) => a.remplace).filter(
        (r): r is string => r !== null,
      ),
    );
    for (const adr of ADR_CATALOGUE.filter((a) => a.statut === "remplace")) {
      expect(
        remplaces.has(adr.adrId),
        `${adr.adrId} est au statut remplace mais aucune decision ne la remplace`,
      ).toBe(true);
    }
  });
});

describe.each(ADR_CATALOGUE.map((a) => [a.adrId, a] as const))(
  "C6, %s",
  (_id, adr) => {
    it("porte un titre sous la forme A plutot que B", () => {
      // L'elision compte : « plutot qu'une case vide » est la meme forme
      // que « plutot que le fine-tuning ».
      expect(adr.titre.toLowerCase()).toMatch(/plut[oô]t qu[e\u2019']/);
    });

    it("porte un contexte en trois phrases, pas une intention", () => {
      expect(adr.contexte.length).toBeGreaterThanOrEqual(3);
      for (const phrase of adr.contexte) {
        expect(phrase.length).toBeGreaterThan(60);
      }
    });

    it("liste des options, dont une retenue et au moins une ecartee", () => {
      const options: readonly AdrOption[] = adr.options;
      expect(options.length).toBeGreaterThanOrEqual(2);
      expect(options.filter((o) => o.verdict === "retenue")).toHaveLength(1);
      expect(
        options.filter((o) => o.verdict === "ecartee").length,
      ).toBeGreaterThanOrEqual(1);
      for (const option of options) {
        expect(option.motif.length).toBeGreaterThan(40);
      }
    });

    it("nomme un compromis sans le minimiser", () => {
      expect(adr.compromis.length).toBeGreaterThan(60);
    });

    it("raisonne sur les trois axes", () => {
      expect(adr.raisonnement.technique.length).toBeGreaterThan(40);
      expect(adr.raisonnement.reglementaire.length).toBeGreaterThan(40);
      expect(adr.raisonnement.economique.length).toBeGreaterThan(30);
    });

    it("porte au moins une trace reelle du depot", () => {
      const preuves: readonly AdrPreuve[] = adr.preuves;
      expect(preuves.length).toBeGreaterThanOrEqual(1);
      for (const preuve of preuves) {
        expect(preuve.locator.length).toBeGreaterThan(3);
        expect(preuve.libelle.length).toBeGreaterThan(5);
      }
    });

    it("dit ce qui a ete observe, pas ce qui etait espere", () => {
      expect(adr.consequence.length).toBeGreaterThan(60);
      expect(adr.consequence).not.toMatch(
        /devrait|permettra|va permettre|on espère|on espere/i,
      );
    });

    it("ecrit ses questions ouvertes quand il est reconstruit", () => {
      if (adr.reconstruit) {
        expect(
          adr.questions.length,
          `${adr.adrId} est reconstruit mais ne liste aucune question`,
        ).toBeGreaterThan(0);
      }
    });

    it("n'emploie ni tiret long ni vocabulaire interdit", () => {
      for (const texte of textesDe(adr)) {
        expect(texte, texte.slice(0, 60)).not.toMatch(/[–—]/);
        for (const interdit of VOCABULAIRE_INTERDIT) {
          expect(
            texte.toLowerCase(),
            `${adr.adrId} : « ${interdit} »`,
          ).not.toContain(interdit.toLowerCase());
        }
      }
    });
  },
);

describe("C7, les revirements", () => {
  const revirements = ADR_CATALOGUE.filter((a) => a.revirement !== null);

  it("en publie cinq, chacune tracee", () => {
    expect(revirements).toHaveLength(5);
  });

  it("ne porte un revirement que sur une decision remplacee", () => {
    for (const adr of revirements) {
      expect(adr.statut).toBe("remplace");
    }
  });

  it("remplit les six champs, et le cout n'est jamais vide", () => {
    for (const adr of revirements) {
      const revirement = adr.revirement as AdrRevirement;
      expect(revirement.croyais.length).toBeGreaterThan(60);
      expect(revirement.invalide.length).toBeGreaterThan(60);
      expect(revirement.fait.length).toBeGreaterThan(40);
      // Sans cout, un revirement se lit comme de l'amelioration continue.
      expect(revirement.cout.length).toBeGreaterThan(60);
      expect(revirement.regle.length).toBeGreaterThan(20);
      expect(typeof revirement.coutEstime).toBe("boolean");
    }
  });

  it("ne se caricature pas : la position initiale reste defendable", () => {
    for (const adr of revirements) {
      const revirement = adr.revirement as AdrRevirement;
      expect(revirement.croyais).toMatch(/^Je (pensais|croyais)/);
      expect(revirement.croyais).not.toMatch(/b[eê]tement|stupide|na[iï]f/i);
    }
  });

  it("garde une regle par revirement, sans doublon", () => {
    const regles = revirements.map((a) => a.revirement?.regle);
    expect(new Set(regles).size).toBe(regles.length);
  });
});

describe("C6, le registre et le catalogue ne divergent pas", () => {
  it("declare exactement les memes identifiants", () => {
    const catalogue = ADR_CATALOGUE.map((a) => a.adrId).sort();
    const registre = REGISTRE_ADR.map((e) => e.adrId).sort();
    expect(registre).toEqual(catalogue);
  });

  it("declare les memes titres et les memes statuts", () => {
    for (const adr of ADR_CATALOGUE) {
      const entree = entreeRegistre(adr.adrId) as EntreeRegistre;
      expect(entree, `${adr.adrId} absent du registre`).toBeDefined();
      expect(entree.titre).toBe(adr.titre);
      expect(entree.statut).toBe(adr.statut);
    }
  });

  it("recopie chaque regle de revirement a l'identique", () => {
    for (const adr of ADR_CATALOGUE.filter((a) => a.revirement)) {
      expect(entreeRegistre(adr.adrId)?.regle).toBe(adr.revirement?.regle);
    }
    expect(REVIREMENTS_REGISTRE).toHaveLength(5);
  });

  it("ne declare une regle que sur un revirement", () => {
    for (const entree of REGISTRE_ADR) {
      if (entree.regle) {
        expect(adrParId(entree.adrId)?.revirement).not.toBeNull();
      }
    }
  });

  it("garde le catalogue comme seule source du texte long", () => {
    // Le registre ne doit porter que des identifiants, des titres et des
    // statuts. S'il se met a porter du contexte, il devient une seconde
    // source de verite, et les deux finiront par se contredire.
    const registreSource = readFileSync(
      fileURLToPath(new URL("../content/decisions.ts", import.meta.url)),
      "utf8",
    );
    expect(registreSource).not.toMatch(/^\s*contexte:/m);
    expect(registreSource).not.toMatch(/^\s*compromis:/m);
    expect(registreSource).not.toMatch(/^\s*consequence:/m);
    expect(CATALOGUE_SOURCE).toMatch(/^\s*contexte: \[/m);
  });
});

describe("C6, point 3, les decisions restant a arbitrer", () => {
  it("en pose quatre, sans les rediger", () => {
    const propositions: readonly Proposition[] = PROPOSITIONS;
    expect(propositions).toHaveLength(4);
    for (const proposition of propositions) {
      expect(proposition.question).toMatch(/\?$/);
      expect(proposition.pourquoi.length).toBeGreaterThan(60);
    }
  });

  it("ne les ecrit pas dans le catalogue, qui alimente la base", () => {
    for (const proposition of PROPOSITIONS) {
      expect(CATALOGUE_SOURCE).not.toContain(proposition.question);
    }
  });
});
