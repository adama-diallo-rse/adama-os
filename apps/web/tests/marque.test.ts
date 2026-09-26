import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { ADAMA_OS } from "../content/adama-os";
import {
  IDENTITE,
  POSITIONNEMENT,
  SIGNATURE,
  SIGNATURE_TEXTE,
  TITRE_COURT,
} from "../content/profil";
import { controlerTexte } from "../lib/vocabulaire";

// =====================================================================
// EC0 a EC3, la marque en une seule source.
//
//   EC0 : une seule marque, et la surface recruteur sans offre ni prix ;
//   EC1 : le titre court lu par quatre surfaces, ecrit nulle part ailleurs ;
//   EC2 : une seule phrase de positionnement, tenue partout ;
//   EC3 : la signature en pied de chaque surface, chaque groupe de mots
//         relie a une page qui existe.
// =====================================================================

const RACINE = join(__dirname, "..");
const DOSSIERS = ["app", "components", "content", "lib"];

function lister(dossier: string): string[] {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) return lister(chemin);
    return /\.(ts|tsx)$/.test(nom) ? [chemin] : [];
  });
}

const SOURCES = DOSSIERS.flatMap((d) => lister(join(RACINE, d))).map(
  (chemin) => ({
    relatif: relative(RACINE, chemin).replace(/\\/g, "/"),
    code: readFileSync(chemin, "utf8"),
  }),
);

const lire = (relatif: string) => readFileSync(join(RACINE, relatif), "utf8");

function routeExiste(chemin: string): boolean {
  return existsSync(join(RACINE, "app", chemin, "page.tsx"));
}

describe("EC1, le titre court", () => {
  it("vient de la branche EC : ESG, DATA, SYSTEMS", () => {
    expect(TITRE_COURT.affiche).toBe("ESG · DATA · SYSTEMS");
    expect(TITRE_COURT.texte).toBe("ESG Data Systems");
  });

  it("est lu par les quatre surfaces", () => {
    for (const surface of [
      "components/site-header.tsx",
      "components/dashboard.tsx",
      "app/layout.tsx",
      "app/recruteur/page.tsx",
    ]) {
      expect(lire(surface), surface).toContain("TITRE_COURT");
    }
  });

  it("n'est ecrit en dur nulle part ailleurs", () => {
    const coupables = SOURCES.filter(
      (f) =>
        f.relatif !== "content/profil.ts" &&
        (f.code.includes(TITRE_COURT.affiche) ||
          f.code.includes('"ESG Data Systems"')),
    ).map((f) => f.relatif);
    expect(coupables).toEqual([]);
  });
});

describe("EC2, la phrase de positionnement", () => {
  it("est une seule phrase, celle de la capacite du profil", () => {
    expect(POSITIONNEMENT.fr).toBe(IDENTITE.capacite);
    expect(ADAMA_OS.proposition).toBe(POSITIONNEMENT.fr);
  });

  it("n'est recopiee dans aucun autre fichier", () => {
    const coupables = SOURCES.filter(
      (f) =>
        f.relatif !== "content/profil.ts" && f.code.includes(POSITIONNEMENT.fr),
    ).map((f) => f.relatif);
    expect(coupables).toEqual([]);
  });

  it("garde ses variantes datees, sans les afficher", () => {
    expect(POSITIONNEMENT.variantes.map((v) => v.code)).toEqual([
      "AXP-19",
      "AXP-159",
    ]);
    for (const v of POSITIONNEMENT.variantes) {
      expect(v.gardeeLe).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const affichee = SOURCES.some(
        (f) => f.relatif !== "content/profil.ts" && f.code.includes(v.fr),
      );
      expect(affichee, v.code).toBe(false);
    }
  });

  it("passe le vocabulaire ferme dans les deux langues", () => {
    const textes = [
      POSITIONNEMENT.fr,
      POSITIONNEMENT.en,
      ...POSITIONNEMENT.variantes.flatMap((v) => [v.fr, v.en]),
    ];
    for (const t of textes) {
      const bloquants = controlerTexte(t).filter((c) => c.niveau !== "relire");
      expect(bloquants, t).toEqual([]);
    }
  });

  it("ne porte ni chiffre ni superlatif", () => {
    for (const t of [POSITIONNEMENT.fr, POSITIONNEMENT.en]) {
      expect(t).not.toMatch(/\d/);
      expect(t).not.toMatch(/\b(meilleur|leader|unique|best|leading)\b/i);
    }
  });
});

describe("EC3, la signature verifiable", () => {
  it("se lit comme une phrase continue", () => {
    expect(SIGNATURE_TEXTE).toBe(
      "Construit par Adama, à partir de systèmes réellement mis en ligne.",
    );
    expect(ADAMA_OS.signature).toBe(SIGNATURE_TEXTE);
  });

  it("relie chaque groupe de mots qui affirme a une page qui existe", () => {
    // Seuls les mots de liaison et la ponctuation restent sans lien.
    const liaisons = [", à partir de ", "."];
    const sansPreuve = SIGNATURE.segments.filter((s) => !s.preuve);
    expect(sansPreuve.map((s) => s.texte)).toEqual(liaisons);
    for (const s of SIGNATURE.segments.filter((s) => s.preuve)) {
      expect(s.preuve, s.texte).toBeDefined();
      expect(routeExiste(s.preuve ?? ""), s.preuve).toBe(true);
      expect(s.montre?.length ?? 0, s.texte).toBeGreaterThan(20);
    }
  });

  it("figure en pied de chaque surface", () => {
    expect(lire("components/page-shell.tsx")).toContain(
      '<Signature className="footer-signature-verifiable"',
    );
    expect(lire("components/dashboard.tsx")).toContain(
      '<Signature className="footer-signature-verifiable"',
    );
  });

  it("passe le vocabulaire ferme", () => {
    for (const t of [SIGNATURE_TEXTE, SIGNATURE.en]) {
      expect(controlerTexte(t).filter((c) => c.niveau !== "relire")).toEqual(
        [],
      );
    }
  });
});

describe("EC0, la surface recruteur reste sobre", () => {
  const recruteur = lire("app/recruteur/page.tsx");

  it("ne renvoie vers aucune offre", () => {
    for (const offre of [
      "/travaillez-avec-moi",
      "/diagnostic",
      "/revue-architecture",
    ]) {
      expect(recruteur, offre).not.toContain(offre);
    }
  });

  it("n'affiche aucun prix", () => {
    expect(recruteur).not.toMatch(/€|euros?\b/i);
  });
});
