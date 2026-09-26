import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AIMANTS } from "../content/aimants";
import {
  ARTICLE_PREUVE_EN,
  ARTICLE_PREUVE_FR,
} from "../content/article-methode-preuve";

// =====================================================================
// EH6, l'aimant a adresses : toujours un sous-produit, jamais un contenu
// produit pour la liste. Les conditions 1, 2 et 4 de la regle ecrite dans
// content/aimants.ts se verifient ici sans demander a personne.
// =====================================================================

const RACINE = join(__dirname, "..");

describe("EH6, l'aimant a adresses", () => {
  it("n'est designe qu'apres avoir ete publie pour lui-meme", () => {
    for (const a of AIMANTS) {
      expect(a.publieLe < a.designeLe, a.id).toBe(true);
    }
  });

  it("vient d'un chantier reel qui l'a commande", () => {
    for (const a of AIMANTS) {
      expect(a.chantier, a.id).toMatch(/^E[A-Z][0-9]+$/);
      expect(a.sousProduitDe.length, a.id).toBeGreaterThan(30);
      for (const chemin of a.chemins) {
        expect(
          existsSync(join(RACINE, "app", chemin, "page.tsx")),
          chemin,
        ).toBe(true);
      }
    }
  });

  it("ne demande rien d'autre qu'une adresse, par la page de la lettre", () => {
    for (const a of AIMANTS) {
      expect(a.demande).toBe("une adresse");
      for (const lien of [a.lien.fr, a.lien.en]) {
        const url = new URL(lien, "https://adamesg-os.fr");
        expect(url.pathname).toBe("/lettre");
        expect(url.searchParams.get("utm_medium")).toBe("aimant");
        expect(url.searchParams.get("utm_campaign")).toBe(a.id);
      }
    }
  });

  it("porte sa provenance a la fin de l'article, dans les deux langues", () => {
    const aimant = AIMANTS.find((a) => a.id === "methode-de-preuve");
    expect(ARTICLE_PREUVE_FR.appel.href).toBe(aimant?.lien.fr);
    expect(ARTICLE_PREUVE_EN.appel.href).toBe(aimant?.lien.en);
  });
});
