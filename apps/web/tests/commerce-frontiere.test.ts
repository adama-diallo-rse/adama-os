import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// =====================================================================
// L13, la couche commerce isolée (page « 2. Marque, domaine et surfaces »,
// section 7). Le commerce vit dans app/(commerce), et aucune page de
// preuve n'en importe un composant. Ce test échoue sinon.
//
// Il lit le code source, chaîne d'import par chaîne d'import : ce qu'on
// interdit, c'est qu'une ligne d'import APPARAISSE, pas seulement qu'un
// rendu particulier évite de la prendre. Il suit aussi les imports
// indirects : une page de preuve qui importe un composant qui importe du
// commerce est une page de preuve qui importe du commerce.
// =====================================================================

const WEB = join(__dirname, "..");
const APP = join(WEB, "app");

/** Les pages de preuve : celles qu'aucun paiement ne doit jamais toucher. */
const PAGES_PREUVE = [
  "preuves",
  "verifier",
  "decisions",
  "revirements",
  "erreurs",
  "systeme",
  "principes",
  "journal",
  "confiance",
  "metrics",
  "os",
];

function lister(dossier: string): string[] {
  if (!existsSync(dossier)) return [];
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) return lister(chemin);
    return /\.(ts|tsx)$/.test(nom) ? [chemin] : [];
  });
}

/** Résout un import relatif vers un fichier du dépôt, ou null. */
function resoudre(depuis: string, specifier: string): string | null {
  if (!specifier.startsWith(".")) return null;
  const base = join(depuis, "..", specifier);
  for (const essai of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ]) {
    if (existsSync(essai) && statSync(essai).isFile()) return essai;
  }
  return null;
}

function imports(fichier: string): string[] {
  const code = readFileSync(fichier, "utf8");
  return Array.from(
    code.matchAll(/(?:import|export)[^'"]*?from\s+["']([^"']+)["']/g),
  ).map((m) => m[1] ?? "");
}

/** Tous les fichiers atteints depuis une page, imports indirects compris. */
function fermeture(depart: string): Set<string> {
  const vus = new Set<string>();
  const pile = [depart];
  while (pile.length) {
    const f = pile.pop();
    if (!f || vus.has(f)) continue;
    vus.add(f);
    for (const s of imports(f)) {
      const r = resoudre(f, s);
      if (r) pile.push(r);
    }
  }
  return vus;
}

function estCommerce(fichier: string): boolean {
  const rel = relative(WEB, fichier).replace(/\\/g, "/");
  return (
    rel.startsWith("app/(commerce)/") ||
    rel.startsWith("components/commerce/") ||
    rel.startsWith("lib/commerce/")
  );
}

describe("L13, aucune page de preuve n'importe du commerce", () => {
  const pages = PAGES_PREUVE.flatMap((d) =>
    lister(join(APP, d)).filter((f) => /page\.tsx$/.test(f)),
  );

  it("trouve bien les pages de preuve à contrôler", () => {
    expect(pages.length).toBeGreaterThan(8);
  });

  for (const page of pages) {
    const nom = relative(WEB, page).replace(/\\/g, "/");
    it(`${nom} ne touche aucun module de commerce`, () => {
      const atteints = Array.from(fermeture(page)).filter(estCommerce);
      expect(atteints.map((f) => relative(WEB, f))).toEqual([]);
    });
  }

  it("détecte une violation quand elle existe (contrôle du contrôle)", () => {
    expect(
      estCommerce(join(WEB, "app", "(commerce)", "panier", "page.tsx")),
    ).toBe(true);
    expect(estCommerce(join(WEB, "components", "commerce", "panier.tsx"))).toBe(
      true,
    );
    expect(estCommerce(join(WEB, "components", "page-shell.tsx"))).toBe(false);
  });

  it("garde le commerce hors de l'accueil et du catalogue tant qu'il n'existe pas", () => {
    for (const f of [
      join(APP, "page.tsx"),
      join(APP, "catalogue", "page.tsx"),
      join(APP, "outils", "page.tsx"),
    ]) {
      const atteints = Array.from(fermeture(f)).filter(estCommerce);
      expect(atteints).toEqual([]);
    }
  });
});
