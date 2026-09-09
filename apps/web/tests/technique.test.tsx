import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  budgets,
  dependancesDirectes,
  policies,
  policiesDeclarees,
  routesPubliques,
  surface,
  tables,
  tablesProtegees,
} from "../lib/inventory";
import {
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL,
  RETRIEVAL_K,
  RETRIEVAL_MIN_SIMILARITY,
} from "../lib/ai/config";

// =====================================================================
// C10-T9, le test anti saisie.
//
// La page /technique ne doit contenir AUCUN chiffre d'inventaire ecrit a la
// main. Le precedent existe et il est documente : la documentation du depot
// annoncait quatre bibliotheques d'interface qui n'ont jamais ete installees,
// et un audit annoncait dix-sept regles de securite alors qu'il y en avait
// vingt et une. Un chiffre recopie est un chiffre qui vieillit sans que
// personne s'en apercoive.
//
// La regle appliquee ici : dans la page technique, aucun litteral numerique
// de plus de deux chiffres, sauf ceux qui viennent d'une constante importee.
// =====================================================================

const PAGE = readFileSync(
  join(process.cwd(), "app/technique/page.tsx"),
  "utf8",
);
const COMPOSANT = readFileSync(
  join(process.cwd(), "components/tech-inventory.tsx"),
  "utf8",
);

/**
 * Exceptions declarees, avec leur raison. Une exception sans raison ecrite
 * n'existe pas : c'est la meme convention que le test anti fabrication.
 */
const EXCEPTIONS: Record<string, string> = {
  "503":
    "Code de reponse HTTP cite dans la description d'un contrat d'interface. Ce n'est pas un compte d'inventaire, c'est le contrat lui-meme, et le remplacer par une constante importee rendrait la phrase illisible.",
};

function litterauxSuspects(code: string): string[] {
  return Array.from(code.matchAll(/(?<![\w.-])(\d{3,})(?![\w-])/g))
    .map((m) => m[1] ?? "")
    .filter((n) => n.length > 0 && EXCEPTIONS[n] === undefined);
}

function sansCommentaires(texte: string): string {
  return texte
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

describe("C10-T9, aucun chiffre d'inventaire n'est saisi", () => {
  it("la page ne contient aucun litteral numerique de plus de deux chiffres", () => {
    expect(litterauxSuspects(sansCommentaires(PAGE))).toEqual([]);
  });

  it("le composant d'inventaire ne contient aucun nombre non plus", () => {
    expect(litterauxSuspects(sansCommentaires(COMPOSANT))).toEqual([]);
  });

  it("les comptes affiches viennent bien de l'inventaire genere", () => {
    const s = surface();
    for (const cle of [
      "pages",
      "api_routes",
      "components",
      "lib_modules",
      "tables",
      "test_files",
      "test_cases",
    ] as const) {
      expect(typeof s[cle]).toBe("number");
      expect(s[cle]).toBeGreaterThan(0);
    }
  });

  it("les reglages documentaires viennent des constantes, pas d'une recopie", () => {
    const code = sansCommentaires(PAGE);
    expect(code).toContain("EMBEDDING_MODEL");
    expect(code).toContain("EMBEDDING_DIMENSIONS");
    expect(code).toContain("RETRIEVAL_MIN_SIMILARITY");
    expect(code).toContain("RETRIEVAL_K");
    expect(code).not.toContain("text-embedding-3-small");
    expect(EMBEDDING_MODEL).toBe("text-embedding-3-small");
    expect(EMBEDDING_DIMENSIONS).toBe(1024);
    expect(RETRIEVAL_MIN_SIMILARITY).toBeLessThan(0.5);
    expect(RETRIEVAL_K).toBeGreaterThan(0);
  });
});

describe("C10, les deux nombres de regles de securite ne se confondent pas", () => {
  it("les regles vivantes portent toutes sur une table du schema", () => {
    const noms = new Set(tables());
    for (const p of policies()) {
      expect(noms.has(p.split(".")[0] ?? "")).toBe(true);
    }
  });

  it("le nombre declare est superieur ou egal au nombre vivant", () => {
    expect(policiesDeclarees().length).toBeGreaterThanOrEqual(
      policies().length,
    );
  });

  it("chaque table protegee existe encore au schema", () => {
    const noms = new Set(tables());
    for (const t of tablesProtegees()) {
      expect(noms.has(t)).toBe(true);
    }
  });
});

describe("C10-T4, les contrats d'interface", () => {
  it("la route protegee par un secret ne figure pas parmi les publiques", () => {
    for (const r of routesPubliques()) {
      expect(r.route).not.toContain("/sync");
    }
  });

  it("chaque route publique de la page est documentee", () => {
    // La page appelle descriptionRoute pour chaque route. Une route non
    // documentee rend « Route non documentee sur cette page », ce qui doit
    // rester impossible : c'est une omission visible, pas une invention, mais
    // elle n'a rien a faire en production.
    const connues = [
      "/api/metrics",
      "/api/decisions",
      "/api/trajectory",
      "/api/ecosystem",
      "/api/chat",
      "/.well-known/adama-os.json",
      "/llms.txt",
      "/auth/callback",
    ];
    for (const r of routesPubliques()) {
      expect(connues, `${r.route} doit etre documentee`).toContain(r.route);
    }
  });
});

describe("C10-T2, l'inventaire reste exploitable", () => {
  it("expose au moins une dependance directe reelle", () => {
    expect(dependancesDirectes().length).toBeGreaterThan(0);
  });

  it("expose les budgets avec leur plafond et leur mesure", () => {
    const b = budgets();
    expect(b.length).toBeGreaterThan(0);
    for (const budget of b) {
      expect(typeof budget.max).toBe("number");
      expect(typeof budget.value).toBe("number");
      expect(typeof budget.over).toBe("boolean");
    }
  });

  it("ne masque aucun budget depasse", () => {
    // Le composant rend TOUS les budgets, pas seulement ceux qui passent.
    const code = sansCommentaires(COMPOSANT);
    expect(code).toContain("budgets.map");
    expect(code).not.toMatch(/budgets\.filter\(\(b\) => !b\.over\)/);
  });
});
