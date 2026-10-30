import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const WEB_ROOT = process.cwd();

function read(relativePath: string) {
  return readFileSync(join(WEB_ROOT, relativePath), "utf8");
}

describe("charte typographique ADAMA OS (révision du 30 octobre 2026)", () => {
  it("charge uniquement les trois familles autohébergées de la charte", () => {
    const layout = read("app/layout.tsx");
    const globals = read("app/globals.css");

    expect(layout).not.toContain("geist/font");
    expect(layout).not.toContain("next/font/google");
    expect(layout).toContain("--font-schibsted");
    expect(layout).toContain("--font-newsreader");
    expect(layout).toContain("--font-plex-mono");
    for (const ancienne of ["syne", "cormorant", "dm-sans", "courier-prime"]) {
      expect(layout).not.toContain(`--font-${ancienne}`);
    }
    expect(globals).not.toContain("font-geist");
  });

  it("note la licence de chaque police autohébergée", () => {
    const credits = readFileSync(join(WEB_ROOT, "CREDITS.md"), "utf8");
    for (const famille of [
      "Schibsted Grotesk",
      "Newsreader",
      "IBM Plex Mono",
    ]) {
      expect(credits).toContain(famille);
    }
    expect(credits).toContain("SIL Open Font License");
  });

  it("ne laisse aucune ancienne police éditoriale dans les feuilles publiques", () => {
    const styles = [
      "app/globals.css",
      "app/portfolio.css",
      "app/subpages.css",
      "app/narrative.css",
      "app/systeme.css",
      "app/expansion.css",
      "app/identite.css",
      "app/refonte.css",
    ]
      .map(read)
      .join("\n");

    expect(styles).not.toMatch(
      /font(?:-family)?\s*:[^;]*(?:Geist|Georgia|Iowan Old Style|Palatino Linotype|Book Antiqua)/i,
    );
  });
});

describe("surface publique du plan d’expansion", () => {
  const source = [
    "content/expansion.ts",
    "components/expansion-dashboard.tsx",
    "components/dashboard.tsx",
    "app/expansion/page.tsx",
  ]
    .map(read)
    .join("\n");

  it("ne publie ni calendrier X0 à X4 ni date de planification", () => {
    expect(source).not.toMatch(
      /\bX[0-4]\b|septembre 2026|octobre à décembre|janvier à mars|avril à décembre|2028 et après/i,
    );
  });

  it("ne publie aucun indicateur ou objectif financier", () => {
    expect(source).not.toMatch(
      /chiffre encaissé|revenu récurrent|premier euro|paiement unique|contrat annuel|\bventes\b/i,
    );
  });

  it("n’emploie aucun tiret cadratin ou demi-cadratin", () => {
    expect(source).not.toMatch(/[—–]/);
  });
});
