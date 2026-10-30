import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { PAIRES, modes, rapport } from "../../../scripts/contraste.mjs";
import {
  GEOMETRIE,
  GRILLE,
  LIGNE_PROVENANCE,
} from "../components/marque/symbole";

// =====================================================================
// L'identité ADAMA OS, révision du 30 octobre 2026.
//
//  1. Plus aucune valeur de la charte STRATA ESG recopiée : ni le navy, ni
//     le signal teal, ni l'or, ni la crème, dans aucune feuille ni aucun
//     composant du site.
//  2. Chaque paire texte et fond passe son seuil, en clair, en sombre et
//     dans le thème alternatif du terminal.
//  3. Le symbole tient sur sa grille : motifs dans leur bande, sceau sur la
//     troisième, ligne de provenance droite.
//  4. Aucun tiret long ni demi-cadratin dans les textes du site.
// =====================================================================

const WEB = join(__dirname, "..");

function lister(dossier: string, extensions: RegExp): string[] {
  return readdirSync(dossier).flatMap((nom) => {
    if (["node_modules", ".next", ".turbo", "fonts"].includes(nom)) return [];
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) return lister(chemin, extensions);
    return extensions.test(nom) ? [chemin] : [];
  });
}

const SOURCES = ["app", "components", "content", "lib"].flatMap((d) =>
  lister(join(WEB, d), /\.(ts|tsx|css)$/),
);

const ANCIENNES = [
  "#0d1b2a",
  "#2affd6",
  "#c9a96e",
  "#f2ede4",
  "#806332",
  "#16273b",
  "#1a2d42",
  "#536878",
  "#6bffe4",
];

describe("1. aucune valeur de l'ancienne charte", () => {
  it("ne laisse aucun ancien hexadécimal dans le site", () => {
    // Le mot-symbole de STRATA ESG est une marque produit : son or reste
    // celui de sa charte, et lui seul a le droit de le porter.
    const coupables = SOURCES.filter((f) => {
      if (f.replace(/\\/g, "/").endsWith("components/marque/stratemark.tsx")) {
        return false;
      }
      const code = readFileSync(f, "utf8").toLowerCase();
      return ANCIENNES.some((h) => code.includes(h));
    }).map((f) => relative(WEB, f));
    expect(coupables).toEqual([]);
  });

  it("ne laisse aucun ancien jeton (emerald, strata-gold, paper, ink)", () => {
    const coupables = SOURCES.filter((f) =>
      /--color-emerald|--strata-(gold|slate|signal)|var\(--paper\)|var\(--ink\)|data-theme="gold"/.test(
        readFileSync(f, "utf8"),
      ),
    ).map((f) => relative(WEB, f));
    expect(coupables).toEqual([]);
  });
});

describe("2. le contraste de la palette", () => {
  const css = readFileSync(join(WEB, "app", "identite.css"), "utf8");
  const tous = modes(css) as Record<string, Map<string, string>>;

  const resoudre = (vars: Map<string, string>, nom: string): string => {
    const v = vars.get(nom) ?? "";
    const ref = v.match(/^var\((--[a-z0-9-]+)\)$/i);
    return ref?.[1] ? resoudre(vars, ref[1]) : v;
  };

  for (const [mode, vars] of Object.entries(tous)) {
    for (const [texte, fond, seuil, usage] of PAIRES as [
      string,
      string,
      number,
      string,
    ][]) {
      it(`${mode} : ${usage} passe ${seuil}:1`, () => {
        const r = rapport(
          resoudre(vars, texte),
          resoudre(vars, fond),
        ) as number;
        expect(r).toBeGreaterThanOrEqual(seuil);
      });
    }
  }
});

describe("3. le symbole sur sa grille", () => {
  it("garde trois bandes dans la grille de 48", () => {
    expect(GEOMETRIE).toHaveLength(3);
    for (const b of GEOMETRIE) {
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.x + b.l).toBeLessThanOrEqual(GRILLE);
      expect(b.y + b.h).toBeLessThanOrEqual(GRILLE);
    }
  });

  it("pose chaque motif à l'intérieur de sa bande", () => {
    for (const b of GEOMETRIE) {
      expect(b.motif.x).toBeGreaterThan(b.x);
      expect(b.motif.x + b.motif.c).toBeLessThan(b.x + b.l);
      expect(b.motif.y).toBeGreaterThan(b.y);
      expect(b.motif.y + b.motif.c).toBeLessThan(b.y + b.h);
    }
  });

  it("ne porte qu'un sceau, sur la troisième bande", () => {
    expect(GEOMETRIE.map((b) => b.motif.sceau)).toEqual([false, false, true]);
  });

  it("aligne les trois motifs sur une ligne de provenance droite", () => {
    const { depart, milieu, arrivee } = LIGNE_PROVENANCE;
    const pente1 = (milieu.y - depart.y) / (milieu.x - depart.x);
    const pente2 = (arrivee.y - milieu.y) / (arrivee.x - milieu.x);
    expect(pente1).toBeCloseTo(pente2, 5);
    expect(pente1).toBeLessThan(0);
  });
});

describe("4. aucun tiret long", () => {
  it("ne laisse ni U+2014 ni U+2013 dans les sources du site", () => {
    const coupables = SOURCES.filter((f) =>
      /[–—]/.test(readFileSync(f, "utf8")),
    ).map((f) => relative(WEB, f));
    expect(coupables).toEqual([]);
  });
});

describe("5. aucune mention publique de l'intelligence artificielle", () => {
  // Le traitement s'appelle « le moteur ». Les commentaires de code ne sont
  // pas une surface publique ; tout le reste l'est, textes et attributs.
  // Sigles en capitales seulement : « j’ai » n’est pas une mention, et les
  // identifiants de code en minuscules (« ia », « @ai-sdk ») non plus. Le
  // nom public d’un agent en « .ai » en est une.
  const MOTIF =
    /\bIA\b|\bAI\b|[Ii]ntelligence artificielle|[Aa]rtificial intelligence|adama\.ai\b/;
  const commentaire = (ligne: string) =>
    /^\s*(\/\/|\*|\/\*|\{\/\*)/.test(ligne);

  it("ne laisse aucune mention dans un texte rendu", () => {
    const coupables: string[] = [];
    for (const f of SOURCES.filter((s) => /\.(ts|tsx)$/.test(s))) {
      const lignes = readFileSync(f, "utf8").split("\n");
      let dansCommentaire = false;
      lignes.forEach((ligne, i) => {
        if (/\/\*/.test(ligne) && !/\*\//.test(ligne)) dansCommentaire = true;
        const ignorer = dansCommentaire || commentaire(ligne);
        if (/\*\//.test(ligne)) dansCommentaire = false;
        if (ignorer) return;
        // « J'AI » en capitales n'est pas une mention.
        const nettoyee = ligne.replace(/J[’']AI\b/g, "");
        if (MOTIF.test(nettoyee))
          coupables.push(`${relative(WEB, f)}:${i + 1}`);
      });
    }
    expect(coupables).toEqual([]);
  });
});
