import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  PRINCIPES,
  adrCitesParLesPrincipes,
  entreesCitees,
  principeDe,
  type OriginePrincipe,
  type OrigineRole,
  type Principe,
} from "../content/principes";
import { REGISTRE_ADR, REVIREMENTS_REGISTRE } from "../content/decisions";
import { CHAINE, CHAINE_TEXTE, PARALLELE, SIGNATURE } from "../content/systeme";
import type { EtapeChaine, LigneParallele } from "../content/systeme";

// =====================================================================
// C14-T4, la regle de non regression des principes.
//
// Le defaut que ce fichier rend impossible : un principe reste sur la page
// alors que la decision dont il est derive a disparu, ou n'a jamais existe.
// Il devient alors un slogan, c'est a dire exactement ce que la couche C14
// refuse.
//
// Pourquoi la verification porte sur le registre versionne et non sur la
// base : un test qui exigerait une connexion serait desactive au premier
// obstacle, en local sans variables d'environnement ou dans une
// verification hors ligne. Le registre est la declaration versionnee de ce
// que la base contient, et tests/decisions.test.ts verifie qu'ils ne
// divergent pas. La chaine de garanties est complete.
// =====================================================================

const IDS_CONNUS = new Set(REGISTRE_ADR.map((e) => e.adrId));

const PAGE = readFileSync(
  fileURLToPath(new URL("../app/principes/page.tsx", import.meta.url)),
  "utf8",
);

describe("C14-T1, les cinq principes", () => {
  it("en publie cinq, pas six", () => {
    const principes: readonly Principe[] = PRINCIPES;
    expect(principes).toHaveLength(5);
  });

  it("numerote de 01 a 05, sans trou ni doublon", () => {
    expect(PRINCIPES.map((p) => p.numero)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
    ]);
  });

  it("tient chaque principe en une phrase", () => {
    for (const principe of PRINCIPES) {
      expect(principe.phrase.endsWith(".")).toBe(true);
      // Une phrase, donc un seul point final.
      expect(principe.phrase.split(".").filter(Boolean)).toHaveLength(1);
      expect(principe.phrase.length).toBeLessThan(90);
    }
  });

  it("nomme ce qui a produit chaque principe, avec un fait date", () => {
    for (const principe of PRINCIPES) {
      expect(principe.produit.length).toBeGreaterThan(120);
      expect(
        principe.produit,
        `${principe.numero} ne date pas le fait qui l'a produit`,
      ).toMatch(/20[0-9]{2}/);
    }
  });

  it("porte le cout de chaque principe : sans cout, c'est un slogan", () => {
    for (const principe of PRINCIPES) {
      expect(
        principe.cout.length,
        `${principe.numero} n'a pas de cout ecrit`,
      ).toBeGreaterThan(80);
    }
  });

  it("ne renvoie jamais vers une decision inexistante", () => {
    for (const principe of PRINCIPES) {
      expect(principe.origines.length).toBeGreaterThanOrEqual(1);
      for (const origine of principe.origines as readonly OriginePrincipe[]) {
        expect(
          IDS_CONNUS.has(origine.adrId),
          `Le principe ${principe.numero} cite ${origine.adrId}, qui n'existe dans aucun registre. Un principe orphelin est un slogan.`,
        ).toBe(true);
      }
    }
  });

  it("qualifie correctement la nature de chaque origine", () => {
    for (const principe of PRINCIPES) {
      for (const origine of principe.origines) {
        const role: OrigineRole = origine.role;
        const entree = REGISTRE_ADR.find((e) => e.adrId === origine.adrId);
        if (role === "revirement") {
          expect(
            entree?.regle,
            `${origine.adrId} est cite comme une correction mais ne porte pas de regle`,
          ).toBeDefined();
        } else {
          expect(entree?.statut).not.toBe("remplace");
        }
      }
    }
  });
});

describe("C7-T3, les regles des revirements remontent toutes ici", () => {
  it("ne perd aucune des cinq regles", () => {
    const cites = new Set(adrCitesParLesPrincipes());
    for (const revirement of REVIREMENTS_REGISTRE) {
      expect(
        cites.has(revirement.adrId),
        `La regle « ${revirement.regle} », issue de ${revirement.adrId}, n'apparait dans aucun principe.`,
      ).toBe(true);
    }
  });

  it("relie chaque decision citee a un principe, dans les deux sens", () => {
    for (const entree of entreesCitees()) {
      expect(principeDe(entree.adrId)).toBeDefined();
    }
  });
});

describe("C14, la page des principes", () => {
  it("affiche le cout de chaque principe", () => {
    expect(PAGE).toContain("CE QU’IL COÛTE");
  });

  it("n'est ni un manifeste ni une citation inspirante", () => {
    expect(PAGE.toLowerCase()).not.toMatch(
      /nos valeurs|notre mission|notre adn|excellence|passion/,
    );
  });

  it("se termine par la signature du site", () => {
    expect(PAGE).toContain("SIGNATURE");
    expect(SIGNATURE).toContain("ne rien affirmer que je ne puisse vérifier");
  });
});

describe("C14-T2, la chaine du site", () => {
  it("compte sept etapes, dans l'ordre", () => {
    const chaine: readonly EtapeChaine[] = CHAINE;
    expect(chaine.map((e) => e.id)).toEqual([
      "sources",
      "collecte",
      "qualification",
      "validation",
      "restitution",
      "verification",
      "lecteur",
    ]);
  });

  it("nomme pour chaque etape le code qui la tient", () => {
    for (const etape of CHAINE) {
      expect(
        etape.implementation.length,
        `${etape.id} ne nomme aucune implementation`,
      ).toBeGreaterThanOrEqual(2);
      expect(etape.quoi.length).toBeGreaterThan(60);
    }
  });

  it("porte un equivalent textuel du schema", () => {
    expect(CHAINE_TEXTE.length).toBeGreaterThan(150);
    for (const etape of CHAINE) {
      expect(CHAINE_TEXTE.toLowerCase()).toContain(etape.titre.toLowerCase());
    }
  });
});

describe("C14-T3, la lecture cote a cote", () => {
  it("aligne les deux colonnes maillon par maillon", () => {
    const paralleles: readonly LigneParallele[] = PARALLELE;
    expect(paralleles.length).toBeGreaterThanOrEqual(6);
    for (const ligne of paralleles) {
      expect(ligne.durabilite.length).toBeGreaterThan(30);
      expect(ligne.portfolio.length).toBeGreaterThan(30);
    }
  });

  it("n'applique la chaine a aucune donnee de durabilite chiffree", () => {
    // Interdit de la couche : ici, la chaine s'applique a des affirmations
    // professionnelles. Un chiffre de durabilite sur cette page ferait
    // croire que le site traite de la donnee client.
    for (const ligne of PARALLELE) {
      expect(ligne.durabilite).not.toMatch(/[0-9]{3,}/);
      expect(ligne.durabilite.toLowerCase()).not.toContain("tonnes");
    }
  });

  it("n'emploie aucun tiret long", () => {
    const textes = [
      SIGNATURE,
      CHAINE_TEXTE,
      ...CHAINE.map((e) => e.quoi),
      ...PARALLELE.flatMap((l) => [l.durabilite, l.portfolio]),
      ...PRINCIPES.flatMap((p) => [p.phrase, p.produit, p.cout]),
    ];
    for (const texte of textes) {
      expect(texte, texte.slice(0, 60)).not.toMatch(/[–—]/);
    }
  });
});
