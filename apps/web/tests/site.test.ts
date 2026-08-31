import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// L0-T6 : l'origine du site a une seule source. Ce test verrouille l'ordre de
// résolution, parce qu'une erreur ici produit des liens canoniques, un
// sitemap et des aperçus de partage faux, sans rien casser visiblement.
const ENV = { ...process.env };

function nettoyer() {
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.NEXT_PUBLIC_VERCEL_URL;
  delete process.env.VERCEL_URL;
}

beforeEach(() => {
  vi.resetModules();
  nettoyer();
});

afterEach(() => {
  process.env = { ...ENV };
});

describe("origine publique du site", () => {
  it("préfère NEXT_PUBLIC_SITE_URL et retire le slash final", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://adamesg-os.fr/";
    process.env.VERCEL_URL = "preview-xyz.vercel.app";
    const { SITE_URL, SITE_HOST } = await import("../lib/site");
    expect(SITE_URL).toBe("https://adamesg-os.fr");
    expect(SITE_HOST).toBe("adamesg-os.fr");
  });

  it("retombe sur l'hôte Vercel en preview", async () => {
    process.env.VERCEL_URL = "adama-os-git-branche.vercel.app";
    const { SITE_URL } = await import("../lib/site");
    expect(SITE_URL).toBe("https://adama-os-git-branche.vercel.app");
  });

  it("ignore une variable vide", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "   ";
    const { SITE_URL } = await import("../lib/site");
    expect(SITE_URL).toBe("https://adamesg-os.fr");
  });

  it("construit une URL absolue depuis un chemin", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://adamesg-os.fr";
    const { absoluteUrl } = await import("../lib/site");
    expect(absoluteUrl("/metrics")).toBe("https://adamesg-os.fr/metrics");
    expect(absoluteUrl("metrics")).toBe("https://adamesg-os.fr/metrics");
    expect(absoluteUrl()).toBe("https://adamesg-os.fr/");
  });
});
